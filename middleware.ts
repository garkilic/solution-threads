import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Admin protection — /admin/dashboard and any sub-routes
  if (path.startsWith('/admin/')) {
    const adminSession = req.cookies.get('admin_session')?.value;
    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  // Workflow protection
  if (!path.startsWith('/workflows/')) return NextResponse.next();

  const slug = path.split('/')[2];

  // Skip the access page itself
  if (path.endsWith('/access')) return NextResponse.next();

  // Check session cookie for all workflow pages
  const session = req.cookies.get('session')?.value;

  if (!session) {
    return NextResponse.redirect(new URL(`/workflows/${slug}/access`, req.url));
  }

  try {
    const { slug: sessionSlug } = JSON.parse(session);
    if (sessionSlug !== slug) {
      return NextResponse.redirect(new URL(`/workflows/${slug}/access`, req.url));
    }
  } catch {
    return NextResponse.redirect(new URL(`/workflows/${slug}/access`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/workflows/:path*', '/admin/:path+'],
};
