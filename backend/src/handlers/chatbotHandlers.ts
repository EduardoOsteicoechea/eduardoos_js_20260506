import type { Request, Response, NextFunction } from 'express';
import {
  CHATBOT_INTERNAL_TOKEN,
  CHATBOT_PUBLIC_AUTH_ENABLED,
  CHATBOT_URL,
} from '../constants/index.js';

const INTERNAL_HEADER = 'X-Chatbot-Internal-Token';
const SESSION_HEADER = 'X-Chatbot-Session-Authorized';

export function chatbotPublicAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!CHATBOT_PUBLIC_AUTH_ENABLED) {
    return next();
  }

  // Session API not implemented yet — reject until wired.
  const sessionId = req.headers['x-session-id'];
  if (typeof sessionId !== 'string' || !sessionId.trim()) {
    return res.status(401).json({
      ok: false,
      error: 'Session required for chatbot (public auth is enabled)',
    });
  }

  return next();
}

export async function proxyChatbot(req: Request, res: Response) {
  if (!CHATBOT_INTERNAL_TOKEN) {
    return res.status(503).json({
      ok: false,
      error: 'CHATBOT_INTERNAL_TOKEN is not configured on the backend',
    });
  }

  const base = CHATBOT_URL.replace(/\/+$/g, '');

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      [INTERNAL_HEADER]: CHATBOT_INTERNAL_TOKEN,
    };

    if (CHATBOT_PUBLIC_AUTH_ENABLED) {
      headers[SESSION_HEADER] = '1';
    }

    const response = await fetch(`${base}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error:
          typeof data?.error === 'string'
            ? data.error
            : `Chatbot service error (${response.status})`,
      });
    }

    return res.json(data);
  } catch (error) {
    console.error('[chatbot]', error);
    return res.status(502).json({
      ok: false,
      error:
        error instanceof Error ? error.message : 'Chatbot service unavailable',
    });
  }
}
