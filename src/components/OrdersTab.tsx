import { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  CheckCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Filter,
  Zap,
  Tag,
  ShoppingCart,
  ArrowRight
} from 'lucide-react';
import { SMMOrder, OrderStatus, ServiceCategory } from '../types';

interface OrdersTabProps {
  orders: SMMOrder[];
  onRefillOrder: (orderId: number) => void;
  onCancelOrder?: (orderId: number) => void;
  onNavigateToNewOrder?: () => void;
}

export function OrdersTab({ orders, onRefillOrder, onNavigateToNewOrder }: OrdersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const statuses: (OrderStatus | 'All')[] = [
    'All',
    'Pending',
    'In progress',
    'Processing',
    'Completed',
    'Partial',
    'Canceled',
  ];

  const categories: (ServiceCategory | 'All')[] = [
    'All',
    'Instagram',
    'TikTok',
    'YouTube',
    'Facebook',
    'Telegram',
    'X (Twitter)',
    'Spotify',
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchSearch =
        ord.orderId.toString().includes(searchTerm) ||
        ord.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.link.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'All' || ord.status === statusFilter;
      const matchCategory = categoryFilter === 'All' || ord.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [orders, searchTerm, statusFilter, categoryFilter]);

  const copyOrderId = (id: number) => {
    navigator.clipboard.writeText(id.toString());
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'In progress':
      case 'Processing':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse';
      case 'Pending':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Canceled':
      case 'Refunded':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'Partial':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Bar */}
      <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            id="orders-search-input"
            type="text"
            placeholder="Search by Order ID, link, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status filter dropdown */}
          <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-300">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
            >
              {statuses.map((st) => (
                <option key={st} value={st} className="bg-neutral-900 text-white">
                  Status: {st}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter dropdown */}
          <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-300">
            <Tag className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-neutral-900 text-white">
                  Platform: {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-950/80 border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Service & Target Link</th>
                <th className="py-3 px-4">Charge</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Start / Remains</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="h-12 w-12 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                        <ShoppingCart className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-neutral-300">
                        {orders.length === 0 ? 'No SMM Orders Placed Yet' : 'No Orders Match Your Filters'}
                      </h4>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        {orders.length === 0
                          ? 'Your order history is completely clean. Choose from high-speed Instagram, TikTok, YouTube, or Telegram services to start boosting!'
                          : 'Try changing your search terms, platform category filter, or status filter above.'}
                      </p>
                      {onNavigateToNewOrder && (
                        <button
                          type="button"
                          onClick={onNavigateToNewOrder}
                          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Place Your First Order</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-neutral-800/40 transition">
                    {/* Order ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <span>#{ord.orderId}</span>
                        <button
                          onClick={() => copyOrderId(ord.orderId)}
                          title="Copy Order ID"
                          className="p-1 hover:text-emerald-400 text-neutral-500 transition cursor-pointer"
                        >
                          {copiedId === ord.orderId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-neutral-400 whitespace-nowrap font-mono text-[11px]">
                      {ord.createdAt}
                    </td>

                    {/* Service & Link */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-neutral-200 line-clamp-1">
                        {ord.serviceName}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <a
                          href={ord.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline font-mono truncate max-w-[200px]"
                        >
                          {ord.link}
                        </a>
                        <ExternalLink className="w-3 h-3 text-neutral-500 shrink-0" />
                      </div>
                      {ord.dripFeed && (
                        <span className="inline-block mt-1 text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300 font-mono">
                          Drip-Feed: {ord.dripFeed.completedRuns}/{ord.dripFeed.runs} runs
                        </span>
                      )}
                    </td>

                    {/* Charge */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      Rs. {ord.charge.toFixed(2)}
                    </td>

                    {/* Quantity */}
                    <td className="py-3.5 px-4 font-mono text-neutral-200">
                      {ord.quantity.toLocaleString()}
                    </td>

                    {/* Start / Remains */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-400 whitespace-nowrap">
                      <div>Start: <span className="text-white">{ord.startCount}</span></div>
                      <div>Remains: <span className="text-white">{ord.remains}</span></div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                          ord.status
                        )}`}
                      >
                        {ord.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onRefillOrder(ord.orderId)}
                        className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-emerald-400 text-xs font-medium border border-neutral-700 transition cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Refill</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
