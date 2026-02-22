import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { slug, code } = await req.json();

    if (!slug || !code) {
      return NextResponse.json(
        { error: "Slug and code are required" },
        { status: 400 }
      );
    }

    // Look up the client by slug using the service-role key (server only)
    const db = createServerClient();
    const { data: client, error } = await db
      .from("clients")
      .select("id, slug, access_code")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !client) {
      // Return the same error as a bad code — don't reveal whether the slug exists
      return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
    }

    // Support both bcrypt hashes (new clients) and plaintext codes (legacy/seed data)
    const storedCode = client.access_code as string;
    const isBcryptHash = storedCode.startsWith("$2");
    const valid = isBcryptHash
      ? await bcrypt.compare(code, storedCode)
      : code === storedCode;

    if (!valid) {
      return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
    }

    // Set session cookies — store only the slug, never the plaintext code
    const cookieStore = await cookies();
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax" as const,
      path: "/",
    };

    cookieStore.set("session", JSON.stringify({ slug }), cookieOptions);
    cookieStore.set("wf_cp", "1", cookieOptions);
    cookieStore.set("wf_st", "1", cookieOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Access validation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
