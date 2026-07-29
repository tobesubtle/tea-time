import { NextResponse } from 'next/server';
import { NodemailerEmailService } from '@/infrastructure/email/emailService';

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, text, html, filename, attachments } = body;

    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return NextResponse.json(
        { success: false, error: '유효한 수신자 이메일 주소가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!subject || !text) {
      return NextResponse.json(
        { success: false, error: '이메일 제목과 본문 내용은 필수입니다.' },
        { status: 400 }
      );
    }

    // txt 파일 첨부 준비 (별도 첨부 목록이 없다면 본문 text를 .txt 파일로 자동 첨부)
    const sanitizedFilename = filename
      ? (filename.endsWith('.txt') ? filename : `${filename}.txt`)
      : 'gemini_result.txt';

    const mailAttachments = attachments || [
      {
        filename: sanitizedFilename,
        content: text,
        contentType: 'text/plain; charset=utf-8',
      },
    ];

    const emailService = new NodemailerEmailService();
    const result = await emailService.sendEmail({
      to,
      subject,
      text,
      html,
      attachments: mailAttachments,
    });

    return NextResponse.json({
      success: true,
      message: '이메일이 성공적으로 전송되었습니다.',
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error('Email API Route Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '이메일 전송 중 알 수 없는 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
