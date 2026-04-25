import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import OnboardingClient from "./OnboardingClient";
import { db } from "@/lib/db";
import { bots } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // If user already has a bot, send them to dashboard
  const userBots = await db.select().from(bots).where(eq(bots.userId, user.id));
  if (userBots.length > 0) {
    redirect("/dashboard");
  }

  return <OnboardingClient />;
}
