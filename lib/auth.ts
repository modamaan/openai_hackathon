import { ScalekitClient } from "@scalekit-sdk/node";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { User } from "@/lib/db/schema";

// ── Scalekit Client (singleton) ────────────────────────────────────────────
let _scalekitClient: ScalekitClient | null = null;

export function getScalekitClient(): ScalekitClient {
  if (!_scalekitClient) {
    if (
      !process.env.SCALEKIT_ENV_URL ||
      !process.env.SCALEKIT_CLIENT_ID ||
      !process.env.SCALEKIT_CLIENT_SECRET
    ) {
      throw new Error("Scalekit environment variables are not configured");
    }
    _scalekitClient = new ScalekitClient(
      process.env.SCALEKIT_ENV_URL,
      process.env.SCALEKIT_CLIENT_ID,
      process.env.SCALEKIT_CLIENT_SECRET
    );
  }
  return _scalekitClient;
}

// ── Session cookie helpers ─────────────────────────────────────────────────
const SESSION_COOKIE = "chatbot_session";

export async function setSessionCookie(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value ?? null;
}

// ── Get current authenticated user ────────────────────────────────────────
export async function getCurrentUser(): Promise<User | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}

// ── Require authenticated user (throw if not) ─────────────────────────────
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

// ── Upsert user from Scalekit profile ─────────────────────────────────────
export async function upsertUser(params: {
  email: string;
  name?: string | null;
  scalekitUserId: string;
}): Promise<User> {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, params.email))
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const [newUser] = await db
    .insert(users)
    .values({
      email: params.email,
      name: params.name ?? null,
      scalekitUserId: params.scalekitUserId,
    })
    .returning();

  return newUser;
}

// ── Build Scalekit authorization URL (social login) ───────────────────────
// We use provider: "google" for B2C social login.
// Enterprise SSO requires organization_id/domain — not needed here.
export function getAuthorizationUrl(
  redirectUri: string,
  provider: string = "google"
): string {
  const client = getScalekitClient();
  return client.getAuthorizationUrl(redirectUri, {
    scopes: ["openid", "profile", "email"],
    provider,
  });
}
