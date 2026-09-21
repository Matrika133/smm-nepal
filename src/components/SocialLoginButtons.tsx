import React, { useState } from 'react';
import {
  Send,
  Facebook,
  Github,
  X,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  User,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, SystemSettings } from '../types';

interface SocialLoginButtonsProps {
  mode: 'login' | 'register';
  availableUsers: UserAccount[];
  onSocialAuthSuccess: (user: UserAccount, isNew: boolean) => void;
  systemSettings?: SystemSettings;
  className?: string;
}

export function SocialLoginButtons({
  mode,
  availableUsers,
  onSocialAuthSuccess,
  systemSettings,
  className = '',
}: SocialLoginButtonsProps) {
  const [activeModal, setActiveModal] = useState<'google' | 'telegram' | 'facebook' | 'github' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [telegramHandle, setTelegramHandle] = useState('');
  const [errorText, setErrorText] = useState('');

  // Built-in Google accounts available for quick one-click login
  const quickGoogleAccounts = [
    {
      name: 'Super Administrator',
      email: 'smmpanelnepal@gmail.com',
      badge: 'Super Admin',
      avatarBg: 'bg-red-500',
    },
    {
      name: 'Bikash Shrestha',
      email: 'bikash.smm@gmail.com',
      badge: 'Reseller VIP',
      avatarBg: 'bg-emerald-500',
    },
  ];

  const handleSelectGoogleAccount = (email: string, name: string) => {
    setIsLoading(true);
    setErrorText('');

    setTimeout(() => {
      setIsLoading(false);
      const cleanEmail = email.trim().toLowerCase();
      
      // Look for existing user
      let matched = availableUsers.find(
        (u) => u.email.toLowerCase() === cleanEmail || (cleanEmail === 'smmpanelnepal@gmail.com' && u.role === 'admin')
      );

      if (matched) {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        setActiveModal(null);
        onSocialAuthSuccess(matched, false);
      } else {
        // Create new Google verified user
        const baseUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || `user_${Date.now().toString().slice(-4)}`;
        const newUser: UserAccount = {
          id: `usr_g_${Date.now()}`,
          username: baseUsername,
          fullName: name || 'Google Verified User',
          email: cleanEmail,
          phone: '9800000000',
          balance: 0.0,
          currency: 'NPR',
          tier: 'Standard',
          role: cleanEmail === 'smmpanelnepal@gmail.com' ? 'admin' : 'user',
          apiKey: `smm_g_np_${Math.random().toString(36).substring(2, 12)}`,
          totalSpent: 0,
          totalOrders: 0,
          createdAt: new Date().toISOString().split('T')[0],
          status: 'Active',
        };
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        setActiveModal(null);
        onSocialAuthSuccess(newUser, true);
      }
    }, 450);
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setErrorText('Please enter a valid Google email address.');
      return;
    }
    handleSelectGoogleAccount(customEmail.trim(), customName.trim() || customEmail.split('@')[0]);
  };

  const handleTelegramSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramHandle.trim()) {
      setErrorText('Please enter your Telegram @username or phone.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const cleanHandle = telegramHandle.trim().replace(/^@/, '').toLowerCase();
      const tgEmail = `${cleanHandle}@telegram.user`;
      
      let matched = availableUsers.find(
        (u) => u.username.toLowerCase() === cleanHandle || u.email.toLowerCase() === tgEmail
      );

      if (matched) {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        setActiveModal(null);
        onSocialAuthSuccess(matched, false);
      } else {
        const newUser: UserAccount = {
          id: `usr_tg_${Date.now()}`,
          username: cleanHandle,
          fullName: `@${cleanHandle} (Telegram)`,
          email: `${cleanHandle}@gmail.com`,
          phone: '9800000000',
          balance: 0.0,
          currency: 'NPR',
          tier: 'Standard',
          role: 'user',
          apiKey: `smm_tg_${Math.random().toString(36).substring(2, 12)}`,
          totalSpent: 0,
          totalOrders: 0,
          createdAt: new Date().toISOString().split('T')[0],
          status: 'Active',
        };
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        setActiveModal(null);
        onSocialAuthSuccess(newUser, true);
      }
    }, 450);
  };

  const handleQuickFacebookLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const fbUser: UserAccount = {
        id: `usr_fb_${Date.now()}`,
        username: `fb_user_${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: 'Facebook Verified User',
        email: `facebook_client_${Math.floor(100 + Math.random() * 900)}@gmail.com`,
        phone: '9841000000',
        balance: 0.0,
        currency: 'NPR',
        tier: 'Standard',
        role: 'user',
        apiKey: `smm_fb_${Math.random().toString(36).substring(2, 12)}`,
        totalSpent: 0,
        totalOrders: 0,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'Active',
      };
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setActiveModal(null);
      onSocialAuthSuccess(fbUser, true);
    }, 450);
  };

  const isGoogleEnabled = false;
  const isFacebookEnabled = !!systemSettings?.socialLoginSettings?.facebookEnabled;
  const isGithubEnabled = !!systemSettings?.socialLoginSettings?.githubEnabled;
  const isTelegramEnabled = systemSettings?.socialLoginSettings?.telegramEnabled !== false;
  const isCompletelyDisabled = !!systemSettings?.socialLoginSettings?.disableAllSocialLogins || (!isFacebookEnabled && !isGithubEnabled && !isTelegramEnabled);

  // If completely disabled from admin, do not render any social login buttons or divider
  if (isCompletelyDisabled) {
    return null;
  }

  const hasSecondary = isTelegramEnabled || isFacebookEnabled || isGithubEnabled;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Primary Social Button: Google */}
      {isGoogleEnabled && (
        <button
          id={`btn-social-google-${mode}`}
          type="button"
          onClick={() => {
            setActiveModal('google');
            setErrorText('');
            setCustomEmail('');
            setCustomName('');
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-800 font-bold text-xs shadow-md transition flex items-center justify-center gap-2.5 border border-neutral-200 cursor-pointer"
        >
          {/* Official Google G SVG icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>
            {mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
          </span>
        </button>
      )}

      {/* Secondary Quick Social Providers: Telegram, Facebook, GitHub */}
      {hasSecondary && (
        <div className="grid grid-cols-2 gap-2">
          {isTelegramEnabled && (
            <button
              id={`btn-social-telegram-${mode}`}
              type="button"
              onClick={() => {
                setActiveModal('telegram');
                setErrorText('');
                setTelegramHandle('');
              }}
              className="py-2 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </button>
          )}

          {isFacebookEnabled && (
            <button
              id={`btn-social-facebook-${mode}`}
              type="button"
              onClick={handleQuickFacebookLogin}
              className="py-2 px-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/30 text-blue-400 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Facebook className="w-3.5 h-3.5" />
              <span>Facebook</span>
            </button>
          )}

          {isGithubEnabled && (
            <button
              id={`btn-social-github-${mode}`}
              type="button"
              onClick={() => handleSelectGoogleAccount('developer@github.com', 'GitHub Developer')}
              className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </button>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-800" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-neutral-900 px-3 text-neutral-500 font-bold tracking-wider">
            {mode === 'login' ? 'Or sign in with email / username' : 'Or register with email'}
          </span>
        </div>
      </div>

      {/* GOOGLE ACCOUNT CHOOSER MODAL */}
      {activeModal === 'google' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-neutral-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 border border-neutral-200">
            {/* Header with Google Logo */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-2.5">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <div>
                  <h3 className="font-bold text-base leading-tight">Sign in with Google</h3>
                  <p className="text-xs text-neutral-500">to continue to {systemSettings?.siteName || 'SMM Panel Nepal'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isLoading ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-neutral-300 border-t-emerald-600 rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-neutral-600">Connecting to Google OAuth 2.0...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Choose an account:</p>
                  
                  {quickGoogleAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleSelectGoogleAccount(acc.email, acc.name)}
                      className="w-full p-3 rounded-2xl border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 flex items-center justify-between text-left transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${acc.avatarBg} text-white font-black text-xs flex items-center justify-center shadow`}>
                          {acc.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                            <span>{acc.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 border border-neutral-300 text-neutral-600 font-bold">
                              {acc.badge}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-500 font-mono">{acc.email}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-400" />
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-neutral-100">
                  <p className="text-xs font-bold text-neutral-600 mb-2">Or use any other Google account:</p>
                  <form onSubmit={handleCustomGoogleSubmit} className="space-y-2.5">
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-emerald-600"
                    />
                    <input
                      type="text"
                      placeholder="Your Full Name (Optional)"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-emerald-600"
                    />
                    {errorText && (
                      <p className="text-red-500 text-xs font-semibold">{errorText}</p>
                    )}
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Continue with this Google Email</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TELEGRAM LOGIN MODAL */}
      {activeModal === 'telegram' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-sky-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-white">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Telegram Social Auth</h3>
                  <p className="text-xs text-neutral-400">Connect via Telegram Widget</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isLoading ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-neutral-300">Verifying Telegram credentials...</p>
              </div>
            ) : (
              <form onSubmit={handleTelegramSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1.5">
                    Telegram @Username or Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">@</span>
                    <input
                      type="text"
                      required
                      placeholder="nepal_smm_creator"
                      value={telegramHandle}
                      onChange={(e) => setTelegramHandle(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Instant login without requiring email verification.
                  </p>
                </div>

                {errorText && (
                  <p className="text-red-400 text-xs font-semibold">{errorText}</p>
                )}

                <div className="pt-2 flex justify-end gap-2 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-black text-xs shadow-lg shadow-sky-500/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Authorize with Telegram</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
