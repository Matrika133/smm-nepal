import { PasswordResetToken, SentEmailLog, UserAccount, EmailConfig } from '../types';

const STORAGE_KEY = 'smm_password_reset_tokens';
const EMAIL_LOGS_KEY = 'smm_sent_email_logs';
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

export function getAllResetTokens(): PasswordResetToken[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading password reset tokens:', err);
    return [];
  }
}

export function saveResetTokens(tokens: PasswordResetToken[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } catch (err) {
    console.error('Error saving password reset tokens:', err);
  }
}

/**
 * Generate a 12-hour valid password reset token and dispatch mock email log
 */
export function createPasswordResetToken(
  email: string,
  user?: UserAccount | null,
  emailConfig?: EmailConfig
): { token: string; resetUrl: string; expiresAt: number; formattedExpiry: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const token = `rst_${Date.now()}_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`;
  const expiresAt = Date.now() + TWELVE_HOURS_MS;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://smmpanelnepal.com';
  const resetUrl = `${origin}/?reset_token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

  const newToken: PasswordResetToken = {
    token,
    email: normalizedEmail,
    userId: user?.id,
    role: user?.role || 'user',
    expiresAt,
    createdAt: Date.now(),
    used: false,
  };

  const existing = getAllResetTokens();
  // Filter out older tokens for the same email
  const updated = [newToken, ...existing.filter((t) => t.email !== normalizedEmail || t.used)];
  saveResetTokens(updated);

  // Dispatch email notification to SentEmailLog
  const expiryDate = new Date(expiresAt);
  const formattedExpiry = expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) +
    ' on ' + expiryDate.toLocaleDateString();

  try {
    const rawLogs = localStorage.getItem(EMAIL_LOGS_KEY);
    const logs: SentEmailLog[] = rawLogs ? JSON.parse(rawLogs) : [];

    const smtpUser = emailConfig?.smtpUsername || emailConfig?.smtpUser || '';
    const smtpPass = emailConfig?.smtpPassword || emailConfig?.smtpPass || '';
    const isSmtpConfigured = Boolean(emailConfig?.isEnabled !== false && emailConfig?.smtpHost && smtpUser);

    const emailSubject = 'Security Alert: Password Reset Link (Valid for 12 Hours) - SMM Panel Nepal';
    const emailBody = `Hello ${user?.username || 'Valued User'},\n\nA request was received to reset the password for your account (${normalizedEmail}).\n\nClick the secure link below to set a new password:\n${resetUrl}\n\n⚠️ IMPORTANT: For your account security, this password reset link is strictly valid for 12 HOURS ONLY (Expires at ${formattedExpiry}). After 12 hours, this link will automatically deactivate.\n\nSender Gateway: ${isSmtpConfigured ? `${emailConfig?.smtpHost}:${emailConfig?.smtpPort || 587}` : 'Internal SMTP Mail Relay'}\n\nIf you did not make this request, please contact SMM Panel Nepal security immediately.`;

    const emailLog: SentEmailLog = {
      id: `email-${Date.now()}`,
      recipient: normalizedEmail,
      recipientName: user?.username || normalizedEmail.split('@')[0],
      subject: emailSubject,
      body: emailBody,
      sentAt: new Date().toISOString(),
      sentBy: emailConfig?.senderName || 'SMM Nepal Security Dispatcher',
      status: 'Sent',
    };

    logs.unshift(emailLog);
    localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(logs.slice(0, 100)));

    // Attempt real live dispatch via backend SMTP endpoint
    if (typeof window !== 'undefined' && emailConfig?.smtpHost) {
      fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpConfig: {
            smtpHost: emailConfig.smtpHost,
            smtpPort: emailConfig.smtpPort || 587,
            smtpUsername: smtpUser,
            smtpPassword: smtpPass,
            encryption: emailConfig.encryption || 'TLS',
            senderName: emailConfig.senderName || 'SMM Panel Nepal Security',
            senderEmail: emailConfig.senderEmail || smtpUser || 'noreply@smmpanelnepal.com',
          },
          to: normalizedEmail,
          subject: emailSubject,
          text: emailBody,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            console.warn('Real SMTP dispatch warning:', data.error);
          }
        })
        .catch((err) => {
          console.warn('SMTP fetch error:', err);
        });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('smm_email_dispatched', { detail: emailLog }));
    }
  } catch (err) {
    console.error('Error logging password reset email:', err);
  }

  return {
    token,
    resetUrl,
    expiresAt,
    formattedExpiry,
  };
}

/**
 * Validate token validity and check 12 hours expiration
 */
export function verifyPasswordResetToken(tokenString: string): {
  valid: boolean;
  error?: string;
  tokenData?: PasswordResetToken;
  remainingHours?: number;
  remainingMinutes?: number;
} {
  if (!tokenString) {
    return { valid: false, error: 'Missing security reset token parameter.' };
  }

  const tokens = getAllResetTokens();
  const found = tokens.find((t) => t.token === tokenString);

  if (!found) {
    return {
      valid: false,
      error: 'Invalid password reset link or token not found in the system registry.',
    };
  }

  if (found.used) {
    return {
      valid: false,
      error: 'This password reset link has already been used. Please request a new link if needed.',
    };
  }

  const now = Date.now();
  if (now > found.expiresAt) {
    return {
      valid: false,
      error: 'This password reset link has expired. Password reset links are strictly valid for 12 hours only. Please generate a new link.',
    };
  }

  const diffMs = found.expiresAt - now;
  const remainingHours = Math.floor(diffMs / (1000 * 60 * 60));
  const remainingMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return {
    valid: true,
    tokenData: found,
    remainingHours,
    remainingMinutes,
  };
}

/**
 * Update user password and consume token
 */
export function completePasswordReset(
  tokenString: string,
  newPassword: string
): { success: boolean; error?: string; email?: string } {
  const verification = verifyPasswordResetToken(tokenString);
  if (!verification.valid || !verification.tokenData) {
    return { success: false, error: verification.error || 'Token verification failed.' };
  }

  const { tokenData } = verification;

  // Mark token as used
  const tokens = getAllResetTokens();
  const updatedTokens = tokens.map((t) => (t.token === tokenString ? { ...t, used: true } : t));
  saveResetTokens(updatedTokens);

  // Update user in smm_nepal_users
  try {
    const rawUsers = localStorage.getItem('smm_nepal_users');
    if (rawUsers) {
      const users: UserAccount[] = JSON.parse(rawUsers);
      const userIndex = users.findIndex(
        (u) => u.email.toLowerCase() === tokenData.email.toLowerCase()
      );

      if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('smm_nepal_users', JSON.stringify(users));
      }
    }

    // Also if admin user, update admin security config
    const rawAdminSecurity = localStorage.getItem('smm_nepal_admin_security');
    if (rawAdminSecurity) {
      const adminSecurity = JSON.parse(rawAdminSecurity);
      adminSecurity.customAdminPassword = newPassword;
      localStorage.setItem('smm_nepal_admin_security', JSON.stringify(adminSecurity));
    }

    // Dispatch global event so App.tsx reloads users
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('smm_password_reset_completed', {
          detail: { email: tokenData.email, newPassword },
        })
      );
    }

    return { success: true, email: tokenData.email };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update user password.' };
  }
}
