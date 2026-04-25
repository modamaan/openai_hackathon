import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sources, bots } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await props.params;

    // Fetch the source and ensure the user owns the bot it belongs to
    const [sourceData] = await db
      .select({
        id: sources.id,
        rawUrl: sources.rawUrl,
        type: sources.type,
        status: sources.status,
        content: sources.content,
        errorMessage: sources.errorMessage,
        createdAt: sources.createdAt,
      })
      .from(sources)
      .innerJoin(bots, eq(sources.botId, bots.id))
      .where(and(eq(sources.id, id), eq(bots.userId, user.id)))
      .limit(1);

    if (!sourceData) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }

    return NextResponse.json({ source: sourceData });
  } catch (error) {
    console.error("Failed to fetch source details:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
