import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Server,
  Key,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Users,
  User,
  Inbox,
  Clock,
  Sparkles,
  AlertCircle,
  FileText,
  Sliders,
  Check,
  Eye,
  EyeOff,
  Trash2,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { SystemSettings, UserAccount, EmailConfig, SentEmailLog } from '../types';

interface AdminEmailConfigTabProps {
  settings: SystemSettings;
  allUsers: UserAccount[];
  currentUser: UserAccount;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  showToast: (msg: string) => void;
}

interface SmtpPreset {
  id: string;
  name: string;
  host: string;
  port: number;
  encryption: 'TLS' | 'SSL' | 'None';
  tip: string;
  authHelp: string;
}

const SMTP_PRESETS: SmtpPreset[] = [
  {
    id: 'gmail',
    name: 'Gmail / Google Workspace',
    host: 'smtp.gmail.com',
    port: 587,
    encryption: 'TLS',
    tip: 'Google Mail Gateway (TLS Port 587 or SSL Port 465)',
    authHelp:
      'Google requires a 16-character App Password (not your standard Google password). Enable 2-Step Verification at myaccount.google.com, visit https://myaccount.google.com/apppasswords, select "Mail", click Generate, and paste the 16 characters into the password field below.',
  },
  {
    id: 'outlook',
    name: 'Microsoft 365 / Outlook',
    host: 'smtp.office365.com',
    port: 587,
    encryption: 'TLS',
    tip: 'Microsoft 365 / Hotmail / Outlook.com (Port 587)',
    authHelp:
      'Use your primary Microsoft email address as the username. If Two-Step Verification is enabled, generate an App Password in your Microsoft Account security settings.',
  },
  {
    id: 'cpanel',
    name: 'cPanel / Webmail / Custom Domain',
    host: 'mail.smmpanelnepal.com',
    port: 465,
    encryption: 'SSL',
    tip: 'Direct cPanel Domain Webmail (Port 465 SSL or Port 587 TLS)',
    authHelp:
      'Use mail.yourdomain.com (or your hosting server IP/hostname), with your full email (e.g., support@yourdomain.com) and the mailbox password created inside your cPanel Email Accounts.',
  },
  {
    id: 'sendgrid',
    name: 'SendGrid SMTP Relay',
    host: 'smtp.sendgrid.net',
    port: 587,
    encryption: 'TLS',
    tip: 'High-volume cloud transactional relay (Port 587)',
    authHelp:
      'Username must be strictly "apikey" and password is your SendGrid API key starting with "SG.".',
  },
  {
    id: 'ses',
    name: 'Amazon Simple Email Service (SES)',
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    encryption: 'TLS',
    tip: 'AWS SES Production Relay (Port 587)',
    authHelp:
      'Generate dedicated SMTP credentials from AWS SES Console -> SMTP Settings (do not use AWS Root/IAM Secret Access Key).',
  },
];

const DEFAULT_EMAIL_CONFIG: EmailConfig = {
  isEnabled: true,
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUsername: 'smmpanelnepal@gmail.com',
  smtpUser: 'smmpanelnepal@gmail.com',
  smtpPassword: '',
  smtpPass: '',
  senderName: 'SMM Panel Nepal Official',
  senderEmail: 'noreply@smmpanelnepal.com',
  encryption: 'TLS',
  sendGridApiKey: '',
  isConfigured: false,
  notifyOnRegistration: true,
  notifyOnDeposit: true,
  notifyOnOrderComplete: false,
  notifyOnTicketReply: true,
};

