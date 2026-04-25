"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bot, Loader2 } from "lucide-react";

export default function NewBotPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    systemPrompt: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create bot");
        return;
      }

      router.push(`/dashboard/bots/${data.bot.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <Link
        href="/dashboard/bots"
        className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to chatbots
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create new chatbot</h1>
        </div>
        <p className="text-white/40 text-sm">
          Set up your AI assistant. You can add knowledge sources after creation.
        </p>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-white/60 text-sm">
              Bot name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Acme Support Bot"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-violet-500/50 h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-white/60 text-sm">
              Description{" "}
              <span className="text-white/25 font-normal">(optional)</span>
            </Label>
            <Input
              id="description"
              placeholder="e.g. Customer support for Acme e-commerce store"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-violet-500/50 h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="systemPrompt" className="text-white/60 text-sm">
              System prompt{" "}
              <span className="text-white/25 font-normal">(optional — leave blank for default)</span>
            </Label>
            <textarea
              id="systemPrompt"
              placeholder={`You are a helpful customer support assistant for [Company]. Answer questions based only on the provided knowledge base...`}
              value={form.systemPrompt}
              onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 resize-none"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !form.name.trim()}
            className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Chatbot"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
