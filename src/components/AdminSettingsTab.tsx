import React, { useState, useEffect } from 'react';
import {
  Settings,
  Image as ImageIcon,
  Sliders,
  Bell,
  Share2,
  Search,
  ShieldCheck,
  Check,
  Upload,
  Globe,
  Sparkles,
  Lock,
  Key,
  Trash2,
  Copy,
  ExternalLink,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Mail,
  Smartphone,
  MessageCircle,
  Code,
  Layers,
  ArrowRight,
  ShieldAlert,
  Send,
  Eye,
  Wrench,
  Activity,
  X,
  Radio,
  Database,
  Download,
  Terminal,
  RefreshCw,
  FileCode2,
  Users,
} from 'lucide-react';
import { SystemSettings, StaffRole, StaffPermissions, UserAccount } from '../types';
import { MaintenanceScreen } from './MaintenanceScreen';
import { SMM_MYSQL_SCHEMA } from '../utils/schemaSql';

interface AdminSettingsTabProps {
  systemSettings: SystemSettings;
  onUpdateSettings: (newSettings: Partial<SystemSettings>) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  currentUser: UserAccount;
  onNavigateSection?: (sectionId: string) => void;
  onOpenInstaller?: () => void;
}

type SettingsSubTab =
  | 'general'
  | 'homepage_stats'
  | 'database'
  | 'logo_favicon'
  | 'system_config'
  | 'staff_permissions'
  | 'notifications'
  | 'social_login'
  | 'seo';

