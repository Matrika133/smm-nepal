import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Printer,
  Copy,
  Check,
  Eye,
  Image as ImageIcon,
  X,
  FileSpreadsheet,
  Building,
  CreditCard,
  Sparkles,
  RefreshCw,
  QrCode,
  ShieldCheck,
  Globe,
  ShoppingCart,
  Gift
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaymentTransaction, UserAccount, SystemSettings } from '../types';

interface TransactionsTabProps {
  user: UserAccount;
  transactions: PaymentTransaction[];
  onApproveDeposit?: (txId: string) => void;
  onNavigateTab: (tab: any) => void;
  systemSettings?: SystemSettings;
}

export function TransactionsTab({
  user,
  transactions,
  onApproveDeposit,
  onNavigateTab,
  systemSettings,
}: TransactionsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'debit' | 'child_panel' | 'referral'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');

  // Modals
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<PaymentTransaction | null>(null);
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxId(id);
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  // Determine transaction classification
  const getTxClassification = (tx: PaymentTransaction): 'Deposit' | 'Debit' | 'ChildPanel' | 'Referral' => {
    if (tx.type) {
      if (tx.type === 'Deposit') return 'Deposit';
      if (tx.type === 'Debit') {
        if (tx.method === 'Child Panel Hosting' || tx.notes?.toLowerCase().includes('child panel')) {
          return 'ChildPanel';
        }
        return 'Debit';
      }
      if (tx.type === 'Commission') return 'Referral';
    }

    // Heuristics based on method & notes
    if (tx.method === 'Child Panel Hosting' || tx.notes?.toLowerCase().includes('child panel')) {
      return 'ChildPanel';
    }
    if (tx.method === 'Wallet Debit' || tx.notes?.toLowerCase().includes('order #')) {
      return 'Debit';
    }
    if (tx.notes?.toLowerCase().includes('referral')) {
      return 'Referral';
    }
    return 'Deposit';
  };

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const classification = getTxClassification(tx);

      // Type filter
      if (typeFilter === 'deposit' && classification !== 'Deposit') return false;
      if (typeFilter === 'debit' && classification !== 'Debit') return false;
      if (typeFilter === 'child_panel' && classification !== 'ChildPanel') return false;
      if (typeFilter === 'referral' && classification !== 'Referral') return false;

      // Status filter
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;

      // Method filter
      if (methodFilter !== 'all' && tx.method !== methodFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = tx.id.toLowerCase().includes(q) || tx.transactionId.toLowerCase().includes(q);
        const matchMethod = tx.method.toLowerCase().includes(q);
        const matchNotes = (tx.notes || '').toLowerCase().includes(q);
        const matchSender = (tx.senderName || '').toLowerCase().includes(q) || (tx.senderPhone || '').toLowerCase().includes(q);
        if (!matchId && !matchMethod && !matchNotes && !matchSender) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortOption === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortOption === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortOption === 'amount_high') {
        return b.amount - a.amount;
      }
      if (sortOption === 'amount_low') {
        return a.amount - b.amount;
      }
      return 0;
    });
  }, [transactions, typeFilter, statusFilter, methodFilter, searchQuery, sortOption]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    let totalDeposited = 0;
    let totalSpent = 0;
    let totalPending = 0;
    let pendingCount = 0;

    transactions.forEach((tx) => {
      const classification = getTxClassification(tx);
      if (tx.status === 'Completed') {
        if (classification === 'Deposit' || classification === 'Referral') {
          totalDeposited += tx.amount;
        } else if (classification === 'Debit' || classification === 'ChildPanel') {
          totalSpent += tx.amount;
        }
      } else if (tx.status === 'Pending') {
        totalPending += tx.amount;
        pendingCount += 1;
      }
    });

    return {
      totalDeposited,
      totalSpent,
      totalPending,
      pendingCount,
      totalCount: transactions.length,
    };
  }, [transactions]);

  // CSV Export Helper
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to export.');
      return;
    }

    const headers = ['Transaction ID', 'Type', 'Method', 'Amount (NPR)', 'Fee (NPR)', 'Status', 'Date', 'Sender Phone', 'Sender Name', 'Notes'];
    const rows = filteredTransactions.map((tx) => [
      `"${tx.transactionId || tx.id}"`,
      `"${getTxClassification(tx)}"`,
      `"${tx.method}"`,
      tx.amount,
      tx.fee || 0,
      `"${tx.status}"`,
      `"${tx.date}"`,
      `"${tx.senderPhone || ''}"`,
      `"${tx.senderName || ''}"`,
      `"${(tx.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SMM_Nepal_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-start sm:items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white tracking-tight">Transaction Statement & Ledger</h1>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                Real-Time Auditing
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Comprehensive financial history covering QR deposits, order debits, child panel licenses, and referral payouts.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-neutral-700 transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('add_funds')}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>+ Deposit Funds (QR)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-400 font-medium">Available Balance</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-white">
            Rs. {user.balance.toLocaleString()}{' '}
            <span className="text-xs text-emerald-400 font-normal font-mono">NPR</span>
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px] pt-2 border-t border-neutral-800 text-neutral-400">
            <span>User Tier: <strong className="text-neutral-200">{user.tier}</strong></span>
            <span className="text-emerald-400 font-mono">Instant Use</span>
          </div>
        </div>

        {/* Total Verified Deposits */}
        <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4 shadow-xl relative overflow-hidden group hover:border-neutral-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-400 font-medium">Verified Deposits</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-white">
            Rs. {stats.totalDeposited.toLocaleString()}{' '}
            <span className="text-xs text-neutral-400 font-normal font-mono">NPR</span>
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px] pt-2 border-t border-neutral-800 text-neutral-400">
            <span>Fonepay / eSewa / Khalti</span>
            <span className="text-neutral-300 font-mono">0% Gateway Fee</span>
          </div>
        </div>

        {/* Total Spend */}
        <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4 shadow-xl relative overflow-hidden group hover:border-neutral-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-400 font-medium">Total Debited</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-white">
            Rs. {stats.totalSpent.toLocaleString()}{' '}
            <span className="text-xs text-neutral-400 font-normal font-mono">NPR</span>
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px] pt-2 border-t border-neutral-800 text-neutral-400">
            <span>Orders & Child Panels</span>
            <span className="text-neutral-300 font-mono">{transactions.length} Entries</span>
          </div>
        </div>

        {/* Pending Verification */}
        <div className={`rounded-2xl p-4 shadow-xl relative overflow-hidden transition ${
          stats.pendingCount > 0
            ? 'bg-amber-950/20 border border-amber-500/40'
            : 'bg-neutral-900/90 border border-neutral-800/90'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-400 font-medium">Pending Review</span>
            <div className={`h-8 w-8 rounded-lg border flex items-center justify-center ${
              stats.pendingCount > 0
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-mono font-black ${stats.pendingCount > 0 ? 'text-amber-400' : 'text-neutral-400'}`}>
            Rs. {stats.totalPending.toLocaleString()}{' '}
            <span className="text-xs font-normal font-mono">NPR</span>
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px] pt-2 border-t border-neutral-800 text-neutral-400">
            <span>{stats.pendingCount} Under Verification</span>
            {stats.pendingCount > 0 ? (
              <span className="text-amber-400 font-semibold animate-pulse">Reviewing</span>
            ) : (
              <span className="text-emerald-400 font-semibold">All Clear</span>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4 shadow-xl space-y-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Transaction ID, Reference code, Method, Phone, or Note..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="all">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending Review</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>

            {/* Method Dropdown */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="all">All Gateways</option>
              <option value="Fonepay">Fonepay</option>
              <option value="eSewa">eSewa</option>
              <option value="Khalti">Khalti</option>
              <option value="Bank Transfer (ConnectIPS)">ConnectIPS</option>
              <option value="IME Pay">IME Pay</option>
              <option value="Crypto (USDT TRC20)">Crypto (USDT)</option>
              <option value="Wallet Debit">Wallet Debit</option>
              <option value="Child Panel Hosting">Child Panel Hosting</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_high">Highest Amount</option>
              <option value="amount_low">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Classification Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-neutral-800/80">
          {[
            { id: 'all', label: 'All Transactions', count: transactions.length },
            {
              id: 'deposit',
              label: 'Deposits',
              count: transactions.filter((t) => getTxClassification(t) === 'Deposit').length,
            },
            {
              id: 'debit',
              label: 'Orders & Debits',
              count: transactions.filter((t) => getTxClassification(t) === 'Debit').length,
            },
            {
              id: 'child_panel',
              label: 'Child Panels',
              count: transactions.filter((t) => getTxClassification(t) === 'ChildPanel').length,
            },
            {
              id: 'referral',
              label: 'Referrals & Bonuses',
              count: transactions.filter((t) => getTxClassification(t) === 'Referral').length,
            },
          ].map((tab) => {
            const isActive = typeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTypeFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-500 text-neutral-950 font-bold'
                    : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-neutral-900/20 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Transactions Table & Mobile Cards */}
      <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Transaction Records
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              ({filteredTransactions.length} of {transactions.length})
            </span>
          </div>

          <span className="text-[11px] text-neutral-500 font-mono hidden sm:inline">
            Currency: NPR (Rs.)
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-neutral-800 border border-neutral-700 text-neutral-500 flex items-center justify-center mx-auto">
              <Receipt className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-white">No transactions found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || methodFilter !== 'all'
                ? 'No transactions match your current search and filter parameters. Try adjusting your query.'
                : 'Your transaction history is currently empty. Make your first deposit using Nepal QR payments.'}
            </p>
            <div className="pt-2 flex justify-center gap-2">
              {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || methodFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('all');
                    setStatusFilter('all');
                    setMethodFilter('all');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200"
                >
                  Reset Filters
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigateTab('add_funds')}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs"
              >
                + Deposit Funds
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Transaction ID & Ref</th>
                    <th className="py-3 px-4">Type & Gateway</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Amount (NPR)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {filteredTransactions.map((tx) => {
                    const classification = getTxClassification(tx);
                    const isDeposit = classification === 'Deposit' || classification === 'Referral';
                    const isPending = tx.status === 'Pending';
                    const isCopied = copiedTxId === tx.id;

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-neutral-950/50 transition group"
                      >
                        {/* ID & Ref */}
                        <td className="py-3.5 px-4 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-neutral-200">
                              {tx.transactionId || tx.id}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(tx.transactionId || tx.id, tx.id)}
                              className="text-neutral-500 hover:text-emerald-400 p-1 rounded hover:bg-neutral-800 transition"
                              title="Copy ID"
                            >
                              {isCopied ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          {tx.notes && (
                            <div className="text-[11px] text-neutral-400 font-sans truncate max-w-xs mt-0.5" title={tx.notes}>
                              {tx.notes}
                            </div>
                          )}
                          {tx.senderPhone && (
                            <div className="text-[10px] text-neutral-500 font-mono">
                              Sender: {tx.senderPhone} {tx.senderName ? `(${tx.senderName})` : ''}
                            </div>
                          )}
                        </td>

                        {/* Type & Gateway */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                              classification === 'Deposit'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : classification === 'ChildPanel'
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                                : classification === 'Referral'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            }`}>
                              {classification === 'Deposit' && <ArrowDownLeft className="w-3.5 h-3.5" />}
                              {classification === 'Debit' && <ShoppingCart className="w-3.5 h-3.5" />}
                              {classification === 'ChildPanel' && <Globe className="w-3.5 h-3.5" />}
                              {classification === 'Referral' && <Gift className="w-3.5 h-3.5" />}
                            </div>

                            <div>
                              <div className="font-semibold text-white flex items-center gap-1.5">
                                <span>{tx.method}</span>
                              </div>
                              <span className="text-[10px] text-neutral-400 uppercase font-mono">
                                {classification}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 font-mono text-neutral-400 whitespace-nowrap">
                          {tx.date}
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                          <div className={`font-black text-sm ${
                            isPending
                              ? 'text-amber-400'
                              : isDeposit
                              ? 'text-emerald-400'
                              : 'text-neutral-200'
                          }`}>
                            {isDeposit ? '+' : '-'}Rs. {tx.amount.toLocaleString()}
                            <span className="text-[10px] font-normal text-neutral-500 ml-1">NPR</span>
                          </div>
                          {tx.fee > 0 && (
                            <div className="text-[10px] text-neutral-500 font-normal">
                              Fee: Rs. {tx.fee}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {isPending ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                              Pending Verification
                            </span>
                          ) : tx.status === 'Completed' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-400 border border-neutral-700">
                              {tx.status}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {tx.screenshotUrl && (
                              <button
                                type="button"
                                onClick={() => setPreviewScreenshotUrl(tx.screenshotUrl!)}
                                className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-300 flex items-center gap-1 cursor-pointer transition border border-neutral-700"
                                title="View Attached Receipt Screenshot"
                              >
                                <ImageIcon className="w-3 h-3 text-emerald-400" />
                                <span>Proof</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedReceiptTx(tx)}
                              className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-300 flex items-center gap-1 cursor-pointer transition"
                              title="View Full Digital Receipt"
                            >
                              <Eye className="w-3 h-3 text-neutral-400" />
                              <span>Receipt</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-neutral-800">
              {filteredTransactions.map((tx) => {
                const classification = getTxClassification(tx);
                const isDeposit = classification === 'Deposit' || classification === 'Referral';
                const isPending = tx.status === 'Pending';
                const isCopied = copiedTxId === tx.id;

                return (
                  <div key={tx.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                          classification === 'Deposit'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : classification === 'ChildPanel'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        }`}>
                          {classification === 'Deposit' && <ArrowDownLeft className="w-4 h-4" />}
                          {classification === 'Debit' && <ShoppingCart className="w-4 h-4" />}
                          {classification === 'ChildPanel' && <Globe className="w-4 h-4" />}
                          {classification === 'Referral' && <Gift className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{tx.method}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{tx.date}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`font-black font-mono text-sm ${
                          isPending ? 'text-amber-400' : isDeposit ? 'text-emerald-400' : 'text-neutral-200'
                        }`}>
                          {isDeposit ? '+' : '-'}Rs. {tx.amount.toLocaleString()}
                        </div>
                        <div className="mt-0.5">
                          {isPending ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                              Pending
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-[11px] font-mono space-y-1">
                      <div className="flex items-center justify-between text-neutral-400">
                        <span>Ref / ID:</span>
                        <div className="flex items-center gap-1 text-white font-bold">
                          <span>{tx.transactionId || tx.id}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(tx.transactionId || tx.id, tx.id)}
                            className="text-neutral-500 hover:text-emerald-400 p-0.5"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      {tx.notes && (
                        <div className="text-neutral-400 font-sans pt-1 border-t border-neutral-900">
                          {tx.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        {tx.screenshotUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewScreenshotUrl(tx.screenshotUrl!)}
                            className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-300 flex items-center gap-1"
                          >
                            <ImageIcon className="w-3 h-3 text-emerald-400" />
                            <span>Proof</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedReceiptTx(tx)}
                          className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-300 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Digital Receipt Modal */}
      {selectedReceiptTx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3.5">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Digital Payment Receipt</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptTx(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 font-mono text-xs">
              <div className="text-center pb-3 border-b border-neutral-800 space-y-1">
                <div className="text-emerald-400 font-bold text-base tracking-wider uppercase">
                  {systemSettings?.siteName || 'SMM Panel Nepal'}
                </div>
                <div className="text-[10px] text-neutral-500">
                  Kathmandu, Nepal • Official Payment Node
                </div>
                <div className="text-[10px] text-neutral-400 pt-1">
                  Tax Invoice / Transaction Voucher
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Transaction ID:</span>
                  <span className="text-white font-bold">{selectedReceiptTx.transactionId || selectedReceiptTx.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Payment Gateway:</span>
                  <span className="text-emerald-400 font-bold">{selectedReceiptTx.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Date & Time:</span>
                  <span className="text-neutral-300">{selectedReceiptTx.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Account User:</span>
                  <span className="text-neutral-300">{user.username} ({user.email})</span>
                </div>
                {selectedReceiptTx.senderPhone && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Sender Phone:</span>
                    <span className="text-neutral-300">{selectedReceiptTx.senderPhone}</span>
                  </div>
                )}
                {selectedReceiptTx.notes && (
                  <div className="flex justify-between pt-1 border-t border-neutral-900">
                    <span className="text-neutral-400">Particulars:</span>
                    <span className="text-neutral-300 font-sans max-w-[200px] text-right truncate">
                      {selectedReceiptTx.notes}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-dashed border-neutral-800 space-y-1.5">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-white">Total Amount:</span>
                  <span className="text-emerald-400">
                    Rs. {selectedReceiptTx.amount.toLocaleString()} NPR
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-500">
                  <span>Processing Fee:</span>
                  <span>Rs. {selectedReceiptTx.fee || 0} NPR</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-400 pt-1">
                  <span>Status:</span>
                  <span className={`font-bold ${selectedReceiptTx.status === 'Completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {selectedReceiptTx.status === 'Completed' ? '✓ VERIFIED & SETTLED' : '⏳ PENDING REVIEW'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-neutral-400" />
                <span>Print Voucher</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedReceiptTx(null)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Screenshot Modal Viewer */}
      {previewScreenshotUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                Payment Proof Screenshot
              </span>
              <button
                onClick={() => setPreviewScreenshotUrl(null)}
                className="text-neutral-400 hover:text-white cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center max-h-[480px]">
              <img
                src={previewScreenshotUrl}
                alt="Payment Receipt Large"
                className="max-h-[460px] w-auto object-contain"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewScreenshotUrl(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-white font-medium cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
