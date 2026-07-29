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
}
