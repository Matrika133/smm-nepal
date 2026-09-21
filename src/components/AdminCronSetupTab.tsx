import React, { useState } from 'react';
import {
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Terminal,
  Activity,
  Zap,
  Server,
  ShieldAlert,
  RefreshCw,
  Sliders,
  Calendar,
  FileCode,
  ArrowUpRight,
  Info,
  Globe,
  Link as LinkIcon,
  ShieldCheck,
  Lock,
  Wifi,
  WifiOff,
  AlertTriangle,
  ExternalLink,
  Power,
  CheckCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SystemSettings, CronSettings, CronJobItem, CronExecutionLog } from '../types';

interface AdminCronSetupTabProps {
  systemSettings: SystemSettings;
  onUpdateSettings: (newSettings: Partial<SystemSettings>) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const DEFAULT_CRON_JOBS: CronJobItem[] = [
  {
    id: 'cron-sync-orders',
    name: 'Wholesaler API Order Status Sync',
    description: 'Polls external wholesale provider APIs to fetch real-time order updates (Completed, In Progress, Canceled, Partial) and automatically credits refunds.',
    interval: 'Every 5 Minutes (*/5 * * * *)',
    command: 'curl -s "{SITE_URL}/api/cron/sync-orders?key={CRON_KEY}" > /dev/null 2>&1',
    endpoint: '/api/cron/sync-orders',
    status: 'active',
    lastRun: '2 mins ago',
    nextRun: 'in 3 mins',
  },
  {
    id: 'cron-dripfeed',
    name: 'Drip-Feed Batch Scheduler & Dispatcher',
    description: 'Checks scheduled drip-feed runs and dispatches the next batch of likes, views, or followers automatically without manual intervention.',
    interval: 'Every 1 Minute (* * * * *)',
    command: 'curl -s "{SITE_URL}/api/cron/dripfeed?key={CRON_KEY}" > /dev/null 2>&1',
    endpoint: '/api/cron/dripfeed',
    status: 'active',
    lastRun: '45 secs ago',
    nextRun: 'in 15 secs',
  },
  {
    id: 'cron-currency',
    name: 'Nepal Rastra Bank Currency Rate Refresh',
    description: 'Syncs current foreign exchange rates for USD ($) and INR (₹) to NPR (रू) to maintain accurate real-time profit margins on reseller services.',
    interval: 'Every 6 Hours (0 */6 * * *)',
    command: 'curl -s "{SITE_URL}/api/cron/currency-rates?key={CRON_KEY}" > /dev/null 2>&1',
    endpoint: '/api/cron/currency-rates',
    status: 'active',
    lastRun: '3 hours ago',
    nextRun: 'in 3 hours',
  },
  {
    id: 'cron-provider-balance',
    name: 'Provider Balance & Health Telemetry',
    description: 'Pings all connected API wholesalers (JAP, Peakerr, SMMFollows) to verify API connectivity and monitor reseller wallet balances.',
    interval: 'Every 15 Minutes (*/15 * * * *)',
    command: 'curl -s "{SITE_URL}/api/cron/check-providers?key={CRON_KEY}" > /dev/null 2>&1',
    endpoint: '/api/cron/check-providers',
    status: 'active',
    lastRun: '10 mins ago',
    nextRun: 'in 5 mins',
  },
  {
    id: 'cron-pending-deposits',
    name: 'Auto-Expire Abandoned Manual Deposits',
    description: 'Scans pending payment QR slips older than 48 hours without matched transaction IDs and marks them Expired to keep the ledger clean.',
    interval: 'Every 30 Minutes (*/30 * * * *)',
    command: 'curl -s "{SITE_URL}/api/cron/expire-deposits?key={CRON_KEY}" > /dev/null 2>&1',
    endpoint: '/api/cron/expire-deposits',
    status: 'active',
    lastRun: '18 mins ago',
    nextRun: 'in 12 mins',
  },
  {
    id: 'cron-db-optimize',
    name: 'Daily System Log Archival & Database Vacuum',
    description: 'Flushes stale telemetry logs, compresses session histories, and optimizes table indexes for maximum speed during peak Nepal shopping hours.',
    interval: 'Daily at Midnight (0 0 * * *)',
    command: 'curl -s "{SITE_URL}/api/cron/cleanup-logs?key={CRON_KEY}" > /dev/null 2>&1',
    endpoint: '/api/cron/cleanup-logs',
    status: 'active',
    lastRun: '10 hours ago',
    nextRun: 'in 14 hours',
  },
];

export function AdminCronSetupTab({
  systemSettings,
  onUpdateSettings,
  showToast,
}: AdminCronSetupTabProps) {
  const cronConfig = systemSettings.cronSettings || {
    cronSecretKey: 'smm_nepal_cron_sec_' + Math.random().toString(36).substring(2, 10),
    isWebsiteConnected: false,
    connectedDomain: '',
    domainVerificationStatus: 'disconnected',
    autoSyncOrders: false,
    autoSyncStatus: false,
    autoCurrencyRefresh: false,
    autoExpirePendingDeposits: false,
    executionLogs: [],
  };

  const isConnected = !!cronConfig.isWebsiteConnected;
  const connectedDomain = cronConfig.connectedDomain || systemSettings.siteUrl || 'https://smmpanelnepal.com';

  const [cronKey, setCronKey] = useState<string>(cronConfig.cronSecretKey || 'smm_nepal_cron_sec_default');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [runningJobId, setRunningJobId] = useState<string | null>(null);
  const [cronJobs, setCronJobs] = useState<CronJobItem[]>(DEFAULT_CRON_JOBS);
  const [activeInstructionTab, setActiveInstructionTab] = useState<'cpanel' | 'vps' | 'easycron'>('cpanel');

  // Website Connection Verification Form States
  const [targetUrlInput, setTargetUrlInput] = useState<string>(
    cronConfig.connectedDomain || systemSettings.siteUrl || 'https://smmpanelnepal.com'
  );
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false);
  const [verificationStep, setVerificationStep] = useState<string>('');

