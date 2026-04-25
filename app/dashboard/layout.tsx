import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { bots } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Sidebar from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const allBots = await db
    .select({ id: bots.id, name: bots.name })
    .from(bots)
    .where(eq(bots.userId, user.id))
    .orderBy(bots.createdAt);

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      <Sidebar user={user} bots={allBots} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
