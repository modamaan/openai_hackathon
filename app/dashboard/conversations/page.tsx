import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { bots, conversations, messages } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import Link from "next/link";
import { MessagesSquare, MessageSquare, ArrowRight } from "lucide-react";

export default async function ConversationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const userBots = await db.select().from(bots).where(eq(bots.userId, user.id));
  const botIds = userBots.map((b) => b.id);

  const allConversations =
    botIds.length > 0
      ? await db
          .select({
            id: conversations.id,
            sessionId: conversations.sessionId,
            createdAt: conversations.createdAt,
            botId: conversations.botId,
            botName: bots.name,
            messageCount: count(messages.id),
          })
          .from(conversations)
          .innerJoin(bots, eq(conversations.botId, bots.id))
          .leftJoin(messages, eq(messages.conversationId, conversations.id))
          .where(eq(bots.userId, user.id))
          .groupBy(conversations.id, bots.name)
          .orderBy(desc(conversations.createdAt))
          .limit(50)
      : [];

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <MessagesSquare className="w-5 h-5 text-white/50" />
          <h1 className="text-xl font-semibold text-white">Conversations</h1>
        </div>
        <p className="text-white/30 text-sm">
          Review all customer conversations across your chatbots.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/[0.06]">
          <h2 className="text-white/70 text-sm font-medium">
            Recent Conversations ({allConversations.length})
          </h2>
        </div>

        {allConversations.length === 0 ? (
          <div className="py-16 text-center">
            <MessagesSquare className="w-8 h-8 text-white/10 mx-auto mb-3" />
            <p className="text-white/25 text-sm">No conversations yet.</p>
            <p className="text-white/15 text-xs mt-1">
              Conversations will appear here once users start chatting with your bots.
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-4 gap-4 px-5 py-2.5 border-b border-white/[0.04] text-white/25 text-xs uppercase tracking-widest font-medium">
              <span>Session</span>
              <span>Bot</span>
              <span>Messages</span>
              <span>Date</span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {allConversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/dashboard/conversations/${conv.id}`}
                  className="grid grid-cols-4 gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group items-center"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0">
                      <MessageSquare className="w-3 h-3 text-white/30" />
                    </div>
                    <span className="text-white/50 text-xs font-mono truncate">
                      {conv.sessionId.slice(0, 8)}…
                    </span>
                  </div>
                  <span className="text-white/60 text-sm truncate">{conv.botName}</span>
                  <span className="text-white/40 text-sm">{conv.messageCount}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-white/30 text-xs">
                      {conv.createdAt
                        ? new Date(conv.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/10 group-hover:text-white/30 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