export function AdminSettingsTab({
  systemSettings,
  onUpdateSettings,
  showToast,
  currentUser,
  onNavigateSection,
  onOpenInstaller,
}: AdminSettingsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>('general');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPreviewMaintenanceOpen, setIsPreviewMaintenanceOpen] = useState(false);

  // Database auto-upload & connection manager state
  const [dbConfig, setDbConfig] = useState({
    host: 'localhost',
    port: '3306',
    database: 'smm_panel_db',
    user: 'root',
    password: '',
    createDatabaseIfNotExists: true,
  });
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [isUploadingSql, setIsUploadingSql] = useState(false);
  const [dbOperationResult, setDbOperationResult] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
    details?: any;
    diagnosis?: any;
  } | null>(null);

  // Local form state
  const [form, setForm] = useState<SystemSettings>({
    ...systemSettings,
    adminRoutePath: systemSettings.adminRoutePath || 'admin',
    maintenanceTitle: systemSettings.maintenanceTitle || 'Website Under Scheduled Maintenance',
    maintenanceMessage:
      systemSettings.maintenanceMessage ||
      'Our platform is currently performing high-speed database optimizations and security updates. All customer balances and orders are securely preserved.',
    maintenanceEstimatedTime: systemSettings.maintenanceEstimatedTime || '< 15 Minutes',
    systemConfig: {
      orderMaxLimit: 1000000,
      dripFeedEnabled: true,
      registrationEnabled: true,
      emailVerificationRequired: false,
      autoSyncProviders: true,
      autoRefundFailedOrders: true,
      lowBalanceThresholdNPR: 100,
      sessionTimeoutMinutes: 60,
      ...(systemSettings.systemConfig || {}),
    },
    socialLoginSettings: {
      googleEnabled: true,
      googleClientId: '109827364512-mock-smm-nepal-oauth.apps.googleusercontent.com',
      googleClientSecret: 'GOCSPX-mock-secret-smm-nepal-772',
      githubEnabled: false,
      githubClientId: '',
      githubClientSecret: '',
      facebookEnabled: false,
      facebookAppId: '',
      facebookAppSecret: '',
      ...(systemSettings.socialLoginSettings || {}),
    },
    seoSettings: {
      metaTitle: 'SMM Panel Nepal - #1 Automated Social Media Growth & SMM Reseller in Nepal',
      metaDescription: 'Best, cheapest and fastest SMM Panel in Nepal with instant Fonepay QR, eSewa, Khalti, and ConnectIPS automated payments. Grow Instagram, TikTok, YouTube & Facebook.',
      metaKeywords: 'smm panel nepal, buy tiktok followers nepal, buy instagram followers nepal, cheap smm nepal, fonepay smm, esewa smm panel',
      ogImageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&auto=format&fit=crop&q=80',
      googleAnalyticsId: 'G-SMMPANELNP99',
      googleSearchConsoleTag: 'google-site-verification=smm_nepal_official_search_console_token',
      headerCode: '<!-- SMM Panel Nepal Custom Tracking Pixel -->',
      footerCode: '',
      ...(systemSettings.seoSettings || {}),
    },
  });

  // Sync external changes
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      ...systemSettings,
      maintenanceTitle: systemSettings.maintenanceTitle || prev.maintenanceTitle || 'Website Under Scheduled Maintenance',
      maintenanceMessage:
        systemSettings.maintenanceMessage ||
        prev.maintenanceMessage ||
        'Our platform is currently performing high-speed database optimizations and security updates. All customer balances and orders are securely preserved.',
      maintenanceEstimatedTime:
        systemSettings.maintenanceEstimatedTime || prev.maintenanceEstimatedTime || '< 15 Minutes',
      systemConfig: {
        ...prev.systemConfig,
        ...(systemSettings.systemConfig || {}),
      },
      socialLoginSettings: {
        ...prev.socialLoginSettings,
        ...(systemSettings.socialLoginSettings || {}),
      },
      seoSettings: {
        ...prev.seoSettings,
        ...(systemSettings.seoSettings || {}),
      },
    }));
  }, [systemSettings]);

  const handleToggleMaintenanceMode = (enable?: boolean) => {
    const newMode = enable !== undefined ? enable : !form.maintenanceMode;
    const updated: SystemSettings = {
      ...form,
      maintenanceMode: newMode,
      maintenanceTitle: form.maintenanceTitle || `${form.siteName || 'Platform'} Under Scheduled Maintenance`,
      maintenanceMessage:
        form.maintenanceMessage ||
        'Our platform is currently performing high-speed database optimizations and security updates. All customer balances and orders are securely preserved.',
      maintenanceEstimatedTime: form.maintenanceEstimatedTime || '< 15 Minutes',
    };
    setForm(updated);
    onUpdateSettings(updated);
    try {
      localStorage.setItem('smm_nepal_system_settings', JSON.stringify(updated));
    } catch (err) {}
    showToast(
      newMode
        ? '🔴 Maintenance Mode ACTIVATED! Customer portal is now locked with the maintenance screen.'
        : '🟢 Maintenance Mode DISABLED! Website is now fully live online for all customers.',
      newMode ? 'info' : 'success'
    );
  };

  const isSuperAdminOrAdmin =
    currentUser.role === 'admin' ||
    currentUser.role === 'superadmin' ||
    currentUser.role === 'manager' ||
    currentUser.tier === 'Admin';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = () => {
    // Sanitize adminRoutePath
    let cleanedAdminPath = (form.adminRoutePath || 'admin').trim().toLowerCase();
    cleanedAdminPath = cleanedAdminPath.replace(/[^a-z0-9_-]/g, '');
    if (!cleanedAdminPath) cleanedAdminPath = 'admin';

    const updated = {
      ...form,
      adminRoutePath: cleanedAdminPath,
    };

    setForm(updated);
    onUpdateSettings(updated);
    showToast('All system settings saved and synchronized!', 'success');
  };

  const handleTestDbConnection = async () => {
    setIsTestingDb(true);
    setDbOperationResult(null);
    try {
      const res = await fetch('/api/installer/test-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: dbConfig.host,
          port: Number(dbConfig.port) || 3306,
          user: dbConfig.user,
          password: dbConfig.password,
          database: dbConfig.database,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDbOperationResult({
          type: 'success',
          title: 'MySQL Connection Succeeded! 🟢',
          message: data.message || `Connected to MySQL "${dbConfig.database}" at ${dbConfig.host}:${dbConfig.port}`,
          details: data,
        });
        showToast('MySQL connection successful!', 'success');
      } else {
        setDbOperationResult({
          type: 'error',
          title: 'MySQL Connection Failed 🔴',
          message: data.error || 'Connection error',
          diagnosis: data.diagnosis,
        });
        showToast(data.error || 'MySQL connection failed', 'error');
      }
    } catch (err: any) {
      setDbOperationResult({
        type: 'error',
        title: 'Network / Server Error',
        message: err.message || 'Could not communicate with server',
      });
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleAutoUploadSql = async () => {
    setIsUploadingSql(true);
    setDbOperationResult(null);
    try {
      const res = await fetch('/api/installer/auto-upload-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: dbConfig.host,
          port: Number(dbConfig.port) || 3306,
          user: dbConfig.user,
          password: dbConfig.password,
          database: dbConfig.database,
          createDatabaseIfNotExists: dbConfig.createDatabaseIfNotExists,
          superAdmin: {
            username: currentUser.username || 'smmpanelnepal',
            email: currentUser.email || 'smmpanelnepal@gmail.com',
            fullName: currentUser.fullName || 'SMM SuperAdmin Nepal',
            password: 'admin123',
            pin: '7788',
          },
          settings: {
            siteName: form.siteName,
            siteTagline: form.siteTagline,
            currency: form.currency || 'NPR',
            adminRoute: form.adminRoutePath || 'admin',
            supportPhone: form.supportPhone,
            supportEmail: form.supportEmail,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDbOperationResult({
          type: 'success',
          title: 'SQL Schema Auto-Uploaded & Executed! ⚡',
          message: data.message,
          details: data.result,
        });
        showToast('SQL schema uploaded and executed in MySQL!', 'success');
      } else {
        setDbOperationResult({
          type: 'error',
          title: 'SQL Upload Failed 🔴',
          message: data.error || 'Failed to execute SQL',
          diagnosis: data.diagnosis,
        });
        showToast(data.error || 'SQL upload failed', 'error');
      }
    } catch (err: any) {
      setDbOperationResult({
        type: 'error',
        title: 'Execution Error',
        message: err.message || 'Failed to auto-upload SQL to database',
      });
    } finally {
      setIsUploadingSql(false);
    }
  };

  const handleDownloadSqlFile = () => {
    window.location.href = '/api/installer/download-sql';
    showToast('Downloading smm_panel_nepal.sql...', 'info');
  };

  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://smmpanelnepal.com';
  const customAdminUrl = `${siteOrigin}/${(form.adminRoutePath || 'admin').replace(/^\/+/, '')}`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <Settings className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-white">Platform Settings & Control Center</h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Configure system parameters, custom admin access URL, brand logos, notifications, social logins, and SEO tags.
          </p>
        </div>

        <button
          id="admin-save-all-settings-btn"
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-2 shrink-0"
        >
          <Check className="w-4 h-4" />
          <span>Save All Settings</span>
        </button>
      </div>

      {/* Settings Navigation Sub-Tabs Bar */}
      <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-2 shadow-lg flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {[
          { id: 'general', label: 'General Setting', icon: Settings },
          { id: 'homepage_stats', label: 'Homepage & Auth Stats', icon: Users },
          { id: 'database', label: 'MySQL Database & Setup', icon: Database },
          { id: 'logo_favicon', label: 'Logo and Favicon', icon: ImageIcon },
          { id: 'system_config', label: 'System Configuration', icon: Sliders },
          { id: 'staff_permissions', label: 'Staff Permission', icon: ShieldCheck },
          { id: 'notifications', label: 'Notification Settings', icon: Bell },
          { id: 'social_login', label: 'Social Login Setting', icon: Share2 },
          { id: 'seo', label: 'SEO Configuration', icon: Search },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              id={`settings-subtab-${tab.id}`}
              onClick={() => setActiveSubTab(tab.id as SettingsSubTab)}
              className={`px-3.5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                  : 'bg-neutral-950/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: GENERAL SETTING */}
      {activeSubTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card: Identity & Custom Admin Route */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-red-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  General Platform Parameters
                </h3>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Site Name */}
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">
                  Website / Brand Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.siteName}
                  onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-bold focus:outline-none focus:border-red-500"
                  placeholder="e.g. SMM Panel Nepal"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">
                  Website Slogan / Tagline
                </label>
                <input
                  type="text"
                  value={form.siteTagline}
                  onChange={(e) => setForm({ ...form, siteTagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-red-500"
                  placeholder="e.g. Nepal #1 Automated Social Media Growth Terminal"
                />
              </div>

              {/* Official Domain URL */}
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Website URL / Domain</span>
                </label>
                <input
                  type="text"
                  value={form.siteUrl || ''}
                  onChange={(e) => setForm({ ...form, siteUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-red-500"
                  placeholder="e.g. https://smmpanelnepal.com"
                />
              </div>

              {/* CUSTOM ADMIN CONSOLE ACCESS URL PATH */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/40 via-neutral-950 to-neutral-950 border border-red-500/40 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-red-400" />
                    <span className="font-bold text-white text-xs">
                      Custom Admin Console Route Path
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 font-mono text-[10px] font-bold">
                    Dynamic Routing
                  </span>
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Customize the URL path used to access the administrator terminal (e.g. changing <code>/admin</code> to <code>/panel-secret</code> or <code>/boss-terminal</code>).
                </p>

                {/* Input Field for Custom Admin Path */}
                <div>
                  <label className="block text-neutral-300 mb-1 font-semibold text-[11px]">
                    Admin Custom Route Slug (e.g., panel-secret, secure-admin):
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 font-mono text-neutral-400 text-xs shrink-0 select-none">
                      /
                    </span>
                    <input
                      id="custom-admin-route-slug-input"
                      type="text"
                      value={form.adminRoutePath || 'admin'}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                        setForm({ ...form, adminRoutePath: val });
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-red-300 font-mono font-bold focus:outline-none focus:border-red-500 text-xs"
                      placeholder="e.g. panel-secret"
                    />
                  </div>
                </div>

                {/* Quick Presets for 1-click slug selection */}
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block mb-1.5">
                    Quick Route Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '/admin (Default)', val: 'admin' },
                      { label: '/panel-secret', val: 'panel-secret' },
                      { label: '/secure-admin', val: 'secure-admin' },
                      { label: '/boss-terminal', val: 'boss-terminal' },
                      { label: '/portal-master', val: 'portal-master' },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setForm({ ...form, adminRoutePath: preset.val })}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                          (form.adminRoutePath || 'admin') === preset.val
                            ? 'bg-red-500 text-white shadow'
                            : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exclusive Route Security Alert */}
                {(!form.adminRoutePath || form.adminRoutePath === 'admin') ? (
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-[11px] leading-relaxed flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Default Route Active (/admin):</strong>
                      The administrator terminal is currently accessible via the standard <code className="text-emerald-300 font-mono font-bold">/admin</code> URL. Change the slug above anytime to hide and restrict access.
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-[11px] leading-relaxed flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Exclusive Secret Route Active (Strict Security):</strong>
                      The admin panel will <strong className="text-white">ONLY</strong> be accessible via <code className="text-red-300 font-mono font-bold">/{form.adminRoutePath}</code>. The default <code className="text-neutral-400 line-through font-mono">/admin</code> route is <strong className="text-red-200">completely disabled</strong> to prevent unauthorized scanning.
                    </div>
                  </div>
                )}

                {/* Resolved Live URLs Display */}
                <div className="space-y-2">
                  {/* Custom Active URL */}
                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-neutral-400 uppercase font-mono">Active Admin Access URL:</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold">LIVE & EXCLUSIVE</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400 truncate block mt-0.5">
                        {customAdminUrl}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(customAdminUrl, 'custom-admin-url')}
                      className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 cursor-pointer transition shrink-0"
                      title="Copy Active Admin URL"
                    >
                      {copiedKey === 'custom-admin-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Status of standard /admin when changed */}
                  {form.adminRoutePath && form.adminRoutePath !== 'admin' && (
                    <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-between gap-2 opacity-75">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-neutral-500 uppercase font-mono">Default /admin Route:</span>
                          <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[9px] font-mono font-bold">DISABLED / BLOCKED</span>
                        </div>
                        <span className="text-xs font-mono text-neutral-500 line-through truncate block mt-0.5">
                          {siteOrigin}/admin
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-red-400/80 bg-red-950/50 px-2 py-0.5 rounded border border-red-900/50">
                        404 / Blocked
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card: Announcement Ticker & Maintenance */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Ticker & Platform Maintenance
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">
                  Live Marquee Header Announcement Ticker
                </label>
                <textarea
                  rows={3}
                  value={form.announcementTicker}
                  onChange={(e) => setForm({ ...form, announcementTicker: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-red-500 leading-relaxed text-xs"
                  placeholder="Broadcast message displayed continuously at the top of the user dashboard..."
                />
              </div>

              {/* Maintenance Mode Box */}
              <div className={`p-5 rounded-2xl border transition-all space-y-4 ${
                form.maintenanceMode
                  ? 'bg-gradient-to-br from-red-950/40 via-neutral-950 to-neutral-950 border-red-500/60 shadow-xl shadow-red-950/20'
                  : 'bg-neutral-950 border-neutral-800'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Wrench className={`w-4 h-4 ${form.maintenanceMode ? 'text-red-400 animate-pulse' : 'text-neutral-400'}`} />
                      <span className="font-bold text-white text-sm">Platform Maintenance Mode</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 ${
                          form.maintenanceMode
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${form.maintenanceMode ? 'bg-red-400 animate-ping' : 'bg-emerald-400'}`} />
                        {form.maintenanceMode ? 'UNDER MAINTENANCE' : 'LIVE ONLINE'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1 max-w-xl">
                      When enabled, customer and visitor pages will display a full-screen maintenance notice while the Admin Console remains 100% accessible.
                    </p>
                  </div>

                  {/* Immediate Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsPreviewMaintenanceOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                      title="Preview how visitors and customers see the maintenance screen"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-400" />
                      <span>Live Preview</span>
                    </button>

                    <button
                      type="button"
                      id="emergency-maintenance-toggle-btn"
                      onClick={() => handleToggleMaintenanceMode()}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-lg ${
                        form.maintenanceMode
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                      }`}
                    >
                      {form.maintenanceMode ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Turn OFF Maintenance (Go Live)</span>
                        </>
                      ) : (
                        <>
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Turn ON Maintenance Mode</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Customizable Maintenance Screen Content */}
                <div className="pt-3 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-neutral-300 mb-1 font-semibold text-[11px]">
                      Maintenance Screen Heading / Title:
                    </label>
                    <input
                      type="text"
                      value={form.maintenanceTitle || ''}
                      onChange={(e) => setForm({ ...form, maintenanceTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-red-500 text-xs"
                      placeholder="e.g. SMM Panel Nepal Under Scheduled Maintenance"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-neutral-300 mb-1 font-semibold text-[11px]">
                      Customer Notice Message (Reason & Details):
                    </label>
                    <textarea
                      rows={2}
                      value={form.maintenanceMessage || ''}
                      onChange={(e) => setForm({ ...form, maintenanceMessage: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-red-500 text-xs leading-relaxed"
                      placeholder="e.g. Our platform is performing high-speed database optimizations and security updates. All customer balances and orders are securely preserved."
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 mb-1 font-semibold text-[11px]">
                      Estimated Downtime / Return Time:
                    </label>
                    <input
                      type="text"
                      value={form.maintenanceEstimatedTime || ''}
                      onChange={(e) => setForm({ ...form, maintenanceEstimatedTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-red-500 text-xs"
                      placeholder="e.g. < 15 Minutes or 30 Minutes"
                    />
                  </div>

                    <div>
                      <label className="block text-neutral-300 mb-1 font-semibold text-[11px]">
                        Admin Route Safeguard:
                      </label>
                      <div className="px-3 py-2 rounded-xl bg-neutral-900/80 border border-neutral-800 text-neutral-400 text-xs font-mono flex items-center justify-between">
                        <span className="text-emerald-400 font-bold truncate">/{form.adminRoutePath || 'admin'}</span>
                        <span className="text-[10px] text-neutral-500 font-sans">Active Route</span>
                      </div>
                    </div>
                </div>
              </div>

              {/* Timezone & Currency */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold text-[11px]">System Timezone</label>
                  <input
                    type="text"
                    disabled
                    value="Asia/Kathmandu (GMT+5:45)"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-400 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold text-[11px]">Primary Currency</label>
                  <input
                    type="text"
                    disabled
                    value="Nepalese Rupee (NPR - रू)"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-400 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: HOMEPAGE & AUTH STATS (USER & SERVICE COUNT EDITING) */}
      {activeSubTab === 'homepage_stats' && (
        <div className="space-y-6">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>Homepage & Auth Landing Statistics</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Change the registered user count, total available services, and total delivered orders displayed to visitors before login and registration.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const current = form.homepageStats || {
                      totalUsers: 18450,
                      totalServices: 280,
                      totalOrders: 154200,
                      systemUptime: '99.98%',
                      activeResellers: 1420,
                      satisfactionRate: '99.9%',
                      useCustomStats: false,
                    };
                    const updated = {
                      ...form,
                      homepageStats: {
                        ...current,
                        useCustomStats: !current.useCustomStats,
                      },
                    };
                    setForm(updated);
                    onUpdateSettings(updated);
                    showToast(
                      updated.homepageStats.useCustomStats
                        ? 'Custom homepage stats enabled!'
                        : 'Dynamic database counts enabled!',
                      'success'
                    );
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md ${
                    form.homepageStats?.useCustomStats
                      ? 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400 font-extrabold'
                      : 'bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{form.homepageStats?.useCustomStats ? 'Custom Numbers Active' : 'Use Real Dynamic Counts'}</span>
                </button>
              </div>
            </div>

            {/* Mode Explanation */}
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              form.homepageStats?.useCustomStats
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-blue-950/20 border-blue-500/30 text-blue-300'
            }`}>
              {form.homepageStats?.useCustomStats ? (
                <span>
                  <strong>Custom Override Active:</strong> The exact numbers you configure below will be shown directly on the user homepage before login and on the registration page.
                </span>
              ) : (
                <span>
                  <strong>Live Database Mode Active:</strong> The homepage currently counts registered accounts and services dynamically from the database. Click "Custom Numbers Active" above to set your own custom values.
                </span>
              )}
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Registered Users Count (Homepage Display)
                </label>
                <input
                  type="number"
                  value={form.homepageStats?.totalUsers ?? 18450}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      homepageStats: {
                        ...(form.homepageStats || {
                          totalServices: 280,
                          totalOrders: 154200,
                          systemUptime: '99.98%',
                          activeResellers: 1420,
                          satisfactionRate: '99.9%',
                          useCustomStats: true,
                        }),
                        totalUsers: Number(e.target.value),
                        useCustomStats: true,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 52400"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">Renders as e.g. 52,400+ on homepage</span>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Total Services Available Count
                </label>
                <input
                  type="number"
                  value={form.homepageStats?.totalServices ?? 280}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      homepageStats: {
                        ...(form.homepageStats || {
                          totalUsers: 18450,
                          totalOrders: 154200,
                          systemUptime: '99.98%',
                          activeResellers: 1420,
                          satisfactionRate: '99.9%',
                          useCustomStats: true,
                        }),
                        totalServices: Number(e.target.value),
                        useCustomStats: true,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 850"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">Renders as e.g. 850+ services on homepage</span>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Total Delivered Orders Count
                </label>
                <input
                  type="number"
                  value={form.homepageStats?.totalOrders ?? 154200}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      homepageStats: {
                        ...(form.homepageStats || {
                          totalUsers: 18450,
                          totalServices: 280,
                          systemUptime: '99.98%',
                          activeResellers: 1420,
                          satisfactionRate: '99.9%',
                          useCustomStats: true,
                        }),
                        totalOrders: Number(e.target.value),
                        useCustomStats: true,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 154200"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">Total orders delivered successfully</span>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  System Uptime SLA %
                </label>
                <input
                  type="text"
                  value={form.homepageStats?.systemUptime || '99.98%'}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      homepageStats: {
                        ...(form.homepageStats || {
                          totalUsers: 18450,
                          totalServices: 280,
                          totalOrders: 154200,
                          activeResellers: 1420,
                          satisfactionRate: '99.9%',
                          useCustomStats: true,
                        }),
                        systemUptime: e.target.value,
                        useCustomStats: true,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="99.98%"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Customer Satisfaction Rate %
                </label>
                <input
                  type="text"
                  value={form.homepageStats?.satisfactionRate || '99.9%'}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      homepageStats: {
                        ...(form.homepageStats || {
                          totalUsers: 18450,
                          totalServices: 280,
                          totalOrders: 154200,
                          systemUptime: '99.98%',
                          activeResellers: 1420,
                          useCustomStats: true,
                        }),
                        satisfactionRate: e.target.value,
                        useCustomStats: true,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="99.9%"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Active Reseller Partners Count
                </label>
                <input
                  type="number"
                  value={form.homepageStats?.activeResellers ?? 1420}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      homepageStats: {
                        ...(form.homepageStats || {
                          totalUsers: 18450,
                          totalServices: 280,
                          totalOrders: 154200,
                          systemUptime: '99.98%',
                          satisfactionRate: '99.9%',
                          useCustomStats: true,
                        }),
                        activeResellers: Number(e.target.value),
                        useCustomStats: true,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="1420"
                />
              </div>
            </div>

            {/* Live Visual Preview */}
            <div className="pt-4 border-t border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  Visitor Homepage Live Preview:
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Real-time Preview
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 shadow-inner">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Registered Users</span>
                    <span className="text-xl font-black text-white font-mono">
                      {(form.homepageStats?.totalUsers ?? 18450).toLocaleString()}+
                    </span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">Active Clients</span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Services Available</span>
                    <span className="text-xl font-black text-white font-mono">
                      {(form.homepageStats?.totalServices ?? 280).toLocaleString()}+
                    </span>
                    <span className="text-[10px] text-blue-400 block mt-0.5">Nepal & Global SMM</span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Orders Delivered</span>
                    <span className="text-xl font-black text-white font-mono">
                      {(form.homepageStats?.totalOrders ?? 154200).toLocaleString()}+
                    </span>
                    <span className="text-[10px] text-amber-400 block mt-0.5">Automated Orders</span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold block">System SLA</span>
                    <span className="text-xl font-black text-white font-mono">
                      {form.homepageStats?.systemUptime || '99.98%'}
                    </span>
                    <span className="text-[10px] text-purple-400 block mt-0.5">Nepal Cluster</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateSettings(form);
                  showToast('Homepage and Auth stats updated successfully!', 'success');
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Save Homepage Stats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: MYSQL DATABASE & SETUP */}
      {activeSubTab === 'database' && (
        <div className="space-y-6">
          {/* Top Hero: Automated MySQL Uploader & Provisioner */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Automated MySQL Database Uploader & Executor</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Auto-Provisioning
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Connect directly to your local or remote MySQL/cPanel server and execute the entire database schema in 1-click.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSqlFile}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-cyan-300 font-bold text-xs flex items-center gap-1.5 border border-cyan-500/30 cursor-pointer transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .SQL File</span>
                </button>
              </div>
            </div>

            {/* Connection Credentials Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider">MySQL Host</label>
                <input
                  type="text"
                  value={dbConfig.host}
                  onChange={(e) => setDbConfig({ ...dbConfig, host: e.target.value })}
                  placeholder="localhost or remote IP / domain"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-neutral-500">Default: localhost</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider">Port</label>
                <input
                  type="text"
                  value={dbConfig.port}
                  onChange={(e) => setDbConfig({ ...dbConfig, port: e.target.value })}
                  placeholder="3306"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-neutral-500">Standard MySQL Port: 3306</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider">Database Name</label>
                <input
                  type="text"
                  value={dbConfig.database}
                  onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })}
                  placeholder="smm_panel_db"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-neutral-500">e.g. cpaneluser_smmpanel</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider">Database User</label>
                <input
                  type="text"
                  value={dbConfig.user}
                  onChange={(e) => setDbConfig({ ...dbConfig, user: e.target.value })}
                  placeholder="root or cpanel_dbuser"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-neutral-500">User with ALL PRIVILEGES</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider">Database Password</label>
                <input
                  type="password"
                  value={dbConfig.password}
                  onChange={(e) => setDbConfig({ ...dbConfig, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-neutral-500">MySQL password (leave empty if none)</span>
              </div>

              <div className="space-y-1.5 flex flex-col justify-center">
                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer select-none pt-4">
                  <input
                    type="checkbox"
                    checked={dbConfig.createDatabaseIfNotExists}
                    onChange={(e) => setDbConfig({ ...dbConfig, createDatabaseIfNotExists: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-0 focus:outline-none accent-emerald-500"
                  />
                  <span className="text-xs font-semibold">Auto-Create Database if missing</span>
                </label>
                <span className="text-[10px] text-neutral-500 pl-6">Executes CREATE DATABASE IF NOT EXISTS</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleTestDbConnection}
                disabled={isTestingDb || isUploadingSql}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 border border-neutral-700 cursor-pointer transition"
              >
                {isTestingDb ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>Testing Connection...</span>
                  </>
                ) : (
                  <>
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Test MySQL Connection</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAutoUploadSql}
                disabled={isUploadingSql || isTestingDb}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-neutral-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition transform active:scale-95"
              >
                {isUploadingSql ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading & Executing SQL Schema...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-neutral-950" />
                    <span>⚡ Auto-Upload & Execute SQL to Database Now</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([SMM_MYSQL_SCHEMA], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'smm_panel_database.sql';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  showToast('Downloaded smm_panel_database.sql successfully!', 'success');
                }}
                className="px-4 py-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs flex items-center gap-2 border border-neutral-700 cursor-pointer transition"
              >
                <Download className="w-3.5 h-3.5 text-neutral-400" />
                <span>Download smm_panel_database.sql</span>
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(SMM_MYSQL_SCHEMA, 'sql_schema')}
                className="px-3.5 py-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs flex items-center gap-2 border border-neutral-700 cursor-pointer transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedKey === 'sql_schema' ? 'Copied!' : 'Copy SQL Script'}</span>
              </button>
            </div>

            {/* Diagnostic Result Banner */}
            {dbOperationResult && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in duration-200 ${
                  dbOperationResult.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {dbOperationResult.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{dbOperationResult.title}</span>
                </div>

                <p className="text-xs text-neutral-200 leading-relaxed font-mono">
                  {dbOperationResult.message}
                </p>

                {/* Details upon success */}
                {dbOperationResult.details && (
                  <div className="mt-2 p-3 bg-black/40 rounded-lg border border-neutral-800 text-[11px] font-mono space-y-1">
                    <div className="text-emerald-400 font-bold">
                      ✓ Tables provisioned: {dbOperationResult.details.tablesCount || dbOperationResult.details.existingTablesCount || 8} tables
                    </div>
                    {dbOperationResult.details.tables && (
                      <div className="text-neutral-400 break-words">
                        Tables: {Array.isArray(dbOperationResult.details.tables) ? dbOperationResult.details.tables.join(', ') : 'All active'}
                      </div>
                    )}
                    {dbOperationResult.details.superAdminUsername && (
                      <div className="text-cyan-400">
                        ✓ SuperAdmin root: {dbOperationResult.details.superAdminUsername} ({dbOperationResult.details.superAdminEmail})
                      </div>
                    )}
                  </div>
                )}

                {/* Helpful solution upon failure */}
                {dbOperationResult.diagnosis && (
                  <div className="mt-3 p-3.5 bg-neutral-950/90 border border-neutral-800 rounded-xl space-y-2 text-xs">
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      <span>समाधान र निर्देशन (How to Fix):</span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      {dbOperationResult.diagnosis.solutionNepali}
                    </p>
                    <p className="text-[11px] text-neutral-400 border-t border-neutral-800 pt-2 font-mono">
                      {dbOperationResult.diagnosis.solutionEnglish}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Manual phpMyAdmin 1-Click Import Instructions Card */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    phpMyAdmin / cPanel Import (यदि Remote Block छ भने)
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  १००% ग्यारेन्टी
                </span>
              </div>

              {/* Critical phpMyAdmin Warning Banner */}
              <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-1.5 text-xs text-amber-200">
                <div className="font-bold flex items-center gap-2 text-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>phpMyAdmin मा समस्या आउनुको मुख्य कारण (#1046 Error):</span>
                </div>
                <p className="text-[11px] leading-relaxed text-neutral-300">
                  धेरै प्रयोगकर्ताले phpMyAdmin खोल्ने बित्तिकै माथिको <strong>"Import"</strong> थिच्दा <code className="text-amber-300 font-mono">#1046 No database selected</code> त्रुटि आउँछ। 
                  त्यसैले <strong>पहिले बायाँ साइडबार (Left Column) मा आफ्नो Database को नाममा १ पटक क्लिक गर्नैपर्छ!</strong>
                </p>
              </div>

              <div className="space-y-3 text-xs text-neutral-300">
                <div className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <div className="font-bold text-white">Step 1: SQL Dump डाउनलोड गर्नुहोस् वा Copy गर्नुहोस्</div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      माथिको <strong className="text-cyan-300">"Download smm_panel_database.sql"</strong> बटन थिचेर फाइल सेभ गर्नुहोस् वा सिधै <strong className="text-emerald-400">"Copy SQL Script"</strong> बटन थिच्नुहोस्।
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <div className="font-bold text-white">Step 2: phpMyAdmin मा छिरेर Database Name मा क्लिक गर्नुहोस्</div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      आफ्नो cPanel मा गएर <strong>phpMyAdmin</strong> खोल्नुहोस्। बायाँ साइडबार (Left Sidebar) मा तपाईंको डाटाबेस (उदा. <code className="text-cyan-300">nepal_smm</code>) मा क्लिक गर्नुहोस्। माथि ब्रेडक्रममा Database Name देखिनुपर्छ।
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <div className="font-bold text-white">Step 3: तरिका A (फाइल Import) वा तरिका B (सिधै SQL Paste)</div>
                    <div className="text-[11px] text-neutral-400 mt-1 space-y-1">
                      <div><strong className="text-white">तरिका A (सजिलो):</strong> माथिको <strong>"Import"</strong> ट्याब &gt; <strong>"Choose File"</strong> &gt; <code className="text-emerald-400">smm_panel_database.sql</code> छान्नुहोस् र <strong>"Go"</strong> थिच्नुहोस्।</div>
                      <div><strong className="text-white">तरिका B (सबैभन्दा भरपर्दो):</strong> माथिको <strong>"SQL"</strong> ट्याब खोल्नुहोस्, कपी गरिएको सम्पूर्ण कोड बक्समा पेस्ट गर्नुहोस् र तल <strong>"Go"</strong> थिच्नुहोस्। ५ सेकेन्डमै सबै टेबल बन्छन्!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SMM Database Tables Structure */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Core Schema & Table Architecture (8 Tables)
                  </h3>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">Auto-Provisioned</span>
              </div>

              <div className="space-y-2 text-xs max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {[
                  { table: 'system_settings', desc: 'Site branding, maintenance mode, currency & admin custom path' },
                  { table: 'users', desc: 'User & SuperAdmin credentials, roles, balances, tiers & security PINs' },
                  { table: 'services', desc: 'SMM catalog, wholesale sync IDs, rates per 1K, min/max limits' },
                  { table: 'orders', desc: 'Customer orders, link, quantity, charges, start count & remains' },
                  { table: 'transactions', desc: 'Fonepay, eSewa, Khalti, ConnectIPS deposits & wallet debits' },
                  { table: 'support_tickets', desc: 'Ticket inquiries, order references, priorities & lifecycle' },
                  { table: 'ticket_messages', desc: 'Threaded ticket chats between customers and admin/staff' },
                  { table: 'child_panels', desc: 'Reseller domain mappings, DNS records, margins & pricing' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-neutral-950/70 border border-neutral-800/80 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                        <Terminal className="w-3 h-3 text-neutral-500" />
                        <span>{item.table}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400">{item.desc}</div>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-neutral-900 border border-neutral-800 text-neutral-400 shrink-0">
                      InnoDB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: LOGO AND FAVICON */}
      {activeSubTab === 'logo_favicon' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Public Website Logo & Favicon */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Public Website Logo & Favicon
                </h3>
              </div>
            </div>

            {/* Logo Live Preview */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center p-2 overflow-hidden shrink-0 shadow-inner">
                {form.siteLogoUrl ? (
                  <img src={form.siteLogoUrl} alt="Site Logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 flex items-center justify-center">
                    <div className="h-full w-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                      <Zap className="w-6 h-6 text-emerald-400 fill-emerald-400" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">{form.siteName}</div>
                <div className="text-[11px] text-neutral-400 font-mono truncate">{form.siteUrl}</div>
                <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{form.siteLogoUrl ? 'Custom Website Logo Active' : 'Default Brand Icon Active'}</span>
                </div>
              </div>
              {form.siteLogoUrl && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, siteLogoUrl: '' })}
                  className="p-2 rounded-xl bg-neutral-900 hover:bg-red-950 text-neutral-400 hover:text-red-400 border border-neutral-800"
                  title="Reset to default logo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Upload or URL for Public Logo */}
            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-neutral-700 hover:border-emerald-500 bg-neutral-950 hover:bg-neutral-900 text-neutral-300 hover:text-white cursor-pointer transition font-semibold">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Upload Website Logo (Up to 1GB - PNG, SVG, JPG, WebP)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 1024 * 1024 * 1024) {
                      showToast('File size exceeds 1GB limit.', 'error');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      if (evt.target?.result) {
                        setForm({ ...form, siteLogoUrl: evt.target.result as string });
                        showToast('Website logo image loaded!', 'success');
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="hidden"
                />
              </label>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold text-[11px]">Or Direct Logo URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={form.siteLogoUrl || ''}
                    onChange={(e) => setForm({ ...form, siteLogoUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    placeholder="https://example.com/logo.png"
                  />
                  {form.siteLogoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ ...form, siteLogoUrl: '' });
                        showToast('Website logo removed. Default badge restored.', 'info');
                      }}
                      className="px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
                      title="Delete website logo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Logo</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Favicon URL */}
              <div className="pt-3 border-t border-neutral-800">
                <label className="block text-neutral-400 mb-1 font-semibold text-[11px]">
                  Favicon / Browser Tab Icon URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={form.siteFaviconUrl || ''}
                    onChange={(e) => setForm({ ...form, siteFaviconUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    placeholder="https://example.com/favicon.ico"
                  />
                  {form.siteFaviconUrl && (
                    <div className="w-9 h-9 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0 overflow-hidden">
                      <img src={form.siteFaviconUrl} alt="Favicon" className="w-5 h-5 object-contain" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Admin Console Custom Logo & Name */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Admin Console Header Branding
                </h3>
              </div>
            </div>

            {/* Admin Console Preview */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center p-2 overflow-hidden shrink-0 shadow-inner">
                {form.adminPanelLogoUrl || form.siteLogoUrl ? (
                  <img
                    src={form.adminPanelLogoUrl || form.siteLogoUrl}
                    alt="Admin Logo"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-red-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white uppercase tracking-wider truncate">
                  {form.adminPanelName || 'Admin Console'}
                </div>
                <div className="text-[11px] text-red-400 font-mono">Protected Master Terminal</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Appears in admin header navbar</div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Admin Console Name</label>
                <input
                  type="text"
                  value={form.adminPanelName || ''}
                  onChange={(e) => setForm({ ...form, adminPanelName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-bold focus:outline-none focus:border-red-500"
                  placeholder="e.g. SMM Nepal Admin Terminal"
                />
              </div>

              {/* Admin Logo Upload */}
              <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-neutral-700 hover:border-red-500 bg-neutral-950 hover:bg-neutral-900 text-neutral-300 hover:text-white cursor-pointer transition font-semibold">
                <Upload className="w-4 h-4 text-red-400" />
                <span>Upload Dedicated Admin Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      if (evt.target?.result) {
                        setForm({ ...form, adminPanelLogoUrl: evt.target.result as string });
                        showToast('Admin logo uploaded!', 'success');
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="hidden"
                />
              </label>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold text-[11px]">Or Admin Logo URL</label>
                <input
                  type="url"
                  value={form.adminPanelLogoUrl || ''}
                  onChange={(e) => setForm({ ...form, adminPanelLogoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-red-500"
                  placeholder="https://example.com/admin-logo.png"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SYSTEM CONFIGURATION */}
      {activeSubTab === 'system_config' && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-neutral-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-red-400" />
              <span>System & Financial Operational Configurations</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Adjust global order limits, financial conversion rates, deposit bonuses, and security policies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            {/* Minimum Deposit */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <label className="block text-neutral-300 font-bold">Minimum Deposit Amount (NPR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">Rs.</span>
                <input
                  type="number"
                  value={form.minDepositNPR}
                  onChange={(e) => setForm({ ...form, minDepositNPR: Number(e.target.value) || 0 })}
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono font-bold focus:outline-none focus:border-red-500"
                />
              </div>
              <p className="text-[10px] text-neutral-500">Minimum funds customer can deposit per transaction.</p>
            </div>

            {/* USD to NPR Exchange Rate */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <label className="block text-neutral-300 font-bold">USD ($) to NPR Exchange Rate</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">$1 =</span>
                <input
                  type="number"
                  step="0.1"
                  value={form.usdToNprRate}
                  onChange={(e) => setForm({ ...form, usdToNprRate: Number(e.target.value) || 136.5 })}
                  className="w-full pl-14 pr-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono font-bold focus:outline-none focus:border-red-500"
                />
              </div>
              <p className="text-[10px] text-neutral-500">Used for USD wholesaler API rate conversion.</p>
            </div>

            {/* INR to NPR Exchange Rate */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <label className="block text-neutral-300 font-bold">INR (₹) to NPR Exchange Rate</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">₹1 =</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.inrToNprRate || 1.6}
                  onChange={(e) => setForm({ ...form, inrToNprRate: Number(e.target.value) || 1.6 })}
                  className="w-full pl-14 pr-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono font-bold focus:outline-none focus:border-red-500"
                />
              </div>
              <p className="text-[10px] text-neutral-500">Used for Indian wholesaler provider APIs.</p>
            </div>

            {/* Deposit Bonus Percent */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <label className="block text-neutral-300 font-bold">Deposit Bonus Percentage (%)</label>
              <div className="relative">
                <input
                  type="number"
                  value={form.depositBonusPercent}
                  onChange={(e) => setForm({ ...form, depositBonusPercent: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono font-bold focus:outline-none focus:border-red-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">%</span>
              </div>
              <p className="text-[10px] text-neutral-500">Bonus credited to users on automated QR deposit.</p>
            </div>

            {/* Child Panel Monthly Rental Price */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <label className="block text-neutral-300 font-bold">Child Panel Monthly Rental Price (NPR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">Rs.</span>
                <input
                  type="number"
                  value={form.childPanelMonthlyPriceNPR ?? 2200}
                  onChange={(e) => setForm({ ...form, childPanelMonthlyPriceNPR: Number(e.target.value) || 2200 })}
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono font-bold focus:outline-none focus:border-red-500"
                />
              </div>
              <p className="text-[10px] text-neutral-500">Monthly subscription fee charged to resellers renting child panels.</p>
            </div>

            {/* Max Order Limit */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <label className="block text-neutral-300 font-bold">Max Order Quantity Limit</label>
              <input
                type="number"
                value={form.systemConfig?.orderMaxLimit || 1000000}
                onChange={(e) =>
                  setForm({
                    ...form,
                    systemConfig: { ...form.systemConfig, orderMaxLimit: Number(e.target.value) || 1000000 },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono font-bold focus:outline-none focus:border-red-500"
              />
              <p className="text-[10px] text-neutral-500">Safety ceiling for single order placement.</p>
            </div>

            {/* Low Balance Warning */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
              <label className="block text-neutral-300 font-bold">Low Balance Alert Threshold (NPR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">Rs.</span>
                <input
                  type="number"
                  value={form.systemConfig?.lowBalanceThresholdNPR || 100}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      systemConfig: { ...form.systemConfig, lowBalanceThresholdNPR: Number(e.target.value) || 100 },
                    })
                  }
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono font-bold focus:outline-none focus:border-red-500"
                />
              </div>
              <p className="text-[10px] text-neutral-500">Triggers deposit reminder notice to customers.</p>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-neutral-800 text-xs">
            <label className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between cursor-pointer hover:border-neutral-700 transition">
              <div>
                <span className="font-bold text-white block">User Public Registration</span>
                <span className="text-[10px] text-neutral-400">Allow new users to sign up</span>
              </div>
              <input
                type="checkbox"
                checked={form.systemConfig?.registrationEnabled !== false}
                onChange={(e) =>
                  setForm({
                    ...form,
                    systemConfig: { ...form.systemConfig, registrationEnabled: e.target.checked },
                  })
                }
                className="w-5 h-5 accent-red-500 rounded"
              />
            </label>

            <label className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between cursor-pointer hover:border-neutral-700 transition">
              <div>
                <span className="font-bold text-white block">Drip-Feed Order Engine</span>
                <span className="text-[10px] text-neutral-400">Enable scheduled interval orders</span>
              </div>
              <input
                type="checkbox"
                checked={form.systemConfig?.dripFeedEnabled !== false}
                onChange={(e) =>
                  setForm({
                    ...form,
                    systemConfig: { ...form.systemConfig, dripFeedEnabled: e.target.checked },
                  })
                }
                className="w-5 h-5 accent-red-500 rounded"
              />
            </label>

            <label className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between cursor-pointer hover:border-neutral-700 transition">
              <div>
                <span className="font-bold text-white block">Auto-Refund Failed Orders</span>
                <span className="text-[10px] text-neutral-400">Refund client on wholesale API cancel</span>
              </div>
              <input
                type="checkbox"
                checked={form.systemConfig?.autoRefundFailedOrders !== false}
                onChange={(e) =>
                  setForm({
                    ...form,
                    systemConfig: { ...form.systemConfig, autoRefundFailedOrders: e.target.checked },
                  })
                }
                className="w-5 h-5 accent-red-500 rounded"
              />
            </label>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: STAFF PERMISSION */}
      {activeSubTab === 'staff_permissions' && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-400" />
                <span>Role-Based Access Control (RBAC) & Staff Permissions</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Configure department access privileges, master keys, and module permissions for support and admin staff.
              </p>
            </div>
            {onNavigateSection && (
              <button
                type="button"
                onClick={() => onNavigateSection('staff')}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-red-600/20 shrink-0"
              >
                <span>Open Staff Management</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Department Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                role: 'Super Admin',
                badge: 'Full Root Access',
                color: 'red',
                desc: 'Unrestricted access to master settings, financial ledgers, staff hiring, and API providers.',
                permissions: ['All 16 Master Modules', 'Database Reset', 'Master Settings', 'Payment Gateways'],
              },
              {
                role: 'Operations / Order Manager',
                badge: 'Orders & Services',
                color: 'blue',
                desc: 'Can edit order statuses, cancel/refund stuck orders, manage prices per 1,000, and link APIs.',
                permissions: ['Orders Master', 'Services Catalog', 'Support Tickets', 'Live Chat'],
              },
              {
                role: 'Finance Manager',
                badge: 'Ledger & Deposits',
                color: 'emerald',
                desc: 'Verifies Fonepay/eSewa screenshot transaction slips, adjusts balances, and handles refunds.',
                permissions: ['Deposit Approvals', 'Adjust Balances', 'Payment QR Manager', 'Transactions'],
              },
              {
                role: 'Customer Support Agent',
                badge: 'Help Desk',
                color: 'amber',
                desc: 'Replies to user support tickets, live chat inquiries, and manages password reset requests.',
                permissions: ['Live Chat Desk', 'Support Tickets', 'Password Resets', 'Broadcasts'],
              },
              {
                role: 'API / Reseller Partner',
                badge: 'B2B Wholesale',
                color: 'purple',
                desc: 'Monitors external wholesale provider APIs, child panels, and custom domain nameservers.',
                permissions: ['Wholesaler APIs', 'Child Panels', 'Cron Automation', 'API Docs'],
              },
              {
                role: 'Custom Staff Member',
                badge: 'Granular Matrix',
                color: 'neutral',
                desc: 'Custom assigned permissions tailored individually in the Staff & Team Management section.',
                permissions: ['Selected by Superadmin', 'Master Passcode Protected', 'Activity Logged'],
              },
            ].map((r) => (
              <div key={r.role} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{r.role}</span>
                  <span className="px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono text-[10px] font-bold">
                    {r.badge}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">{r.desc}</p>
                <div className="pt-2 border-t border-neutral-850 flex flex-wrap gap-1">
                  {r.permissions.map((p) => (
                    <span key={p} className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 text-[10px] font-mono">
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: NOTIFICATION SETTINGS */}
      {activeSubTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Support & Admin Alerts Channels */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Support Channels & Admin Alerts
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp Support Number</span>
                </label>
                <input
                  type="text"
                  value={form.whatsappNumber}
                  onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-red-500"
                  placeholder="+977 9841000000"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span>Telegram Support Handle / Channel</span>
                </label>
                <input
                  type="text"
                  value={form.telegramHandle}
                  onChange={(e) => setForm({ ...form, telegramHandle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-red-500"
                  placeholder="@smmpanelnepal"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  <span>Official Support Email</span>
                </label>
                <input
                  type="email"
                  value={form.supportEmail}
                  onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-red-500"
                  placeholder="smmpanelnepal@gmail.com"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Support Helpline Phone</label>
                <input
                  type="text"
                  value={form.supportPhone || ''}
                  onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-red-500"
                  placeholder="+977 9841000000"
                />
              </div>
            </div>
          </div>

          {/* Automated SMTP & Email Events */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Automated Email Event Triggers
                </h3>
              </div>
              {onNavigateSection && (
                <button
                  type="button"
                  onClick={() => onNavigateSection('email_config')}
                  className="text-[11px] text-emerald-400 hover:underline font-bold"
                >
                  Configure SMTP →
                </button>
              )}
            </div>

            <div className="space-y-3 text-xs">
              {[
                {
                  key: 'enabledForRegistration',
                  title: 'Welcome Email on User Signup',
                  desc: 'Sends login details and welcome message to newly registered users.',
                },
                {
                  key: 'enabledForDeposits',
                  title: 'Deposit Confirmation Alert',
                  desc: 'Sends payment receipt email when a QR deposit is verified & credited.',
                },
                {
                  key: 'enabledForOrders',
                  title: 'Order Status Dispatches',
                  desc: 'Notifies customer via email when their SMM order completes.',
                },
                {
                  key: 'enabledForPasswordForgot',
                  title: 'Password Reset Notification',
                  desc: 'Sends temporary password or reset pin when user requests reset.',
                },
              ].map((ev) => {
                const isEnabled = (form.emailConfig as any)?.[ev.key] !== false;
                return (
                  <label
                    key={ev.key}
                    className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between cursor-pointer hover:border-neutral-700 transition"
                  >
                    <div>
                      <span className="font-bold text-white block">{ev.title}</span>
                      <span className="text-[10px] text-neutral-400">{ev.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          emailConfig: {
                            ...(form.emailConfig || {
                              smtpHost: 'smtp.gmail.com',
                              smtpPort: 587,
                              senderName: 'SMM Panel Nepal',
                              senderEmail: 'noreply@smmpanelnepal.com',
                              encryption: 'TLS',
                            }),
                            [ev.key]: e.target.checked,
                          },
                        })
                      }
                      className="w-5 h-5 accent-emerald-500 rounded"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: SOCIAL LOGIN SETTING */}
      {activeSubTab === 'social_login' && (
        <div className="space-y-6">
          {/* Master Kill Switch for All Social Logins */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    Social Login Master Switch (Completely Turn On / Off)
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Completely hide or show all social login buttons (Google, Facebook, Telegram, GitHub) on Login & Registration modals.
                </p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800">
                <span className="text-xs font-bold text-neutral-200">
                  {form.socialLoginSettings?.disableAllSocialLogins ? '🔴 Completely Disabled (OFF)' : '🟢 Active (ON)'}
                </span>
                <input
                  type="checkbox"
                  checked={!form.socialLoginSettings?.disableAllSocialLogins}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      socialLoginSettings: {
                        ...form.socialLoginSettings,
                        disableAllSocialLogins: !e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Google OAuth Login */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-red-500/20 text-red-400 font-bold text-xs">G</span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Google OAuth 2.0 Sign-In
                  </h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-neutral-300 font-bold">Enabled</span>
                  <input
                    type="checkbox"
                    checked={form.socialLoginSettings?.googleEnabled !== false}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        socialLoginSettings: {
                          ...form.socialLoginSettings,
                          googleEnabled: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-red-500"
                  />
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Google Client ID</label>
                  <input
                    type="text"
                    value={form.socialLoginSettings?.googleClientId || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        socialLoginSettings: {
                          ...form.socialLoginSettings,
                          googleClientId: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-red-500"
                    placeholder="apps.googleusercontent.com Client ID"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Google Client Secret</label>
                  <input
                    type="password"
                    value={form.socialLoginSettings?.googleClientSecret || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        socialLoginSettings: {
                          ...form.socialLoginSettings,
                          googleClientSecret: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-red-500"
                    placeholder="GOCSPX-..."
                  />
                </div>

                {/* Authorized Redirect URI */}
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <span className="text-[10px] text-neutral-500 font-mono block uppercase">
                    Authorized Redirect URI (Add to Google Cloud Console):
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-emerald-400 truncate">
                      {siteOrigin}/api/auth/google/callback
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`${siteOrigin}/api/auth/google/callback`, 'google-redirect-uri')}
                      className="p-1 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white"
                    >
                      {copiedKey === 'google-redirect-uri' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Telegram & Other Social Logins */}
            <div className="space-y-6">
              {/* Telegram Login */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-sky-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Telegram Quick Auth
                    </h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-neutral-300 font-bold">Enabled</span>
                    <input
                      type="checkbox"
                      checked={form.socialLoginSettings?.telegramEnabled !== false}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          socialLoginSettings: {
                            ...form.socialLoginSettings,
                            telegramEnabled: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 accent-sky-500"
                    />
                  </label>
                </div>

                <div className="space-y-3 text-xs">
                  <p className="text-neutral-400 text-xs">
                    Allows users in Nepal to quickly verify their account using their verified Telegram @handle.
                  </p>
                </div>
              </div>

              {/* GitHub */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-neutral-200" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      GitHub OAuth Login
                    </h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-neutral-300 font-bold">Enabled</span>
                    <input
                      type="checkbox"
                      checked={!!form.socialLoginSettings?.githubEnabled}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          socialLoginSettings: {
                            ...form.socialLoginSettings,
                            githubEnabled: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 accent-red-500"
                    />
                  </label>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-semibold">GitHub Client ID</label>
                    <input
                      type="text"
                      value={form.socialLoginSettings?.githubClientId || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          socialLoginSettings: {
                            ...form.socialLoginSettings,
                            githubClientId: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-red-500"
                      placeholder="GitHub OAuth App Client ID"
                    />
                  </div>
                </div>
              </div>

              {/* Facebook */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Facebook Login SDK
                    </h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-neutral-300 font-bold">Enabled</span>
                    <input
                      type="checkbox"
                      checked={!!form.socialLoginSettings?.facebookEnabled}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          socialLoginSettings: {
                            ...form.socialLoginSettings,
                            facebookEnabled: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 accent-red-500"
                    />
                  </label>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-semibold">Facebook App ID</label>
                    <input
                      type="text"
                      value={form.socialLoginSettings?.facebookAppId || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          socialLoginSettings: {
                            ...form.socialLoginSettings,
                            facebookAppId: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-red-500"
                      placeholder="Meta App ID"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: SEO CONFIGURATION */}
      {activeSubTab === 'seo' && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-neutral-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-red-400" />
              <span>Search Engine Optimization (SEO) & Analytics Configuration</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Optimize metadata for Google search index rankings, social share cards (OpenGraph), and analytics pixels.
            </p>
          </div>

          {/* Google Rich Snippet Search Result Preview */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
            <span className="text-[10px] text-neutral-500 font-mono uppercase">Google Search Preview:</span>
            <div className="text-xs font-mono text-neutral-400">{form.siteUrl || 'https://smmpanelnepal.com'}</div>
            <div className="text-sm font-bold text-blue-400 hover:underline cursor-pointer">
              {form.seoSettings?.metaTitle || form.siteName}
            </div>
            <div className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
              {form.seoSettings?.metaDescription || form.siteTagline}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
            {/* Meta Title */}
            <div>
              <label className="block text-neutral-400 mb-1 font-semibold">SEO Meta Title</label>
              <input
                type="text"
                value={form.seoSettings?.metaTitle || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    seoSettings: { ...form.seoSettings, metaTitle: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-bold focus:outline-none focus:border-red-500 text-xs"
                placeholder="Meta title for Google results..."
              />
            </div>

            {/* Meta Keywords */}
            <div>
              <label className="block text-neutral-400 mb-1 font-semibold">Meta Keywords (Comma separated)</label>
              <input
                type="text"
                value={form.seoSettings?.metaKeywords || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    seoSettings: { ...form.seoSettings, metaKeywords: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-red-500 text-xs"
                placeholder="smm nepal, buy tiktok followers, fonepay smm, cheap followers"
              />
            </div>

            {/* Meta Description */}
            <div className="lg:col-span-2">
              <label className="block text-neutral-400 mb-1 font-semibold">SEO Meta Description</label>
              <textarea
                rows={3}
                value={form.seoSettings?.metaDescription || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    seoSettings: { ...form.seoSettings, metaDescription: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-red-500 text-xs leading-relaxed"
                placeholder="Brief summary appearing under Google search results (150-160 characters recommended)..."
              />
            </div>

            {/* OG Social Share Image URL */}
            <div>
              <label className="block text-neutral-400 mb-1 font-semibold">OpenGraph (OG) Social Card Image URL</label>
              <input
                type="url"
                value={form.seoSettings?.ogImageUrl || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    seoSettings: { ...form.seoSettings, ogImageUrl: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-red-500 text-xs"
                placeholder="https://example.com/social-share-banner.jpg"
              />
            </div>

            {/* Google Analytics ID */}
            <div>
              <label className="block text-neutral-400 mb-1 font-semibold">Google Analytics Measurement ID</label>
              <input
                type="text"
                value={form.seoSettings?.googleAnalyticsId || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    seoSettings: { ...form.seoSettings, googleAnalyticsId: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-red-500 text-xs"
                placeholder="G-XXXXXXXXXX"
              />
            </div>

            {/* Custom Header Tracking Scripts */}
            <div className="lg:col-span-2">
              <label className="block text-neutral-400 mb-1 font-semibold">
                Custom Header Tracking Scripts / Pixels (Injected into &lt;head&gt;)
              </label>
              <textarea
                rows={3}
                value={form.seoSettings?.headerCode || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    seoSettings: { ...form.seoSettings, headerCode: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-emerald-400 font-mono text-xs focus:outline-none focus:border-red-500"
                placeholder="<!-- Facebook Pixel / TikTok Tracking Script -->"
              />
            </div>
          </div>
        </div>
      )}

      {/* LIVE MAINTENANCE PREVIEW MODAL */}
      {isPreviewMaintenanceOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white">Live Customer Maintenance Screen Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewMaintenanceOpen(false)}
                className="p-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto relative p-2 bg-neutral-950 min-h-[420px]">
              <MaintenanceScreen systemSettings={form} />
            </div>
            <div className="px-5 py-3 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">
                This is how regular visitors and non-admin customers see the site when Maintenance is enabled.
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewMaintenanceOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
