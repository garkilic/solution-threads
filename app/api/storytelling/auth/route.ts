import { NextRequest, NextResponse } from 'next/server';

// POST /api/storytelling/auth
// Body: { password }
export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password || password !== process.env.STORYTELLING_PASSWORD) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('wf_st', '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
  return res;
}
