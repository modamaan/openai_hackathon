import { NextRequest, NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const provider: string = body.provider ?? "google";

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
    const authUrl = getAuthorizationUrl(redirectUri, provider);

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error("Auth login error:", error);
    return NextResponse.json(
      { error: "Failed to initiate authentication" },
      { status: 500 }
    );
  }
}
