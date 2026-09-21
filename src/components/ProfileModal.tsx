import React, { useState, useRef } from 'react';
import {
  X,
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
  LogOut,
  RefreshCw,
  Sparkles,
  Lock,
  Camera,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  KeyRound,
  ShieldCheck,
  UserCheck,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import { UserAccount } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  user: UserAccount;
  onClose: () => void;
  onUpdateUser: (updated: Partial<UserAccount>) => void;
  onLogout: () => void;
  onNavigateTab?: (tab: any) => void;
  showToast?: (msg: string) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: (theme: 'dark' | 'light') => void;
}

export function ProfileModal({
  isOpen,
  user,
  onClose,
  onUpdateUser,
  onLogout,
  onNavigateTab,
  showToast,
  theme,
  onToggleTheme,
}: ProfileModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'password' | 'api'>('profile');

  // Visual Theme state (Dark / Light)
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>(() => {
    if (theme) return theme;
    if (user.theme) return user.theme;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smm_nepal_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      if (document.documentElement.classList.contains('light')) return 'light';
    }
    return 'dark';
  });

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setCurrentTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smm_nepal_theme', newTheme);
      if (newTheme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    }
    onUpdateUser({ theme: newTheme });
    if (onToggleTheme) {
      onToggleTheme(newTheme);
    }
    if (showToast) {
      showToast(`Switched to ${newTheme === 'light' ? 'Light' : 'Dark'} Theme`);
    }
  };

  // Profile Form state
  const [fullName, setFullName] = useState(user.fullName || user.username);
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [avatarInputUrl, setAvatarInputUrl] = useState('');
  const [isSavedProfile, setIsSavedProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Change state (Previous + 2x New Password)
  const [prevPassword, setPrevPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPrevPass, setShowPrevPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // API Key states
  const [copiedKey, setCopiedKey] = useState(false);
  const [keyRegenNotice, setKeyRegenNotice] = useState(false);

  // File input ref for avatar image upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Avatar Image File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileMsg({ type: 'error', text: 'Please select a valid image file (PNG, JPG, WEBP).' });
      return;
    }

    if (file.size > 1024 * 1024 * 1024) {
      setProfileMsg({ type: 'error', text: 'Image size should be less than 1 GB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        onUpdateUser({ avatarUrl: result });
        setProfileMsg({ type: 'success', text: 'Profile picture updated successfully!' });
        if (showToast) showToast('Profile picture updated!');
        setTimeout(() => setProfileMsg(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyAvatarUrl = () => {
    if (!avatarInputUrl.trim()) return;
    setAvatarUrl(avatarInputUrl.trim());
    onUpdateUser({ avatarUrl: avatarInputUrl.trim() });
    setAvatarInputUrl('');
    setProfileMsg({ type: 'success', text: 'Profile picture updated from URL!' });
    if (showToast) showToast('Profile picture updated!');
    setTimeout(() => setProfileMsg(null), 3000);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    onUpdateUser({ avatarUrl: '' });
    setProfileMsg({ type: 'success', text: 'Profile picture reset to default initials.' });
    setTimeout(() => setProfileMsg(null), 3000);
  };

  // Save Profile Info (Name, Email, Phone, Avatar)
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    if (!fullName.trim()) {
      setProfileMsg({ type: 'error', text: 'Full Name cannot be empty.' });
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setProfileMsg({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    onUpdateUser({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatarUrl: avatarUrl.trim() || undefined,
    });

    setIsSavedProfile(true);
    setProfileMsg({ type: 'success', text: 'Profile details updated successfully!' });
    if (showToast) showToast('Profile updated successfully!');
    setTimeout(() => {
      setIsSavedProfile(false);
      setProfileMsg(null);
    }, 3000);
  };

  // Change Password with Previous Password & 2x New Password Confirmation
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    const currentActualPassword = user.password || '';

    // If user has an existing password, verify previous password
    if (currentActualPassword) {
      if (!prevPassword) {
        setPasswordMsg({ type: 'error', text: 'Please enter your previous password.' });
        return;
      }
      if (prevPassword !== currentActualPassword) {
        setPasswordMsg({ type: 'error', text: 'Previous password is incorrect. Please check and try again.' });
        return;
      }
    }

    if (!newPassword) {
      setPasswordMsg({ type: 'error', text: 'Please enter a new password.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (!confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Please enter new password twice to confirm.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation password do not match.' });
      return;
    }

    if (currentActualPassword && newPassword === currentActualPassword) {
      setPasswordMsg({ type: 'error', text: 'New password must be different from your previous password.' });
      return;
    }

    onUpdateUser({ password: newPassword });
    setPrevPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMsg({ type: 'success', text: 'Password has been successfully changed!' });
    if (showToast) showToast('Account password updated successfully!');
    setTimeout(() => setPasswordMsg(null), 3500);
  };

  // Reseller API Key copy and regen
  const handleCopyKey = () => {
    navigator.clipboard.writeText(user.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = () => {
    const newKey = `smm_live_np_${Math.random().toString(36).substring(2, 12)}`;
    onUpdateUser({ apiKey: newKey });
    setKeyRegenNotice(true);
    setTimeout(() => setKeyRegenNotice(false), 3000);
  };

  const userRole = user.role || user.tier || 'User';

  return (
    <div
      id="user-profile-hub-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="user-profile-hub-modal"
        className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          id="user-profile-modal-close-btn"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
          title="Close profile window"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Card Header with Role and Avatar */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-5 border-b border-neutral-800">
          {/* Avatar Picture with Edit Photo trigger */}
          <div className="relative group shrink-0">
            <div className="h-20 w-20 rounded-2xl bg-neutral-950 border-2 border-emerald-500/40 p-0.5 shadow-xl overflow-hidden flex items-center justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.fullName || user.username}
                  className="h-full w-full object-cover rounded-[14px]"
                  onError={() => setAvatarUrl('')}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-[14px] flex items-center justify-center text-2xl font-black text-neutral-950">
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md transition cursor-pointer"
              title="Upload photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* User Details & Badges */}
          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white truncate">
                {user.fullName || user.username}
              </h2>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1 shrink-0">
                <UserCheck className="w-3 h-3" />
                <span>Role: {userRole}</span>
              </span>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                ⭐ {user.tier} Tier
              </span>
            </div>

            <div className="text-xs text-neutral-400 font-mono flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
              <span className="text-emerald-400 font-semibold">@{user.username}</span>
              <span>•</span>
              <span className="truncate">{user.email}</span>
              <span>•</span>
              <span className="text-neutral-500">Active</span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-xs font-mono">
              <div className="bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800 text-emerald-400 font-bold">
                Balance: Rs. {user.balance.toLocaleString()} NPR
              </div>
              <div className="bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800 text-neutral-300">
                Orders: {user.totalOrders}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Navigation Sub-Tabs */}
        <div className="flex items-center gap-1.5 border-b border-neutral-800 pt-3 pb-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSubTab('profile')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeSubTab === 'profile'
                ? 'bg-emerald-500 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Photo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('password')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeSubTab === 'password'
                ? 'bg-emerald-500 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('api')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeSubTab === 'api'
                ? 'bg-emerald-500 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Reseller API</span>
          </button>

          {/* Quick Theme Switch Pill in Header */}
          <button
            id="profile-modal-quick-theme-toggle"
            type="button"
            onClick={() => handleThemeChange(currentTheme === 'dark' ? 'light' : 'dark')}
            className="ml-auto px-2.5 py-1 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer text-neutral-300 hover:text-white shrink-0 shadow-inner"
            title={`Current theme: ${currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'} - Click to toggle`}
          >
            {currentTheme === 'dark' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline font-mono text-[11px]">Dark Theme</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline font-mono text-[11px]">Light Theme</span>
              </>
            )}
          </button>
        </div>

        {/* Tab 1: Edit Profile, Name, Email, Picture */}
        {activeSubTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4 pt-4">
            {profileMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 font-mono ${
                  profileMsg.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}
              >
                {profileMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            {/* Profile Picture Controls */}
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Profile Picture / Avatar</span>
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Upload Image File</span>
                </button>

                <div className="flex-1 flex items-center gap-1.5 w-full">
                  <input
                    type="url"
                    value={avatarInputUrl}
                    onChange={(e) => setAvatarInputUrl(e.target.value)}
                    placeholder="Or paste direct image URL (https://...)"
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyAvatarUrl}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 hover:text-white transition cursor-pointer"
                  >
                    Apply
                  </button>
                </div>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="px-2.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs font-semibold transition cursor-pointer"
                    title="Remove custom picture"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Form Fields for Name, Email, Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Full Name</span>
                </label>
                <input
                  id="profile-fullname-input"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Email Address</span>
                </label>
                <input
                  id="profile-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@domain.com"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Phone / WhatsApp Number</span>
                </label>
                <input
                  id="profile-phone-input"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +977 98XXXXXXXX"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Visual Appearance & Theme Toggle Switch */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Visual Appearance & Theme</h4>
                    <p className="text-[11px] text-neutral-400">Customize your visual interface between Dark and Light mode</p>
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  currentTheme === 'dark'
                    ? 'bg-neutral-800 text-neutral-300 border-neutral-700'
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/30 font-bold'
                }`}>
                  {currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>

              {/* Mode Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* Dark Theme Option */}
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition cursor-pointer ${
                    currentTheme === 'dark'
                      ? 'bg-neutral-900 border-emerald-500 text-white shadow-md ring-1 ring-emerald-500/50'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${
                    currentTheme === 'dark' ? 'bg-neutral-800 text-emerald-400' : 'bg-neutral-800/60 text-neutral-400'
                  }`}>
                    <Moon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <span>Dark Theme</span>
                      {currentTheme === 'dark' && (
                        <span className="text-[9px] bg-emerald-500 text-neutral-950 px-1.5 py-0.2 rounded font-mono font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5 leading-relaxed">
                      Deep obsidian tones with reduced eye fatigue for nighttime trading.
                    </p>
                  </div>
                </button>

                {/* Light Theme Option */}
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition cursor-pointer ${
                    currentTheme === 'light'
                      ? 'bg-amber-500/10 border-amber-500 text-neutral-900 shadow-md ring-1 ring-amber-500/50'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${
                    currentTheme === 'light' ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800/60 text-neutral-400'
                  }`}>
                    <Sun className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <span className={currentTheme === 'light' ? 'text-amber-600' : ''}>Light Theme</span>
                      {currentTheme === 'light' && (
                        <span className="text-[9px] bg-amber-500 text-neutral-950 px-1.5 py-0.2 rounded font-mono font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5 leading-relaxed">
                      Clean high-contrast daytime canvas with crisp typography.
                    </p>
                  </div>
                </button>
              </div>

              {/* Interactive Toggle Switch */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                <span className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <span>Toggle Switch:</span>
                  <strong className="text-neutral-200 font-medium">
                    {currentTheme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                  </strong>
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                    <Moon className="w-3 h-3 text-neutral-400" /> Dark
                  </span>
                  <button
                    id="user-profile-theme-toggle-switch"
                    type="button"
                    role="switch"
                    aria-checked={currentTheme === 'light'}
                    onClick={() => handleThemeChange(currentTheme === 'dark' ? 'light' : 'dark')}
                    className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      currentTheme === 'light' ? 'bg-amber-500' : 'bg-neutral-800'
                    }`}
                    title="Toggle Theme (Dark / Light)"
                  >
                    <span
                      className={`pointer-events-none inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        currentTheme === 'light' ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    >
                      {currentTheme === 'light' ? (
                        <Sun className="h-3 w-3 text-amber-500" />
                      ) : (
                        <Moon className="h-3 w-3 text-neutral-800" />
                      )}
                    </span>
                  </button>
                  <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                    <Sun className="w-3 h-3 text-amber-400" /> Light
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                id="save-profile-details-btn"
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Change Password (Requires Previous Password & 2x New Password) */}
        {activeSubTab === 'password' && (
          <form onSubmit={handleChangePassword} className="space-y-4 pt-4">
            <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl">
              <span className="text-xs font-bold text-white block mb-0.5">Password Security Rule</span>
              <p className="text-[11px] text-neutral-400">
                To update your account password, you must enter your <strong className="text-emerald-400">previous password</strong> and then enter your <strong className="text-emerald-400">new password two times</strong> to confirm.
              </p>
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

            {/* 1. Previous Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                <span>1. Previous (Current) Password *</span>
                <span className="text-[10px] text-neutral-500 font-mono">Verification Required</span>
              </label>
              <div className="relative">
                <input
                  id="user-prev-password"
                  type={showPrevPass ? 'text' : 'password'}
                  value={prevPassword}
                  onChange={(e) => setPrevPassword(e.target.value)}
                  required={!!user.password}
                  placeholder="Enter your current previous password"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPrevPass(!showPrevPass)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  {showPrevPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 2. New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                <span>2. New Password (Min 6 chars) *</span>
                <span className="text-[10px] text-neutral-500 font-mono">1st Entry</span>
              </label>
              <div className="relative">
                <input
                  id="user-new-password"
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter your new password"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 3. Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                <span>3. Confirm New Password *</span>
                <span className="text-[10px] text-neutral-500 font-mono">2nd Entry (Confirm)</span>
              </label>
              <div className="relative">
                <input
                  id="user-confirm-new-password"
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password to confirm"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                id="submit-password-change-btn"
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>Confirm & Update Password</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Reseller API Key */}
        {activeSubTab === 'api' && (
          <div className="space-y-4 pt-4">
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-emerald-400" /> Reseller API Key
                </span>
                <button
                  type="button"
                  onClick={handleRegenerateKey}
                  className="text-xs text-neutral-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer font-mono"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate Key
                </button>
              </div>

              {keyRegenNotice && (
                <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2 font-mono">
                  ✓ New API key generated successfully!
                </div>
              )}

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 font-mono text-xs text-neutral-300">
                <span className="truncate flex-1 text-xs text-emerald-400 font-mono">{user.apiKey}</span>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer shrink-0"
                  title="Copy API key"
                >
                  {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Use this secret key to connect automated reseller scripts, WHMCS modules, or WordPress SMM plugins directly to our high-speed dispatch API endpoint.
            </p>
          </div>
        )}

        {/* Modal Footer with Logout and Quick Actions */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <button
            id="modal-profile-logout-btn"
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 hover:text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Account</span>
          </button>

          <div className="flex items-center gap-2">
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateTab('add_funds');
                }}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                + Add Funds
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
