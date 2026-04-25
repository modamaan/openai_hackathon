"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "google" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Authentication failed");
        return;
      }

      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Read error from URL params on mount (from Scalekit callback redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get("error");
    if (urlError) {
      setError(decodeURIComponent(urlError.replace(/_/g, " ")));
    }
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background subtle gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-white/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold text-lg">
            <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-black" />
            </div>
            <span className="text-white tracking-tight">Replyo</span>
          </Link>
          <p className="text-white/30 text-sm mt-3">Sign in to your workspace</p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-7 shadow-2xl">
          <h1 className="text-white text-lg font-semibold mb-1">Welcome back</h1>
          <p className="text-white/30 text-sm mb-7">
            Sign in to start building your AI support assistant.
          </p>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
              {error}
            </div>
          )}

          {/* Google Login */}
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-11 bg-white text-black hover:bg-white/90 border-0 font-medium shadow-lg disabled:opacity-60 flex items-center gap-3 rounded-full"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {loading ? "Redirecting to Google..." : "Continue with Google"}
          </Button>

          <div className="mt-6 pt-5 border-t border-white/[0.05] text-center">
            <p className="text-white/25 text-xs">
              By continuing, you agree to our{" "}
              <span className="text-white/40 hover:text-white cursor-pointer transition-colors">Terms of Service</span>{" "}
              and{" "}
              <span className="text-white/40 hover:text-white cursor-pointer transition-colors">Privacy Policy</span>.
            </p>
          </div>
        </div>

        <p className="text-center text-white/25 text-sm mt-5">
          New here?{" "}
          <button onClick={handleGoogleLogin} className="text-white/60 hover:text-white transition-colors underline underline-offset-2">
            Create a free account
          </button>
        </p>
      </div>
    </div>
  );
}
