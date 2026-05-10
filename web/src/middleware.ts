import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Define protected routes
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/schemes') ||
    pathname.startsWith('/compliance') ||
    pathname.startsWith('/consultant') ||
    pathname.startsWith('/documents') ||
    pathname.startsWith('/ai') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/results');

  // 1. If trying to access protected route without token
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If token exists, verify it
  if (token) {
    try {
      await jose.jwtVerify(token, JWT_SECRET);
      
      // If already logged in and trying to access login page, go to dashboard
      if (pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      return NextResponse.next();
    } catch (err) {
      // Invalid/Expired token
      if (isProtectedRoute) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/schemes/:path*',
    '/compliance/:path*',
    '/consultant/:path*',
    '/documents/:path*',
    '/ai/:path*',
    '/profile/:path*',
    '/results/:path*',
    '/login',
  ],
};
