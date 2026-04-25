import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { bots, sources } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import KnowledgeClient from "./KnowledgeClient";

export default async function KnowledgePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const userBots = await db.select().from(bots).where(eq(bots.userId, user.id));

  const allSources = userBots.length > 0
    ? await db
        .select({
          id: sources.id,
          rawUrl: sources.rawUrl,
          url: sources.rawUrl,
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
        .orderBy(desc(sources.createdAt))
    : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <KnowledgeClient bots={userBots} initialSources={allSources as any} />;
}
