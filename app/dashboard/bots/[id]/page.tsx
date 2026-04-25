import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { bots, sources } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import BotDetailClient from "./BotDetailClient";

export default async function BotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const [bot] = await db
    .select()
    .from(bots)
    .where(and(eq(bots.id, id), eq(bots.userId, user.id)))
    .limit(1);

  if (!bot) notFound();

  const allSources = await db
    .select()
    .from(sources)
    .where(eq(sources.botId, id))
    .orderBy(sources.createdAt);

  return <BotDetailClient bot={bot} sources={allSources} />;
}
