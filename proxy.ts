import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  let hasSupabaseUser = false;
  let supabaseRole = 'user';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

  if (supabaseUrl && !supabaseUrl.includes('mock') && supabaseAnonKey) {
    try {
      const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
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

      const { data: { user }, error } = await supabase.auth.getUser();
      if (user && !error) {
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
  const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/prompts') || pathname.startsWith('/templates');
  const isAdminRoute = pathname.startsWith('/admin');

  // 1. 비로그인 유저가 보호된 경로(/admin, /prompts, /templates) 접근 시 /login으로 이동
  if (isProtectedRoute && !isAuthenticated) {
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
  matcher: ['/', '/admin/:path*', '/login', '/prompts/:path*', '/templates/:path*'],
};
