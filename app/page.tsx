import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-black/90 backdrop-blur-md border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-black" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight">Replyo</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#integration" className="hover:text-white transition-colors">Integration</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5 text-sm h-9 px-4">
              Sign in
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-white text-black hover:bg-white/90 text-sm h-9 px-4 font-medium rounded-full border-0">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pt-28 pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-xs text-white/60 mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Version 1.0.0 available now!
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-5">
          Human-Friendly Support,
          <br />
          <span className="text-white/40">powered by AI.</span>
        </h1>

        <p className="text-white/40 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Instantly resolve customer questions with an assistant that reads your docs and speaks with empathy. No robotic replies, just answers.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link href="/login">
            <Button className="bg-white text-black hover:bg-white/90 h-11 px-6 text-sm font-medium rounded-full border-0">
              Start for free →
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" className="h-11 px-6 text-sm border-white/15 bg-transparent text-white hover:bg-white/5 hover:border-white/25 rounded-full">
              View Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Chat Demo Preview ──────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <div className="bg-[#111] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
          {/* Demo header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-white/50 text-xs font-medium">Replyo Support</span>
          </div>

          {/* Messages */}
          <div className="p-5 space-y-4">
            {/* Bot message */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-white/60" />
              </div>
              <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-white/80 max-w-xs">
                Hi there! How can I help you today?
              </div>
            </div>

            {/* Quick replies */}
            <div className="flex gap-2 ml-10 flex-wrap">
              {["FAQ", "Pricing", "Support"].map((t) => (
                <span key={t} className="text-xs border border-white/10 text-white/40 px-3 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>

            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-white text-black rounded-2xl rounded-br-sm px-4 py-2.5 text-sm max-w-xs font-medium">
                I need some information about Replyo
              </div>
            </div>

            {/* Bot reply */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-white/60" />
              </div>
              <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-white/80 max-w-sm leading-relaxed">
                <span className="text-emerald-400">Replyo</span> is an AI customer support assistant designed to instantly resolve customer questions by reading your documentation and responding with empathy.{" "}
                <span className="text-white/40">No robotic replies, just human-friendly answers.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" className="relative overflow-hidden py-24">
        {/* ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-teal-900/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6">
          <div className="mb-14">
            <h2 className="text-4xl font-bold text-white mb-3">Designed for trust</h2>
            <p className="text-white/40 text-base max-w-md leading-relaxed">
              Most AI support tools hallucinate. Ours is strictly grounded in your content, with a personality you control.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: "📖",
                title: "Knowledge Graph",
                desc: "We crawl your site and docs to build a structured understanding of your product. No manual training required.",
              },
              {
                icon: "🛡",
                title: "Strict Guardrails",
                desc: "Define exactly what the AI can and cannot say. It will politely decline out-of-scope questions.",
              },
              {
                icon: "⚡",
                title: "Smart Lead Capture",
                desc: "Automatically collects mobile numbers when handling complex queries, turning anonymous visits into real business leads.",
              },
              {
                icon: "👔",
                title: "One-Click Handoff",
                desc: "View all captured leads directly in your dashboard with an instant 'Call Visitor' action for your human agents.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all"
              >
                <div className="text-2xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-white mb-2 text-[15px]">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integration ─────────────────────────────────────────────────────── */}
      <section id="integration" className="py-24 max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-4">Drop-in simplicity.</h2>
            <p className="text-white/40 text-base mb-8 leading-relaxed">
              No complex SDKs or user syncing. Just add our script tag and you&apos;re live. We inherit your CSS variables automatically.
            </p>
            <ol className="space-y-3">
              {[
                "Scan your documentation URL",
                "Copy the embed snippet",
                "Auto-resolve tickets",
              ].map((step, i) => (
                <li key={step} className="flex items-center gap-3 text-sm text-white/50">
                  <span className="w-5 h-5 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-xs text-white/40 shrink-0 font-mono">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Code snippet */}
          <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
            {/* Mac dots */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-auto text-white/20 text-xs font-mono">index.html</span>
            </div>
            <div className="p-5 font-mono text-xs leading-relaxed">
              <p className="text-white/30">{`<!-- Replyo Support -->`}</p>
              <p className="text-emerald-400 mt-1">{`<script`}</p>
              <p className="text-sky-300 pl-4">{`  src="https://replyo.ai/sdk.js"`}</p>
              <p className="text-amber-300 pl-4">{`  data-bot-id="your-bot-id"`}</p>
              <p className="text-white/50 pl-4">{`  defer`}</p>
              <p className="text-emerald-400">{`>`}</p>
              <p className="text-emerald-400">{`</script>`}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-3">Simple pricing</h2>
        <p className="text-white/40 mb-12">Start free. Scale as you grow.</p>

        <div className="grid md:grid-cols-3 gap-5 text-left">
          {[
            {
              name: "Starter",
              price: "Free",
              desc: "Perfect for indie makers",
              features: ["1 chatbot", "500 messages/mo", "1 URL source", "Embed widget"],
              cta: "Get started",
              highlight: false,
            },
            {
              name: "Pro",
              price: "$29",
              desc: "For growing businesses",
              features: ["5 chatbots", "10,000 messages/mo", "Unlimited URL sources", "Smart Lead Capture", "Analytics"],
              cta: "Start free trial",
              highlight: true,
            },
            {
              name: "Business",
              price: "$99",
              desc: "For scaling teams",
              features: ["Unlimited chatbots", "Unlimited messages", "File upload sources", "CRM Integrations", "SSO & Teams"],
              cta: "Contact sales",
              highlight: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 border ${
                plan.highlight
                  ? "bg-white text-black border-white"
                  : "bg-white/[0.02] border-white/[0.08] text-white"
              }`}
            >
              <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${plan.highlight ? "text-black/50" : "text-white/30"}`}>
                {plan.name}
              </p>
              <div className="text-3xl font-bold mb-1">{plan.price}</div>
              <p className={`text-sm mb-6 ${plan.highlight ? "text-black/50" : "text-white/40"}`}>{plan.desc}</p>
              <ul className="space-y-2 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className={`text-sm flex items-center gap-2 ${plan.highlight ? "text-black/70" : "text-white/50"}`}>
                    <span className={`${plan.highlight ? "text-black" : "text-emerald-400"}`}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/login">
                <Button
                  className={`w-full rounded-full border-0 text-sm font-medium ${
                    plan.highlight
                      ? "bg-black text-white hover:bg-black/80"
                      : "bg-white/[0.06] text-white hover:bg-white/10"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-8 px-8 flex items-center justify-between text-white/25 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-white flex items-center justify-center">
            <MessageSquare className="w-3 h-3 text-black" />
          </div>
          <span className="text-white/40 font-medium">Replyo</span>
        </div>
        <p>© 2025 Replyo. Built with Next.js, Scalekit, ZenRows & OpenAI.</p>
      </footer>
    </div>
  );
}
