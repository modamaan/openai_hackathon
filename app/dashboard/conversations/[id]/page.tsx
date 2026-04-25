import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { bots, conversations, messages } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, MessageSquare, User, Sparkles, Mail, Phone } from "lucide-react";

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const conv = await db
    .select({
      id: conversations.id,
      sessionId: conversations.sessionId,
      createdAt: conversations.createdAt,
      botName: bots.name,
      visitorEmail: conversations.visitorEmail,
      visitorPhone: conversations.visitorPhone,
      isLead: conversations.isLead,
    })
    .from(conversations)
    .innerJoin(bots, eq(conversations.botId, bots.id))
    .where(eq(conversations.id, id))
    .limit(1);

  if (!conv[0]) return notFound();

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  return (
    <div className="p-8 max-w-3xl">
      {/* Back */}
      <Link href="/dashboard/conversations" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/70 text-sm mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        All Conversations
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white mb-1">{conv[0].botName}</h1>
          <p className="text-white/30 text-xs font-mono">Session: {conv[0].sessionId}</p>
        </div>
        <span className="text-white/25 text-xs">
          {conv[0].createdAt ? new Date(conv[0].createdAt).toLocaleString() : ""}
        </span>
      </div>

      {/* Lead Banner */}
      {conv[0].isLead && (conv[0].visitorEmail || conv[0].visitorPhone) && (
        <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-emerald-400 text-sm font-semibold mb-0.5">Capturered Lead</p>
              <p className="text-emerald-400/70 text-xs font-medium font-mono">{conv[0].visitorPhone || conv[0].visitorEmail}</p>
            </div>
          </div>
          <a 
            href={conv[0].visitorPhone ? `tel:${conv[0].visitorPhone}` : `mailto:${conv[0].visitorEmail}?subject=Following up`}
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg text-sm font-semibold transition-colors shrink-0"
          >
            {conv[0].visitorPhone ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            {conv[0].visitorPhone ? "Call Visitor" : "Email Visitor"}
          </a>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-4">
        {msgs.map((msg) => {
          const isBot = msg.role === "assistant";
          return (
            <div key={msg.id} className={`flex gap-3 ${isBot ? "" : "flex-row-reverse"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                isBot ? "bg-white/[0.06] border border-white/[0.08]" : "bg-white/10 border border-white/10"
              }`}>
                {isBot
                  ? <MessageSquare className="w-3.5 h-3.5 text-white/40" />
                  : <User className="w-3.5 h-3.5 text-white/60" />
                }
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                isBot
                  ? "bg-white/[0.04] border border-white/[0.07] text-white/70 rounded-tl-sm"
                  : "bg-white text-black rounded-tr-sm"
              }`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        {msgs.length === 0 && (
          <p className="text-white/25 text-sm text-center py-8">No messages in this conversation.</p>
        )}
      </div>
    </div>
  );
}
