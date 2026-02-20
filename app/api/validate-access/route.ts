import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { slug, code } = await req.json();

    if (!slug || !code) {
      return NextResponse.json(
        { error: 'Slug and code are required' },
        { status: 400 }
      );
    }

    if (code !== process.env.DEMO_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 401 }
      );
    }

    // Set all access cookies at once
    const cookieStore = await cookies();
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax' as const,
      path: '/',
    };

    cookieStore.set('session', JSON.stringify({ slug, code }), cookieOptions);
    cookieStore.set('wf_cp', '1', cookieOptions);
    cookieStore.set('wf_st', '1', cookieOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Access validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
