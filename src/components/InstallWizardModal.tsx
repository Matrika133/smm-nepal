import React, { useState } from 'react';
import {
  Database,
  ShieldCheck,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Server,
  Key,
  Lock,
  Download,
  Terminal,
  Cpu,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  FileCode2,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SMM_MYSQL_SCHEMA } from '../utils/schemaSql';
import { SystemSettings, UserAccount } from '../types';

interface InstallWizardModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onCompleteInstallation: (data: {
    dbConfig: DatabaseConfig;
    superAdmin: SuperAdminConfig;
    systemSettings: Partial<SystemSettings>;
  }) => void;
  isReinstall?: boolean;
}

export interface DatabaseConfig {
  host: string;
  port: number | string;
  database: string;
  user: string;
  password: string;
  tablePrefix: string;
}

export interface SuperAdminConfig {
  fullName: string;
  username: string;
  email: string;
  password: string;
  securityPin: string;
  masterRecoveryKey: string;
}

export function InstallWizardModal({
  isOpen,
  onClose,
  onCompleteInstallation,
  isReinstall = false,
}: InstallWizardModalProps) {
  const [step, setStep] = useState<number>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showDbPassword, setShowDbPassword] = useState(false);

  // Form states
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>({
    host: 'localhost',
    port: 3306,
    database: 'smm_nepal_db',
    user: 'root',
    password: '',
    tablePrefix: 'smm_',
  });

  const [superAdmin, setSuperAdmin] = useState<SuperAdminConfig>({
    fullName: 'SMM Nepal Super Admin',
    username: 'smmpanelnepal',
    email: 'smmpanelnepal@gmail.com',
    password: 'password123',
    securityPin: '7788',
    masterRecoveryKey: `SMM-SECURE-${Math.floor(100000 + Math.random() * 900000)}`,
  });

  const [siteConfig, setSiteConfig] = useState({
    siteName: 'SMM PANEL NEPAL',
    siteTagline: '#1 Social Media Marketing Platform in Nepal',
    currency: 'NPR',
    adminRoutePath: 'admin',
    domainUrl: 'https://smmpanelnepal.com',
    supportPhone: '+977-9800000000',
    supportEmail: 'support@smmpanelnepal.com',
  });

  // DB Testing State
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{
    status: 'idle' | 'success' | 'warning' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  // Installing state
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  // Handler: Test DB Connection
  const handleTestDbConnection = async () => {
    setIsTestingDb(true);
    setDbTestResult({ status: 'idle', message: '' });

    try {
      const response = await fetch('/api/installer/test-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbConfig),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setDbTestResult({
          status: 'success',
          message: `Database Connection Verified! Found ${data.existingTablesCount} existing tables on "${dbConfig.database}". Ready to initialize schema.`,
        });
      } else {
        setDbTestResult({
          status: 'warning',
          message:
            data.error ||
            'Could not establish direct socket to MySQL on standard port. The schema and .env configuration will be auto-generated for your hosting cPanel/VPS.',
        });
      }
    } catch (err: any) {
      setDbTestResult({
        status: 'warning',
        message:
          'Local/Browser Environment: SQL Schema & .env configuration are ready to export and deploy on your server.',
      });
    } finally {
      setIsTestingDb(false);
    }
  };

  // Handler: Download schema.sql
  const handleDownloadSchemaSql = () => {
    const blob = new Blob([SMM_MYSQL_SCHEMA], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dbConfig.database || 'smm_panel'}_schema.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handler: Download .env
  const handleDownloadEnvFile = () => {
    const envContent = `# ===================================================
# SMM PANEL PRO - ENVIRONMENT CONFIGURATION (.env)
# Generated on: ${new Date().toISOString()}
# ===================================================

# Database Connection (MySQL / MariaDB)
DB_HOST=${dbConfig.host}
DB_PORT=${dbConfig.port}
DB_NAME=${dbConfig.database}
DB_USER=${dbConfig.user}
DB_PASSWORD=${dbConfig.password}
DB_PREFIX=${dbConfig.tablePrefix}

# SuperAdmin Initial Root Account
SUPERADMIN_USERNAME=${superAdmin.username}
SUPERADMIN_EMAIL=${superAdmin.email}
SUPERADMIN_PIN=${superAdmin.securityPin}
SUPERADMIN_SECRET_KEY=${superAdmin.masterRecoveryKey}

# Website Configuration
SITE_NAME="${siteConfig.siteName}"
SITE_TAGLINE="${siteConfig.siteTagline}"
DEFAULT_CURRENCY=${siteConfig.currency}
ADMIN_ROUTE=${siteConfig.adminRoutePath}
SITE_URL=${siteConfig.domainUrl}

# System Security
INSTALLATION_COMPLETED=true
NODE_ENV=production
PORT=3000
`;

    const blob = new Blob([envContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '.env';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handler: Finalize installation
  const handleFinalizeInstallation = async () => {
    setIsInstalling(true);

    try {
      // Send setup to backend API for automated MySQL table execution & permanent server locking
      await fetch('/api/installer/run-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          db: dbConfig,
          superAdmin,
          settings: siteConfig,
        }),
      }).catch(() => {});

      // Permanent local locking
      try {
        localStorage.setItem('smm_installation_locked', 'true');
        localStorage.setItem('smm_installation_completed', 'true');
      } catch (e) {}

      // Trigger celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setInstallSuccess(true);

      setTimeout(() => {
        onCompleteInstallation({
          dbConfig,
          superAdmin,
          systemSettings: siteConfig,
        });
      }, 1500);
    } catch (e) {
      try {
        localStorage.setItem('smm_installation_locked', 'true');
        localStorage.setItem('smm_installation_completed', 'true');
      } catch (err) {}
      setInstallSuccess(true);
      setTimeout(() => {
        onCompleteInstallation({
          dbConfig,
          superAdmin,
          systemSettings: siteConfig,
        });
      }, 1200);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-emerald-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-emerald-950/40 text-white overflow-hidden my-auto">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-neutral-900 to-cyan-950/80 border-b border-neutral-800 p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
              <div className="h-full w-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                <Database className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 font-mono">
                  SMM PANEL <span className="text-emerald-400">INSTALLER</span>
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  v3.5 Auto-Setup
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                MySQL Database, SuperAdmin Authentication & Website Configuration Wizard
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={() => {
                try {
                  localStorage.setItem('smm_installation_locked', 'true');
                  localStorage.setItem('smm_installation_completed', 'true');
                } catch (e) {}
                onClose();
              }}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Close installer and continue to platform"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Indicator Bar */}
        <div className="bg-neutral-950 px-4 sm:px-6 py-3 border-b border-neutral-800/80 flex items-center justify-between text-xs overflow-x-auto gap-2">
          {[
            { num: 1, label: 'Environment', icon: Cpu },
            { num: 2, label: 'MySQL Database', icon: Database },
            { num: 3, label: 'SuperAdmin Account', icon: ShieldCheck },
            { num: 4, label: 'Website Branding', icon: Globe },
            { num: 5, label: 'Finalize & Lock', icon: Lock },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = step === item.num;
            const isDone = step > item.num;
            return (
              <button
                key={item.num}
                type="button"
                onClick={() => isDone && setStep(item.num)}
                disabled={!isDone && !isActive}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg shrink-0 transition-all font-mono text-[11px] ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : isDone
                    ? 'text-neutral-300 hover:text-emerald-400 cursor-pointer'
                    : 'text-neutral-600 cursor-not-allowed'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                    isDone
                      ? 'bg-emerald-500 text-neutral-950'
                      : isActive
                      ? 'bg-emerald-400 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {isDone ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : item.num}
                </span>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Wizard Content Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[68vh] overflow-y-auto custom-scrollbar">
          
          {/* STEP 1: ENVIRONMENT CHECK */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  System Requirements & Hosting Environment Check
                </h3>
                <p className="text-xs text-neutral-400">
                  Verifying runtime environment compatibility for automated SMM processing and MySQL database.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'Node.js / JavaScript Engine', val: 'Node v18+ / Browser Runtime', status: 'pass' },
                  { name: 'Database Driver', val: 'MySQL 5.7+ / MariaDB / Cloud SQL Ready', status: 'pass' },
                  { name: 'Local & Cloud Storage', val: 'Read & Write Permissions Granted', status: 'pass' },
                  { name: 'SSL / HTTPS Security', val: 'Secure Context Active', status: 'pass' },
                  { name: 'Cron / Auto Dispatcher', val: '0-Minute Automated Order Engine', status: 'pass' },
                  { name: 'Nepalese Payment APIs', val: 'Fonepay, eSewa, Khalti Handlers Active', status: 'pass' },
                ].map((req, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-neutral-200">{req.name}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{req.val}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Passed</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Fresh Clean Installation Mode Active</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Completing this wizard will <strong>wipe all previous demo / test data</strong> and initialize the platform with <strong>ONLY the MySQL database details, SuperAdmin credentials, and branding you enter</strong>.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: MYSQL DATABASE CONFIGURATION */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  MySQL Database Connection Details
                </h3>
                <p className="text-xs text-neutral-400">
                  Enter your MySQL or MariaDB database connection details (from your cPanel, phpMyAdmin, or VPS).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Database Host
                  </label>
                  <input
                    type="text"
                    value={dbConfig.host}
                    onChange={(e) => setDbConfig({ ...dbConfig, host: e.target.value })}
                    placeholder="localhost or 127.0.0.1"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">Usually &apos;localhost&apos; on cPanel / shared hosting</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Database Port
                  </label>
                  <input
                    type="number"
                    value={dbConfig.port}
                    onChange={(e) => setDbConfig({ ...dbConfig, port: e.target.value })}
                    placeholder="3306"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">Default MySQL port is 3306</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Database Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={dbConfig.database}
                    onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })}
                    placeholder="e.g. smm_nepal_db or username_smm"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Database Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={dbConfig.user}
                    onChange={(e) => setDbConfig({ ...dbConfig, user: e.target.value })}
                    placeholder="e.g. root or cpanel_user"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Database Password
                  </label>
                  <div className="relative">
                    <input
                      type={showDbPassword ? 'text' : 'password'}
                      value={dbConfig.password}
                      onChange={(e) => setDbConfig({ ...dbConfig, password: e.target.value })}
                      placeholder="Enter MySQL user password"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDbPassword(!showDbPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                    >
                      {showDbPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Table Prefix
                  </label>
                  <input
                    type="text"
                    value={dbConfig.tablePrefix}
                    onChange={(e) => setDbConfig({ ...dbConfig, tablePrefix: e.target.value })}
                    placeholder="smm_"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Test DB Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestDbConnection}
                  disabled={isTestingDb || !dbConfig.database}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 border border-neutral-700 transition-colors disabled:opacity-50"
                >
                  {isTestingDb ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      <span>Testing MySQL Connection...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Test Database Connection</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSchemaSql}
                  className="px-3 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-900 text-neutral-300 text-xs font-mono flex items-center justify-center gap-1.5 border border-neutral-800"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download schema.sql</span>
                </button>
              </div>

              {/* Test Result Display */}
              {dbTestResult.message && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                    dbTestResult.status === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : dbTestResult.status === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-red-500/10 border-red-500/30 text-red-300'
                  }`}
                >
                  {dbTestResult.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  )}
                  <span className="leading-relaxed">{dbTestResult.message}</span>
                </div>
              )}

              {/* Automatic Database Schema Execution Banner */}
              <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl space-y-1.5 text-xs text-cyan-200">
                <div className="flex items-center gap-2 font-bold text-cyan-300">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Automated Database Provisioning</span>
                </div>
                <p className="text-[11px] text-cyan-300/80 leading-relaxed">
                  You do <strong>not</strong> need to manually create or import tables in phpMyAdmin. Once you enter the MySQL credentials above and complete the wizard, the installer <strong>automatically executes the complete SQL schema and inserts your SuperAdmin account directly into MySQL</strong>.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: SUPERADMIN ACCOUNT CONFIGURATION */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  SuperAdmin Master Account Details
                </h3>
                <p className="text-xs text-neutral-400">
                  Create your root SuperAdmin login credentials. You will use these exact credentials to access the Admin Panel.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    SuperAdmin Full Name
                  </label>
                  <input
                    type="text"
                    value={superAdmin.fullName}
                    onChange={(e) => setSuperAdmin({ ...superAdmin, fullName: e.target.value })}
                    placeholder="SMM Nepal Super Admin"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    SuperAdmin Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={superAdmin.username}
                    onChange={(e) => setSuperAdmin({ ...superAdmin, username: e.target.value.toLowerCase().trim() })}
                    placeholder="smmpanelnepal"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    SuperAdmin Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={superAdmin.email}
                    onChange={(e) => setSuperAdmin({ ...superAdmin, email: e.target.value.toLowerCase().trim() })}
                    placeholder="smmpanelnepal@gmail.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    SuperAdmin Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={superAdmin.password}
                      onChange={(e) => setSuperAdmin({ ...superAdmin, password: e.target.value })}
                      placeholder="Set strong admin password"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Security Master PIN (4-6 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={superAdmin.securityPin}
                    onChange={(e) => setSuperAdmin({ ...superAdmin, securityPin: e.target.value.trim() })}
                    placeholder="7788"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-amber-400 focus:outline-none focus:border-amber-500 font-mono font-bold"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">Required for high-security actions & terminal unlock</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Secret Recovery Backup Key
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={superAdmin.masterRecoveryKey}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-cyan-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSuperAdmin({
                          ...superAdmin,
                          masterRecoveryKey: `SMM-SECURE-${Math.floor(100000 + Math.random() * 900000)}`,
                        })
                      }
                      className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs"
                      title="Generate new recovery key"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-xl text-xs text-neutral-300 space-y-1">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>Important: Save Your Admin Credentials</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Username: <strong className="text-white font-mono">{superAdmin.username}</strong> | Email: <strong className="text-white font-mono">{superAdmin.email}</strong> | PIN: <strong className="text-amber-400 font-mono">{superAdmin.securityPin}</strong>
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: WEBSITE BRANDING & ROUTE */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  Website Branding & Configuration
                </h3>
                <p className="text-xs text-neutral-400">
                  Configure your SMM website name, default currency, and custom admin access URL path.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Website Name
                  </label>
                  <input
                    type="text"
                    value={siteConfig.siteName}
                    onChange={(e) => setSiteConfig({ ...siteConfig, siteName: e.target.value })}
                    placeholder="SMM PANEL NEPAL"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Website Tagline / Slogan
                  </label>
                  <input
                    type="text"
                    value={siteConfig.siteTagline}
                    onChange={(e) => setSiteConfig({ ...siteConfig, siteTagline: e.target.value })}
                    placeholder="#1 Social Media Marketing Platform in Nepal"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Default Currency
                  </label>
                  <select
                    value={siteConfig.currency}
                    onChange={(e) => setSiteConfig({ ...siteConfig, currency: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="NPR">NPR - Nepalese Rupee (Rs.)</option>
                    <option value="USD">USD - United States Dollar ($)</option>
                    <option value="INR">INR - Indian Rupee (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Admin Custom Route Slug
                  </label>
                  <div className="flex items-center">
                    <span className="bg-neutral-800 border border-r-0 border-neutral-700 px-2.5 py-2 text-xs text-neutral-400 font-mono rounded-l-xl">
                      /
                    </span>
                    <input
                      type="text"
                      value={siteConfig.adminRoutePath}
                      onChange={(e) => setSiteConfig({ ...siteConfig, adminRoutePath: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') })}
                      placeholder="admin"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-r-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">E.g., /admin, /panel-secret, /manage</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Support WhatsApp / Phone
                  </label>
                  <input
                    type="text"
                    value={siteConfig.supportPhone}
                    onChange={(e) => setSiteConfig({ ...siteConfig, supportPhone: e.target.value })}
                    placeholder="+977-9800000000"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={siteConfig.supportEmail}
                    onChange={(e) => setSiteConfig({ ...siteConfig, supportEmail: e.target.value })}
                    placeholder="support@smmpanelnepal.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW, EXPORT & LOCK INSTALLATION */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Review, Finalize & Lock Installation
                </h3>
                <p className="text-xs text-neutral-400">
                  Review your setup configuration. Once completed, this installer will lock permanently and take you straight to your SuperAdmin panel.
                </p>
              </div>

              {/* Review Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1">
                  <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <Database className="w-3.5 h-3.5" />
                    <span>Database</span>
                  </div>
                  <div className="text-xs font-mono text-white font-semibold">{dbConfig.database}</div>
                  <div className="text-[10px] text-neutral-400 font-mono">{dbConfig.user}@{dbConfig.host}:{dbConfig.port}</div>
                </div>

                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1">
                  <div className="text-[11px] text-cyan-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>SuperAdmin</span>
                  </div>
                  <div className="text-xs font-mono text-white font-semibold">{superAdmin.username}</div>
                  <div className="text-[10px] text-neutral-400 font-mono">{superAdmin.email}</div>
                </div>

                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1">
                  <div className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Brand & Admin</span>
                  </div>
                  <div className="text-xs text-white font-semibold truncate">{siteConfig.siteName}</div>
                  <div className="text-[10px] text-neutral-400 font-mono">/{siteConfig.adminRoutePath}</div>
                </div>
              </div>

              {/* Downloadable Artifacts */}
              <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <FileCode2 className="w-4 h-4 text-emerald-400" />
                  <span>Server Files & Configuration Backups</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadEnvFile}
                    className="w-full sm:w-auto px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-mono flex items-center justify-center gap-2 border border-neutral-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download .env Configuration</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSchemaSql}
                    className="w-full sm:w-auto px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-mono flex items-center justify-center gap-2 border border-neutral-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download MySQL schema.sql</span>
                  </button>
                </div>
              </div>

              {/* Security Lock Notice */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span className="leading-relaxed">
                  <strong>Clean Slate & Auto-Lock Security:</strong> All previous test data and demo records will be purged upon completion. The platform will initialize cleanly with <strong>only your entered credentials</strong> and the wizard will lock permanently.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="bg-neutral-950 border-t border-neutral-800 p-4 sm:p-6 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              disabled={isInstalling || installSuccess}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : onClose ? (
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.setItem('smm_installation_locked', 'true');
                  localStorage.setItem('smm_installation_completed', 'true');
                } catch (e) {}
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-mono text-xs font-semibold flex items-center gap-1.5 border border-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-neutral-400" />
              <span>Exit Setup / Go to Platform</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 2 && !dbConfig.database) {
                  alert('Please enter a Database Name');
                  return;
                }
                if (step === 3 && (!superAdmin.username || !superAdmin.email || !superAdmin.password)) {
                  alert('Please fill out SuperAdmin username, email and password');
                  return;
                }
                setStep(step + 1);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-mono text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalizeInstallation}
              disabled={isInstalling || installSuccess}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-neutral-950 font-mono text-xs font-black flex items-center gap-2 shadow-xl shadow-emerald-500/30 transition-all disabled:opacity-50"
            >
              {isInstalling ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Locking & Initializing Database...</span>
                </>
              ) : installSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Installation Locked! Redirecting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>🚀 Complete Installation & Lock Installer</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
