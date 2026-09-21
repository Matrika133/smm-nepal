import React, { useState } from 'react';
import {
  Users,
  Link as LinkIcon,
  Copy,
  Check,
  DollarSign,
  TrendingUp,
  Award,
  Share2,
  Gift,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Wallet,
  Coins,
  Send,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, SystemSettings } from '../types';

interface ReferralTabProps {
  user: UserAccount;
  onAddFunds: (amount: number, method: any, txId: string, extra?: any) => void;
  onNavigateTab: (tab: any) => void;
  systemSettings?: SystemSettings;
}

interface ReferralRecord {
  id: string;
  username: string;
  joinedDate: string;
  totalDeposited: number;
  totalOrders: number;
  commissionEarned: number;
  status: 'Active' | 'Pending';
}

export function ReferralTab({ user, onAddFunds, onNavigateTab, systemSettings }: ReferralTabProps) {
  const referralCode = user.username.toUpperCase();
  const domain = (systemSettings?.domainUrl || 'smmpanelnepal.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const referralLink = `https://${domain}/ref/${user.username}`;
  const brandName = systemSettings?.siteName || 'SMM Panel Nepal';

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPromo, setCopiedPromo] = useState(false);

  // Referral balance state (simulated realistic state saved in local state or transferred)
  const [unclaimedCommission, setUnclaimedCommission] = useState<number>(() => {
    const saved = localStorage.getItem(`smm_referral_unclaimed_${user.id}`);
    return saved !== null ? parseFloat(saved) : 212.0;
  });

  const [totalClaimed, setTotalClaimed] = useState<number>(() => {
    const saved = localStorage.getItem(`smm_referral_claimed_${user.id}`);
    return saved !== null ? parseFloat(saved) : 400.0;
  });

  const [claimSuccessMsg, setClaimSuccessMsg] = useState('');

  // Sample referred users list (1.8% commission rate)
  const [referrals] = useState<ReferralRecord[]>([
    {
      id: 'ref_1',
      username: 'kathmandu_media',
      joinedDate: '2026-02-14',
      totalDeposited: 15000,
      totalOrders: 42,
      commissionEarned: 270, // 15000 * 1.8%
      status: 'Active',
    },
    {
      id: 'ref_2',
      username: 'pokhara_boost',
      joinedDate: '2026-02-19',
      totalDeposited: 8000,
      totalOrders: 19,
      commissionEarned: 144, // 8000 * 1.8%
      status: 'Active',
    },
    {
      id: 'ref_3',
      username: 'nepal_vibe_marketing',
      joinedDate: '2026-02-25',
      totalDeposited: 11000,
      totalOrders: 31,
      commissionEarned: 198, // 11000 * 1.8%
      status: 'Active',
    },
  ]);

  const totalReferrals = referrals.length;
  const activeReferrals = referrals.filter((r) => r.status === 'Active').length;
  const totalLifetimeEarned = totalClaimed + unclaimedCommission;

  // Copy Link handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Copy Code handler
  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Copy Promo text handler
  const handleCopyPromo = () => {
    const promoText = `🚀 Boost your TikTok, Instagram, YouTube & Facebook with Nepal's #1 Instant SMM Reseller Panel! Pay with Fonepay QR, eSewa & Khalti.\n\nRegister now with my link: ${referralLink} or use referral code: ${referralCode}`;
    navigator.clipboard.writeText(promoText);
    setCopiedPromo(true);
    setTimeout(() => setCopiedPromo(false), 2000);
  };

  // Claim commission to live wallet (Instant auto-approval without admin approval)
  const handleTransferToWallet = () => {
    if (unclaimedCommission <= 0) return;

    const amount = unclaimedCommission;
    onAddFunds(amount, 'Fonepay', `REF-COMMISSION-${Date.now().toString().slice(-6)}`, {
      notes: `Referral Affiliate Commission instant payout for @${user.username}`,
      isImmediateApproval: true,
    });

    setTotalClaimed((prev) => {
      const updated = prev + amount;
      localStorage.setItem(`smm_referral_claimed_${user.id}`, String(updated));
      return updated;
    });

    setUnclaimedCommission(0);
    localStorage.setItem(`smm_referral_unclaimed_${user.id}`, '0');

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setClaimSuccessMsg(`Rs. ${amount.toLocaleString()} NPR commission successfully transferred to your main wallet balance!`);
    setTimeout(() => setClaimSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white">
                Affiliate & Referral Program
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                1.8% Lifetime Commission
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Invite friends and creators to {brandName} and earn 1.8% on every fund deposit they make forever.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-neutral-950 px-4 py-2 rounded-xl border border-neutral-800 w-full md:w-auto justify-between md:justify-end">
          <span className="text-xs text-neutral-400">Your Referral Code:</span>
          <span className="text-sm font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {referralCode}
          </span>
        </div>
      </div>

      {/* Referral Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-md">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">Total Invited</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-white">
            {totalReferrals}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">
            {activeReferrals} Active Resellers
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-md">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">Commission Rate</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-amber-400">
            1.8%
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">
            Lifetime on all deposits
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-md">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium">Lifetime Earned</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-white">
            Rs. {totalLifetimeEarned.toLocaleString()}{' '}
            <span className="text-xs text-neutral-500 font-normal">NPR</span>
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">
            Total commission generated
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-emerald-500/30 shadow-md">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium text-emerald-400">Available to Payout</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-emerald-400">
            Rs. {unclaimedCommission.toLocaleString()}{' '}
            <span className="text-xs text-emerald-400/70 font-normal">NPR</span>
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">
            Instant transfer to wallet
          </div>
        </div>
      </div>

      {/* Claim Message Toast */}
      {claimSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{claimSuccessMsg}</span>
        </div>
      )}

      {/* Referral Link & Transfer Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Referral Link & Sharing Tools (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Your Unique Referral Link
                </h2>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">1-Click Share</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300">
                Share this link with your clients or audience:
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300">
                <span className="truncate flex-1 text-xs text-emerald-400 font-semibold select-all">
                  {referralLink}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-neutral-300">
                Or share your Referral Code:
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300">
                <span className="truncate flex-1 text-xs text-amber-400 font-bold select-all">
                  {referralCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="pt-3 border-t border-neutral-800 space-y-2">
              <span className="text-xs font-semibold text-neutral-400 block">
                Quick Share Options:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Boost your social media with Nepal's #1 SMM Reseller Panel! Register: ${referralLink}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(
                    `Get cheap likes, followers & views with instant Fonepay deposit:`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-sky-950/40 hover:bg-sky-950 border border-sky-800/60 text-sky-300 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyPromo}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedPromo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPromo ? 'Promo Copied!' : 'Copy Promo Message'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Transfer Earnings to Main Balance (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Transfer Commission
                </h2>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">0% Fee</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-xs text-neutral-400 block">Available Commission to Transfer:</span>
              <div className="text-2xl font-mono font-black text-emerald-400">
                Rs. {unclaimedCommission.toLocaleString()} <span className="text-xs text-neutral-400 font-normal">NPR</span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Instantly credit this commission to your main balance to place new orders.
              </p>
            </div>

            <button
              type="button"
              onClick={handleTransferToWallet}
              disabled={unclaimedCommission <= 0}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
                unclaimedCommission > 0
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-emerald-500/20'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Transfer Rs. {unclaimedCommission.toLocaleString()} to Main Balance</span>
            </button>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-neutral-500">
                Current Main Balance: <strong className="text-white font-mono">Rs. {user.balance.toLocaleString()} NPR</strong>
              </span>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              How Referral Works
            </h3>
            <div className="space-y-2.5 text-xs text-neutral-400">
              <div className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-full bg-neutral-800 text-emerald-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                  1
                </span>
                <p>Send your link or code to clients, creators, or friends.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-full bg-neutral-800 text-emerald-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                  2
                </span>
                <p>They create an account and deposit funds via Fonepay or eSewa.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-full bg-neutral-800 text-emerald-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                  3
                </span>
                <p>You automatically receive 5% commission credited to your affiliate wallet.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referred Users Table */}
      <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Referred Users Activity ({referrals.length})
            </h2>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">Live Tracking</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-mono text-[11px]">
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Joined Date</th>
                <th className="pb-3 font-semibold">Total Deposits</th>
                <th className="pb-3 font-semibold">Orders Placed</th>
                <th className="pb-3 font-semibold text-right">5% Commission Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-sans">
              {referrals.map((ref) => (
                <tr key={ref.id} className="hover:bg-neutral-800/30 transition">
                  <td className="py-3 font-medium text-white flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                      {ref.username.substring(0, 2).toUpperCase()}
                    </div>
                    <span>@{ref.username}</span>
                  </td>
                  <td className="py-3 text-neutral-400 font-mono text-[11px]">
                    {ref.joinedDate}
                  </td>
                  <td className="py-3 font-mono text-neutral-200">
                    Rs. {ref.totalDeposited.toLocaleString()} NPR
                  </td>
                  <td className="py-3 font-mono text-neutral-300">
                    {ref.totalOrders}
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-emerald-400">
                    +Rs. {ref.commissionEarned.toLocaleString()} NPR
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
