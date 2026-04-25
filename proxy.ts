import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/api/auth", "/api/chat", "/api/sdk.js"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  const isPublic =
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".");

  if (isPublic) return NextResponse.next();

  // Check session cookie
  const session = request.cookies.get("chatbot_session");
  if (!session?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
