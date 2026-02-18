import { NextRequest, NextResponse } from 'next/server';
import { validateAccessCode } from '@/lib/auth';
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

    const valid = await validateAccessCode(slug, code);

    if (valid) {
      // Set session cookie
      const cookieStore = await cookies();
      cookieStore.set('session', JSON.stringify({ slug, code }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid access code' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Access validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
