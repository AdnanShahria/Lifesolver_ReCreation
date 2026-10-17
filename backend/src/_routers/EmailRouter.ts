import type { Env } from '../types';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload, env: Env): Promise<void> {
  const provider = env.EMAIL_PROVIDER ?? 'resend';

  if (provider === 'resend' && env.RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'LifeSolver <noreply@lifesolver.app>',
        to: [payload.to],
        subject: payload.subject,
        html: payload.html
      })
    });
    return;
  }

  console.log(`[EmailRouter:DevLog] To: ${payload.to} | Subject: ${payload.subject}`);
}
