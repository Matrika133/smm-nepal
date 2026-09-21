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
  ShieldAlert,
  LogOut,
  RefreshCw,
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
  Building,
  Briefcase
} from 'lucide-react';
import { UserAccount, StaffMember } from '../types';

interface StaffProfileSecurityModalProps {
  isOpen: boolean;
  currentUser: UserAccount;
  staffMember?: StaffMember | null;
  onClose: () => void;
  onUpdateCurrentUser: (updated: Partial<UserAccount>) => void;
  onUpdateStaffMember?: (updated: Partial<StaffMember>) => void;
  onLockAdmin: () => void;
  showToast?: (msg: string) => void;
}

export function StaffProfileSecurityModal({
  isOpen,
  currentUser,
  staffMember,
  onClose,
  onUpdateCurrentUser,
  onUpdateStaffMember,
  onLockAdmin,
  showToast,
}: StaffProfileSecurityModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'master_key'>('profile');

  // Profile fields state
  const [name, setName] = useState(currentUser.fullName || staffMember?.name || currentUser.username);
  const [email, setEmail] = useState(currentUser.email || staffMember?.email || '');
  const [phone, setPhone] = useState(currentUser.phone || staffMember?.phone || '');
  const [department, setDepartment] = useState(currentUser.department || staffMember?.department || 'Executive Administration');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [avatarInputUrl, setAvatarInputUrl] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Change state (Previous + 2x New Password)
  const [prevPassword, setPrevPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPrevPass, setShowPrevPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Master Key Change state (Previous + 2x New Master Key)
  const [prevMasterKey, setPrevMasterKey] = useState('');
  const [newMasterKey, setNewMasterKey] = useState('');
  const [confirmMasterKey, setConfirmMasterKey] = useState('');
  const [showPrevMaster, setShowPrevMaster] = useState(false);
  const [showNewMaster, setShowNewMaster] = useState(false);
  const [showConfirmMaster, setShowConfirmMaster] = useState(false);
  const [masterKeyMsg, setMasterKeyMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Photo Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileMsg({ type: 'error', text: 'Please select a valid image file.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        onUpdateCurrentUser({ avatarUrl: result });
        setProfileMsg({ type: 'success', text: 'Staff profile photo updated!' });
        if (showToast) showToast('Staff profile photo updated!');
        setTimeout(() => setProfileMsg(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyAvatarUrl = () => {
    if (!avatarInputUrl.trim()) return;
    setAvatarUrl(avatarInputUrl.trim());
    onUpdateCurrentUser({ avatarUrl: avatarInputUrl.trim() });
    setAvatarInputUrl('');
    setProfileMsg({ type: 'success', text: 'Staff profile photo updated from URL!' });
    if (showToast) showToast('Staff profile photo updated!');
    setTimeout(() => setProfileMsg(null), 3000);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    onUpdateCurrentUser({ avatarUrl: '' });
    setProfileMsg({ type: 'success', text: 'Staff profile photo reset.' });
    setTimeout(() => setProfileMsg(null), 3000);
  };

  // Save Profile details
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    if (!name.trim()) {
      setProfileMsg({ type: 'error', text: 'Name cannot be empty.' });
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setProfileMsg({ type: 'error', text: 'Please provide a valid email address.' });
      return;
    }

    onUpdateCurrentUser({
      fullName: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      department: department.trim(),
      avatarUrl: avatarUrl.trim() || undefined,
    });

    if (onUpdateStaffMember && staffMember) {
      onUpdateStaffMember({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        department: department.trim(),
      });
    }

    setProfileMsg({ type: 'success', text: 'Staff credentials and profile details saved successfully!' });
    if (showToast) showToast('Staff profile updated!');
    setTimeout(() => setProfileMsg(null), 3000);
  };

  // Change Password Handler (Previous + 2x New Password)
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    const currentActualPassword = currentUser.password || staffMember?.password || '';

    if (currentActualPassword) {
      if (!prevPassword) {
        setPasswordMsg({ type: 'error', text: 'Please enter your previous staff password.' });
        return;
      }
      if (prevPassword !== currentActualPassword) {
        setPasswordMsg({ type: 'error', text: 'Previous password does not match current staff credentials.' });
        return;
      }
    }

    if (!newPassword.trim()) {
      setPasswordMsg({ type: 'error', text: 'Please enter a new password.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (!confirmPassword.trim()) {
      setPasswordMsg({ type: 'error', text: 'Please enter the new password twice to confirm.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    if (currentActualPassword && newPassword === currentActualPassword) {
      setPasswordMsg({ type: 'error', text: 'New password cannot be identical to previous password.' });
      return;
    }

    onUpdateCurrentUser({ password: newPassword.trim() });
    if (onUpdateStaffMember && staffMember) {
      onUpdateStaffMember({ password: newPassword.trim() });
    }

    setPrevPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMsg({ type: 'success', text: 'Staff password has been securely updated!' });
    if (showToast) showToast('Staff password updated!');
    setTimeout(() => setPasswordMsg(null), 3500);
  };

  // Change Master Key Handler (Previous + 2x New Master Key)
  const handleChangeMasterKey = (e: React.FormEvent) => {
    e.preventDefault();
    setMasterKeyMsg(null);

    const currentActualMasterKey = currentUser.masterKey || staffMember?.masterKey || 'smm_master_key_99';

    if (currentActualMasterKey) {
      if (!prevMasterKey.trim()) {
        setMasterKeyMsg({ type: 'error', text: 'Please enter your previous master key.' });
        return;
      }
      if (prevMasterKey.trim().toLowerCase() !== currentActualMasterKey.trim().toLowerCase()) {
        setMasterKeyMsg({ type: 'error', text: 'Previous master key does not match.' });
        return;
      }
    }

    if (!newMasterKey.trim()) {
      setMasterKeyMsg({ type: 'error', text: 'Please enter a new master key.' });
      return;
    }

    if (newMasterKey.length < 6) {
      setMasterKeyMsg({ type: 'error', text: 'New master key must be at least 6 characters.' });
      return;
    }

    if (!confirmMasterKey.trim()) {
      setMasterKeyMsg({ type: 'error', text: 'Please enter the new master key twice to confirm.' });
      return;
    }

    if (newMasterKey.trim() !== confirmMasterKey.trim()) {
      setMasterKeyMsg({ type: 'error', text: 'New master key and confirmation do not match.' });
      return;
    }

    onUpdateCurrentUser({
      masterKey: newMasterKey.trim(),
      masterPassword: newMasterKey.trim(),
    });

    if (onUpdateStaffMember && staffMember) {
      onUpdateStaffMember({ masterKey: newMasterKey.trim() });
    }

    setPrevMasterKey('');
    setNewMasterKey('');
    setConfirmMasterKey('');
    setMasterKeyMsg({ type: 'success', text: 'Staff master key has been securely updated!' });
    if (showToast) showToast('Master key updated!');
    setTimeout(() => setMasterKeyMsg(null), 3500);
  };

  const staffRole = currentUser.role || staffMember?.role || 'Admin';

  return (
    <div
      id="staff-security-profile-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="staff-security-profile-modal"
        className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
          title="Close window"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Staff Profile Header Card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-5 border-b border-neutral-800">
          {/* Avatar Picture with Edit Photo trigger */}
          <div className="relative group shrink-0">
            <div className="h-20 w-20 rounded-2xl bg-neutral-950 border-2 border-red-500/40 p-0.5 shadow-xl overflow-hidden flex items-center justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="h-full w-full object-cover rounded-[14px]"
                  onError={() => setAvatarUrl('')}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-tr from-red-600 to-rose-500 rounded-[14px] flex items-center justify-center text-2xl font-black text-white">
                  {(currentUser.username || 'AD').substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-full bg-red-500 hover:bg-red-400 text-white shadow-md transition cursor-pointer"
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

          {/* Details & Badges */}
          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white truncate">
                {name}
              </h2>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-1 shrink-0 uppercase">
                <ShieldAlert className="w-3 h-3" />
                <span>Role: {staffRole}</span>
              </span>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-neutral-950 border border-neutral-800 text-neutral-300 shrink-0">
                {department}
              </span>
            </div>

            <div className="text-xs text-neutral-400 font-mono flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
              <span className="text-red-400 font-semibold">@{currentUser.username}</span>
              <span>•</span>
              <span className="truncate">{email}</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Staff Console
              </span>
            </div>
          </div>
        </div>

        {/* Modal Navigation Sub-Tabs */}
        <div className="flex items-center gap-1.5 border-b border-neutral-800 pt-3 pb-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-red-500 text-white font-bold shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Staff Info & Photo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'password'
                ? 'bg-red-500 text-white font-bold shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Change Staff Password</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('master_key')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'master_key'
                ? 'bg-red-500 text-white font-bold shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Master Key</span>
          </button>
        </div>

        {/* Tab 1: Staff Info & Photo */}
        {activeTab === 'profile' && (
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

            {/* Photo Controls */}
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-red-400" />
                <span>Staff Profile Picture</span>
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-red-400" />
                  <span>Upload Image File</span>
                </button>

                <div className="flex-1 flex items-center gap-1.5 w-full">
                  <input
                    type="url"
                    value={avatarInputUrl}
                    onChange={(e) => setAvatarInputUrl(e.target.value)}
                    placeholder="Or enter direct image URL"
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
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

            {/* Edit Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-red-400" />
                  <span>Staff Full Name</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter staff full name"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-red-400" />
                  <span>Official Email Address</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="staff@domain.com"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-red-400" />
                  <span>Phone / WhatsApp</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +977 98XXXXXXXX"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-red-400" />
                  <span>Department</span>
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Administration / Support"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-red-500/20 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Staff Profile</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Change Staff Password (Previous + 2x New Password) */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="space-y-4 pt-4">
            <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl">
              <span className="text-xs font-bold text-white block mb-0.5">Staff Password Security Protocol</span>
              <p className="text-[11px] text-neutral-400">
                Staff and administrators must provide their <strong className="text-red-400">previous password</strong> and enter their <strong className="text-red-400">new password two times</strong> to confirm.
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
                <span>1. Previous Staff Password *</span>
                <span className="text-[10px] text-neutral-500 font-mono">Current Password Verification</span>
              </label>
              <div className="relative">
                <input
                  type={showPrevPass ? 'text' : 'password'}
                  value={prevPassword}
                  onChange={(e) => setPrevPassword(e.target.value)}
                  required
                  placeholder="Enter previous password"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
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
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new staff password"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
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
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password to confirm"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
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
                type="submit"
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-red-500/20 flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>Confirm & Update Staff Password</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Change Master Key (Previous + 2x New Master Key) */}
        {activeTab === 'master_key' && (
          <form onSubmit={handleChangeMasterKey} className="space-y-4 pt-4">
            <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl">
              <span className="text-xs font-bold text-white block mb-0.5">Staff Master Key Security Protocol</span>
              <p className="text-[11px] text-neutral-400">
                The Master Key is required for high-level administration and system lock override. You must enter your <strong className="text-red-400">previous master key</strong> and enter your <strong className="text-red-400">new master key two times</strong> to confirm.
              </p>
            </div>

            {masterKeyMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 font-mono ${
                  masterKeyMsg.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}
              >
                {masterKeyMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{masterKeyMsg.text}</span>
              </div>
            )}

            {/* 1. Previous Master Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                <span>1. Previous Master Key *</span>
                <span className="text-[10px] text-neutral-500 font-mono">Current Master Verification</span>
              </label>
              <div className="relative">
                <input
                  type={showPrevMaster ? 'text' : 'password'}
                  value={prevMasterKey}
                  onChange={(e) => setPrevMasterKey(e.target.value)}
                  required
                  placeholder="Enter current master key"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPrevMaster(!showPrevMaster)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  {showPrevMaster ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 2. New Master Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                <span>2. New Master Key (Min 6 chars) *</span>
                <span className="text-[10px] text-neutral-500 font-mono">1st Entry</span>
              </label>
              <div className="relative">
                <input
                  type={showNewMaster ? 'text' : 'password'}
                  value={newMasterKey}
                  onChange={(e) => setNewMasterKey(e.target.value)}
                  required
                  placeholder="Enter new master key"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewMaster(!showNewMaster)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  {showNewMaster ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 3. Confirm New Master Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                <span>3. Confirm New Master Key *</span>
                <span className="text-[10px] text-neutral-500 font-mono">2nd Entry (Confirm)</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmMaster ? 'text' : 'password'}
                  value={confirmMasterKey}
                  onChange={(e) => setConfirmMasterKey(e.target.value)}
                  required
                  placeholder="Re-enter new master key to confirm"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmMaster(!showConfirmMaster)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  {showConfirmMaster ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-red-500/20 flex items-center gap-1.5"
              >
                <KeyRound className="w-4 h-4" />
                <span>Confirm & Update Master Key</span>
              </button>
            </div>
          </form>
        )}

        {/* Modal Footer with Logout and Lock */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onLockAdmin();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 hover:text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-sm"
          >
            <Lock className="w-4 h-4" />
            <span>Logout and Lock Console</span>
          </button>

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
  );
}
