import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversations, messages, bots } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const botId = searchParams.get("botId");
    const sessionId = searchParams.get("sessionId");

    if (!botId || !sessionId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Fetch bot to get name and questions
    const [bot] = await db.select().from(bots).where(eq(bots.id, botId)).limit(1);
    const botName = bot?.name || "Support";
    let suggestedQuestions: string[] = [];
    try { suggestedQuestions = JSON.parse(bot?.suggestedQuestions || "[]"); } catch {}

    // Find the conversation
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.botId, botId), eq(conversations.sessionId, sessionId)))
      .limit(1);

    if (!conversation) {
      return NextResponse.json({ messages: [], botName, suggestedQuestions }, {
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    // Fetch messages
    const chatHistory = await db
      .select({
        id: messages.id,
        role: messages.role,
        content: messages.content,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(eq(messages.conversationId, conversation.id))
      .orderBy(messages.createdAt);

    return NextResponse.json(
      { messages: chatHistory, botName, suggestedQuestions },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json({ error: "Failed to load history" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
