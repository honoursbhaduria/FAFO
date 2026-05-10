import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Comprehensive list of protected business routes
  const protectedPaths = [
    '/dashboard',
    '/schemes',
    '/compliance',
    '/consultant',
    '/documents',
    '/ai',
    '/profile',
    '/results',
    '/questionnaire',
    '/news/bookmarks'
  ];

  const isProtectedRoute = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // 1. If trying to access protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    console.log(`Unauthenticated access to ${pathname}, redirecting to /login`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If token exists, verify its integrity
  if (token) {
    try {
      await jose.jwtVerify(token, JWT_SECRET);
      
      // Prevent logged-in users from accessing the login page
      if (pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      return NextResponse.next();
    } catch (err) {
      // If token is invalid/expired and trying to access a protected route
      if (isProtectedRoute) {
        console.log(`Invalid token for ${pathname}, clearing session and redirecting`);
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
      }
    }
  }

  return NextResponse.next();
}

// Ensure middleware runs on all relevant routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, videos, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|hero-bg.mp4|.*\\.png|.*\\.jpg).*)',
  ],
};
