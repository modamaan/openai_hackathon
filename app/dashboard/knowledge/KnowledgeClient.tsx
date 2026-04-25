"use client";

import { useState, useEffect } from "react";
import {
  Globe, Loader2, Plus, Trash2, CheckCircle2, Clock,
  AlertCircle, BookOpen, FileText, Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Bot } from "@/lib/db/schema";

interface Source {
  id: string;
  rawUrl?: string | null;
  url?: string | null;       // legacy alias kept for BotDetailClient compat
  status: string | null;
  errorMessage?: string | null;
  createdAt: Date | null;
  botId: string;
  botName: string;
  type?: string | null;
}

interface Props {
  bots: Bot[];
  initialSources: Source[];
}

const statusConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  done:       { icon: CheckCircle2, label: "Ready",      color: "text-emerald-400" },
  ready:      { icon: CheckCircle2, label: "Ready",      color: "text-emerald-400" },
  processing: { icon: Clock,        label: "Processing", color: "text-amber-400" },
  error:      { icon: AlertCircle,  label: "Error",      color: "text-red-400" },
};

type Mode = "url" | "text";

export default function KnowledgeClient({ bots, initialSources }: Props) {
  const [sources, setSources] = useState<Source[]>(initialSources);
  const [mode, setMode] = useState<Mode>("url");

  // URL mode state
  const [url, setUrl] = useState("");

  // Text mode state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [selectedBot, setSelectedBot] = useState(bots[0]?.id ?? "");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If any source is exactly "processing", we should poll the server
    const hasProcessing = sources.some(s => s.status === "processing");
    if (!hasProcessing) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/sources");
        if (res.ok) {
          const data = await res.json();
          setSources(data.sources);
        }
      } catch (err) {
        // silently ignore poll errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [sources]);

  async function handleAdd() {
    if (!selectedBot) { setError("Please select a bot first"); return; }

    if (mode === "url" && !url.trim()) { setError("Enter a URL"); return; }
    if (mode === "text" && content.trim().length < 20) { setError("Content must be at least 20 characters"); return; }

    setAdding(true);
    setError("");

    try {
      const body =
        mode === "url"
          ? { botId: selectedBot, url: url.trim() }
          : { botId: selectedBot, content: content.trim(), title: title.trim() || "Manual Text" };

      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");

      const data = await res.json();
      const bot = bots.find((b) => b.id === selectedBot);
      setSources((prev) => [{ ...data.source, rawUrl: data.source.rawUrl ?? data.source.url, botName: bot?.name ?? "" }, ...prev]);
      setUrl("");
      setContent("");
      setTitle("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add source");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    setSources((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/sources/${id}`, { method: "DELETE" }).catch(() => null);
  }

  function getSourceLabel(source: Source): string {
    const raw = source.rawUrl ?? source.url ?? "";
    if (raw.startsWith("text://")) return raw.replace("text://", "📝 ");
    return raw;
  }

  function getSourceIcon(source: Source) {
    const raw = source.rawUrl ?? source.url ?? "";
    return raw.startsWith("text://") ? FileText : Globe;
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <BookOpen className="w-5 h-5 text-white/50" />
          <h1 className="text-xl font-semibold text-white">Knowledge Base</h1>
        </div>
        <p className="text-white/30 text-sm">
          Train your chatbots by adding URLs or pasting text content directly.
        </p>
      </div>

      {/* Add Source Card */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white/70 text-sm font-medium">Add Knowledge Source</h2>

          {/* Mode toggle */}
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-lg p-1">
            <button
              onClick={() => { setMode("url"); setError(""); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === "url"
                  ? "bg-white text-black shadow-sm"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <LinkIcon className="w-3 h-3" />
              URL
            </button>
            <button
              onClick={() => { setMode("text"); setError(""); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === "text"
                  ? "bg-white text-black shadow-sm"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <FileText className="w-3 h-3" />
              Text
            </button>
          </div>
        </div>

        {/* Bot selector */}
        {bots.length > 1 && (
          <div className="mb-3">
            <label className="text-white/35 text-xs mb-1.5 block">Select Bot</label>
            <select
              value={selectedBot}
              onChange={(e) => setSelectedBot(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.08] text-white/70 text-sm rounded-lg px-3 py-2 outline-none focus:border-white/20 w-full"
            >
              {bots.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#111] text-white">
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* URL Mode */}
        {mode === "url" && (
          <div className="flex gap-3">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="https://your-docs.com/page"
              className="flex-1 bg-white/[0.04] border border-white/[0.08] text-white text-sm rounded-lg px-3.5 py-2.5 outline-none placeholder:text-white/15 focus:border-white/20 transition-colors"
            />
            <Button
              onClick={handleAdd}
              disabled={adding || !url.trim() || !selectedBot}
              className="bg-white text-black hover:bg-white/90 border-0 rounded-lg px-4 text-sm shrink-0 disabled:opacity-40"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1.5" />Add URL</>}
            </Button>
          </div>
        )}

        {/* Text Mode */}
        {mode === "text" && (
          <div className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (e.g. FAQ, Product Description)"
              className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-sm rounded-lg px-3.5 py-2.5 outline-none placeholder:text-white/15 focus:border-white/20 transition-colors"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your content here — product descriptions, FAQs, support articles, policies..."
              rows={6}
              className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-sm rounded-lg px-3.5 py-2.5 outline-none placeholder:text-white/15 focus:border-white/20 transition-colors resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <p className="text-white/20 text-xs">
                {content.length} chars · Use this for protected pages, PDFs, or custom FAQs
              </p>
              <Button
                onClick={handleAdd}
                disabled={adding || content.trim().length < 20 || !selectedBot}
                className="bg-white text-black hover:bg-white/90 border-0 rounded-lg px-4 text-sm disabled:opacity-40"
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1.5" />Add Text</>}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-xs mt-2.5 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </p>
        )}

        {bots.length === 0 && (
          <p className="text-white/25 text-xs mt-2">
            Create a chatbot first before adding knowledge sources.
          </p>
        )}
      </div>

      {/* Sources Table */}
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/[0.06]">
          <h2 className="text-white/60 text-sm font-medium">Sources ({sources.length})</h2>
        </div>

        {sources.length === 0 ? (
          <div className="py-16 text-center">
            <Globe className="w-8 h-8 text-white/10 mx-auto mb-3" />
            <p className="text-white/20 text-sm">No knowledge sources yet.</p>
            <p className="text-white/10 text-xs mt-1">Add a URL or paste text above to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {sources.map((source) => {
              const cfg = statusConfig[source.status ?? "processing"] ?? statusConfig.processing;
              const StatusIcon = cfg.icon;
              const SourceIcon = getSourceIcon(source);
              return (
                <div
                  key={source.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0">
                    <SourceIcon className="w-3.5 h-3.5 text-white/30" />
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-white/65 text-sm truncate">{getSourceLabel(source)}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-white/25 text-xs">{source.botName}</p>
                      {source.status === "error" && source.errorMessage && (
                        <span className="text-red-400/70 text-[10px] bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/10 truncate max-w-[200px]" title={source.errorMessage}>
                          {source.errorMessage}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs shrink-0 ${cfg.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </div>
                  <p className="text-white/20 text-xs hidden sm:block shrink-0">
                    {source.createdAt ? new Date(source.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </p>
                  <button
                    onClick={() => handleDelete(source.id)}
                    className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all p-1 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
