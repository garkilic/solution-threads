import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (!path.startsWith('/workflows/')) return NextResponse.next();

  const slug = path.split('/')[2];

  // Check top-level session (excludes /access pages)
  if (!path.includes('/access')) {
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
  }

  // Per-workflow password gates (skip the workflow access pages themselves)
  const isClientPrepAccess = path.endsWith('/client-prep/access');
  const isStorytellingAccess = path.endsWith('/storytelling/access');

  if (path.includes('/client-prep') && !isClientPrepAccess) {
    const wfCookie = req.cookies.get('wf_cp')?.value;
    if (!wfCookie) {
      return NextResponse.redirect(new URL(`/workflows/${slug}/client-prep/access`, req.url));
    }
  }

  if (path.includes('/storytelling') && !isStorytellingAccess) {
    const wfCookie = req.cookies.get('wf_st')?.value;
    if (!wfCookie) {
      return NextResponse.redirect(new URL(`/workflows/${slug}/storytelling/access`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/workflows/:path*',
};