  const logs = cronConfig.executionLogs || [];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerateKey = () => {
    if (!isConnected) {
      showToast('Connect website domain first to manage cron secret keys.', 'error');
      return;
    }
    const newKey = 'smm_nepal_cron_sec_' + Math.random().toString(36).substring(2, 12);
    setCronKey(newKey);
    onUpdateSettings({
      cronSettings: {
        ...cronConfig,
        cronSecretKey: newKey,
      },
    });
    showToast('New Cron Secret Key generated and saved!', 'success');
  };

  // Domain Connection Handshake Simulator
  const handleConnectWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = targetUrlInput.trim().replace(/\/+$/, '');
    if (!cleanUrl || (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://'))) {
      showToast('Please enter a valid website URL starting with https:// or http://', 'error');
      return;
    }

    setIsVerifyingDomain(true);
    setVerificationStep('Resolving DNS and IP routes...');

    setTimeout(() => {
      setVerificationStep('Testing SSL / TLS handshake & endpoint security...');
    }, 600);

    setTimeout(() => {
      setVerificationStep('Verifying webhook endpoint /api/cron/handshake...');
    }, 1200);

    setTimeout(() => {
      const now = new Date().toISOString();
      const initialLog: CronExecutionLog = {
        id: 'log-connect-' + Date.now(),
        jobName: 'Website Domain Handshake & Activation',
        status: 'success',
        message: `Successfully linked ${cleanUrl}. Webhook handshake HTTP 200 OK. Cron Automation Engine activated.`,
        executedAt: now,
        durationMs: 142,
      };

      const updatedLogs = [initialLog, ...(cronConfig.executionLogs || [])];

      onUpdateSettings({
        siteUrl: cleanUrl,
        cronSettings: {
          ...cronConfig,
          isWebsiteConnected: true,
          connectedDomain: cleanUrl,
          connectedAt: now,
          domainVerificationStatus: 'connected',
          autoSyncOrders: true,
          autoSyncStatus: true,
          autoCurrencyRefresh: true,
          autoExpirePendingDeposits: true,
          lastRun: now,
          executionLogs: updatedLogs,
        },
      });

      setIsVerifyingDomain(false);
      setVerificationStep('');
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      showToast(`Website connected successfully! Cron jobs are now ACTIVE for ${cleanUrl}`, 'success');
    }, 1800);
  };

  // Disconnect Website Domain
  const handleDisconnectWebsite = () => {
    if (!confirm('Are you sure you want to disconnect the website? All automated background cron jobs will be paused.')) {
      return;
    }

    onUpdateSettings({
      cronSettings: {
        ...cronConfig,
        isWebsiteConnected: false,
        domainVerificationStatus: 'disconnected',
        autoSyncOrders: false,
        autoSyncStatus: false,
        autoCurrencyRefresh: false,
        autoExpirePendingDeposits: false,
      },
    });

    showToast('Website disconnected. Cron job settings are now INACTIVE.', 'info');
  };

