import nodemailer from 'nodemailer';
import {
  APP_PUBLIC_URL,
  GOOGLE_EMAIL_APP_EMAIL,
  GOOGLE_EMAIL_APP_PASSWORD,
} from '../constants/index.js';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!GOOGLE_EMAIL_APP_EMAIL || !GOOGLE_EMAIL_APP_PASSWORD) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GOOGLE_EMAIL_APP_EMAIL,
        pass: GOOGLE_EMAIL_APP_PASSWORD.replace(/\s+/g, ''),
      },
    });
  }

  return transporter;
}

async function sendMail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn('[auth/email] Gmail app credentials are not configured');
    return;
  }

  await mailer.sendMail({
    from: GOOGLE_EMAIL_APP_EMAIL,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}

export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<void> {
  const link = `${APP_PUBLIC_URL}/auth/validate-email?token=${encodeURIComponent(token)}`;
  await sendMail({
    to: email,
    subject: 'Verifica tu correo — Eduardo Osteicoechea',
    text: `Verifica tu correo visitando: ${link}`,
    html: `<p>Verifica tu correo haciendo clic en <a href="${link}">este enlace</a>.</p>`,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
): Promise<void> {
  const link = `${APP_PUBLIC_URL}/auth/reset-password?token=${encodeURIComponent(token)}`;
  await sendMail({
    to: email,
    subject: 'Restablecer contraseña — Eduardo Osteicoechea',
    text: `Restablece tu contraseña visitando: ${link}`,
    html: `<p>Restablece tu contraseña haciendo clic en <a href="${link}">este enlace</a>. El enlace caduca en 1 hora.</p>`,
  });
}
