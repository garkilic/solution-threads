import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getClientBySlug } from '@/lib/auth';
import { getMeetingPrepClients, saveMeetingPrepClients } from '@/lib/storage-server';

async function getSessionSlug(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return null;
    const { slug } = JSON.parse(session);
    return slug || null;
  } catch {
    return null;
  }
}

// GET /api/meeting-prep/clients?slug=demo
export async function GET(req: NextRequest) {
  const sessionSlug = await getSessionSlug();
  if (!sessionSlug) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug || slug !== sessionSlug) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const client = await getClientBySlug(slug);
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const clients = await getMeetingPrepClients(client.id);
  return NextResponse.json({ clients });
}

// POST /api/meeting-prep/clients
// Body: { slug, clients: Client[] }
export async function POST(req: NextRequest) {
  const sessionSlug = await getSessionSlug();
  if (!sessionSlug) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug, clients } = await req.json();
  if (!slug || slug !== sessionSlug) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const client = await getClientBySlug(slug);
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await saveMeetingPrepClients(client.id, clients);
  return NextResponse.json({ ok: true });
}
