import { NextRequest, NextResponse } from 'next/server';

// POST /api/meeting-prep/auth
// Body: { password }
export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password || password !== process.env.CLIENT_PREP_PASSWORD) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('wf_cp', '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
  return res;
}
