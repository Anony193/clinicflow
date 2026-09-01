/**
 * Resend Email Adapter (Production)
 *
 * Transactional email via Resend API.
 */

import { Resend } from 'resend';

export interface EmailPort {
  send(params: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<{ messageId: string }>;
}

export class ResendEmailAdapter implements EmailPort {
  private resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is required for email adapter');
    }
    this.resend = new Resend(apiKey);
  }

  async send(params: { to: string; subject: string; html: string; text?: string }) {
    const result = await this.resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'ClinicFlow <noreply@clinicflow.com>',
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
    return { messageId: result.data?.id ?? 'unknown' };
  }
}

/** Console email adapter (sandbox) */
export class ConsoleEmailAdapter implements EmailPort {
  async send(params: { to: string; subject: string; html: string; text?: string }) {
    console.log(`[EMAIL] To: ${params.to} | Subject: ${params.subject}`);
    console.log(`[EMAIL] Body: ${params.text ?? params.html.slice(0, 200)}`);
    return { messageId: 'console' };
  }
}

export function getEmailAdapter(): EmailPort {
  if (process.env.RESEND_API_KEY) {
    return new ResendEmailAdapter();
  }
  return new ConsoleEmailAdapter();
}
