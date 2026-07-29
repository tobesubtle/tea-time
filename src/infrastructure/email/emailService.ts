import nodemailer from 'nodemailer';

export interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export class NodemailerEmailService {
  private createTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 465;
    const secure = port === 465; // 465: SSL, 587: TLS
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      throw new Error(
        '이메일 발송을 위한 SMTP 환경변수(SMTP_USER, SMTP_PASS)가 설정되지 않았습니다. .env 및 Vercel 환경변수를 확인해 주세요.'
      );
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  async sendEmail({ to, subject, text, html }: SendEmailParams): Promise<{ success: boolean; messageId?: string }> {
    const transporter = this.createTransporter();
    const from = process.env.SMTP_FROM || `"Tea Time Prompt" <${process.env.SMTP_USER}>`;

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, '<br />'),
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  }

  async sendAdminQuotaAlertEmail({
    userEmail,
    modelName,
    errorMessage,
  }: {
    userEmail?: string;
    modelName: string;
    errorMessage: string;
  }): Promise<{ success: boolean }> {
    const adminEmail = process.env.SMTP_USER || 'admin@example.com';
    const subject = `[티타임은 즐거워] ⚠️ Gemini API 쿼터/비용 초과 경고 알림 (${modelName})`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #fee2e2; border-radius: 12px; background: #fff5f5;">
        <h2 style="color: #dc2626; margin-top: 0;">⚠️ Gemini API 쿼터/비용 초과 발생</h2>
        <p style="color: #374151; font-size: 14px;">
          Gemini AI API 호출 중 쿼터(Quota) 제한 또는 비용 관련 오류가 발생하였습니다.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #fecaca; font-weight: bold; color: #991b1b; width: 110px;">발생 시간</td>
            <td style="padding: 8px; border-bottom: 1px solid #fecaca; color: #1f2937;">${new Date().toLocaleString('ko-KR')}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #fecaca; font-weight: bold; color: #991b1b;">사용자 이메일</td>
            <td style="padding: 8px; border-bottom: 1px solid #fecaca; color: #1f2937;">${userEmail || '알 수 없음'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #fecaca; font-weight: bold; color: #991b1b;">AI 모델명</td>
            <td style="padding: 8px; border-bottom: 1px solid #fecaca; color: #1f2937;"><strong>${modelName}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #fecaca; font-weight: bold; color: #991b1b;">오류 내용</td>
            <td style="padding: 8px; border-bottom: 1px solid #fecaca; color: #dc2626; word-break: break-all;">${errorMessage}</td>
          </tr>
        </table>
        <p style="color: #6b7280; font-size: 12px; margin-bottom: 0;">
          관리자 화면 ➔ <strong>쿼터/에러 모니터링</strong> 탭에서 상세 발생 이력 조회가 가능합니다.
        </p>
      </div>
    `;

    try {
      await this.sendEmail({
        to: adminEmail,
        subject,
        text: `Gemini API 쿼터 오류: ${errorMessage} (사용자: ${userEmail}, 모델: ${modelName})`,
        html,
      });
      return { success: true };
    } catch (err) {
      console.error('Failed to send admin quota alert email:', err);
      return { success: false };
    }
  }
}
