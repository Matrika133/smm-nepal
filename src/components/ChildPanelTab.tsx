import React, { useState } from 'react';
import {
  Globe,
  Server,
  Zap,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Palette,
  Clock,
  Sparkles,
  ChevronRight,
  Sliders,
  Settings,
  HelpCircle,
  Terminal,
  Lock,
  UserCheck,
  ArrowRight,
  Layers,
  Key
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChildPanel, ChildPanelTheme, UserAccount, SystemSettings } from '../types';
import { CHILD_PANEL_MONTHLY_PRICE_NPR, PANEL_NAMESERVERS } from '../data/smmData';

interface ChildPanelTabProps {
  user: UserAccount;
  childPanels: ChildPanel[];
  onCreateChildPanel: (panelData: Omit<ChildPanel, 'id' | 'createdAt' | 'renewDate' | 'totalOrdersForwarded' | 'totalEarningsNPR' | 'syncedServicesCount'>) => boolean;
  onRenewChildPanel: (panelId: string) => boolean;
  onToggleAutoRenew: (panelId: string) => void;
  onUpdateMargin: (panelId: string, marginPercent: number) => void;
  onNavigateTab: (tab: any) => void;
  systemSettings?: SystemSettings;
}

export function ChildPanelTab({
  user,
  childPanels,
  onCreateChildPanel,
  onRenewChildPanel,
  onToggleAutoRenew,
  onUpdateMargin,
  onNavigateTab,
  systemSettings,
}: ChildPanelTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'my_panels' | 'order_panel' | 'dns_guide' | 'calculator'>('my_panels');

  // Active Monthly Price dynamically loaded from System Settings or default
  const activeChildPanelPrice = systemSettings?.childPanelMonthlyPriceNPR ?? CHILD_PANEL_MONTHLY_PRICE_NPR;

  // Form State for Ordering a Child Panel
  const [domain, setDomain] = useState('');
  const [adminUsername, setAdminUsername] = useState(user.username ? `${user.username}_admin` : 'admin');
  const [adminPassword, setAdminPassword] = useState('Admin@2026');
  const [currency, setCurrency] = useState<'NPR' | 'USD' | 'INR'>('NPR');
  const [selectedTheme, setSelectedTheme] = useState<ChildPanelTheme>('Dark Cyber');
  const [profitMargin, setProfitMargin] = useState<number>(25);
  const [siteTitle, setSiteTitle] = useState('Nepal Social Boost');
  const [supportContact, setSupportContact] = useState(user.phone ? `+977 ${user.phone}` : '+977 9800000000');
  const [autoRenew, setAutoRenew] = useState(true);

  // Form Feedback
  const [formError, setFormError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Copy helpers
  const [copiedNS1, setCopiedNS1] = useState(false);
  const [copiedNS2, setCopiedNS2] = useState(false);
  const [copiedCname, setCopiedCname] = useState(false);

  // DNS Verification Simulation
  const [verifyingDnsId, setVerifyingDnsId] = useState<string | null>(null);
  const [dnsCheckResult, setDnsCheckResult] = useState<{ [id: string]: { success: boolean; msg: string } }>({});

  // Admin Launch Preview Modal
  const [previewPanel, setPreviewPanel] = useState<ChildPanel | null>(null);

  // Calculator State
  const [calcMonthlyOrders, setCalcMonthlyOrders] = useState<number>(350);
  const [calcAvgOrderValue, setCalcAvgOrderValue] = useState<number>(450);
  const [calcMarginPercent, setCalcMarginPercent] = useState<number>(30);

  const monthlyGrossSales = calcMonthlyOrders * calcAvgOrderValue;
  const estimatedMonthlyProfit = Math.round(monthlyGrossSales * (calcMarginPercent / (100 + calcMarginPercent)));
  const netProfitAfterRent = estimatedMonthlyProfit - activeChildPanelPrice;

  const handleCopy = (text: string, type: 'ns1' | 'ns2' | 'cname') => {
    navigator.clipboard.writeText(text);
    if (type === 'ns1') {
      setCopiedNS1(true);
      setTimeout(() => setCopiedNS1(false), 2000);
    } else if (type === 'ns2') {
      setCopiedNS2(true);
      setTimeout(() => setCopiedNS2(false), 2000);
    } else {
      setCopiedCname(true);
      setTimeout(() => setCopiedCname(false), 2000);
    }
  };

  const handleVerifyDns = (panelId: string, panelDomain: string) => {
    setVerifyingDnsId(panelId);
    setTimeout(() => {
      setVerifyingDnsId(null);
      setDnsCheckResult((prev) => ({
        ...prev,
        [panelId]: {
          success: true,
          msg: `DNS records successfully resolved to ${PANEL_NAMESERVERS.ns1} & ${PANEL_NAMESERVERS.ns2}. SSL Certificate issued!`,
        },
      }));
    }, 1600);
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setOrderSuccess(null);

    // Clean domain
    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    if (!cleanDomain || !cleanDomain.includes('.')) {
      setFormError('Please enter a valid domain name (e.g. yourbrand.com or yourbrand.com.np)');
      return;
    }

    if (!adminUsername.trim() || adminUsername.length < 3) {
      setFormError('Admin username must be at least 3 characters.');
      return;
    }

    if (!adminPassword.trim() || adminPassword.length < 6) {
      setFormError('Admin password must be at least 6 characters.');
      return;
    }

    if (user.balance < activeChildPanelPrice) {
      setFormError(`Insufficient funds. Your balance is Rs. ${user.balance.toLocaleString()} NPR, but Rs. ${activeChildPanelPrice.toLocaleString()} NPR is required for the 1-month hosting license.`);
      return;
    }

    const success = onCreateChildPanel({
      domain: cleanDomain,
      adminUsername: adminUsername.trim(),
      adminPassword: adminPassword.trim(),
      currency,
      priceMonthly: activeChildPanelPrice,
      status: 'Active',
      nameservers: {
        ns1: PANEL_NAMESERVERS.ns1,
        ns2: PANEL_NAMESERVERS.ns2,
      },
      cnameRecord: PANEL_NAMESERVERS.cname,
      autoRenew,
      theme: selectedTheme,
      dnsVerified: true,
      profitMarginPercent: profitMargin,
      siteTitle: siteTitle.trim() || `${cleanDomain} - SMM Services`,
      supportContact: supportContact.trim() || `support@${cleanDomain}`,
    });

    if (success) {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
      });
      setOrderSuccess(cleanDomain);
      setDomain('');
      setActiveSubTab('my_panels');
    }
  };

  const totalForwarded = childPanels.reduce((sum, p) => sum + p.totalOrdersForwarded, 0);
  const totalEarnings = childPanels.reduce((sum, p) => sum + p.totalEarningsNPR, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Server className="w-3.5 h-3.5" />
              <span>{systemSettings?.siteName || 'SMM Panel Nepal'} Reseller Cloud</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Child Panel Reseller System
            </h1>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Launch your very own branded SMM website under your custom domain (like <span className="text-emerald-400 font-mono">yourbrand.com</span> or <span className="text-cyan-400 font-mono">brand.com.np</span>). All orders and 95+ services automatically sync with {systemSettings?.siteName || 'SMM Panel Nepal'} with your chosen profit margin!
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveSubTab('order_panel')}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs sm:text-sm transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Rent New Child Panel (Rs. {activeChildPanelPrice.toLocaleString()}/mo)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('dns_guide')}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs sm:text-sm border border-neutral-700 transition flex items-center gap-2 cursor-pointer"
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Nameservers Guide</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-neutral-800/80">
          <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-3.5">
            <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active Panels</span>
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {childPanels.length}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">100% Uptime Hosted</span>
          </div>

          <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-3.5">
            <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Orders Forwarded</span>
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {totalForwarded.toLocaleString()}
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">Auto-dispatched to API</span>
          </div>

          <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-3.5">
            <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reseller Revenue</span>
            </div>
            <div className="text-xl font-bold text-cyan-400 font-mono mt-1">
              Rs. {totalEarnings.toLocaleString()}
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">From your end-users</span>
          </div>

          <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-3.5">
            <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Hosting License</span>
            </div>
            <div className="text-xl font-bold text-white font-mono mt-1">
              Rs. {activeChildPanelPrice.toLocaleString()}
            </div>
            <span className="text-[10px] text-purple-400 font-mono">NPR / Month (All-inclusive)</span>
          </div>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSubTab('my_panels')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'my_panels'
              ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Child Panels ({childPanels.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('order_panel')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'order_panel'
              ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Rent New Panel</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('dns_guide')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'dns_guide'
              ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>DNS & Nameserver Setup</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('calculator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'calculator'
              ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Profit & Margin Calculator</span>
        </button>
      </div>

      {/* SUB-TAB 1: MY CHILD PANELS */}
      {activeSubTab === 'my_panels' && (
        <div className="space-y-4">
          {orderSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <strong>Congratulations!</strong> Your child panel for <span className="font-mono font-bold text-white">{orderSuccess}</span> has been provisioned! Please ensure your domain nameservers are set to <code className="bg-emerald-900/60 px-1 py-0.5 rounded text-white">{PANEL_NAMESERVERS.ns1}</code> and <code className="bg-emerald-900/60 px-1 py-0.5 rounded text-white">{PANEL_NAMESERVERS.ns2}</code>.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOrderSuccess(null)}
                className="text-xs font-mono text-emerald-400 hover:underline shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {childPanels.length === 0 ? (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-12 text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400 mx-auto">
                <Globe className="w-8 h-8 text-neutral-500" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-white">No Child Panels Rented Yet</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Start your automated social media marketing reseller agency in minutes. Point your domain, choose your profit margin, and start taking customer orders.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('order_panel')}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Rent Your First Child Panel</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {childPanels.map((panel) => {
                const isDnsChecking = verifyingDnsId === panel.id;
                const checkRes = dnsCheckResult[panel.id];

                return (
                  <div
                    key={panel.id}
                    className="bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 rounded-3xl p-5 sm:p-6 transition shadow-xl space-y-5"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                          <Globe className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-black text-white font-mono">
                              {panel.domain}
                            </h3>
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${
                                panel.status === 'Active'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : panel.status === 'Pending DNS'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : 'bg-red-500/20 text-red-300 border-red-500/30'
                              }`}
                            >
                              {panel.status}
                            </span>
                            <span className="text-[10px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-700 font-mono">
                              Theme: {panel.theme}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            Title: <span className="text-neutral-200">{panel.siteTitle}</span> • Currency: <span className="font-mono text-emerald-400">{panel.currency}</span>
                          </p>
                        </div>
                      </div>

                      {/* Top Right Quick Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewPanel(panel)}
                          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-neutral-700 flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Admin Login Info</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVerifyDns(panel.id, panel.domain)}
                          disabled={isDnsChecking}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isDnsChecking ? 'animate-spin' : ''}`} />
                          <span>{isDnsChecking ? 'Checking DNS...' : 'Verify DNS'}</span>
                        </button>
                      </div>
                    </div>

                    {/* DNS check result banner */}
                    {checkRes && (
                      <div
                        className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                          checkRes.success
                            ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                            : 'bg-amber-950/40 border border-amber-500/30 text-amber-300'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>{checkRes.msg}</span>
                      </div>
                    )}

                    {/* Grid of Key Info & Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      {/* Box 1: Nameservers & DNS */}
                      <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-3.5 space-y-2">
                        <div className="text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                          <span>NAMESERVERS</span>
                          <span className="text-emerald-400 text-[10px]">Cloudflare SSL Active</span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between bg-neutral-900 px-2.5 py-1.5 rounded-lg border border-neutral-800 text-[11px] font-mono text-neutral-300">
                            <span>{panel.nameservers.ns1}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(panel.nameservers.ns1, 'ns1')}
                              className="text-neutral-400 hover:text-white"
                              title="Copy"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between bg-neutral-900 px-2.5 py-1.5 rounded-lg border border-neutral-800 text-[11px] font-mono text-neutral-300">
                            <span>{panel.nameservers.ns2}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(panel.nameservers.ns2, 'ns2')}
                              className="text-neutral-400 hover:text-white"
                              title="Copy"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Box 2: Profit Margin Markup Controller */}
                      <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-3.5 space-y-2">
                        <div className="text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                          <span>PROFIT MARKUP</span>
                          <span className="text-amber-400 font-bold font-mono">+{panel.profitMarginPercent}%</span>
                        </div>
                        <p className="text-[11px] text-neutral-400">
                          Automatically adds +{panel.profitMarginPercent}% profit margin on top of {systemSettings?.siteName || 'SMM Panel Nepal'} rates.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="range"
                            min="5"
                            max="100"
                            step="5"
                            value={panel.profitMarginPercent}
                            onChange={(e) => onUpdateMargin(panel.id, parseInt(e.target.value))}
                            className="w-full accent-emerald-500 cursor-pointer"
                          />
                          <span className="text-xs font-mono font-bold text-white shrink-0 w-9 text-right">
                            {panel.profitMarginPercent}%
                          </span>
                        </div>
                      </div>

                      {/* Box 3: Expiry & Auto-Renew */}
                      <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-3.5 space-y-2">
                        <div className="text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                          <span>RENEWAL STATUS</span>
                          <span className="text-cyan-400 text-[10px]">30-Day Cycle</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-400">Next Renewal:</span>
                          <span className="font-mono font-bold text-white">{panel.renewDate}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={panel.autoRenew}
                              onChange={() => onToggleAutoRenew(panel.id)}
                              className="rounded border-neutral-700 text-emerald-500 focus:ring-emerald-500 accent-emerald-500"
                            />
                            <span>Auto-Renew</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => onRenewChildPanel(panel.id)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition cursor-pointer"
                          >
                            + Renew 30 Days (Rs. {panel.priceMonthly.toLocaleString()})
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom stats ribbon */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800/80 text-xs text-neutral-400 font-mono">
                      <div className="flex items-center gap-4">
                        <span>
                          Synced Services: <strong className="text-white">{panel.syncedServicesCount} Active</strong>
                        </span>
                        <span>
                          Orders Forwarded: <strong className="text-emerald-400">{panel.totalOrdersForwarded.toLocaleString()}</strong>
                        </span>
                        <span>
                          Customer Support: <strong className="text-neutral-300">{panel.supportContact}</strong>
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Created: {panel.createdAt}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: ORDER NEW CHILD PANEL FORM */}
      {activeSubTab === 'order_panel' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
                <Zap className="w-3.5 h-3.5" />
                <span>Instant Provisioning</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Order Your Custom SMM Child Panel
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Enter your domain details. Once ordered, set the nameservers at your domain registrar to go live automatically.
              </p>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleOrderSubmit} className="space-y-4">
              {/* Domain Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                  <span>Domain Name *</span>
                  <span className="text-[11px] text-neutral-400 font-mono">e.g. nepalsmm.com or brand.com.np</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="yourbrandname.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition font-mono"
                  />
                </div>
                <p className="text-[11px] text-neutral-400">
                  Tip: You can use free <strong className="text-neutral-300">.com.np</strong> domains from Mercantile Register (register.com.np) or standard TLDs from Namecheap/GoDaddy.
                </p>
              </div>

              {/* Admin Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Admin Username *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="admin_nepal"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Admin Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="SecurePass2026!"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Currency & Profit Margin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Panel Default Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="NPR">Nepali Rupees (Rs. NPR) - Recommended for Nepal</option>
                    <option value="USD">US Dollar ($ USD) - For International Resellers</option>
                    <option value="INR">Indian Rupees (₹ INR)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                    <span>Default Service Profit Markup</span>
                    <span className="text-emerald-400 font-mono font-bold">+{profitMargin}%</span>
                  </label>
                  <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2">
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={profitMargin}
                      onChange={(e) => setProfitMargin(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-white shrink-0">
                      +{profitMargin}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Site Title & Support Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Panel Brand / Site Title
                  </label>
                  <input
                    type="text"
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                    placeholder="e.g. Kathmandu Social Boost"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Customer Support Contact (WhatsApp/Email)
                  </label>
                  <input
                    type="text"
                    value={supportContact}
                    onChange={(e) => setSupportContact(e.target.value)}
                    placeholder="+977 98XXXXXXXX (WhatsApp)"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Theme Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-purple-400" />
                  <span>Choose Theme Template</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(
                    [
                      { name: 'Dark Cyber', color: 'bg-emerald-500' },
                      { name: 'Neon Emerald', color: 'bg-teal-400' },
                      { name: 'Minimalist Slate', color: 'bg-neutral-400' },
                      { name: 'Royal Purple', color: 'bg-purple-500' },
                      { name: 'Ocean Blue', color: 'bg-cyan-500' },
                    ] as { name: ChildPanelTheme; color: string }[]
                  ).map((theme) => (
                    <button
                      key={theme.name}
                      type="button"
                      onClick={() => setSelectedTheme(theme.name)}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between h-20 ${
                        selectedTheme === theme.name
                          ? 'bg-neutral-950 border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`h-3 w-3 rounded-full ${theme.color}`} />
                        {selectedTheme === theme.name && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-neutral-200">
                        {theme.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-renew checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                    className="rounded border-neutral-700 text-emerald-500 focus:ring-emerald-500 accent-emerald-500 h-4 w-4"
                  />
                  <span>Enable Auto-Renewal each month from your wallet balance</span>
                </label>
              </div>

              {/* Submit / Order Action */}
              <div className="pt-4 border-t border-neutral-800">
                {user.balance >= activeChildPanelPrice ? (
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Pay Rs. {activeChildPanelPrice.toLocaleString()} NPR & Deploy Child Panel</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-300 text-xs flex items-center justify-between">
                      <span>Insufficient wallet balance (Current: Rs. {user.balance.toLocaleString()} NPR).</span>
                      <span className="font-bold">Need: Rs. {activeChildPanelPrice.toLocaleString()} NPR</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('add_funds')}
                      className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Add Funds First (eSewa / Khalti / Fonepay)</span>
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Right Summary & What's Included */}
          <div className="space-y-4">
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>What's Included With Your Child Panel</span>
              </h3>

              <ul className="space-y-3 text-xs text-neutral-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>100% Automated Order Sync:</strong> When your client places an order on your site, it auto-forwards to {systemSettings?.siteName || 'SMM Panel Nepal'} without manual effort.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>95+ SMM Services Pre-loaded:</strong> Instagram, TikTok, YouTube, Facebook, Spotify, Telegram & more.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Unlimited Bandwidth & Hosting:</strong> High-speed SSD cloud nodes with zero hosting server headaches.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Free SSL Certificate:</strong> Automatic HTTPS certificate generation with Cloudflare DDoS protection.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Full Profit Control:</strong> Keep 100% of your markup profit deposited directly into your panel.
                  </span>
                </li>
              </ul>

              <div className="pt-4 border-t border-neutral-800 space-y-2">
                <div className="text-[11px] font-mono text-neutral-400">
                  NAMESERVERS TO POINT:
                </div>
                <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 font-mono text-xs text-emerald-400 space-y-1">
                  <div>1. {PANEL_NAMESERVERS.ns1}</div>
                  <div>2. {PANEL_NAMESERVERS.ns2}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DNS & NAMESERVERS SETUP GUIDE */}
      {activeSubTab === 'dns_guide' && (
        <div className="space-y-6">
          {/* Quick Copy Card */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                DNS & Nameserver Configuration Guide
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Point your domain's DNS to our high-speed cluster. Propagation usually takes 5 to 30 minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-neutral-400 uppercase">Primary Nameserver (NS1)</div>
                  <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                    {PANEL_NAMESERVERS.ns1}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(PANEL_NAMESERVERS.ns1, 'ns1')}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
                >
                  {copiedNS1 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-neutral-400 uppercase">Secondary Nameserver (NS2)</div>
                  <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                    {PANEL_NAMESERVERS.ns2}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(PANEL_NAMESERVERS.ns2, 'ns2')}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
                >
                  {copiedNS2 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-5 space-y-3">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400">
                1
              </div>
              <h3 className="text-sm font-bold text-white">Get a Domain Name</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                You can get a <strong>FREE .com.np domain</strong> from Mercantile Communications (<a href="https://register.com.np" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">register.com.np</a>) using your Nepali citizenship, or buy a .com/.net from Namecheap/GoDaddy.
              </p>
            </div>

            <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-5 space-y-3">
              <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-400">
                2
              </div>
              <h3 className="text-sm font-bold text-white">Update Nameservers</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Log in to your domain registrar's control panel, find <strong>Custom Nameservers / DNS Settings</strong>, and replace default records with <code className="text-emerald-400">{PANEL_NAMESERVERS.ns1}</code> and <code className="text-emerald-400">{PANEL_NAMESERVERS.ns2}</code>.
              </p>
            </div>

            <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-5 space-y-3">
              <div className="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-400">
                3
              </div>
              <h3 className="text-sm font-bold text-white">Verify & Go Live</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Come back to the <strong>My Child Panels</strong> tab and click <strong>Verify DNS</strong>. Once verified, your website with customized pricing and automated order fulfillment is 100% active!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PROFIT & MARGIN CALCULATOR */}
      {activeSubTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Reseller Income Projection</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Child Panel Earnings Calculator
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Estimate your monthly reseller profits based on your expected customer order volume and markup margin.
              </p>
            </div>

            <div className="space-y-5">
              {/* Slider 1: Monthly Orders */}
              <div className="space-y-2 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-300">Estimated Monthly Client Orders</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {calcMonthlyOrders.toLocaleString()} Orders / month
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="3000"
                  step="50"
                  value={calcMonthlyOrders}
                  onChange={(e) => setCalcMonthlyOrders(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Slider 2: Average Order Value */}
              <div className="space-y-2 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-300">Average Order Value (in NPR)</span>
                  <span className="font-mono font-bold text-cyan-400 text-sm">
                    Rs. {calcAvgOrderValue.toLocaleString()} NPR
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2500"
                  step="50"
                  value={calcAvgOrderValue}
                  onChange={(e) => setCalcAvgOrderValue(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Slider 3: Margin Markup % */}
              <div className="space-y-2 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-300">Profit Margin Markup</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    +{calcMarginPercent}% Markup
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={calcMarginPercent}
                  onChange={(e) => setCalcMarginPercent(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Projected Monthly ROI
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Gross Reseller Sales:</span>
                  <span className="font-mono font-bold text-white">Rs. {monthlyGrossSales.toLocaleString()} NPR</span>
                </div>

                <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Gross Markup Profit:</span>
                  <span className="font-mono font-bold text-emerald-400">Rs. {estimatedMonthlyProfit.toLocaleString()} NPR</span>
                </div>

                <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Child Panel Hosting Fee:</span>
                  <span className="font-mono text-red-400">- Rs. {activeChildPanelPrice.toLocaleString()} NPR</span>
                </div>
              </div>

              <div className="bg-neutral-950 p-4 rounded-2xl border border-emerald-500/40 text-center space-y-1">
                <div className="text-[11px] font-mono text-neutral-400 uppercase">Estimated Net Monthly Profit</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  Rs. {netProfitAfterRent > 0 ? netProfitAfterRent.toLocaleString() : 0} NPR
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  {(estimatedMonthlyProfit / (activeChildPanelPrice || 1) * 100).toFixed(0)}% ROI on Hosting Investment
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveSubTab('order_panel')}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <span>Deploy Child Panel Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Admin Preview Modal */}
      {previewPanel && (
        <div
          id="admin-preview-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Child Panel Admin Access</h3>
                  <p className="text-[11px] text-neutral-400 font-mono">{previewPanel.domain}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPanel(null)}
                className="text-neutral-400 hover:text-white text-xs font-mono p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Admin URL:</span>
                <span className="text-emerald-400 font-bold">https://{previewPanel.domain}/admin</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Username:</span>
                <span className="text-white font-bold">{previewPanel.adminUsername}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Password:</span>
                <span className="text-white font-bold tracking-widest">••••••••</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">API Status:</span>
                <span className="text-cyan-400 font-bold">Connected (v4.5)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed">
              Use these credentials to log in to your custom child panel admin dashboard once your DNS nameservers have propagated.
            </div>

            <button
              type="button"
              onClick={() => setPreviewPanel(null)}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
