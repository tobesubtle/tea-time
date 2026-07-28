import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  let hasSupabaseUser = false;
  let supabaseRole = 'user'; // 로그인한 세션의 기본 role fallback을 user로 설정

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('mock')) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
              response = NextResponse.next({
                request,
              });
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              );
            },
          },
        }
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        hasSupabaseUser = true;
        supabaseRole = user.user_metadata?.role || user.app_metadata?.role || 'user';
      }
    } catch {
      // ignore
    }
  }

  const isAuthenticated = hasSupabaseUser;
  const userRole = hasSupabaseUser ? supabaseRole : 'user';

  const pathname = request.nextUrl.pathname;

  const isAuthRoute = pathname.startsWith('/login');
  const isAdminRoute = pathname.startsWith('/admin');

  // 1. 비로그인 유저가 /admin 접근 시 /login으로 이동
  if (isAdminRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. 명시적 일반 사용자(role === 'user')가 /admin 접근 시 /templates(초기화면)으로 차단 리다이렉트
  if (isAdminRoute && userRole === 'user') {
    return NextResponse.redirect(new URL('/templates', request.url));
  }

  // 3. 이미 로그인한 유저가 /login 접속 시 /templates(초기화면)으로 이동
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/templates', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/', '/admin/:path*', '/login'],
};
