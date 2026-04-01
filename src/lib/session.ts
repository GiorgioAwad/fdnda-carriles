import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/constants";
import type { SessionUser, UserRole } from "@/lib/types";

function encodeSession(session: SessionUser) {
  return Buffer.from(JSON.stringify(session), "utf-8").toString("base64url");
}

function decodeSession(raw: string) {
  return JSON.parse(Buffer.from(raw, "base64url").toString("utf-8")) as SessionUser;
}

export async function getSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  try {
    return decodeSession(raw);
  } catch {
    return null;
  }
}

export async function setSession(session: SessionUser) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function requireSession(requiredRole?: UserRole) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (requiredRole === "admin" && session.role !== "admin") {
    redirect("/staff");
  }

  return session;
}
