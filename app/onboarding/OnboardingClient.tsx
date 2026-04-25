"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, ArrowRight, Loader2, Globe, Building2 } from "lucide-react";
import { completeOnboardingAction } from "./actions";

export default function OnboardingClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const url = formData.get("websiteUrl") as string;

    // Very basic URL format normalization
    let formattedUrl = url.trim();
    if (formattedUrl && !formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = "https://" + formattedUrl;
      formData.set("websiteUrl", formattedUrl);
    }

    try {
      const { botId } = await completeOnboardingAction(formData);

      // We immediately trigger the scraping of the URL we just added by letting the bot detail client poll it 
      // or we can hit the API right now, but our action created the Source as "pending". 
      // Actually, we must hit `/api/sources` POST if we want the background scraper to run instantly.
      // Since our server action bypasses the POST /api/sources, we should trigger a fetch to process it:
      await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId, url: formattedUrl }),
      });

      router.push(`/dashboard/bots/${botId}`);
    } catch {
      setError("Something went wrong. Please check your inputs and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-violet-500/30">
      {/* Background subtle gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-violet-600/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 mb-4 shadow-lg shadow-violet-500/20">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Setup your Assistant</h1>
          <p className="text-white/40 text-sm mt-3 max-w-xs mx-auto leading-relaxed">
            Let's create your AI support bot and train it on your website's knowledge base.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-white/70 mb-2">
                Company Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="companyName"
                  name="companyName"
                  required
                  placeholder="e.g. Acme Corp"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-violet-500/50 h-12 pl-10 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-medium text-white/70 mb-2">
                Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  required
                  placeholder="e.g. https://acme.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-violet-500/50 h-12 pl-10 rounded-xl"
                />
              </div>
              <p className="text-white/30 text-xs mt-2 ml-1">
                We'll magically scrape this URL to teach your AI.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-8 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl shadow-lg shadow-violet-500/20 disabled:opacity-50 transition-all group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              <span className="flex items-center justify-center">
                Start Training AI
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
