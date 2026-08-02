import { NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase/server';
import fs from 'fs';
import path from 'path';

export const revalidate = 0;

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse(
        `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>접근 제한</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8fafc;color:#1e293b;}.card{background:#fff;padding:32px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);text-align:center;}a{color:#4338ca;text-decoration:none;font-weight:600;}</style></head><body><div class="card"><h2>🔒 로그인이 필요합니다</h2><p>최종 보고서는 로그인 후 관리자 권한으로만 접근할 수 있습니다.</p><a href="/login">로그인 페이지로 이동</a></div></body></html>`,
        { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    const userRole = user?.user_metadata?.role || user?.app_metadata?.role || 'user';

    if (userRole !== 'admin') {
      return new NextResponse(
        `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>접근 권한 없음</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8fafc;color:#1e293b;}.card{background:#fff;padding:32px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);text-align:center;}a{color:#4338ca;text-decoration:none;font-weight:600;}</style></head><body><div class="card"><h2>🚫 접근 권한 없음</h2><p>최종 보고서는 최고 관리자(admin) 계정만 열람할 수 있습니다.</p><a href="/templates">메인 화면으로 이동</a></div></body></html>`,
        { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    const filePath = path.join(process.cwd(), 'Doc', 'project_final_report.html');

    if (!fs.existsSync(filePath)) {
      return new NextResponse('보고서 파일을 찾을 수 없습니다.', { status: 404 });
    }

    const htmlContent = fs.readFileSync(filePath, 'utf-8');

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Admin Report Route Error:', error);
    return new NextResponse('보고서를 불러오는 중 오류가 발생했습니다.', { status: 500 });
  }
}
