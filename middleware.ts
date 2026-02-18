import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Check if accessing workflow routes (but not access page)
  if (path.startsWith('/workflows/') && !path.includes('/access')) {
    const session = req.cookies.get('session')?.value;

    if (!session) {
      // Extract slug from path (/workflows/demo/... -> demo)
      const slug = path.split('/')[2];
      return NextResponse.redirect(new URL(`/workflows/${slug}/access`, req.url));
    }

    // Validate session matches slug
    try {
      const { slug: sessionSlug } = JSON.parse(session);
      const requestedSlug = path.split('/')[2];

      if (sessionSlug !== requestedSlug) {
        return NextResponse.redirect(new URL(`/workflows/${requestedSlug}/access`, req.url));
      }
    } catch {
      // Invalid session cookie
      const slug = path.split('/')[2];
      return NextResponse.redirect(new URL(`/workflows/${slug}/access`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/workflows/:path*',
};
