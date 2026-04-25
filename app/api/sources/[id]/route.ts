import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sources, bots } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id } = await params;

  // Verify source belongs to this user
  const source = await db
    .select()
    .from(sources)
    .innerJoin(bots, eq(sources.botId, bots.id))
    .where(and(eq(sources.id, id), eq(bots.userId, user.id)))
    .limit(1);

  if (!source[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(sources).where(eq(sources.id, id));
  return NextResponse.json({ success: true });
}
