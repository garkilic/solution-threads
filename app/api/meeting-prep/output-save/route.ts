import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getClientBySlug } from '@/lib/auth';
import { saveMeetingPrepOutput } from '@/lib/storage-server';

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

// POST /api/meeting-prep/output-save
// Body: { slug, contactName, contactCompany, context?, keyStats?, sections }
export async function POST(req: NextRequest) {
  const sessionSlug = await getSessionSlug();
  if (!sessionSlug) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug, contactName, contactCompany, context, keyStats, sections } = await req.json();
  if (!slug || slug !== sessionSlug) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const client = await getClientBySlug(slug);
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const runId = await saveMeetingPrepOutput(client.id, contactName, contactCompany, context, keyStats, sections);
  return NextResponse.json({ id: runId });
}
