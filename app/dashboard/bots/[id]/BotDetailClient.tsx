"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Bot,
  Globe,
  Loader2,
  Copy,
  Check,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Code2,
  Eye,
  Settings,
  PencilRuler,
} from "lucide-react";
import type { Bot as BotType, Source } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose
} from "@/components/ui/dialog";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://your-domain.com";

export default function BotDetailClient({
  bot,
  sources: initialSources,
}: {
  bot: BotType;
  sources: Source[];
}) {
  const router = useRouter();
  const [sources, setSources] = useState<Source[]>(initialSources);
  const [url, setUrl] = useState("");
  const [addingUrl, setAddingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"sources" | "embed" | "test" | "settings">("sources");

  // Settings State
  const [faqs, setFaqs] = useState(() => {
    try { return JSON.parse((bot as any).suggestedQuestions || "[]").join("\n"); } catch { return ""; }
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Preview state
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<(Source & { content?: string | null }) | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const embedCode = `<script
  src="${APP_URL}/api/sdk.js"
  data-bot-id="${bot.id}"
  defer
></script>`;

  async function handleAddUrl(e: React.FormEvent) {
    e.preventDefault();
    setAddingUrl(true);
    setUrlError(null);

    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId: bot.id, url }),
      });

      const data = await res.json();
      if (!res.ok) {
        setUrlError(data.error ?? "Failed to add URL");
        return;
      }

      setSources((prev) => [data.source, ...prev]);
      setUrl("");

      // Poll for status updates
      pollSourceStatus(data.source.id);
    } catch {
      setUrlError("Something went wrong.");
    } finally {
      setAddingUrl(false);
    }
  }

  function pollSourceStatus(sourceId: string) {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/sources?botId=${bot.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setSources(data.sources);

      const source = data.sources.find((s: Source) => s.id === sourceId);
      if (source?.status === "done" || source?.status === "error") {
        clearInterval(interval);
      }
    }, 3000);

    // Stop polling after 2 minutes
    setTimeout(() => clearInterval(interval), 120_000);
  }

  async function handleDeleteSource(sourceId: string) {
    setSources((prev) => prev.filter((s) => s.id !== sourceId));
    // Note: add DELETE /api/sources/[id] for production
  }

  async function openPreview(id: string) {
    setPreviewId(id);
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/sources/${id}`);
      if (res.ok) {
        const { source } = await res.json();
        setPreviewData(source);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPreviewLoading(false);
    }
  }

  function copyEmbed() {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const tabs = [
    { id: "sources", label: "Knowledge Base" },
    { id: "embed", label: "Embed Code" },
    { id: "test", label: "Test Chat" },
    { id: "settings", label: "Settings" },
  ] as const;

  async function handleSaveSettings() {
    setSavingSettings(true);
    setSettingsError(null);
    setSettingsSuccess(false);

    try {
      const suggestedQuestions = JSON.stringify(faqs.split("\n").map((q: string) => q.trim()).filter(Boolean));
      const res = await fetch(`/api/bots/${bot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestedQuestions }),
      });

      if (!res.ok) {
        setSettingsError("Failed to save settings");
        return;
      }
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch {
      setSettingsError("An error occurred");
    } finally {
      setSavingSettings(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      {/* Bot header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-0.5">{bot.name}</h1>
          <p className="text-white/40 text-sm">{bot.description ?? "No description"}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-violet-300/60 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full font-mono">
              {bot.id}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm transition-all",
              activeTab === tab.id
                ? "bg-violet-600/80 text-white font-medium shadow-sm"
                : "text-white/40 hover:text-white/70"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Knowledge Base */}
      {activeTab === "sources" && (
        <div className="space-y-4">
          {/* Add URL form */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-1">Add a website URL</h2>
            <p className="text-white/40 text-xs mb-4">
              We&apos;ll scrape the page, summarise it with AI, and build your knowledge base.
            </p>
            <form onSubmit={handleAddUrl} className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yoursite.com/about"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-violet-500/50 h-11 pl-9"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={addingUrl || !url}
                className="bg-violet-600 hover:bg-violet-500 text-white border-0 h-11 px-5 shrink-0 disabled:opacity-50"
              >
                {addingUrl ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Add URL"
                )}
              </Button>
            </form>
            {urlError && (
              <p className="text-red-400 text-xs mt-2">{urlError}</p>
            )}
          </div>

          {/* Sources list */}
          {sources.length > 0 ? (
            <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-white/[0.06]">
                <p className="text-white/60 text-sm font-medium">
                  {sources.length} source{sources.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {sources.map((src) => (
                  <div
                    key={src.id}
                    className="flex items-center gap-3 px-5 py-3.5"
                  >
                    <SourceStatusIcon status={src.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-sm truncate">
                        {src.rawUrl}
                      </p>
                      <p className="text-white/30 text-xs capitalize">{src.status}{src.status === "processing" ? "..." : ""}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openPreview(src.id)}
                        className="text-white/20 hover:text-white transition-colors p-1"
                        title="View Scraped Data"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSource(src.id)}
                        className="text-white/20 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-12 text-center">
              <Globe className="w-8 h-8 text-white/15 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No sources yet. Add a URL above to train your bot.</p>
            </div>
          )}

          {/* Preview Dialog */}
          <Dialog open={!!previewId} onOpenChange={(open) => !open && setPreviewId(null)}>
            <DialogContent className="bg-[#111] border-white/10 text-white max-w-4xl max-h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Source Preview</DialogTitle>
                <DialogDescription className="text-white/40 truncate pr-8">
                  {previewData?.rawUrl ?? "Loading dataset..."}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto mt-4 pr-2 custom-scrollbar border border-white/5 bg-black/50 rounded-lg p-4">
                {previewLoading ? (
                  <div className="h-40 flex items-center justify-center text-white/30">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : previewData ? (
                  <pre className="text-xs text-white/70 font-mono whitespace-pre-wrap break-words leading-relaxed select-text">
                    {previewData.content || "No content extracted. Source may still be processing or failed."}
                  </pre>
                ) : (
                  <div className="h-40 flex items-center justify-center text-red-400/50 text-sm">
                    Failed to load source data.
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Tab: Embed Code */}
      {activeTab === "embed" && (
        <div className="space-y-4">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-violet-400" />
                <h2 className="text-white font-semibold">Embed your chatbot</h2>
              </div>
              <Link href={`/test/${bot.id}`} target="_blank" className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-500/20">
                <Globe className="w-3.5 h-3.5" />
                Live Playground (New Tab)
              </Link>
            </div>
            <p className="text-white/40 text-sm mb-5">
              Copy the script below and paste it before the closing{" "}
              <code className="text-violet-300 bg-violet-500/10 px-1 rounded text-xs">
                &lt;/body&gt;
              </code>{" "}
              tag of any webpage.
            </p>
            <div className="relative bg-black/40 border border-white/[0.08] rounded-xl p-4 font-mono">
              <pre className="text-green-300/80 text-xs overflow-x-auto whitespace-pre-wrap">
                {embedCode}
              </pre>
              <Button
                onClick={copyEmbed}
                size="sm"
                className="absolute top-3 right-3 h-7 bg-white/10 hover:bg-white/15 text-white border-0 text-xs"
              >
                {copied ? (
                  <Check className="w-3 h-3 mr-1 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3 mr-1" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-5">
            <p className="text-violet-300/80 text-sm font-medium mb-1">
              ⚡ How it works
            </p>
            <ul className="text-violet-300/50 text-xs space-y-1.5">
              <li>• The script loads a lightweight chat widget (~8KB gzipped)</li>
              <li>• It uses your bot ID to fetch responses from your knowledge base</li>
              <li>• No CORS issues — the API allows all origins for chat requests</li>
              <li>• Visitors&apos; sessions are anonymous by default</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === "settings" && (
        <div className="space-y-4">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-violet-400" />
              <h2 className="text-white font-semibold">Bot Configuration</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm font-medium mb-1.5 block">Suggested Questions (FAQs)</label>
                <p className="text-white/40 text-xs mb-3">
                  These appear as clickable pills when the user first opens the chat. Enter one question per line.
                </p>
                <textarea
                  value={faqs}
                  onChange={(e) => setFaqs(e.target.value)}
                  placeholder="What are your services?\nHow do I contact support?\nWhat is your pricing?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-violet-500/50 outline-none resize-none leading-relaxed"
                  rows={5}
                />
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="bg-violet-600 hover:bg-violet-500 text-white border-0"
                >
                  {savingSettings ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                  Save Settings
                </Button>
              </div>

              {settingsSuccess && <p className="text-emerald-400 text-sm mt-3 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Settings updated successfully</p>}
              {settingsError && <p className="text-red-400 text-sm mt-3 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {settingsError}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Test Chat */}
      {activeTab === "test" && (
        <TestChat botId={bot.id} botName={bot.name} suggestedQuestionsStr={(bot as any).suggestedQuestions || null} />
      )}
    </div>
  );
}

function SourceStatusIcon({ status }: { status: string | null }) {
  if (status === "done") return <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />;
  if (status === "error") return <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />;
  if (status === "processing") return <RefreshCw className="w-4 h-4 text-violet-400 shrink-0 animate-spin" />;
  return <Clock className="w-4 h-4 text-white/30 shrink-0" />;
}

function TestChat({ botId, botName, suggestedQuestionsStr }: { botId: string; botName: string; suggestedQuestionsStr: string | null }) {
  const [msgs, setMsgs] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const sessionId = useState(() => crypto.randomUUID())[0];

  const suggestedQuestions = (() => {
    try { return JSON.parse(suggestedQuestionsStr || "[]") as string[]; } catch { return []; }
  })();

  async function sendMessage(e?: React.FormEvent, presetMessage?: string) {
    if (e) e.preventDefault();
    const userMsg = presetMessage || input.trim();
    if (!userMsg || loading) return;

    setMsgs((prev) => [...prev, { role: "user", content: userMsg }]);
    if (!presetMessage) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId, message: userMsg, sessionId }),
      });

      if (!res.ok) {
        setMsgs((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = "";

      setMsgs((prev) => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Parse Vercel AI SDK data stream
        for (const line of chunk.split("\n")) {
          if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2));
              assistantMsg += text;
              setMsgs((prev) => [
                ...prev.slice(0, -1),
                { role: "assistant", content: assistantMsg },
              ]);
            } catch {}
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col h-[500px]">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <span className="text-white/60 text-sm">{botName} — Test Mode</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.length === 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-white/60 max-w-xs">
                Hi there! 👋 Welcome to {botName}. How can I help you today?
              </div>
            </div>
            
            {suggestedQuestions.length > 0 && (
              <div className="flex flex-wrap gap-2 pl-9">
                {suggestedQuestions.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(undefined, q)}
                    className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-medium hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all hover:-translate-y-px whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {msgs.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2.5`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-violet-400" />
              </div>
            )}
            <div
              className={cn(
                "px-3 py-2 rounded-2xl text-sm max-w-sm",
                msg.role === "user"
                  ? "bg-violet-600/70 text-white rounded-br-sm"
                  : "bg-white/[0.04] border border-white/[0.07] text-white/70 rounded-tl-sm"
              )}
            >
              {msg.content || (loading && msg.role === "assistant" ? <span className="animate-pulse">▋</span> : "")}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-white/[0.06]">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a test message..."
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-violet-500/50 h-10"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-violet-600 hover:bg-violet-500 text-white border-0 h-10 px-4 shrink-0 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
}
