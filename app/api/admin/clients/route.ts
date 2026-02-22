import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { createServerClient } from "@/lib/supabase-server";

// Verify admin session before any operation
async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return !!cookieStore.get("admin_session")?.value;
}

// POST /api/admin/clients — provision a new client tenant
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, slug, accessCode } = await req.json();

    if (!name || !slug) {
      return NextResponse.json(
        { error: "name and slug are required" },
        { status: 400 }
      );
    }

    // Validate slug format: lowercase letters, numbers, hyphens only
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "Slug must contain only lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }

    // Generate a random access code if one wasn't provided
    const plainCode =
      accessCode ||
      Math.random().toString(36).slice(2, 8) +
        Math.random().toString(36).slice(2, 8);

    // Hash the access code before storing
    const hashedCode = await bcrypt.hash(plainCode, 12);

    const db = createServerClient();

    // Check slug uniqueness
    const { data: existing } = await db
      .from("clients")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "A client with this slug already exists" },
        { status: 409 }
      );
    }

    // Insert new client
    const { data: newClient, error } = await db
      .from("clients")
      .insert({ name, slug, access_code: hashedCode })
      .select("id, slug, name, created_at")
      .single();

    if (error || !newClient) {
      console.error("Failed to create client:", error);
      return NextResponse.json(
        { error: "Failed to create client" },
        { status: 500 }
      );
    }

    // Return the plaintext code once — it cannot be recovered after this
    return NextResponse.json({
      id: newClient.id,
      name: newClient.name,
      slug: newClient.slug,
      createdAt: newClient.created_at,
      accessCode: plainCode, // shown once to the admin, then gone
    });
  } catch (err) {
    console.error("Client provisioning error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/admin/clients — list all clients (for the dashboard refresh)
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = createServerClient();
    const { data, error } = await db
      .from("clients")
      .select("id, slug, name, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
    }

    return NextResponse.json({ clients: data || [] });
  } catch (err) {
    console.error("Client list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
