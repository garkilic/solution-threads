import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getClientBySlug } from '@/lib/auth';
import { getMeetingPrepOutput } from '@/lib/storage-server';

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

// GET /api/meeting-prep/output/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionSlug = await getSessionSlug();
  if (!sessionSlug) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const client = await getClientBySlug(sessionSlug);
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const output = await getMeetingPrepOutput(id);
  if (!output) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ output });
}
