import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bots, chunks, conversations, messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getOpenAIClient, generateEmbeddings, findRelevantChunks } from "@/lib/openai";

// POST /api/chat — RAG chat endpoint (public, used by embed widget)
export async function POST(request: NextRequest) {
  try {
    const { botId, message, sessionId } = await request.json();

    if (!botId || !message?.trim()) {
      return NextResponse.json(
        { error: "botId and message are required" },
        { status: 400 }
      );
    }

    // Load bot config
    const [bot] = await db
      .select()
      .from(bots)
      .where(eq(bots.id, botId))
      .limit(1);

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Load all chunks for this bot
    const allChunks = await db
      .select({ content: chunks.content, embedding: chunks.embedding })
      .from(chunks)
      .where(eq(chunks.botId, botId));

    // Embed the user's query
    const [queryEmbedding] = await generateEmbeddings([message.trim()]);

    // Find relevant context via cosine similarity
    const relevantChunks = findRelevantChunks(queryEmbedding, allChunks, 5);
    const context = relevantChunks.join("\n\n---\n\n");

    // Build or find conversation
    let conversationId: string;
    if (sessionId) {
      const [existing] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.sessionId, sessionId))
        .limit(1);
      conversationId = existing?.id ?? (await createConversation(botId, sessionId));
    } else {
      conversationId = await createConversation(botId, crypto.randomUUID());
    }

    // Save user message
    await db.insert(messages).values({
      conversationId,
      role: "user",
      content: message.trim(),
    });

    const systemPrompt = `${bot.systemPrompt ?? "You are a helpful customer support assistant."}

---
KNOWLEDGE BASE CONTEXT:
${context || "No specific context available. Answer generally and politely."}
---

Instructions:
- Only answer based on the knowledge base context above.
- If the answer is not in the context, say: "I don't have that information. Please contact our support team."
- Be concise, friendly, and helpful.`;

    // Stream response using OpenAI SDK directly (no @ai-sdk/openai needed)
    const openai = getOpenAIClient();
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message.trim() },
      ],
    });

    // Stream back in Vercel AI SDK data-stream format (0:"text"\n)
    // so the existing TestChat reader keeps working
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let fullText = "";
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              fullText += text;
              controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
            }
          }
        } finally {
          controller.close();
          // Persist assistant message (fire-and-forget)
          db.insert(messages)
            .values({ conversationId, role: "assistant", content: fullText })
            .catch(console.error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Transfer-Encoding": "chunked",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}

async function createConversation(botId: string, sessionId: string): Promise<string> {
  const [conv] = await db
    .insert(conversations)
    .values({ botId, sessionId })
    .returning();
  return conv.id;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
