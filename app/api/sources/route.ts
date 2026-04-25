import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sources, chunks, bots } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { scrapeUrl, isValidUrl } from "@/lib/scraper";
import { chunkText, generateEmbeddings, summariseText } from "@/lib/openai";

// POST /api/sources
// Accepts either { botId, url } (scrape mode) or { botId, content, title } (manual mode)
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const { botId, url, content: manualContent, title } = body;

    if (!botId) {
      return NextResponse.json({ error: "botId is required" }, { status: 400 });
    }

    // Decide mode
    const isManual = !!manualContent;
    const isUrl = !!url;

    if (!isManual && !isUrl) {
      return NextResponse.json({ error: "Provide either a URL or manual text content" }, { status: 400 });
    }
    if (isUrl && !isValidUrl(url)) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }
    if (isManual && (typeof manualContent !== "string" || manualContent.trim().length < 20)) {
      return NextResponse.json({ error: "Content must be at least 20 characters" }, { status: 400 });
    }

    // Verify bot belongs to user
    const [bot] = await db
      .select()
      .from(bots)
      .where(and(eq(bots.id, botId), eq(bots.userId, user.id)))
      .limit(1);

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Create source record
    const [source] = await db
      .insert(sources)
      .values({
        botId,
        type: isManual ? "text" : "url",
        rawUrl: isManual ? `text://${(title ?? "Manual").slice(0, 60)}` : url,
        status: "processing",
      })
      .returning();

    // Start background processing (no await — respond immediately)
    processSource(source.id, botId, isManual ? null : url, isManual ? manualContent : null).catch(
      async (err) => {
        console.error("Source processing failed:", err);
        await db
          .update(sources)
          .set({ status: "error", errorMessage: err.message })
          .where(eq(sources.id, source.id));
      }
    );

    return NextResponse.json({ source }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown";
    if (msg === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to add source" }, { status: 500 });
  }
}

// GET /api/sources
// If ?botId=xxx is provided, filter by bot. Otherwise return all sources for the user.
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const botId = searchParams.get("botId");

    let query: any;

    if (botId) {
      // Verify bot belongs to user
      const [bot] = await db
        .select()
        .from(bots)
        .where(and(eq(bots.id, botId), eq(bots.userId, user.id)))
        .limit(1);

      if (!bot) {
        return NextResponse.json({ error: "Bot not found" }, { status: 404 });
      }

      query = db
        .select({
          id: sources.id,
          rawUrl: sources.rawUrl,
          type: sources.type,
          status: sources.status,
          errorMessage: sources.errorMessage,
          createdAt: sources.createdAt,
          botId: sources.botId,
          botName: bots.name,
        })
        .from(sources)
        .innerJoin(bots, eq(sources.botId, bots.id))
        .where(eq(sources.botId, botId))
        .orderBy(sql`${sources.createdAt} DESC`);
    } else {
      query = db
        .select({
          id: sources.id,
          rawUrl: sources.rawUrl,
          type: sources.type,
          status: sources.status,
          errorMessage: sources.errorMessage,
          createdAt: sources.createdAt,
          botId: sources.botId,
          botName: bots.name,
        })
        .from(sources)
        .innerJoin(bots, eq(sources.botId, bots.id))
        .where(eq(bots.userId, user.id))
        .orderBy(sql`${sources.createdAt} DESC`);
    }

    const allSources = await query;
    return NextResponse.json({ sources: allSources });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// ── Background processing pipeline ──────────────────────────────────────────
async function processSource(
  sourceId: string,
  botId: string,
  url: string | null,
  manualContent: string | null
): Promise<void> {
  // 1. Get raw text — either scrape or use provided content directly
  let rawText: string;
  if (manualContent) {
    rawText = manualContent.trim();
  } else if (url) {
    rawText = await scrapeUrl(url);
  } else {
    throw new Error("No URL or content provided");
  }

  // 2. Summarise (skip for short manual texts)
  const summarised =
    rawText.length > 500 ? await summariseText(rawText) : rawText;

  // 3. Save content on source record
  await db
    .update(sources)
    .set({ content: summarised })
    .where(eq(sources.id, sourceId));

  // 4. Chunk + embed
  const textChunks = chunkText(summarised, 400, 40);
  if (textChunks.length === 0) {
    throw new Error("No meaningful content found");
  }

  const embeddings = await generateEmbeddings(textChunks);

  // 5. Store chunks
  await db.insert(chunks).values(
    textChunks.map((content, i) => ({
      sourceId,
      botId,
      content,
      embedding: JSON.stringify(embeddings[i]),
    }))
  );

  // 6. Mark done
  await db
    .update(sources)
    .set({ status: "done" })
    .where(eq(sources.id, sourceId));
}
