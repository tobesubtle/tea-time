import { NodemailerEmailService } from '@/infrastructure/email/emailService';

export interface SendAdminEmailParams {
  toEmail: string;
  subject?: string;
  content: string;
}

export class SendAdminEmailUseCase {
  private emailService: NodemailerEmailService;

  constructor() {
    this.emailService = new NodemailerEmailService();
  }

  async execute({ toEmail, subject, content }: SendAdminEmailParams): Promise<{ success: boolean; error?: string }> {
    if (!toEmail) {
      return { success: false, error: '수신자 이메일 주소가 존재하지 않습니다.' };
    }

    if (!content || !content.trim()) {
      return { success: false, error: '발송할 텍스트 내용을 입력해 주세요.' };
    }

    const now = new Date();
    const dateFormatted = now.toISOString().replace(/[:.]/g, '-');
    const fileName = `memo_${dateFormatted.slice(0, 19)}.txt`;
    const mailSubject = subject || `[티타임은 즐거워] 관리자 메모/텍스트 전송 (${now.toLocaleDateString('ko-KR')})`;

    const htmlContent = `
      <div style="font-family: 'Malgun Gothic', sans-serif; max-width: 650px; padding: 24px; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #18181b; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">
          📧 관리자 메모 전송 알림
        </h2>
        <p style="color: #52525b; font-size: 14px; margin-bottom: 20px; line-height: 1.6;">
          관리자 화면에서 작성하신 텍스트 메모가 수신되었습니다.<br/>
          본문 및 첨부된 <strong>.txt</strong> 파일에서 전체 내용을 확인하실 수 있습니다.
        </p>
        
        <div style="background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h3 style="font-size: 12px; text-transform: uppercase; color: #71717a; margin-top: 0; margin-bottom: 8px;">
            📄 작성된 본문 내용
          </h3>
          <pre style="white-space: pre-wrap; font-family: inherit; font-size: 14px; color: #27272a; margin: 0; word-break: break-all;">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>

        <div style="border-top: 1px solid #f4f4f5; pt-16px; color: #a1a1aa; font-size: 12px; margin-top: 24px; padding-top: 12px;">
          * 본 메일은 관리자 전용 텍스트 발송 기능을 통해 수신되었습니다. (첨부파일: ${fileName})
        </div>
      </div>
    `;

    try {
      const result = await this.emailService.sendEmail({
        to: toEmail,
        subject: mailSubject,
        text: content,
        html: htmlContent,
        attachments: [
          {
            filename: fileName,
            content: content,
            contentType: 'text/plain; charset=utf-8',
          },
        ],
      });

      return { success: result.success };
    } catch (err: any) {
      console.error('SendAdminEmailUseCase execution failed:', err);
      return {
        success: false,
        error: err.message || '이메일 발송 과정에서 오류가 발생했습니다. (SMTP 설정을 확인하세요)',
      };
    }
  }
}
