import tls from 'node:tls';
import type { Env } from '../types';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function toBase64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64');
  }
  return btoa(unescape(encodeURIComponent(str)));
}

/**
 * Dispatches an email via direct Gmail SMTP TLS (smtp.gmail.com:465)
 */
async function sendViaGmailSMTP(
  user: string,
  appPassword: string,
  payload: EmailPayload,
  defaultFromName = 'LifeSolver'
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const cleanUser = user.trim().replace(/[\r\n\s]+/g, '');
    const cleanPass = appPassword.replace(/\s+/g, '');
    const cleanTo = payload.to.trim().replace(/[\r\n\s]+/g, '');
    const cleanSubject = payload.subject.replace(/[\r\n]+/g, ' ').trim();
    const fromName = (payload.fromName || defaultFromName).replace(/[\r\n]+/g, ' ').trim();
    const plainText = payload.text || htmlToPlainText(payload.html);

    const socket = tls.connect({
      host: 'smtp.gmail.com',
      port: 465,
      rejectUnauthorized: true,
    });

    let step = 0;
    const send = (line: string) => {
      socket.write(line + '\r\n');
    };

    socket.setEncoding('utf-8');

    socket.on('data', (data: any) => {
      const response = data.toString();
      const code = parseInt(response.slice(0, 3), 10);

      if (code >= 400 && code < 600) {
        socket.end();
        return reject(new Error(`Gmail SMTP error [${code}]: ${response.trim()}`));
      }

      switch (step) {
        case 0: // 220 Service ready
          step++;
          send('EHLO lifesolver.app');
          break;
        case 1: // 250 EHLO response
          step++;
          send('AUTH LOGIN');
          break;
        case 2: // 334 Username challenge
          step++;
          send(toBase64(cleanUser));
          break;
        case 3: // 334 Password challenge
          step++;
          send(toBase64(cleanPass));
          break;
        case 4: // 235 Authentication succeeded
          step++;
          send(`MAIL FROM:<${cleanUser}>`);
          break;
        case 5: // 250 Sender OK
          step++;
          send(`RCPT TO:<${cleanTo}>`);
          break;
        case 6: // 250 Recipient OK
          step++;
          send('DATA');
          break;
        case 7: // 354 Start mail input
          step++;
          const boundary = '----=_Part_' + Date.now();
          const mime = [
            `From: "${fromName}" <${cleanUser}>`,
            `To: <${cleanTo}>`,
            `Subject: ${cleanSubject}`,
            `MIME-Version: 1.0`,
            `Content-Type: multipart/alternative; boundary="${boundary}"`,
            ``,
            `--${boundary}`,
            `Content-Type: text/plain; charset=UTF-8`,
            `Content-Transfer-Encoding: 7bit`,
            ``,
            plainText,
            ``,
            `--${boundary}`,
            `Content-Type: text/html; charset=UTF-8`,
            `Content-Transfer-Encoding: 7bit`,
            ``,
            payload.html,
            ``,
            `--${boundary}--`,
            `.`,
          ].join('\r\n');
          send(mime);
          break;
        case 8: // 250 Message accepted for delivery
          send('QUIT');
          socket.end();
          resolve(true);
          break;
      }
    });

    socket.on('error', (err: any) => {
      reject(err);
    });

    socket.setTimeout(12000, () => {
      socket.destroy();
      reject(new Error('Gmail SMTP connection timed out after 12 seconds'));
    });
  });
}

export async function sendEmail(payload: EmailPayload, env: Env): Promise<void> {
  const provider = env.EMAIL_PROVIDER ?? 'gmail';

  // 1. Gmail SMTP (Primary / Dedicated)
  if ((provider === 'gmail' || !env.RESEND_API_KEY) && env.GMAIL_USER && env.GMAIL_APP_PASSWORD) {
    try {
      await sendViaGmailSMTP(
        env.GMAIL_USER,
        env.GMAIL_APP_PASSWORD,
        payload,
        env.GMAIL_FROM_NAME || 'LifeSolver'
      );
      console.log(`[EmailRouter:GmailSMTP] Dispatched to ${payload.to} | Subject: "${payload.subject}"`);
      return;
    } catch (err: any) {
      console.error(`[EmailRouter:GmailSMTP] Dispatch error:`, err?.message || err);
      // If Resend is also configured as fallback, fall through
      if (!env.RESEND_API_KEY) {
        throw err;
      }
    }
  }

  // 2. Resend API Fallback
  if ((provider === 'resend' || env.RESEND_API_KEY) && env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${env.GMAIL_FROM_NAME || 'LifeSolver'} <noreply@lifesolver.app>`,
          to: [payload.to],
          subject: payload.subject,
          html: payload.html
        })
      });
      if (res.ok) {
        console.log(`[EmailRouter:Resend] Dispatched to ${payload.to} | Subject: "${payload.subject}"`);
        return;
      }
      console.error(`[EmailRouter:Resend] Failed with status ${res.status}:`, await res.text());
    } catch (err: any) {
      console.error(`[EmailRouter:Resend] Fetch error:`, err?.message || err);
    }
  }

  // 3. Fallback Dev Log
  console.log(`[EmailRouter:DevLog] To: ${payload.to} | Subject: ${payload.subject}`);
}
