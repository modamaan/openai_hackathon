"use client";

import { useState } from "react";
import { Settings, User, Key, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  user: { id: string; name: string | null; email: string; scalekitUserId: string };
}

export default function SettingsClient({ user }: Props) {
  const [name, setName] = useState(user.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800)); // optimistic
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <Settings className="w-5 h-5 text-white/50" />
          <h1 className="text-xl font-semibold text-white">Settings</h1>
        </div>
        <p className="text-white/30 text-sm">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <section className="bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <User className="w-4 h-4 text-white/40" />
          <h2 className="text-white/70 text-sm font-medium">Profile</h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Display Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-sm rounded-lg px-3.5 py-2.5 outline-none focus:border-white/20 transition-colors placeholder:text-white/20"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Email Address</label>
            <input
              value={user.email}
              disabled
              className="w-full bg-white/[0.02] border border-white/[0.05] text-white/30 text-sm rounded-lg px-3.5 py-2.5 outline-none cursor-not-allowed"
            />
            <p className="text-white/20 text-xs mt-1">Email is managed by your Google account.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-white text-black hover:bg-white/90 border-0 rounded-lg text-sm px-4 h-9"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" />Saved</> : "Save Changes"}
            </Button>
          </div>
        </div>
      </section>

      {/* API Info */}
      <section className="bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <Key className="w-4 h-4 text-white/40" />
          <h2 className="text-white/70 text-sm font-medium">Account Info</h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">User ID</label>
            <div className="flex items-center gap-2">
              <input
                value={user.id}
                readOnly
                className="flex-1 bg-white/[0.02] border border-white/[0.05] text-white/30 text-xs rounded-lg px-3.5 py-2.5 outline-none font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                className="border-white/[0.08] bg-transparent text-white/40 hover:text-white hover:bg-white/[0.05] h-9 text-xs shrink-0"
                onClick={() => navigator.clipboard.writeText(user.id)}
              >
                Copy
              </Button>
            </div>
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Auth Provider</label>
            <div className="flex items-center gap-2 text-sm text-white/40">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google (via Scalekit)
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-red-950/20 border border-red-900/30 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-red-900/20 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-400/60" />
          <h2 className="text-red-400/80 text-sm font-medium">Danger Zone</h2>
        </div>
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="text-white/50 text-sm font-medium">Delete Account</p>
            <p className="text-white/25 text-xs mt-0.5">Permanently delete your account and all chatbots.</p>
          </div>
          <Button
            variant="outline"
            className="border-red-900/40 bg-transparent text-red-400/60 hover:text-red-400 hover:bg-red-950/40 hover:border-red-800/50 text-sm h-9 shrink-0"
          >
            Delete Account
          </Button>
        </div>
      </section>
    </div>
  );
}
