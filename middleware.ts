import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

function decodeRole(raw: string | undefined) {
  if (!raw) {
    return null;
  }

  try {
    const normalized = raw.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    const payload = JSON.parse(json) as { role?: string };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  const role = decodeRole(session);

  const protectedRoute = pathname.startsWith("/staff") || pathname.startsWith("/admin");
  if (protectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/staff", request.url));
  }

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL(role === "admin" ? "/admin" : "/staff", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/staff/:path*", "/admin/:path*"]
};
