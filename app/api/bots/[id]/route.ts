import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { bots } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/bots/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const [bot] = await db
      .select()
      .from(bots)
      .where(and(eq(bots.id, id), eq(bots.userId, user.id)))
      .limit(1);

    if (!bot) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ bot });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// PATCH /api/bots/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const data = await request.json();

    const [bot] = await db
      .update(bots)
      .set({
        name: data.name ?? undefined,
        description: data.description ?? undefined,
        systemPrompt: data.systemPrompt ?? undefined,
        suggestedQuestions: data.suggestedQuestions ?? undefined,
      })
      .where(and(eq(bots.id, id), eq(bots.userId, user.id)))
      .returning();

    if (!bot) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ bot });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// DELETE /api/bots/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    await db
      .delete(bots)
      .where(and(eq(bots.id, id), eq(bots.userId, user.id)));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
