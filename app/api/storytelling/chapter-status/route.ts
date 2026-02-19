import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateChapterStatus } from '@/lib/storage-server';

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

// POST /api/storytelling/chapter-status
// Body: { chapterId, status, feedback? }
export async function POST(req: NextRequest) {
  const sessionSlug = await getSessionSlug();
  if (!sessionSlug) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { chapterId, status, feedback } = await req.json();

  if (!chapterId || !status) {
    return NextResponse.json({ error: 'chapterId and status required' }, { status: 400 });
  }

  await updateChapterStatus(chapterId, status, feedback);
  return NextResponse.json({ ok: true });
}
