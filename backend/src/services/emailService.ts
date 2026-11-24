// @ts-ignore
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export interface EmailOptions {
  to: string;
  userName?: string;
  resetToken: string;
  expiresInMinutes?: number;
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string | false;
  deliveredTo: string;
  transportMode: 'smtp' | 'test-ethereal' | 'mock-simulation';
  error?: string;
}

class EmailService {
  private transporter: any = null;
  private readonly appUrl: string;
  private readonly senderEmail: string;

  constructor() {
    this.appUrl = (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '');
    this.senderEmail = process.env.SMTP_FROM || '"CAMPUS-AI AGENTIC SYSTEM" <no-reply@campus.edu>';
  }

  private async getTransporter(): Promise<any> {
    if (this.transporter) {
      return this.transporter;
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      // Real configured SMTP server (Gmail, Outlook, AWS SES, Mailgun, SendGrid, etc.)
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
      return this.transporter;
    }

    // If SMTP is not provided in .env, attempt creating an Ethereal test account or local fallback
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`[EmailService] Initialized Ethereal test email transporter with ${testAccount.user}`);
      return this.transporter;
    } catch (err) {
      // If network is restricted, fallback to jsonTransport
      this.transporter = nodemailer.createTransport({
        jsonTransport: true
      });
      console.log('[EmailService] Network isolated: fallback to JSON transport');
      return this.transporter;
    }
  }

  public async sendPasswordResetEmail(options: EmailOptions): Promise<EmailDeliveryResult> {
    const { to, userName, resetToken, expiresInMinutes = 30 } = options;
    const resetUrl = `${this.appUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
    .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0 0 6px 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
    .header p { margin: 0; font-size: 12px; opacity: 0.85; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .greeting { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
    .text { font-size: 13px; color: #334155; margin-bottom: 24px; }
    .button-box { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
    .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #991b1b; margin-bottom: 24px; }
    .link-alt { font-size: 11px; color: #64748b; word-break: break-all; margin-top: 16px; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CAMPUS-AI AGENTIC SYSTEM</h1>
      <p>Smart Student Information & Academic Management Platform</p>
    </div>
    <div class="content">
      <div class="greeting">Dear ${userName || 'Member'},</div>
      <div class="text">
        We received a verified request to reset the password for your <strong>CAMPUS-AI AGENTIC SYSTEM</strong> account associated with this email address.
      </div>
      <div class="button-box">
        <a href="${resetUrl}" target="_blank" class="btn">Reset Password</a>
      </div>
      <div class="warning">
        <strong>Important:</strong> This reset link will expire in <strong>${expiresInMinutes} minutes</strong>. For security, it can be used only once.
      </div>
      <div class="text" style="font-size: 12px; color: #64748b;">
        If you did not initiate this password reset request, you can safely disregard this email. Your current password remains active and secure.
      </div>
      <div class="link-alt">
        If the button above does not work, copy and paste this secure link directly into your browser address bar:<br/>
        <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
      </div>
    </div>
    <div class="footer">
      Automated Security Notification • CAMPUS-AI System Orchestrator • Do Not Reply directly to this automated address.
    </div>
  </div>
</body>
</html>
    `;

    try {
      const transporter = await this.getTransporter();
      const info = await transporter.sendMail({
        from: this.senderEmail,
        to,
        subject: 'Password Reset Request – CAMPUS-AI AGENTIC SYSTEM',
        text: `Hello ${userName || 'Member'},\n\nClick the link below to reset your password (valid for ${expiresInMinutes} minutes):\n${resetUrl}\n\nIf you did not request this, please ignore this message.`,
        html: htmlContent
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[EmailService] Password reset email dispatched to ${to}. Message ID: ${info.messageId}`);
      if (previewUrl) {
        console.log(`[EmailService] Ethereal Web Preview: ${previewUrl}`);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl,
        deliveredTo: to,
        transportMode: process.env.SMTP_HOST ? 'smtp' : (previewUrl ? 'test-ethereal' : 'mock-simulation')
      };
    } catch (error: any) {
      console.error('[EmailService] Failed to send password reset email:', error);
      return {
        success: false,
        deliveredTo: to,
        transportMode: 'smtp',
        error: error.message || 'SMTP Connection Error'
      };
    }
  }
}

export const emailService = new EmailService();
