import React, { useState, useEffect } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  X,
  KeyRound,
} from 'lucide-react';
import { verifyPasswordResetToken, completePasswordReset } from '../utils/passwordReset';

interface PasswordResetModalProps {
  isOpen: boolean;
  tokenString: string;
  onClose: () => void;
  onSuccessRedirectToLogin: (email: string) => void;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  tokenString,
  onClose,
  onSuccessRedirectToLogin,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [verification, setVerification] = useState<{
    valid: boolean;
    error?: string;
    tokenData?: any;
    remainingHours?: number;
    remainingMinutes?: number;
  }>({ valid: false });

  // Re-verify on token change or modal open
  useEffect(() => {
    if (isOpen && tokenString) {
      const res = verifyPasswordResetToken(tokenString);
      setVerification(res);
      if (!res.valid) {
        setErrorMsg(res.error || 'Token expired or invalid.');
      } else {
        setErrorMsg('');
      }
    }
  }, [isOpen, tokenString]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-check.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = completePasswordReset(tokenString, newPassword);
      setIsSubmitting(false);

      if (result.success) {
        setIsSuccess(true);
      } else {
        setErrorMsg(result.error || 'Failed to update password.');
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-neutral-100 overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Password Changed Successfully!</h3>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Your account password has been safely updated. Your 12-hour reset token has been consumed.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 font-mono">
              Account: <span className="text-emerald-400 font-bold">{verification.tokenData?.email}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onSuccessRedirectToLogin(verification.tokenData?.email || '');
              }}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <span>Sign In with New Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : !verification.valid ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Reset Link Invalid or Expired</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                {errorMsg || 'For account security, password reset links remain strictly valid for 12 hours.'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 text-left space-y-1.5">
              <p className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>12-Hour Expiration Rule</span>
              </p>
              <p className="text-[11px]">
                To safeguard user wallets and balances, reset links are revoked automatically after 12 hours.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition"
            >
              Close and Request New Link
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Account Password</h3>
                <p className="text-xs text-neutral-400">Enter a secure new password for your account</p>
              </div>
            </div>

            {/* Remaining validity indicator */}
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-neutral-300">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-medium block text-[11px] text-neutral-400">Token Validity (12h Window)</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {verification.remainingHours}h {verification.remainingMinutes}m remaining
                  </span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                Valid
              </span>
            </div>

            <div className="text-xs text-neutral-400 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80">
              Resetting password for: <strong className="text-neutral-200">{verification.tokenData?.email}</strong>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full pl-10 pr-10 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Updating Password...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-neutral-950" />
                    <span>Save New Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
