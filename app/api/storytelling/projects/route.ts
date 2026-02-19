import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getClientBySlug } from '@/lib/auth';
import { getBookProjects, createBookProject } from '@/lib/storage-server';

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

// GET /api/storytelling/projects?slug=demo
export async function GET(req: NextRequest) {
  const sessionSlug = await getSessionSlug();
  if (!sessionSlug) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug || slug !== sessionSlug) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await getClientBySlug(slug);
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const projects = await getBookProjects(client.id);
  return NextResponse.json({ projects });
}

// POST /api/storytelling/projects
// Body: { slug, title, subjectName, artStyle, targetAge, ancestryData?, oralHistory?, chapterOutline? }
export async function POST(req: NextRequest) {
  const sessionSlug = await getSessionSlug();
  if (!sessionSlug) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { slug, ...data } = body;

  if (!slug || slug !== sessionSlug) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await getClientBySlug(slug);
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const id = await createBookProject(client.id, data);
  return NextResponse.json({ id });
}