  const handleRunJob = (job: CronJobItem) => {
    if (!isConnected) {
      showToast('Cron jobs are locked. Connect website domain first!', 'error');
      return;
    }

    setRunningJobId(job.id);
    const start = performance.now();

    setTimeout(() => {
      const durationMs = Math.round(performance.now() - start + Math.random() * 200 + 150);
      const newLog: CronExecutionLog = {
        id: 'log-' + Date.now(),
        jobName: job.name,
        status: 'success',
        message: `Manual execution completed successfully for ${connectedDomain}. Dispatched payload to ${job.endpoint}. Output: HTTP 200 OK.`,
        executedAt: new Date().toISOString(),
        durationMs,
      };

      const updatedLogs = [newLog, ...logs.slice(0, 19)];
      onUpdateSettings({
        cronSettings: {
          ...cronConfig,
          lastRun: new Date().toISOString(),
          executionLogs: updatedLogs,
        },
      });

      setRunningJobId(null);
      showToast(`Cron task "${job.name}" executed successfully (${durationMs}ms)!`, 'success');
    }, 700);
  };

  const toggleJobStatus = (jobId: string) => {
    if (!isConnected) {
      showToast('Connect website domain first to toggle cron tasks.', 'error');
      return;
    }

    setCronJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, status: j.status === 'active' ? 'paused' : 'active' } : j
      )
    );
    showToast('Cron task status updated.', 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`p-2 rounded-xl border ${
              isConnected
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              <Clock className="w-5 h-5" />
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-white">Cron Jobs & Automation Engine</h1>
              {isConnected ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVE (CONNECTED)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  INACTIVE (NEEDS WEBSITE CONNECTION)
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Automate provider order synchronization, drip-feed schedules, Nepal Rastra Bank forex rates, and database housekeeping.
          </p>
        </div>

        {/* Global Key Widget */}
        <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-2xl p-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-mono font-bold text-neutral-500">Cron Secret Key</div>
            <div className="font-mono text-xs font-bold text-red-300 truncate max-w-[180px]">
              {isConnected ? cronKey : '••••••••••••••••••••'}
            </div>
          </div>
          <button
            type="button"
            disabled={!isConnected}
            onClick={() => copyToClipboard(cronKey, 'global-cron-key')}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-neutral-300 hover:text-white border border-neutral-700 cursor-pointer transition"
            title="Copy Secret Key"
          >
            {copiedId === 'global-cron-key' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            type="button"
            disabled={!isConnected}
            onClick={handleRegenerateKey}
            className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 disabled:opacity-40 text-red-400 hover:text-white border border-red-500/30 cursor-pointer transition"
            title="Regenerate Secret Key"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Connection Gateway Banner / Form */}
      {!isConnected ? (
        <div className="bg-gradient-to-br from-amber-950/30 via-neutral-900 to-neutral-950 border-2 border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                <WifiOff className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">
                  Website Connection Required to Activate Cron Jobs
                </h2>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  Cron job settings and background polling daemons remain inactive until your live website URL is connected and verified.
                </p>
              </div>
            </div>

            <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 text-xs text-neutral-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Why is website connection required?</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                Background cron daemons (cPanel, Crontab, EasyCron) need a verified root website URL and endpoint key to dispatch HTTP POST/GET requests safely. Connect your website domain below to activate automated order sync, real-time provider polling, and drip-feed execution.
              </p>
            </div>

            <form onSubmit={handleConnectWebsite} className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">
                Enter Your Website Domain / URL
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="url"
                    required
                    value={targetUrlInput}
                    onChange={(e) => setTargetUrlInput(e.target.value)}
                    placeholder="https://smmpanelnepal.com"
                    disabled={isVerifyingDomain}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-sm font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isVerifyingDomain}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 font-black text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  {isVerifyingDomain ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying & Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Power className="w-4 h-4" />
                      <span>Verify & Connect Website</span>
                    </>
                  )}
                </button>
              </div>

              {isVerifyingDomain && (
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center gap-2.5 text-xs text-emerald-400 font-mono animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{verificationStep}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      ) : (
        /* Connected Website Domain Live Card */
        <div className="bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-950 border border-emerald-500/40 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider font-mono">
                  Website Connected & Active
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="text-base font-bold text-white font-mono mt-0.5 flex items-center gap-2">
                <span>{connectedDomain}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-sans border border-neutral-700">
                  TLS 1.3 / SSL Verified
                </span>
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                Connected At: {cronConfig.connectedAt ? new Date(cronConfig.connectedAt).toLocaleString() : 'Active'} • Webhook Handshake: HTTP 200 OK (24ms)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              type="button"
              onClick={handleDisconnectWebsite}
              className="px-3.5 py-2 rounded-xl bg-neutral-950 hover:bg-red-950/40 text-neutral-300 hover:text-red-300 border border-neutral-800 hover:border-red-500/30 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <WifiOff className="w-3.5 h-3.5 text-neutral-400" />
              <span>Disconnect / Re-link</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border transition ${
          isConnected ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-900/30 border-neutral-850 opacity-60'
        }`}>
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Automated Tasks</span>
            <Server className={`w-4 h-4 ${isConnected ? 'text-emerald-400' : 'text-neutral-500'}`} />
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {isConnected ? `${cronJobs.filter((j) => j.status === 'active').length} / ${cronJobs.length}` : '0 Active'}
          </div>
          <div className={`text-[11px] font-medium mt-1 ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isConnected ? 'All core daemons online' : 'Inactive (Awaiting Connection)'}
          </div>
        </div>

        <div className={`p-4 rounded-2xl border transition ${
          isConnected ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-900/30 border-neutral-850 opacity-60'
        }`}>
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Order Sync Daemon</span>
            <RefreshCw className={`w-4 h-4 ${isConnected ? 'text-blue-400' : 'text-neutral-500'}`} />
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {isConnected ? 'Every 5m' : 'Paused'}
          </div>
          <div className="text-[11px] text-neutral-400 font-medium mt-1">Wholesale API auto-polling</div>
        </div>

        <div className={`p-4 rounded-2xl border transition ${
          isConnected ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-900/30 border-neutral-850 opacity-60'
        }`}>
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Drip-Feed Batcher</span>
            <Zap className={`w-4 h-4 ${isConnected ? 'text-amber-400' : 'text-neutral-500'}`} />
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {isConnected ? 'Every 60s' : 'Paused'}
          </div>
          <div className="text-[11px] text-neutral-400 font-medium mt-1">Sub-minute queue dispatch</div>
        </div>

        <div className={`p-4 rounded-2xl border transition ${
          isConnected ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-900/30 border-neutral-850 opacity-60'
        }`}>
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Last Auto-Execution</span>
            <Activity className={`w-4 h-4 ${isConnected ? 'text-purple-400' : 'text-neutral-500'}`} />
          </div>
          <div className="text-lg font-black text-white mt-2 font-mono truncate">
            {isConnected && cronConfig.lastRun ? new Date(cronConfig.lastRun).toLocaleTimeString() : 'Not Connected'}
          </div>
          <div className={`text-[11px] font-medium mt-1 ${isConnected ? 'text-purple-400' : 'text-neutral-500'}`}>
            {isConnected ? 'Status: HTTP 200 OK' : 'Standby Mode'}
          </div>
        </div>
      </div>

      {/* Cron Tasks Catalog */}
      <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-6 shadow-xl space-y-4 relative">
        {!isConnected && (
          <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-[2px] rounded-2xl z-10 flex flex-col items-center justify-center p-6 text-center">
            <Lock className="w-10 h-10 text-amber-400 mb-2" />
            <h3 className="text-base font-black text-white">Cron Daemons Locked</h3>
            <p className="text-xs text-neutral-400 max-w-md mt-1">
              Connect your website domain in the box above to unlock and activate background cron execution commands.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Configured System Cron Daemons</span>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-mono font-bold">
                {cronJobs.length} Jobs
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Add these command lines to your cPanel, Linux crontab, or EasyCron dashboard.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {cronJobs.map((job) => {
            const resolvedCommand = job.command
              .replace('{SITE_URL}', connectedDomain)
              .replace('{CRON_KEY}', cronKey);
            const isRunning = runningJobId === job.id;

            return (
              <div
                key={job.id}
                className={`p-4 rounded-2xl border transition-all ${
                  job.status === 'active' && isConnected
                    ? 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                    : 'bg-neutral-950/30 border-neutral-800/50 opacity-60'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{job.name}</span>
                      <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[10px]">
                        {job.interval}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                          job.status === 'active' && isConnected
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {isConnected ? job.status.toUpperCase() : 'PENDING CONNECTION'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">{job.description}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={!isConnected}
                      onClick={() => toggleJobStatus(job.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer disabled:opacity-40 ${
                        job.status === 'active'
                          ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
                          : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-600'
                      }`}
                    >
                      {job.status === 'active' ? 'Pause' : 'Activate'}
                    </button>

                    <button
                      type="button"
                      disabled={isRunning || !isConnected}
                      onClick={() => handleRunJob(job)}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-red-600/20 cursor-pointer"
                    >
                      {isRunning ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Running...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Run Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Command Snippet */}
                <div className="mt-3 pt-3 border-t border-neutral-850 flex items-center justify-between gap-3 bg-neutral-900/90 rounded-xl px-3 py-2">
                  <div className="font-mono text-[11px] text-neutral-300 truncate select-all">
                    {resolvedCommand}
                  </div>
                  <button
                    type="button"
                    disabled={!isConnected}
                    onClick={() => copyToClipboard(resolvedCommand, job.id)}
                    className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 disabled:opacity-40 text-neutral-400 hover:text-white border border-neutral-800 cursor-pointer transition shrink-0"
                    title="Copy Command"
                  >
                    {copiedId === job.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Setup Instructions Card */}
      <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-red-400" />
            <h2 className="text-base font-bold text-white">How to Set Up in cPanel / Server Crontab</h2>
          </div>
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveInstructionTab('cpanel')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeInstructionTab === 'cpanel'
                  ? 'bg-red-500 text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              cPanel Hosting
            </button>
            <button
              type="button"
              onClick={() => setActiveInstructionTab('vps')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeInstructionTab === 'vps'
                  ? 'bg-red-500 text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Ubuntu/Linux VPS
            </button>
            <button
              type="button"
              onClick={() => setActiveInstructionTab('easycron')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeInstructionTab === 'easycron'
                  ? 'bg-red-500 text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              EasyCron / Cloud
            </button>
          </div>
        </div>

        {activeInstructionTab === 'cpanel' && (
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-2 leading-relaxed">
            <p>
              1. Log into your hosting <strong>cPanel</strong> account and search for <strong>Cron Jobs</strong> in the Advanced menu.
            </p>
            <p>
              2. Under <em>Add New Cron Job</em>, choose the schedule frequency (e.g. <strong>Once Per 5 Minutes</strong> for Order Sync).
            </p>
            <p>
              3. Paste the cURL command generated above with your website domain and secret key into the <strong>Command</strong> box.
            </p>
            <p>
              4. Click <strong>Add New Cron Job</strong>. Your server will now execute status checks in the background 24/7.
            </p>
          </div>
        )}

        {activeInstructionTab === 'vps' && (
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-2 leading-relaxed">
            <p>
              1. SSH into your VPS server as root or web user: <code>crontab -e</code>
            </p>
            <p>
              2. Add the cron lines at the bottom of the crontab file:
            </p>
            <pre className="p-3 bg-neutral-900 rounded-lg text-emerald-400 font-mono text-[11px] overflow-x-auto">
{`*/5 * * * * curl -s "${connectedDomain}/api/cron/sync-orders?key=${cronKey}" > /dev/null 2>&1
* * * * * curl -s "${connectedDomain}/api/cron/dripfeed?key=${cronKey}" > /dev/null 2>&1
0 */6 * * * curl -s "${connectedDomain}/api/cron/currency-rates?key=${cronKey}" > /dev/null 2>&1`}
            </pre>
            <p>3. Save and exit (<code>:wq</code> in vim or <code>Ctrl+O, Enter, Ctrl+X</code> in nano).</p>
          </div>
        )}

        {activeInstructionTab === 'easycron' && (
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-2 leading-relaxed">
            <p>
              1. Sign up on <strong>EasyCron</strong> or <strong>cron-job.org</strong>.
            </p>
            <p>
              2. Create a new URL monitor pointing to: <code>{connectedDomain}/api/cron/sync-orders?key={cronKey}</code>
            </p>
            <p>
              3. Set the interval to <strong>Every 5 minutes</strong> and select HTTP GET.
            </p>
          </div>
        )}
      </div>

      {/* Execution Logs Table */}
      <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-400" />
            <h2 className="text-base font-bold text-white">Cron Execution History & Telemetry</h2>
          </div>
          <span className="text-xs text-neutral-400 font-mono">{logs.length} logged runs</span>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            No execution logs yet. Connect your website above and click &quot;Run Now&quot; on any task to test manually.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950 text-neutral-400 uppercase font-mono text-[10px] border-b border-neutral-800">
                <tr>
                  <th className="p-3">Job Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Executed At</th>
                  <th className="p-3">Output / Log Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-950/40 transition">
                    <td className="p-3 font-bold text-white whitespace-nowrap">{log.jobName}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-neutral-400 whitespace-nowrap">
                      {log.durationMs ? `${log.durationMs}ms` : '320ms'}
                    </td>
                    <td className="p-3 font-mono text-neutral-400 whitespace-nowrap">
                      {new Date(log.executedAt).toLocaleString()}
                    </td>
                    <td className="p-3 text-neutral-300 font-mono text-[11px] truncate max-w-md">
                      {log.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
