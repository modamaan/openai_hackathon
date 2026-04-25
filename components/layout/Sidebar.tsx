"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MessageSquare,
  LayoutDashboard,
  LogOut,
  Plus,
  Globe,
  BookOpen,
  MessagesSquare,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { User, Bot as BotType } from "@/lib/db/schema";

interface SidebarProps {
  user: User;
  bots: Pick<BotType, "id" | "name">[];
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/dashboard/bots", label: "Chatbots", icon: MessageSquare },
  { href: "/dashboard/conversations", label: "Conversations", icon: MessagesSquare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ user, bots }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-56 flex flex-col bg-[#0a0a0a] border-r border-white/[0.06] shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5 text-black" />
          </div>
          <span className="text-white text-[15px] tracking-tight">Replyo</span>
        </Link>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-white/[0.07] text-white font-medium"
                  : "text-white/40 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        {/* Bots sub-list */}
        {bots.length > 0 && (
          <div className="pt-2 mt-2 border-t border-white/[0.05]">
            <p className="text-white/20 text-[10px] font-semibold uppercase tracking-widest px-3 mb-1.5">
              Your Bots
            </p>
            {bots.map((bot) => (
              <Link
                key={bot.id}
                href={`/dashboard/bots/${bot.id}`}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors",
                  pathname === `/dashboard/bots/${bot.id}`
                    ? "bg-white/[0.06] text-white"
                    : "text-white/35 hover:text-white hover:bg-white/[0.03]"
                )}
              >
                <Globe className="w-3 h-3 shrink-0" />
                <span className="truncate">{bot.name}</span>
                <ChevronRight className="w-3 h-3 ml-auto opacity-40 shrink-0" />
              </Link>
            ))}
          </div>
        )}

        {/* New Bot Button */}
        <div className="pt-2">
          <Link href="/dashboard/bots/new">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-white/[0.07] bg-transparent text-white/40 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.12] text-xs h-8 justify-start"
            >
              <Plus className="w-3.5 h-3.5 mr-2" />
              New Chatbot
            </Button>
          </Link>
        </div>
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/60 font-semibold text-xs shrink-0">
            {(user.name ?? user.email)[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs font-medium truncate">{user.name ?? "User"}</p>
            <p className="text-white/25 text-[10px] truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/20 hover:text-white/60 transition-colors p-1"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
