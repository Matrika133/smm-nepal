import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Key,
  Copy,
  Check,
  Shield,
  Wallet,
  ShoppingCart,
  Calendar,
  RefreshCw,
  Lock,
  CheckCircle2,
  AlertCircle,
  Save,
  Globe,
  Bell,
  Sparkles,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';
import { UserAccount } from '../types';

interface ProfileTabProps {
  user: UserAccount;
  onUpdateUser: (updated: Partial<UserAccount>) => void;
  onNavigateTab: (tab: any) => void;
}

export function ProfileTab({ user, onUpdateUser, onNavigateTab }: ProfileTabProps) {
  const [fullName, setFullName] = useState(user.fullName || user.username);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '9841000000');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // API Key & Copied states
  const [copiedKey, setCopiedKey] = useState(false);
  const [keyRegenNotice, setKeyRegenNotice] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Handle Save Profile Details
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      return;
    }
    onUpdateUser({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    setProfileSuccessMsg('Profile information updated successfully!');
    setTimeout(() => setProfileSuccessMsg(''), 3000);
  };

  // Handle Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (user.password && currentPassword !== user.password) {
      setPasswordMsg({ type: 'error', text: 'Current password does not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    onUpdateUser({ password: newPassword });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
    setTimeout(() => setPasswordMsg(null), 3500);
  };

  // Handle Copy API Key
  const handleCopyKey = () => {
    navigator.clipboard.writeText(user.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Handle Regenerate API Key
  const handleRegenerateKey = () => {
    const newKey = `smm_live_np_${Math.random().toString(36).substring(2, 12)}`;
    onUpdateUser({ apiKey: newKey });
    setKeyRegenNotice(true);
    setTimeout(() => setKeyRegenNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Account Header */}
      <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
            <div className="h-full w-full bg-neutral-950 rounded-[14px] flex items-center justify-center text-xl font-black text-emerald-400">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg sm:text-xl font-black text-white">
                {user.fullName || user.username}
              </h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                ⭐ {user.tier}
              </span>
            </div>
            <div className="text-xs text-neutral-400 font-mono flex flex-wrap items-center gap-2 mt-1">
              <span className="text-emerald-400 font-semibold">@{user.username}</span>
              <span>•</span>
              <span>{user.email}</span>
              <span>•</span>
              <span>Member since {user.createdAt || '2026-01-01'}</span>
            </div>
          </div>
        </div>

        {/* Live Balance Overview & Add Funds CTA */}
        <div className="flex items-center gap-3 bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800 w-full md:w-auto justify-between md:justify-end">
          <div>
            <span className="text-[10px] text-neutral-400 block font-mono">Realtime Live Balance</span>
            <span className="text-base font-mono font-black text-emerald-400">
              Rs. {user.balance.toLocaleString()} <span className="text-xs text-neutral-400 font-normal">NPR</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('add_funds')}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition cursor-pointer flex items-center gap-1"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>+ Add Funds</span>
          </button>
        </div>
      </div>

      {/* Account Performance Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-xs font-medium">Total Spent</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg sm:text-xl font-mono font-black text-white">
              Rs. {user.totalSpent.toLocaleString()} <span className="text-xs text-neutral-500 font-normal">NPR</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('transactions')}
            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold text-left mt-2 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>View All Transactions →</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-md">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">Total Orders</span>
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-mono font-black text-emerald-400">
            {user.totalOrders} <span className="text-xs text-neutral-500 font-normal">Orders</span>
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">Direct API & Panel orders</div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-md">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">Discount Tier</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-mono font-black text-amber-400">
            {user.tier}
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">Special Wholesale Rates</div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-md">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">Account Status</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-mono font-black text-emerald-400 flex items-center gap-1.5">
            <span>Verified</span>
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">Full 24/7 API & Support Access</div>
        </div>
      </div>

      {/* Main Forms Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personal Information & API Key (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Edit Profile Form */}
          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Personal & Contact Information
                </h2>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">Profile Details</span>
            </div>

            {profileSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Full Name / Reseller Brand
                  </label>
                  <input
                    id="profile-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Username <span className="text-[10px] text-neutral-500">(Cannot be changed)</span>
                  </label>
                  <input
                    type="text"
                    value={user.username}
                    disabled
                    className="w-full bg-neutral-950/60 border border-neutral-800/60 rounded-xl px-3 py-2 text-xs text-neutral-400 font-mono cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      id="profile-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      placeholder="smmpanelnepal@gmail.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Nepal Phone / WhatsApp Number
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      id="profile-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      placeholder="98XXXXXXXX"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Reseller API Key Management */}
          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Reseller API Key Integration
                </h2>
              </div>
              <button
                type="button"
                onClick={handleRegenerateKey}
                className="text-xs text-neutral-400 hover:text-emerald-400 flex items-center gap-1 transition cursor-pointer font-mono"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Regenerate API Key</span>
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Use this private API key to connect external SMM scripts (Rental panels, PerfectPanel, WordPress plugin) to auto-dispatch orders.
            </p>

            {keyRegenNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                ✓ New API key generated and active!
              </div>
            )}

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300">
              <span className="truncate flex-1 text-xs text-emerald-400 font-bold select-all">
                {user.apiKey}
              </span>
              <button
                type="button"
                onClick={handleCopyKey}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer flex items-center gap-1"
              >
                {copiedKey ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-xs font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-xs">Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
              <span>API Endpoint: <code className="text-neutral-400 font-mono">https://smmpanelnepal.com/api/v2</code></span>
              <button
                type="button"
                onClick={() => onNavigateTab('api')}
                className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View Full API Docs</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Change Password & Preferences (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Change Password Form */}
          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Security & Password
                </h2>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">Security</span>
            </div>

            {passwordMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 font-mono ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}
              >
                {passwordMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">
                  Current Password
                </label>
                <input
                  id="pwd-current"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">
                  New Password
                </label>
                <input
                  id="pwd-new"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Min 6 characters"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">
                  Confirm New Password
                </label>
                <input
                  id="pwd-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat new password"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Account Tier Perks Box */}
          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {user.tier} Tier Benefits
              </h3>
            </div>

            <ul className="space-y-2 text-xs text-neutral-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Wholesale rates with 0% gateway deposit fees</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Priority high-speed order processing queue</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Dedicated 24/7 Nepali WhatsApp & Ticket Support</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>5% Referral Commission on all affiliate deposits</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
