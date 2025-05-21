import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware ensures that the app works correctly on Netlify
export function middleware(request: NextRequest) {
  // Continue with the request as normal
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
