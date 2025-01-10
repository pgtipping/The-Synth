import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Redirect /blog/drafts to /drafts
  if (request.nextUrl.pathname === '/blog/drafts') {
    return NextResponse.redirect(new URL('/drafts', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/blog/drafts',
};
