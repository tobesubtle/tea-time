import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase/server';
import { SendAdminEmailUseCase } from '@/domain/usecases/SendAdminEmailUseCase';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '인증되지 않은 사용자입니다. 로그인 후 시도해 주세요.' },
        { status: 401 }
      );
    }

    const userRole = user.user_metadata?.role || user.app_metadata?.role || 'user';
    if (userRole !== 'admin') {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const userEmail = user.email;
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: '로그인 유저의 이메일 정보를 찾을 수 없습니다.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { content, subject } = body || {};

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { success: false, error: '발송할 텍스트 내용을 입력해 주세요.' },
        { status: 400 }
      );
    }

    const useCase = new SendAdminEmailUseCase();
    const result = await useCase.execute({
      toEmail: userEmail,
      subject,
      content,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || '이메일 발송에 실패하였습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${userEmail} 주소로 이메일 및 txt 첨부파일이 성공적으로 전송되었습니다.`,
      targetEmail: userEmail,
    });
  } catch (error: any) {
    console.error('API /api/admin/send-email Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류가 발생하였습니다.' },
      { status: 500 }
    );
  }
}
