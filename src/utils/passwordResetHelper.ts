/**
 * Password Reset Engine (12-Hour Validity)
 * Supports both standard users and admin/superadmin accounts.
 */

import { PasswordResetToken, UserAccount, SentEmailLog, SystemSettings } from '../types';

const STORAGE_KEY = 'smm_password_reset_tokens';

export function getStoredResetTokens(): PasswordResetToken[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveResetTokens(tokens: PasswordResetToken[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } catch (err) {
    console.error('Failed to save reset tokens', err);
  }
}

/**
 * Creates a password reset token valid for strictly 12 hours.
 */
export function createPasswordResetToken(
  user: UserAccount,
  systemSettings?: SystemSettings
): { token: string; resetUrl: string; tokenObj: PasswordResetToken; emailLog: SentEmailLog } {
  const secureRandom = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  const tokenString = `rst_${Date.now()}_${secureRandom}`;
  const now = Date.now();
  const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
  const expiresAt = now + TWELVE_HOURS_MS;

  const tokenObj: PasswordResetToken = {
    token: tokenString,
    email: user.email,
    userId: user.id,
    role: user.role || user.tier || 'user',
    createdAt: now,
    expiresAt,
    used: false,
  };

  const existing = getStoredResetTokens();
  // Filter out expired or existing tokens for this email to keep clean
  const updated = existing.filter((t) => t.email !== user.email || t.used);
  updated.unshift(tokenObj);
  saveResetTokens(updated);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://smmpanelnepal.com';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const resetUrl = `${origin}${pathname}?reset_token=${tokenString}`;

  const siteName = systemSettings?.siteName || 'SMM Panel Nepal';
  const emailLog: SentEmailLog = {
    id: `reset_mail_${Date.now()}`,
    recipient: user.email,
    recipientName: user.fullName || user.username,
    subject: `🔒 Password Reset Link for ${siteName} (Valid for 12 Hours)`,
    body: `Hello ${user.fullName || user.username},\n\nA password reset request was received for your account (@${user.username}).\n\nClick the link below to securely reset your password:\n${resetUrl}\n\n⚠️ IMPORTANT: This reset link is strictly valid for 12 HOURS only.\nIf you did not make this request, please contact management immediately.\n\nBest regards,\n${siteName} Security Team`,
    sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sentBy: 'Automated Security System',
    status: 'Sent',
  };

  // Log in sent emails
  try {
    const rawLogs = localStorage.getItem('smm_sent_email_logs');
    const logs: SentEmailLog[] = rawLogs ? JSON.parse(rawLogs) : [];
    logs.unshift(emailLog);
    localStorage.setItem('smm_sent_email_logs', JSON.stringify(logs));
  } catch {}

  return {
    token: tokenString,
    resetUrl,
    tokenObj,
    emailLog,
  };
}

/**
 * Validates a password reset token.
 */
export function validateResetToken(tokenString: string): {
  valid: boolean;
  reason?: string;
  tokenObj?: PasswordResetToken;
  hoursRemaining?: number;
  minutesRemaining?: number;
} {
  if (!tokenString) {
    return { valid: false, reason: 'No reset token provided.' };
  }

  const tokens = getStoredResetTokens();
  const tokenObj = tokens.find((t) => t.token === tokenString);

  if (!tokenObj) {
    return { valid: false, reason: 'Invalid or unrecognized reset token.' };
  }

  if (tokenObj.used) {
    return { valid: false, reason: 'This reset link has already been used. Please request a new link.' };
  }

  const now = Date.now();
  if (now > tokenObj.expiresAt) {
    return {
      valid: false,
      reason: 'This password reset link has expired. Reset links are strictly valid for 12 hours only.',
    };
  }

  const diffMs = tokenObj.expiresAt - now;
  const hoursRemaining = Math.floor(diffMs / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return {
    valid: true,
    tokenObj,
    hoursRemaining,
    minutesRemaining,
  };
}

/**
 * Marks token as used after successful password change.
 */
export function markTokenAsUsed(tokenString: string): void {
  const tokens = getStoredResetTokens();
  const idx = tokens.findIndex((t) => t.token === tokenString);
  if (idx !== -1) {
    tokens[idx].used = true;
    saveResetTokens(tokens);
  }
}
