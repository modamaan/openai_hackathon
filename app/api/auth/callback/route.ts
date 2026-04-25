import { NextRequest, NextResponse } from "next/server";
import { getScalekitClient, setSessionCookie, upsertUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      console.error("Scalekit auth error:", error);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(new URL("/login?error=no_code", request.url));
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
    const client = getScalekitClient();

    // Exchange code for tokens
    const tokenResponse = await client.authenticateWithCode(code, redirectUri);
    const { user: scalekitUser, idToken } = tokenResponse;

    if (!scalekitUser?.email) {
      return NextResponse.redirect(
        new URL("/login?error=no_email", request.url)
      );
    }

    // Upsert user in our DB
    const user = await upsertUser({
      email: scalekitUser.email,
      name: scalekitUser.name ?? scalekitUser.email.split("@")[0],
      scalekitUserId: scalekitUser.id ?? scalekitUser.email,
    });

    // Set session cookie
    await setSessionCookie(user.id);

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(
      new URL("/login?error=auth_failed", request.url)
    );
  }
}
