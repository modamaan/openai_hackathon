"use server";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { bots, sources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function completeOnboardingAction(formData: FormData) {
  const user = await requireUser();
  const companyName = formData.get("companyName") as string;
  const websiteUrl = formData.get("websiteUrl") as string;

  if (!companyName || !websiteUrl) {
    throw new Error("Missing required fields");
  }

  // Create Bot
  const [bot] = await db
    .insert(bots)
    .values({
      userId: user.id,
      name: companyName,
      description: `Initial bot for ${companyName}`,
      systemPrompt: `You are a helpful customer support assistant for ${companyName}. Answer questions based only on the provided knowledge base. If you don't know the answer, say so politely.`,
    })
    .returning();

  // Client will hit /api/sources to create the source and trigger background processing
  return { botId: bot.id };
}
