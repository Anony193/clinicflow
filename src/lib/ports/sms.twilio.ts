/**
 * Twilio SMS Adapter (Production)
 *
 * SMS via Twilio API for appointment reminders.
 */

import Twilio from 'twilio';

export interface SmsPort {
  send(params: { to: string; body: string }): Promise<{ messageId: string }>;
}

export class TwilioSmsAdapter implements SmsPort {
  private client: Twilio.Twilio;
  private fromNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) {
      throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required for SMS adapter');
    }
    this.client = Twilio(accountSid, authToken);
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER!;
  }

  async send(params: { to: string; body: string }) {
    const result = await this.client.messages.create({
      from: this.fromNumber,
      to: params.to,
      body: params.body,
    });
    return { messageId: result.sid };
  }
}

/** Console SMS adapter (sandbox) */
export class ConsoleSmsAdapter implements SmsPort {
  async send(params: { to: string; body: string }) {
    console.log(`[SMS] To: ${params.to} | Body: ${params.body}`);
    return { messageId: 'console' };
  }
}

export function getSmsAdapter(): SmsPort {
  if (process.env.TWILIO_ACCOUNT_SID) {
    return new TwilioSmsAdapter();
  }
  return new ConsoleSmsAdapter();
}
