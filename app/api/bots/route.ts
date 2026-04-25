import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { bots } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/bots — list all bots for the current user
export async function GET() {
  try {
    const user = await requireUser();
    const allBots = await db
      .select()
      .from(bots)
      .where(eq(bots.userId, user.id))
      .orderBy(bots.createdAt);

    return NextResponse.json({ bots: allBots });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// POST /api/bots — create a new bot
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const { name, description, systemPrompt } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Bot name is required" }, { status: 400 });
    }

    const [bot] = await db
      .insert(bots)
      .values({
        userId: user.id,
        name: name.trim(),
        description: description?.trim() ?? null,
        systemPrompt: systemPrompt?.trim() ?? undefined,
      })
      .returning();

    return NextResponse.json({ bot }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    if (msg === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create bot" }, { status: 500 });
  }
}
