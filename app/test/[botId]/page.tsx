import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { bots } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Script from "next/script";

export default async function TestBotPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;

  // Validate bot exists
  const [bot] = await db
    .select()
    .from(bots)
    .where(eq(bots.id, botId))
    .limit(1);

  if (!bot) notFound();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative font-sans">
      {/* Fake Website Header */}
      <header className="border-b border-white/10 px-8 py-6 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-emerald-500" />
          <span className="font-semibold text-lg tracking-tight">YourSaaS Platform</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-white/50">
          <span>Features</span>
          <span>Pricing</span>
          <span>Contact</span>
          <div className="px-4 py-2 bg-white/10 rounded-md text-white">Login</div>
        </div>
      </header>

      {/* Fake Website Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="inline-flex items-center px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-8">
          Widget Testing Environment
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Check out your <span className="text-emerald-400">new Assistant!</span>
        </h1>
        <p className="text-white/50 max-w-lg mb-10 text-lg">
          This is exactly how the Replyo widget will look when embedded on your public website. 
          Look at the bottom right corner of your screen to interact with {bot.name}.
        </p>

        {/* Fake Dashboard Elements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl border border-white/10 bg-white/[0.02] p-6 text-left flex flex-col justify-between">
              <div className="w-8 h-8 rounded-full bg-white/10 mb-4" />
              <div>
                <div className="w-2/3 h-4 rounded bg-white/10 mb-2" />
                <div className="w-1/2 h-3 rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Injecting the embedded widget SDK just like a customer would */}
      <Script src="/api/sdk.js" data-bot-id={botId} strategy="afterInteractive" />
    </div>
  );
}
