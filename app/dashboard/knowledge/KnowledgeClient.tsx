"use client";

import { useState, useEffect, useRef } from "react";
import {
  Globe, Loader2, Plus, Trash2, CheckCircle2, Clock,
  AlertCircle, BookOpen, FileText, Link as LinkIcon, Upload, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose
} from "@/components/ui/dialog";
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
  content?: string | null;
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

type Mode = "url" | "text" | "file";

export default function KnowledgeClient({ bots, initialSources }: Props) {
  const [sources, setSources] = useState<Source[]>(initialSources);
  const [mode, setMode] = useState<Mode>("url");

  // Mode states
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview state
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<Source | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setTitle(file.name);
    const reader = new FileReader();
    reader.onload = (event) => setContent((event.target?.result as string) || "");
    reader.readAsText(file);
  }

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
      setFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
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
            <button
              onClick={() => { setMode("file"); setError(""); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === "file"
                  ? "bg-white text-black shadow-sm"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <Upload className="w-3 h-3" />
              File
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
                {content.length} chars · Use this for protected pages, PDFs (extracted), or custom FAQs
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

        {/* File Mode */}
        {mode === "file" && (
          <div className="space-y-3">
            <div
              className="w-full bg-white/[0.02] border border-white/[0.08] border-dashed rounded-xl py-12 flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.04] transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-white/30 mb-3" />
              <p className="text-white/70 text-sm font-medium mb-1">
                {fileName ? "File selected" : "Click to select a file"}
              </p>
              <p className="text-white/30 text-xs">
                {fileName || "Supports .txt, .md, .csv"}
              </p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".txt,.md,.csv,.json"
                onChange={handleFileChange}
              />
            </div>
            
            {fileName && (
              <div className="flex items-center justify-between">
                <p className="text-white/20 text-xs text-emerald-400/80">
                  <CheckCircle2 className="inline w-3 h-3 mr-1" />
                  Successfully extracted {content.length} characters
                </p>
                <Button
                  onClick={handleAdd}
                  disabled={adding || content.trim().length < 20 || !selectedBot}
                  className="bg-white text-black hover:bg-white/90 border-0 rounded-lg px-4 text-sm disabled:opacity-40"
                >
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4 mr-1.5" />Upload Dataset</>}
                </Button>
              </div>
            )}
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
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => openPreview(source.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-white transition-all p-1"
                      title="View Scraped Data"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(source.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
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
  );
}
