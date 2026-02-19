import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getClientBySlug } from '@/lib/auth';
import { getBookProject, getBookChapters } from '@/lib/storage-server';

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

// GET /api/storytelling/workspace/[projectId]
// Returns { project, chapters } — verifies project belongs to the session's client
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const sessionSlug = await getSessionSlug();
  if (!sessionSlug) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { projectId } = await params;
  const project = await getBookProject(projectId);

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Verify project belongs to the session's client
  const client = await getClientBySlug(sessionSlug);
  if (!client || project.client_id !== client.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const chapters = await getBookChapters(projectId);
  return NextResponse.json({ project, chapters });
}
