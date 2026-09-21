import { useState, useMemo } from 'react';
import {
  List,
  Search,
  CheckCircle,
  Clock,
  ShieldCheck,
  Zap,
  Info,
  SlidersHorizontal,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { SMMService, ServiceCategory, ServiceType } from '../types';

interface ServicesTabProps {
  services: SMMService[];
  onSelectServiceToOrder: (service: SMMService) => void;
}

export function ServicesTab({ services, onSelectServiceToOrder }: ServicesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [selectedModalService, setSelectedModalService] = useState<SMMService | null>(null);

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

  const types: (ServiceType | 'All')[] = [
    'All',
    'Followers',
    'Likes',
    'Views',
    'Subscribers',
    'Watch Time',
    'Custom Comments',
    'Members',
  ];

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        s.serviceId.toString().includes(searchTerm) ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = categoryFilter === 'All' || s.category === categoryFilter;
      const matchType = typeFilter === 'All' || s.type === typeFilter;

      return matchSearch && matchCategory && matchType;
    });
  }, [services, searchTerm, categoryFilter, typeFilter]);

  return (
    <div className="space-y-5">
      {/* Search & Filter Header */}
      <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            id="services-search-input"
            type="text"
            placeholder="Search by ID or service name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-300">
            <span className="text-neutral-500">Platform:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-neutral-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Type Dropdown */}
          <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-300">
            <span className="text-neutral-500">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
            >
              {types.map((t) => (
                <option key={t} value={t} className="bg-neutral-900 text-white">
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-950/80 border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Service Name</th>
                <th className="py-3 px-4">Rate / 1K</th>
                <th className="py-3 px-4">Min / Max</th>
                <th className="py-3 px-4">Average Time</th>
                <th className="py-3 px-4">Refill</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-xs">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    No services found matching filters.
                  </td>
                </tr>
              ) : (
                filteredServices.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-800/40 transition">
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-400">
                      #{s.serviceId}
                    </td>

                    {/* Service Name & Badges */}
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-emerald-400 font-mono">
                          {s.category}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-800/60 text-neutral-300">
                          {s.type}
                        </span>
                        {s.isPopular && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Popular
                          </span>
                        )}
                      </div>
                      <div className="font-medium text-neutral-100 text-xs leading-snug">
                        {s.name}
                      </div>
                    </td>

                    {/* Rate per 1K */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                      Rs. {s.ratePer1k.toFixed(2)}{' '}
                      <span className="text-[10px] text-neutral-400 font-normal">NPR</span>
                    </td>

                    {/* Min / Max */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-300 whitespace-nowrap">
                      {s.minQuantity.toLocaleString()} / {s.maxQuantity.toLocaleString()}
                    </td>

                    {/* Average Time */}
                    <td className="py-3.5 px-4 text-neutral-300 whitespace-nowrap text-xs">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{s.averageTime}</span>
                      </div>
                    </td>

                    {/* Refill Guarantee */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {s.refill ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> {s.refillDays || 30}d Refill
                        </span>
                      ) : (
                        <span className="text-[11px] text-neutral-500">No Refill</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedModalService(s)}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
                          title="View Details"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectServiceToOrder(s)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-500/20"
                        >
                          <span>Order</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Details Modal */}
      {selectedModalService && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[11px] font-mono text-emerald-400">
                  Service #{selectedModalService.serviceId} • {selectedModalService.category}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedModalService.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedModalService(null)}
                className="text-neutral-500 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-neutral-300 leading-relaxed">
                {selectedModalService.description}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block">Rate Per 1,000</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    Rs. {selectedModalService.ratePer1k.toFixed(2)} NPR
                  </span>
                </div>
                <div className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block">Delivery Speed</span>
                  <span className="text-xs font-semibold text-neutral-200">
                    {selectedModalService.speed}
                  </span>
                </div>
                <div className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block">Min / Max Quantity</span>
                  <span className="text-xs font-mono text-neutral-200">
                    {selectedModalService.minQuantity.toLocaleString()} - {selectedModalService.maxQuantity.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block">Refill Policy</span>
                  <span className="text-xs font-semibold text-emerald-400">
                    {selectedModalService.refill ? `${selectedModalService.refillDays} Days Auto-Refill` : 'No Refill'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setSelectedModalService(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const s = selectedModalService;
                  setSelectedModalService(null);
                  onSelectServiceToOrder(s);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs shadow-lg shadow-emerald-500/25 cursor-pointer"
              >
                Place Order with this Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
