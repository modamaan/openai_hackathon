import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { bots, sources, conversations } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, Globe, MessagesSquare, Plus, ArrowRight, Zap } from "lucide-react";

export default async function DashboardHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [botCount, sourceCount, convoCount] = await Promise.all([
    db.select({ count: count() }).from(bots).where(eq(bots.userId, user.id)),
    db
      .select({ count: count() })
      .from(sources)
      .innerJoin(bots, eq(sources.botId, bots.id))
      .where(eq(bots.userId, user.id)),
    db
      .select({ count: count() })
      .from(conversations)
      .innerJoin(bots, eq(conversations.botId, bots.id))
      .where(eq(bots.userId, user.id)),
  ]);

  if (botCount[0].count === 0) {
    redirect("/onboarding");
  }

  const recentBots = await db
    .select()
    .from(bots)
    .where(eq(bots.userId, user.id))
    .orderBy(bots.createdAt)
    .limit(5);

  const stats = [
    { label: "Total Chatbots", value: botCount[0].count, icon: MessageSquare, href: "/dashboard/bots" },
    { label: "Knowledge Sources", value: sourceCount[0].count, icon: Globe, href: "/dashboard/knowledge" },
    { label: "Conversations", value: convoCount[0].count, icon: MessagesSquare, href: "/dashboard/conversations" },
  ];

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white mb-1">
          Welcome back, {user.name?.split(" ")[0] ?? user.email.split("@")[0]} 👋
        </h1>
        <p className="text-white/30 text-sm">Here&apos;s an overview of your AI support operation.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-5 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-4">
              <stat.icon className="w-4 h-4 text-white/50 group-hover:text-white/80 transition-colors" />
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
            <div className="text-white/35 text-xs">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Add Knowledge Source", desc: "Train your bot with a URL", href: "/dashboard/knowledge", emoji: "📚" },
          { label: "Create a Chatbot", desc: "Set up a new AI assistant", href: "/dashboard/bots/new", emoji: "🤖" },
          { label: "View Conversations", desc: "Review customer chats", href: "/dashboard/conversations", emoji: "💬" },
        ].map((a) => (
          <Link key={a.label} href={a.href}
            className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.07] rounded-xl p-4 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all group"
          >
            <span className="text-xl mt-0.5">{a.emoji}</span>
            <div>
              <p className="text-white/70 text-sm font-medium group-hover:text-white transition-colors">{a.label}</p>
              <p className="text-white/25 text-xs mt-0.5">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Bots */}
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <h2 className="text-white/80 text-sm font-medium">Your Chatbots</h2>
          <Link href="/dashboard/bots/new">
            <Button size="sm" className="bg-white text-black hover:bg-white/90 border-0 text-xs h-7 rounded-full px-3">
              <Plus className="w-3 h-3 mr-1.5" />
              New Bot
            </Button>
          </Link>
        </div>

        {recentBots.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-3">
              <Zap className="w-5 h-5 text-white/30" />
            </div>
            <p className="text-white/30 text-sm mb-4">No chatbots yet. Create your first one!</p>
            <Link href="/dashboard/bots/new">
              <Button className="bg-white text-black hover:bg-white/90 border-0 rounded-full text-sm">
                Create Chatbot
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {recentBots.map((bot) => (
              <Link
                key={bot.id}
                href={`/dashboard/bots/${bot.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5 text-white/40" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm font-medium group-hover:text-white transition-colors">
                      {bot.name}
                    </p>
                    <p className="text-white/25 text-xs">{bot.description ?? "No description"}</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 transition-all" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
