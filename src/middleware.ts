// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // If user is authenticated, redirect from sign-in, sign-up, verify, or root to dashboard
  if (token && (
    url.pathname.startsWith('/sign-in') ||
    url.pathname.startsWith('/sign-up') ||
    url.pathname.startsWith('/verify') ||
    url.pathname === '/'
  )) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not authenticated, allow access to sign-in and sign-up pages
  if (!token && (
    url.pathname.startsWith('/sign-in') ||
    url.pathname.startsWith('/sign-up') ||
    url.pathname.startsWith('/verify')
  )) {
    return NextResponse.next(); // Allow the request to proceed
  }

  // Redirect unauthenticated users to sign-in instead of /home
  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Allow authenticated users to access other routes (e.g., /dashboard)
  return NextResponse.next();
}

export const config = {
  matcher: ['/sign-in', '/sign-up', '/', '/dashboard/:path*', '/verify/:path*'],
};