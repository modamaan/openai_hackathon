import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { bots, sources, conversations } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Globe, MessagesSquare, ArrowRight, Zap } from "lucide-react";

export default async function ChatbotsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const userBots = await db.select().from(bots).where(eq(bots.userId, user.id));

  const botStats = await Promise.all(
    userBots.map(async (bot) => {
      const [srcCount, convCount] = await Promise.all([
        db.select({ count: count() }).from(sources).where(eq(sources.botId, bot.id)),
        db.select({ count: count() }).from(conversations).where(eq(conversations.botId, bot.id)),
      ]);
      return { ...bot, sources: srcCount[0].count, conversations: convCount[0].count };
    })
  );

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <MessageSquare className="w-5 h-5 text-white/50" />
            <h1 className="text-xl font-semibold text-white">Chatbots</h1>
          </div>
          <p className="text-white/30 text-sm">Manage and configure your AI support assistants.</p>
        </div>
        <Link href="/dashboard/bots/new">
          <Button className="bg-white text-black hover:bg-white/90 border-0 rounded-full text-sm h-9 px-4">
            <Plus className="w-4 h-4 mr-1.5" />
            New Chatbot
          </Button>
        </Link>
      </div>

      {botStats.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl py-20 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-white/20" />
          </div>
          <p className="text-white/30 text-sm mb-4">No chatbots yet.</p>
          <Link href="/dashboard/bots/new">
            <Button className="bg-white text-black hover:bg-white/90 border-0 rounded-full text-sm">
              Create your first chatbot
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {botStats.map((bot) => (
            <Link
              key={bot.id}
              href={`/dashboard/bots/${bot.id}`}
              className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.07] rounded-xl px-5 py-4 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all group"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-white/40" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white/80 font-medium text-sm group-hover:text-white transition-colors">
                  {bot.name}
                </p>
                <p className="text-white/30 text-xs truncate mt-0.5">
                  {bot.description ?? "No description"}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-5 shrink-0">
                <div className="text-center hidden sm:block">
                  <div className="flex items-center gap-1.5 text-white/35 text-xs">
                    <Globe className="w-3 h-3" />
                    {bot.sources} sources
                  </div>
                </div>
                <div className="text-center hidden sm:block">
                  <div className="flex items-center gap-1.5 text-white/35 text-xs">
                    <MessagesSquare className="w-3 h-3" />
                    {bot.conversations} chats
                  </div>
                </div>
                <div className={`text-xs px-2.5 py-1 rounded-full border shrink-0 ${
                  "bg-white/[0.03] border-white/[0.08] text-white/25"
                }`}>
                  Active
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/15 group-hover:text-white/40 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
