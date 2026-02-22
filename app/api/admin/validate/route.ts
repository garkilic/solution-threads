import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual, createHash } from "crypto";

function safeCompare(a: string, b: string): boolean {
  // Use fixed-length SHA-256 digests so timingSafeEqual never throws on
  // length mismatches, while still preventing timing attacks.
  const bufA = createHash("sha256").update(a).digest();
  const bufB = createHash("sha256").update(b).digest();
  return timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  const adminPassword = process.env.ADMIN_PASSWORD ?? "";

  if (!password || !safeCompare(password, adminPassword)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_session", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
    path: "/",
  });
  return res;
}
