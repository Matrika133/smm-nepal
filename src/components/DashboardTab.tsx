import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Zap,
  Globe,
  Bell,
  Wallet,
  ShieldCheck,
  Flame,
  ArrowUpRight,
  Activity,
  AlertTriangle,
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { UserAccount, SMMOrder, SMMService, BroadcastNotification, SystemSettings } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface DashboardTabProps {
  user: UserAccount;
  orders: SMMOrder[];
  services: SMMService[];
  notices: BroadcastNotification[];
  onNavigateTab: (tab: any) => void;
  onQuickOrder: (service: SMMService) => void;
  systemSettings?: SystemSettings;
}

export function DashboardTab({
  user,
  orders,
  services,
  notices,
  onNavigateTab,
  onQuickOrder,
  systemSettings,
}: DashboardTabProps) {
  // Compute analytics
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'In progress' || o.status === 'Processing' || o.status === 'Pending'
  ).length;

  const completedOrdersCount = orders.filter((o) => o.status === 'Completed').length;
  const isLowBalance = user.balance < 50;
  const popularServices = services.filter((s) => s.isPopular).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Broadcast Notice Banner */}
      {notices.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-950/50 via-neutral-900 to-neutral-900 border border-emerald-500/30 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-300">{notices[0].title}</h4>
              <p className="text-xs text-neutral-300 font-sans mt-0.5">{notices[0].message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('new_order')}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs shrink-0 cursor-pointer transition shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Start Order</span>
            </button>
          </div>
        </div>
      )}



      {/* QUICK STATS SECTION: AT-A-GLANCE MONITORING */}
      <section id="quick-stats-section" aria-label="Quick Stats Overview" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Account Quick Stats
            </h2>
          </div>
          <span className="text-[11px] text-neutral-500 font-mono flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Remaining Balance */}
          <div
            id="quick-stat-remaining-balance"
            className={`rounded-2xl p-5 border shadow-xl relative overflow-hidden transition group ${
              isLowBalance
                ? 'bg-gradient-to-br from-amber-950/40 via-neutral-900 to-neutral-900 border-amber-500/50 hover:border-amber-400'
                : 'bg-neutral-900/90 border-neutral-800/90 hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-400">Remaining Balance</span>
                {isLowBalance && (
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded uppercase">
                    Low
                  </span>
                )}
              </div>
              <div
                className={`h-9 w-9 rounded-xl border flex items-center justify-center ${
                  isLowBalance
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}
              >
                <Wallet className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tight flex items-baseline gap-1.5">
                <span>Rs. {user.balance.toLocaleString()}</span>
                <span className="text-xs font-mono font-semibold text-emerald-400">NPR</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                {isLowBalance
                  ? 'Balance is below 50 NPR. Top up for uninterrupted auto-fulfillment.'
                  : 'Ready for instant order execution with zero hold.'}
              </p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-800 text-[11px]">
              <span className="text-neutral-500 font-mono">
                Tier: <strong className="text-neutral-300">{user.tier}</strong>
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab('add_funds')}
                className={`font-bold flex items-center gap-1 transition cursor-pointer px-2.5 py-1 rounded-lg ${
                  isLowBalance
                    ? 'bg-amber-500 text-neutral-950 hover:bg-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <span>+ Add Funds (QR)</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 2: Active Orders */}
          <div
            id="quick-stat-active-orders"
            className="bg-neutral-900/90 border border-neutral-800/90 hover:border-amber-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-400">Active Orders</span>
                {activeOrdersCount > 0 && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                )}
              </div>
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-mono font-black text-amber-400 tracking-tight flex items-baseline gap-1.5">
                <span>{activeOrdersCount}</span>
                <span className="text-xs font-mono font-normal text-neutral-400">In-Flight</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                {activeOrdersCount > 0
                  ? `${activeOrdersCount} order(s) currently being dispatched through SMM server nodes.`
                  : 'All placed orders are complete. Ready for new submissions.'}
              </p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-800 text-[11px]">
              <span className="text-neutral-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 font-mono font-semibold">{completedOrdersCount}</span> Completed
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab('orders')}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition cursor-pointer px-2 py-0.5"
              >
                <span>Track Live</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 3: Total Spent */}
          <div
            id="quick-stat-total-spent"
            className="bg-neutral-900/90 border border-neutral-800/90 hover:border-blue-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-neutral-400">Total Spent (Lifetime)</span>
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tight flex items-baseline gap-1.5">
                <span>Rs. {user.totalSpent.toLocaleString()}</span>
                <span className="text-xs font-mono font-semibold text-blue-400">NPR</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Total investment across {orders.length} orders placed with wholesale VIP rates.
              </p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-800 text-[11px]">
              <span className="text-neutral-400">
                Discount: <strong className="text-neutral-200 font-mono">35% VIP Applied</strong>
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab('transactions')}
                className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition cursor-pointer px-2 py-0.5"
              >
                <span>Transactions</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Quick Order Recommendations & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Popular Fast Services (6 cols) */}
        <div className="lg:col-span-6 bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Trending SMM Services (Nepal & Global)
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('services')}
              className="text-xs text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              All Services ({services.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {popularServices.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 hover:border-emerald-500/40 transition flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-emerald-400 font-semibold">
                      {s.category}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      Speed: {s.averageTime}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-neutral-100 truncate group-hover:text-white transition">
                    {s.name}
                  </h4>
                  <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                    Rs. {s.ratePer1k.toFixed(2)} / 1,000{' '}
                    <span className="text-neutral-500 text-[10px] font-normal">
                      (Min {s.minQuantity.toLocaleString()})
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onQuickOrder(s)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs shrink-0 cursor-pointer shadow-md shadow-emerald-500/20 flex items-center gap-1"
                >
                  <span>Order</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Live Orders (6 cols) */}
        <div className="lg:col-span-6 bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Live Order Activity
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              View Full History
            </button>
          </div>

          <div className="space-y-2.5">
            {orders.length === 0 ? (
              <div className="py-8 text-center bg-neutral-950 border border-neutral-800/80 rounded-xl px-4">
                <ShoppingCart className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-neutral-300">No Orders in Queue</h4>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Ready to boost your socials? Select any high-speed service from the left to place your first order.
                </p>
                <button
                  onClick={() => onNavigateTab('new_order')}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>New SMM Order</span>
                </button>
              </div>
            ) : (
              orders.slice(0, 4).map((ord) => (
                <div
                  key={ord.id}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5 font-mono">
                      <span className="font-bold text-white">#{ord.orderId}</span>
                      <span className="text-[10px] text-neutral-400">{ord.createdAt}</span>
                    </div>
                    <div className="text-neutral-300 font-medium truncate">
                      {ord.serviceName}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                      Qty: <strong className="text-white">{ord.quantity.toLocaleString()}</strong> • Charge: <strong className="text-emerald-400">Rs. {ord.charge.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        ord.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : ord.status === 'In progress'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Child Panel Reseller Callout Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start sm:items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                Reseller Cloud
              </span>
              <h3 className="text-sm font-bold text-white">
                Launch Your Own SMM Website with a Child Panel
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl">
              Connect your own custom domain, set your own profit margin percentage, and let {systemSettings?.siteName || 'SMM Panel Nepal'} handle all automatic order dispatching.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('child_panel')}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
        >
          <Globe className="w-4 h-4" />
          <span>Explore Child Panels</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
