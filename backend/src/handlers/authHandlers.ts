import type { Request, Response } from 'express';
import {
  clearRefreshCookie,
  readRefreshCookie,
  setRefreshCookie,
} from '../auth/cookies.js';
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from '../auth/email.js';
import { signAccessToken } from '../auth/jwt.js';
import {
  createAuthPasswordReset,
  fetchAuthUser,
  issueAuthRefresh,
  loginAuthUser,
  logoutAllAuthSessions,
  registerAuthUser,
  resendAuthVerification,
  resetAuthPassword,
  revokeAuthRefresh,
  rotateAuthRefresh,
  updateAuthProfile,
  verifyAuthEmail,
  type AuthUser,
} from '../postsDbAuthClient.js';

function publicUser(user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    roles: user.roles,
    email_verified: user.email_verified,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

async function issueSession(res: Response, user: AuthUser) {
  const refresh = await issueAuthRefresh(user.id);
  setRefreshCookie(res, {
    token: refresh.raw_token,
    family_id: refresh.family_id,
  });

  return {
    accessToken: signAccessToken(user),
    user: publicUser(user),
  };
}

export async function registerUser(req: Request, res: Response) {
  const email = String(req.body?.email ?? '').trim();
  const password = String(req.body?.password ?? '');
  const display_name = String(req.body?.display_name ?? '').trim();

  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'email and password are required' });
  }

  try {
    const { user, verify_token } = await registerAuthUser({
      email,
      password,
      display_name,
    });

    if (verify_token) {
      await sendVerificationEmail(user.email, verify_token);
    }

    const session = await issueSession(res, user);
    return res.status(201).json({ ok: true, ...session });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'registration failed';
    const status = message.includes('already registered') ? 409 : 400;
    return res.status(status).json({ ok: false, error: message });
  }
}

export async function loginUser(req: Request, res: Response) {
  const email = String(req.body?.email ?? '').trim();
  const password = String(req.body?.password ?? '');

  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'email and password are required' });
  }

  try {
    const user = await loginAuthUser({ email, password });
    const session = await issueSession(res, user);
    return res.json({ ok: true, ...session });
  } catch {
    return res.status(401).json({ ok: false, error: 'invalid credentials' });
  }
}

export async function refreshSession(req: Request, res: Response) {
  const cookie = readRefreshCookie(req);
  if (!cookie) {
    return res.status(401).json({ ok: false, error: 'missing refresh token' });
  }

  try {
    const rotated = await rotateAuthRefresh({
      token: cookie.token,
      family_id: cookie.family_id,
    });
    const user = await fetchAuthUser(rotated.user_id);
    setRefreshCookie(res, {
      token: rotated.raw_token,
      family_id: rotated.family_id,
    });

    return res.json({
      ok: true,
      accessToken: signAccessToken(user),
      user: publicUser(user),
    });
  } catch {
    clearRefreshCookie(res);
    return res.status(401).json({ ok: false, error: 'invalid refresh token' });
  }
}

export async function logoutUser(req: Request, res: Response) {
  const cookie = readRefreshCookie(req);
  if (cookie?.token) {
    try {
      await revokeAuthRefresh(cookie.token);
    } catch {
      // ignore revoke errors on logout
    }
  }

  if (req.auth?.sub) {
    try {
      await logoutAllAuthSessions(req.auth.sub);
    } catch {
      // ignore
    }
  }

  clearRefreshCookie(res);
  return res.json({ ok: true });
}

export async function getProfile(req: Request, res: Response) {
  if (!req.auth?.sub) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  try {
    const user = await fetchAuthUser(req.auth.sub);
    return res.json({ ok: true, user: publicUser(user) });
  } catch {
    return res.status(404).json({ ok: false, error: 'user not found' });
  }
}

export async function updateProfile(req: Request, res: Response) {
  if (!req.auth?.sub) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  const display_name =
    typeof req.body?.display_name === 'string'
      ? req.body.display_name.trim()
      : undefined;
  const password =
    typeof req.body?.password === 'string' ? req.body.password : undefined;

  if (!display_name && !password) {
    return res.status(400).json({ ok: false, error: 'nothing to update' });
  }

  try {
    const user = await updateAuthProfile({
      user_id: req.auth.sub,
      display_name,
      password,
    });
    return res.json({
      ok: true,
      user: publicUser(user),
      accessToken: signAccessToken(user),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'update failed';
    return res.status(400).json({ ok: false, error: message });
  }
}

export async function validateEmail(req: Request, res: Response) {
  const token = String(req.body?.token ?? req.query?.token ?? '').trim();
  if (!token) {
    return res.status(400).json({ ok: false, error: 'token is required' });
  }

  try {
    const user = await verifyAuthEmail(token);
    return res.json({ ok: true, user: publicUser(user) });
  } catch {
    return res.status(400).json({ ok: false, error: 'invalid or expired token' });
  }
}

export async function resendVerification(req: Request, res: Response) {
  const email = String(req.body?.email ?? '').trim();
  if (!email) {
    return res.status(400).json({ ok: false, error: 'email is required' });
  }

  try {
    const verify_token = await resendAuthVerification(email);
    if (verify_token) {
      await sendVerificationEmail(email, verify_token);
    }
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: 'could not resend verification' });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  const email = String(req.body?.email ?? '').trim();
  if (!email) {
    return res.status(400).json({ ok: false, error: 'email is required' });
  }

  try {
    const reset_token = await createAuthPasswordReset(email);
    if (reset_token) {
      await sendPasswordResetEmail(email, reset_token);
    }
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: 'could not send reset email' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  const token = String(req.body?.token ?? '').trim();
  const password = String(req.body?.password ?? '');

  if (!token || !password) {
    return res
      .status(400)
      .json({ ok: false, error: 'token and password are required' });
  }

  try {
    const user = await resetAuthPassword({ token, password });
    return res.json({ ok: true, user: publicUser(user) });
  } catch {
    return res.status(400).json({ ok: false, error: 'invalid or expired token' });
  }
}