const INITIAL_SENT_LOGS: SentEmailLog[] = [
  {
    id: 'email_log_1',
    recipient: 'All Registered Users (842 Recipients)',
    recipientName: 'Global User Broadcast',
    subject: '⚡ Major Platform Update: 0-Min Instant Nepali Payment Gateways Activated',
    body: 'Dear Valued Member,\n\nWe are excited to announce our upgraded 0-Minute automatic payment system with instant balance credit for eSewa, Khalti, and Fonepay. Thank you for choosing SMM Panel Nepal!',
    sentAt: 'Today at 10:15 AM',
    sentBy: 'Super Admin',
    status: 'Sent',
  },
  {
    id: 'email_log_2',
    recipient: 'kiran@gmail.com',
    recipientName: 'Kiran Thapa',
    subject: 'Deposit Approved: Rs. 5,000 NPR Added to Your Balance',
    body: 'Hello Kiran,\n\nYour manual deposit proof for Fonepay transaction ID FP-98234 has been verified and Rs. 5,000 NPR has been added to your wallet.\n\nHappy Reselling!',
    sentAt: 'Yesterday at 04:30 PM',
    sentBy: 'Admin Console',
    status: 'Sent',
  },
];

export function AdminEmailConfigTab({
  settings,
  allUsers,
  currentUser,
  onUpdateSettings,
  showToast,
}: AdminEmailConfigTabProps) {
  const currentSiteName = settings.siteName || 'SMM Panel Nepal';

  // Config form state with field normalization
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(() => {
    const existing = settings.emailConfig;
    if (existing) {
      const user = existing.smtpUsername || existing.smtpUser || '';
      const pass = existing.smtpPassword !== undefined ? existing.smtpPassword : (existing.smtpPass || '');
      return {
        ...DEFAULT_EMAIL_CONFIG,
        ...existing,
        smtpUsername: user,
        smtpUser: user,
        smtpPassword: pass,
        smtpPass: pass,
        senderName: existing.senderName || `${currentSiteName} Official`,
      };
    }
    return {
      ...DEFAULT_EMAIL_CONFIG,
      senderName: `${currentSiteName} Official`,
    };
  });

  const [activeSubTab, setActiveSubTab] = useState<'dispatcher' | 'smtp_config' | 'logs'>('smtp_config');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('gmail');

  // Dispatcher form state
  const [recipientType, setRecipientType] = useState<'all' | 'single' | 'custom'>('all');
  const [selectedUserId, setSelectedUserId] = useState<string>(allUsers[0]?.id || '');
  const [customEmail, setCustomEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>(`Welcome to ${currentSiteName} - Exclusive Customer Notice`);
  const [template, setTemplate] = useState<string>('announcement');
  const [bodyText, setBodyText] = useState<string>(
    `Dear Valued Customer,\n\nWe are pleased to inform you that our services and instant QR payment gateways have been upgraded with maximum delivery speed.\n\nIf you have any questions, our support team is available 24/7 via live chat.\n\nBest regards,\n${currentSiteName} Management Team`
  );

  // Testing & sending states
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{
    success: boolean;
    msg: string;
    latency?: number;
    details?: any;
  } | null>(null);

  // Direct Live Test Email
  const [testEmailRecipient, setTestEmailRecipient] = useState<string>(
    currentUser.email || settings.supportEmail || 'smmpanelnepal@gmail.com'
  );
  const [isSendingTestMail, setIsSendingTestMail] = useState(false);
  const [testMailResult, setTestMailResult] = useState<{ success: boolean; msg: string } | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [sentLogs, setSentLogs] = useState<SentEmailLog[]>(() => {
    try {
      const stored = localStorage.getItem('smm_sent_email_logs');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return INITIAL_SENT_LOGS;
  });

  // Handle template selection
  const handleTemplateChange = (tpl: string) => {
    setTemplate(tpl);
    if (tpl === 'announcement') {
      setSubject(`📢 ${currentSiteName}: Platform Maintenance & Feature Updates`);
      setBodyText(
        `Dear Members,\n\nWe have successfully upgraded our backend server nodes and services API to provide ultra-fast deliveries.\n\nEnjoy lowest rates and 0-minute QR processing.\n\nSincerely,\nAdmin Team`
      );
    } else if (tpl === 'deposit_credit') {
      setSubject('💰 Wallet Credit Confirmed: Funds Added to Your Account');
      setBodyText(
        `Dear Customer,\n\nYour recent deposit has been verified and successfully credited to your ${currentSiteName} wallet balance.\n\nYou can now place orders instantly via the New Order tab.\n\nThank you for choosing us!`
      );
    } else if (tpl === 'discount') {
      setSubject('🎉 Special Offer: +10% Bonus on All Deposits Today!');
      setBodyText(
        `Exclusive Promotion for our loyal users!\n\nDeposit any amount today via eSewa, Khalti, or Fonepay and automatically receive an extra 10% bonus added to your balance.\n\nOffer valid for the next 24 hours. Don't miss out!\n\nBest regards,\n${currentSiteName} Promotion Desk`
      );
    } else if (tpl === 'security') {
      setSubject('🔒 Security Notice: Important Account Information');
      setBodyText(
        `Hello,\n\nThis is a standard security advisory from ${currentSiteName}. Please ensure you keep your account password secure and never share your API key with unauthorized parties.\n\nIf you did not request any recent account actions, please contact support immediately.`
      );
    }
  };

  // Apply a Provider Preset
  const handleApplyPreset = (preset: SmtpPreset) => {
    setSelectedPresetId(preset.id);
    setEmailConfig((prev) => ({
      ...prev,
      smtpHost: preset.host,
      smtpPort: preset.port,
      encryption: preset.encryption,
    }));
    setSmtpTestResult(null);
    showToast(`Loaded ${preset.name} configuration presets.`);
  };

  // Real Backend SMTP Connection Test (TCP / TLS Handshake)
  const handleTestSmtp = async () => {
    if (!emailConfig.smtpHost?.trim()) {
      setSmtpTestResult({
        success: false,
        msg: 'Please specify an SMTP Host (e.g. smtp.gmail.com).',
      });
      return;
    }

    setIsTestingSmtp(true);
    setSmtpTestResult(null);

    const user = (emailConfig.smtpUsername || emailConfig.smtpUser || '').trim();
    const pass = emailConfig.smtpPassword !== undefined ? emailConfig.smtpPassword : (emailConfig.smtpPass || '');

    try {
      const res = await fetch('/api/email/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpHost: emailConfig.smtpHost.trim(),
          smtpPort: Number(emailConfig.smtpPort) || 587,
          smtpUsername: user,
          smtpPassword: pass,
          encryption: emailConfig.encryption || 'TLS',
          senderEmail: emailConfig.senderEmail,
          senderName: emailConfig.senderName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSmtpTestResult({
          success: true,
          latency: data.latencyMs,
          msg: data.message || `SMTP Handshake Verified in ${data.latencyMs}ms! Connected to ${emailConfig.smtpHost}:${emailConfig.smtpPort}. Ready to dispatch live emails.`,
          details: data.details,
        });
        showToast(`SMTP Mail Server Connected Successfully (${data.latencyMs}ms)!`);
      } else {
        setSmtpTestResult({
          success: false,
          latency: data.latencyMs,
          msg: data.error || data.rawError || 'SMTP Connection Failed. Please check your credentials.',
        });
      }
    } catch (err: any) {
      setSmtpTestResult({
        success: false,
        msg: `Connection Error: Could not reach backend server API (${err.message}).`,
      });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  // Send Live Test Email to Admin's Inbox
  const handleSendTestEmail = async () => {
    if (!testEmailRecipient?.trim() || !testEmailRecipient.includes('@')) {
      alert('Please enter a valid email address to receive the live test email.');
      return;
    }

    setIsSendingTestMail(true);
    setTestMailResult(null);

    const user = (emailConfig.smtpUsername || emailConfig.smtpUser || '').trim();
    const pass = emailConfig.smtpPassword !== undefined ? emailConfig.smtpPassword : (emailConfig.smtpPass || '');

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpConfig: {
            smtpHost: emailConfig.smtpHost.trim(),
            smtpPort: Number(emailConfig.smtpPort) || 587,
            smtpUsername: user,
            smtpPassword: pass,
            encryption: emailConfig.encryption || 'TLS',
            senderEmail: emailConfig.senderEmail || user || 'noreply@smmpanelnepal.com',
            senderName: emailConfig.senderName || currentSiteName,
          },
          to: testEmailRecipient.trim(),
          subject: `✅ [Test] ${currentSiteName} - SMTP Mail Server Verified`,
          text: `Congratulations!\n\nYour outgoing SMTP Mail Server (${emailConfig.smtpHost}:${emailConfig.smtpPort}) is successfully connected and verified.\n\nAll transactional notifications (deposits, registrations, password resets, order status updates) will now be dispatched live through this email gateway.\n\nDelivered at: ${new Date().toLocaleString()}\nSender: ${emailConfig.senderName || currentSiteName} <${emailConfig.senderEmail || user}>`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestMailResult({
          success: true,
          msg: `Live test email delivered successfully to ${testEmailRecipient}! Server Response: ${data.response || data.messageId || 'OK'}`,
        });
        showToast(`Test email dispatched to ${testEmailRecipient}!`);
      } else {
        setTestMailResult({
          success: false,
          msg: data.error || 'Failed to dispatch test email. Please check your SMTP credentials.',
        });
      }
    } catch (err: any) {
      setTestMailResult({
        success: false,
        msg: `Network request error: ${err.message}`,
      });
    } finally {
      setIsSendingTestMail(false);
    }
  };

  // Save SMTP Settings
  const handleSaveConfig = () => {
    const user = (emailConfig.smtpUsername || emailConfig.smtpUser || '').trim();
    const pass = emailConfig.smtpPassword !== undefined ? emailConfig.smtpPassword : (emailConfig.smtpPass || '');

    const updatedConfig: EmailConfig = {
      ...emailConfig,
      smtpUsername: user,
      smtpUser: user,
      smtpPassword: pass,
      smtpPass: pass,
      isConfigured: Boolean(emailConfig.smtpHost && (user || emailConfig.smtpPort)),
    };

    const updated: SystemSettings = {
      ...settings,
      emailConfig: updatedConfig,
    };

    onUpdateSettings(updated);
    try {
      localStorage.setItem('smm_nepal_system_settings', JSON.stringify(updated));
    } catch (e) {}
    showToast('Email & SMTP Configuration Saved Successfully!');
  };

  // Live Email Dispatcher
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      alert('Please enter an email subject line.');
      return;
    }
    if (!bodyText.trim()) {
      alert('Please enter an email message body.');
      return;
    }

    let targetName = '';
    let targetEmail = '';
    let recipientsList: string[] = [];

    if (recipientType === 'all') {
      targetName = 'All Registered Users';
      targetEmail = `Broadcast to ${allUsers.length} Users`;
      recipientsList = allUsers.map((u) => u.email).filter(Boolean);
    } else if (recipientType === 'single') {
      const u = allUsers.find((user) => user.id === selectedUserId);
      targetName = u?.fullName || u?.username || 'Client User';
      targetEmail = u?.email || 'customer@gmail.com';
      recipientsList = [targetEmail];
    } else {
      if (!customEmail.trim() || !customEmail.includes('@')) {
        alert('Please enter a valid recipient email address.');
        return;
      }
      targetName = 'Custom Recipient';
      targetEmail = customEmail.trim();
      recipientsList = [targetEmail];
    }

    setIsSending(true);

    const user = (emailConfig.smtpUsername || emailConfig.smtpUser || '').trim();
    const pass = emailConfig.smtpPassword !== undefined ? emailConfig.smtpPassword : (emailConfig.smtpPass || '');

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpConfig: {
            smtpHost: emailConfig.smtpHost.trim(),
            smtpPort: Number(emailConfig.smtpPort) || 587,
            smtpUsername: user,
            smtpPassword: pass,
            encryption: emailConfig.encryption || 'TLS',
            senderEmail: emailConfig.senderEmail || user || 'noreply@smmpanelnepal.com',
            senderName: emailConfig.senderName || currentSiteName,
          },
          to: recipientsList.length === 1 ? recipientsList[0] : recipientsList,
          subject: subject.trim(),
          text: bodyText.trim(),
        }),
      });

      const data = await res.json();
      const isSuccess = res.ok && data.success;

      const newLog: SentEmailLog = {
        id: 'email_' + Date.now(),
        recipient: targetEmail,
        recipientName: targetName,
        subject: subject.trim(),
        body: bodyText.trim(),
        sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString(),
        sentBy: currentUser.fullName || currentUser.username,
        status: isSuccess ? 'Sent' : 'Failed',
      };

      const updatedLogs = [newLog, ...sentLogs];
      setSentLogs(updatedLogs);
      try {
        localStorage.setItem('smm_sent_email_logs', JSON.stringify(updatedLogs));
      } catch (err) {}

      if (isSuccess) {
        showToast(`Email successfully dispatched to ${targetName}!`);
      } else {
        alert(
          `Email Dispatch Warning:\n${data.error || 'The mail server did not accept the message'}\n\nPlease check your SMTP credentials under the SMTP Settings tab.`
        );
      }
    } catch (err: any) {
      alert(`Network error while dispatching email: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const selectedUserObj = allUsers.find((u) => u.id === selectedUserId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/20">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white tracking-tight">
                Email Configuration & User Dispatcher
              </h3>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                SMTP Active
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Configure outgoing mail servers, setup automatic transactional emails, and send personalized messages directly to registered clients.
            </p>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('dispatcher')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'dispatcher'
                ? 'bg-sky-500 text-neutral-950 font-black shadow-lg shadow-sky-500/20'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Email</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('smtp_config')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'smtp_config'
                ? 'bg-sky-500 text-neutral-950 font-black shadow-lg shadow-sky-500/20'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>SMTP Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('logs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'logs'
                ? 'bg-sky-500 text-neutral-950 font-black shadow-lg shadow-sky-500/20'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Sent History ({sentLogs.length})</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SUBTAB 1: EMAIL DISPATCHER (SEND TO USERS DIRECTLY)
         ========================================================================= */}
      {activeSubTab === 'dispatcher' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Compose Email to Users
                </h4>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                From: {emailConfig.senderName || 'SMM Nepal'} &lt;{emailConfig.senderEmail || 'support@smmpanelnepal.com'}&gt;
              </span>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4 text-xs">
              {/* Recipient Target Selector */}
              <div className="space-y-1.5">
                <label className="block text-neutral-300 font-semibold">
                  Send To / Target Audience
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRecipientType('all')}
                    className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer flex items-center justify-center gap-1.5 font-bold ${
                      recipientType === 'all'
                        ? 'bg-sky-500 text-neutral-950 border-sky-400 shadow-md shadow-sky-500/20'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>All Users ({allUsers.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecipientType('single')}
                    className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer flex items-center justify-center gap-1.5 font-bold ${
                      recipientType === 'single'
                        ? 'bg-sky-500 text-neutral-950 border-sky-400 shadow-md shadow-sky-500/20'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Specific User</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecipientType('custom')}
                    className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer flex items-center justify-center gap-1.5 font-bold ${
                      recipientType === 'custom'
                        ? 'bg-sky-500 text-neutral-950 border-sky-400 shadow-md shadow-sky-500/20'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Custom Email</span>
                  </button>
                </div>
              </div>

              {/* Specific User Selector */}
              {recipientType === 'single' && (
                <div className="space-y-1">
                  <label className="block text-neutral-400 font-semibold">Select Registered User</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-medium focus:outline-none focus:border-sky-500"
                  >
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName || u.username} ({u.email}) • Balance: Rs. {u.balance} NPR
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom Email Input */}
              {recipientType === 'custom' && (
                <div className="space-y-1">
                  <label className="block text-neutral-400 font-semibold">Recipient Email Address</label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="e.g., client@gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              )}

              {/* Template Presets */}
              <div className="space-y-1.5">
                <label className="block text-neutral-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Quick Templates (Click to fill)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'announcement', label: 'Platform Announcement' },
                    { id: 'deposit_credit', label: 'Deposit Approved' },
                    { id: 'discount', label: 'Bonus Credit Promo' },
                    { id: 'security', label: 'Security Alert' },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleTemplateChange(tpl.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                        template === tpl.id
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                      }`}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="block text-neutral-300 font-semibold">Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject line of your email"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-bold focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Message Body */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-neutral-300 font-semibold">Email Message Body</label>
                  <span className="text-[10px] text-neutral-500">Supports plain text & line breaks</span>
                </div>
                <textarea
                  rows={7}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Write your email message here..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-sky-500 leading-relaxed font-sans"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>Preview Email</span>
                </button>

                <button
                  type="submit"
                  disabled={isSending}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-black transition shadow-lg shadow-sky-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Dispatching Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Email Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Live Preview Box (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-sky-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Recipient Inbox Preview
                  </h4>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold">
                  Live View
                </span>
              </div>

              {/* Rendered Email Preview Container */}
              <div className="rounded-2xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-inner">
                {/* Email Header */}
                <div className="p-3.5 border-b border-neutral-800/80 bg-neutral-900/40 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>From:</span>
                    <span className="font-semibold text-neutral-200">
                      {emailConfig.senderName} &lt;{emailConfig.senderEmail}&gt;
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>To:</span>
                    <span className="font-semibold text-sky-300 truncate max-w-[200px]">
                      {recipientType === 'all'
                        ? 'All Members (Broadcast)'
                        : recipientType === 'single'
                        ? selectedUserObj?.email || 'user@example.com'
                        : customEmail || 'custom@example.com'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                    <span>Subject:</span>
                    <span className="font-bold text-white truncate max-w-[200px]">
                      {subject || '(No Subject)'}
                    </span>
                  </div>
                </div>

                {/* Email Body Card */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px]">
                      NP
                    </div>
                    <span className="text-xs font-bold text-neutral-300">
                      {settings.siteName || 'SMM Panel Nepal'}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-800/60 min-h-[140px]">
                    {bodyText || 'Type your message on the left to see live rendering...'}
                  </div>

                  <div className="text-[10px] text-neutral-500 text-center pt-2 border-t border-neutral-900">
                    Sent via {emailConfig.smtpHost} encrypted with {emailConfig.encryption}
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30 text-[11px] text-sky-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  Emails sent will be recorded in the Sent History tab with deliverability timestamps.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBTAB 2: SMTP CONFIGURATION SETTINGS
         ========================================================================= */}
      {activeSubTab === 'smtp_config' && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-sky-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  SMTP Mail Server Configuration
                </h4>
                {emailConfig.smtpHost && (emailConfig.smtpUsername || emailConfig.smtpUser) ? (
                  <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    Active Gateway
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                    Configuration Incomplete
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Connect your actual mail server to dispatch live customer notifications, password reset links, and broadcast updates.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestSmtp}
                disabled={isTestingSmtp}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingSmtp ? 'animate-spin text-sky-400' : 'text-neutral-400'}`} />
                <span>{isTestingSmtp ? 'Pinging Mail Server...' : 'Test Connection'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save SMTP Settings</span>
              </button>
            </div>
          </div>

          {/* Test connection alert banner */}
          {smtpTestResult && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 transition-all ${
                smtpTestResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/40 border-red-500/40 text-red-200'
              }`}
            >
              {smtpTestResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-semibold">{smtpTestResult.msg}</p>
                {smtpTestResult.latency && (
                  <p className="text-[11px] opacity-80 font-mono">
                    Round-trip Handshake Latency: {smtpTestResult.latency} ms
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 1-Click Provider Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>One-Click Mail Provider Presets</span>
              </label>
              <span className="text-[11px] text-neutral-500">Auto-fills host, port & encryption</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {SMTP_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${
                    selectedPresetId === preset.id
                      ? 'bg-sky-950/40 border-sky-500/50 text-white shadow-md shadow-sky-500/10'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                  }`}
                >
                  <span className="font-bold text-xs truncate">{preset.name}</span>
                  <span className="text-[10px] text-neutral-500 font-mono truncate">{preset.host}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Provider Specific Helper Notice (e.g. Gmail App Passwords) */}
          {emailConfig.smtpHost.includes('gmail.com') && (
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200/90 text-xs flex items-start gap-3">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-300">Using Gmail or Google Workspace?</span>
                <p className="text-[11px] leading-relaxed text-amber-200/80">
                  Google disables direct password login. You <strong>MUST</strong> use a 16-character{' '}
                  <strong>Google App Password</strong>:
                  <br />
                  1. Enable <strong>2-Step Verification</strong> on your Google account.
                  <br />
                  2. Visit{' '}
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-amber-300 font-semibold hover:text-amber-200 inline-flex items-center gap-1"
                  >
                    myaccount.google.com/apppasswords <ExternalLink className="w-3 h-3" />
                  </a>
                  <br />
                  3. Enter app name "SMM Panel", click Generate, and copy the 16-letter code into the SMTP Password field below.
                </p>
              </div>
            </div>
          )}

          {/* Configuration Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* SMTP Host */}
            <div className="space-y-1">
              <label className="block text-neutral-300 font-semibold">SMTP Host / Server</label>
              <input
                type="text"
                value={emailConfig.smtpHost}
                onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                placeholder="e.g., smtp.gmail.com or mail.domain.com"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* SMTP Port */}
            <div className="space-y-1">
              <label className="block text-neutral-300 font-semibold">SMTP Port</label>
              <input
                type="number"
                value={emailConfig.smtpPort}
                onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: parseInt(e.target.value) || 587 })}
                placeholder="587 or 465"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Encryption */}
            <div className="space-y-1">
              <label className="block text-neutral-300 font-semibold">Encryption Protocol</label>
              <select
                value={emailConfig.encryption}
                onChange={(e) => setEmailConfig({ ...emailConfig, encryption: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-medium focus:outline-none focus:border-sky-500"
              >
                <option value="TLS">TLS (Port 587 - Recommended)</option>
                <option value="SSL">SSL (Port 465)</option>
                <option value="NONE">None (Port 25)</option>
              </select>
            </div>

            {/* SMTP Username */}
            <div className="space-y-1">
              <label className="block text-neutral-300 font-semibold">SMTP Username / Email</label>
              <input
                type="text"
                value={emailConfig.smtpUsername || emailConfig.smtpUser || ''}
                onChange={(e) =>
                  setEmailConfig({
                    ...emailConfig,
                    smtpUsername: e.target.value,
                    smtpUser: e.target.value,
                  })
                }
                placeholder="e.g., smmpanelnepal@gmail.com"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* SMTP Password with toggle */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-neutral-300 font-semibold">SMTP Password / App Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-neutral-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={emailConfig.smtpPassword !== undefined ? emailConfig.smtpPassword : (emailConfig.smtpPass || '')}
                onChange={(e) =>
                  setEmailConfig({
                    ...emailConfig,
                    smtpPassword: e.target.value,
                    smtpPass: e.target.value,
                  })
                }
                placeholder="Enter 16-character App Password or mail password"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Sender Display Name */}
            <div className="space-y-1">
              <label className="block text-neutral-300 font-semibold">Sender Display Name</label>
              <input
                type="text"
                value={emailConfig.senderName}
                onChange={(e) => setEmailConfig({ ...emailConfig, senderName: e.target.value })}
                placeholder="e.g., SMM Panel Nepal Support"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Sender From Email */}
            <div className="space-y-1">
              <label className="block text-neutral-300 font-semibold">From / Reply-To Email</label>
              <input
                type="email"
                value={emailConfig.senderEmail}
                onChange={(e) => setEmailConfig({ ...emailConfig, senderEmail: e.target.value })}
                placeholder="noreply@smmpanelnepal.com"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Live Test Email Tool */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Send Live Test Email to Your Inbox</span>
                </h5>
                <p className="text-[11px] text-neutral-400">
                  Verify actual end-to-end delivery right now by dispatching a test email through your configured SMTP server.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 text-xs">
              <input
                type="email"
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
                placeholder="Enter recipient email (e.g. your personal email)"
                className="w-full sm:flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSendingTestMail}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap shadow-md shadow-emerald-500/20"
              >
                {isSendingTestMail ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Live Email...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Test Email</span>
                  </>
                )}
              </button>
            </div>

            {testMailResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  testMailResult.success
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/50 border-red-500/40 text-red-300'
                }`}
              >
                {testMailResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{testMailResult.msg}</span>
              </div>
            )}
          </div>

          {/* Transactional Notification Triggers */}
          <div className="pt-4 border-t border-neutral-800 space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              Automatic Notification Triggers
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {[
                { key: 'notifyOnRegistration', label: 'Welcome Email on Sign Up' },
                { key: 'notifyOnDeposit', label: 'Deposit Approval Confirmation' },
                { key: 'notifyOnOrderComplete', label: 'Order Completion Notice' },
                { key: 'notifyOnTicketReply', label: 'Support Ticket Reply Notice' },
              ].map((item) => {
                const isChecked = (emailConfig as any)[item.key] ?? false;
                return (
                  <label
                    key={item.key}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer hover:border-neutral-700"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        setEmailConfig({
                          ...emailConfig,
                          [item.key]: e.target.checked,
                        })
                      }
                      className="rounded accent-sky-500 h-4 w-4"
                    />
                    <span className="text-neutral-300 font-medium">{item.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBTAB 3: SENT EMAILS HISTORY LOGS
         ========================================================================= */}
      {activeSubTab === 'logs' && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Sent Emails History Log
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Full chronological archive of emails and user notices sent from the admin console.
              </p>
            </div>

            {sentLogs.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Clear all sent email logs?')) {
                    setSentLogs([]);
                    try {
                      localStorage.removeItem('smm_sent_email_logs');
                    } catch (e) {}
                    showToast('Sent logs cleared.');
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-red-950/50 text-neutral-400 hover:text-red-400 text-xs transition cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {sentLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <span className="font-bold text-white">{log.subject}</span>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                    <span>{log.sentAt}</span>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                      {log.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                  <span>Recipient: <strong className="text-sky-300">{log.recipient}</strong></span>
                  <span>•</span>
                  <span>Sent By: <strong className="text-neutral-200">{log.sentBy}</strong></span>
                </div>

                <p className="text-xs text-neutral-300 whitespace-pre-wrap bg-neutral-900/50 p-2.5 rounded-xl border border-neutral-800/60">
                  {log.body}
                </p>
              </div>
            ))}

            {sentLogs.length === 0 && (
              <div className="text-center py-12 text-neutral-500 text-xs">
                No emails dispatched yet. Use the "Send Email" tab to compose a message.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-400" />
                <span>Email Client Preview</span>
              </h3>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-3">
              <div className="space-y-1 pb-2 border-b border-neutral-800">
                <div className="text-neutral-400">Subject: <strong className="text-white">{subject}</strong></div>
                <div className="text-neutral-400">From: {emailConfig.senderName} &lt;{emailConfig.senderEmail}&gt;</div>
              </div>
              <div className="text-neutral-200 whitespace-pre-wrap leading-relaxed">
                {bodyText}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPreviewModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
