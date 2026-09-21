import {
  Sparkles,
  Zap,
  TrendingUp,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Layers,
  ArrowRight
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { SMMService, ServiceCategory, SMMOrder, UserAccount } from '../types';

interface NewOrderTabProps {
  services: SMMService[];
  user: UserAccount;
  onPlaceOrder: (order: Omit<SMMOrder, 'id' | 'orderId' | 'status' | 'createdAt' | 'startCount' | 'remains'>) => boolean;
  onSelectServiceDetails: (service: SMMService) => void;
}

export function NewOrderTab({
  services,
  user,
  onPlaceOrder,
  onSelectServiceDetails,
}: NewOrderTabProps) {
  const categories: ServiceCategory[] = [
    'Instagram',
    'TikTok',
    'YouTube',
    'Facebook',
    'Telegram',
    'X (Twitter)',
    'Spotify',
  ];

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('Instagram');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('ig-101');
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState<number>(1000);
  const [customComments, setCustomComments] = useState('');
  const [dripFeedEnabled, setDripFeedEnabled] = useState(false);
  const [runs, setRuns] = useState(4);
  const [intervalMinutes, setIntervalMinutes] = useState(30);

  const [orderSuccessMsg, setOrderSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Available services in selected category
  const filteredServices = useMemo(() => {
    return services.filter((s) => s.category === selectedCategory);
  }, [services, selectedCategory]);

  // Selected service object
  const currentService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId) || filteredServices[0] || services[0];
  }, [services, selectedServiceId, filteredServices]);

  // When category changes, auto select first service in category
  const handleCategoryChange = (cat: ServiceCategory) => {
    setSelectedCategory(cat);
    const firstInCat = services.find((s) => s.category === cat);
    if (firstInCat) {
      setSelectedServiceId(firstInCat.id);
      setQuantity(Math.max(firstInCat.minQuantity, 1000));
    }
  };

  // Calculate total charge
  const totalQuantity = dripFeedEnabled ? quantity * runs : quantity;
  const totalCost = (currentService.ratePer1k * (totalQuantity / 1000));

  const handleQuickQty = (amount: number) => {
    setQuantity(Math.max(currentService.minQuantity, Math.min(amount, currentService.maxQuantity)));
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setOrderSuccessMsg('');

    if (!link.trim()) {
      setErrorMsg('Please provide a valid target URL or profile link.');
      return;
    }

    if (quantity < currentService.minQuantity) {
      setErrorMsg(`Minimum quantity for this service is ${currentService.minQuantity.toLocaleString()}`);
      return;
    }

    if (quantity > currentService.maxQuantity) {
      setErrorMsg(`Maximum quantity for this service is ${currentService.maxQuantity.toLocaleString()}`);
      return;
    }

    if (user.balance < totalCost) {
      setErrorMsg(`Insufficient balance (Rs. ${user.balance.toLocaleString()} NPR). Total cost is Rs. ${totalCost.toFixed(2)} NPR. Please deposit funds in the Add Funds tab via QR.`);
      return;
    }

    const commentsList = currentService.type === 'Custom Comments'
      ? customComments.split('\n').map((c) => c.trim()).filter(Boolean)
      : undefined;

    const success = onPlaceOrder({
      serviceId: currentService.id,
      serviceName: currentService.name,
      category: currentService.category,
      link: link.trim(),
      quantity: totalQuantity,
      charge: Number(totalCost.toFixed(2)),
      dripFeed: dripFeedEnabled ? { runs, intervalMinutes, completedRuns: 0 } : undefined,
      customComments: commentsList,
    });

    if (success) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
      setOrderSuccessMsg(`Order placed successfully! ${totalQuantity.toLocaleString()} ${currentService.type} queued for dispatch.`);
      setLink('');
      setCustomComments('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Form (7 cols) */}
      <div className="lg:col-span-7 bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Place New SMM Order</h2>
              <p className="text-xs text-neutral-400">Instant dispatch • 24/7 automated delivery nodes</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-neutral-400 block">Available Balance</span>
            <span className="text-sm font-mono font-bold text-emerald-400">Rs. {user.balance.toLocaleString()} NPR</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-300 block uppercase tracking-wider">
            1. Select Platform Category
          </label>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-neutral-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                }`}
              >
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmitOrder} className="space-y-4">
          {/* Service Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
              <span>2. Choose Service Package</span>
              <span className="text-[11px] text-emerald-400 font-mono">
                Rs. {currentService.ratePer1k.toFixed(2)} per 1,000
              </span>
            </label>
            <select
              id="smm-service-select"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition leading-relaxed"
            >
              {filteredServices.map((s) => (
                <option key={s.id} value={s.id}>
                  #{s.serviceId} - {s.name} (Rs. {s.ratePer1k.toFixed(2)}/1K)
                </option>
              ))}
            </select>
          </div>

          {/* Link Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
              <span>3. Target Link / URL</span>
              <span className="text-[11px] text-neutral-500">Public profile or post URL</span>
            </label>
            <input
              id="smm-order-link-input"
              type="text"
              required
              placeholder="e.g. https://instagram.com/p/C9x81_qLM2 or https://tiktok.com/@username"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 font-mono transition"
            />
          </div>

          {/* Custom comments textarea if service requires it */}
          {currentService.type === 'Custom Comments' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                <span>Custom Comments (1 per line)</span>
                <span className="text-[11px] text-neutral-500">
                  {customComments.split('\n').filter((l) => l.trim().length > 0).length} comments entered
                </span>
              </label>
              <textarea
                rows={3}
                placeholder="Great post! 🔥&#10;Loved this content 👏&#10;Awesome share!"
                value={customComments}
                onChange={(e) => {
                  setCustomComments(e.target.value);
                  const count = e.target.value.split('\n').filter((l) => l.trim().length > 0).length;
                  if (count > 0) setQuantity(count);
                }}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono transition"
              />
            </div>
          )}

          {/* Quantity Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300">
                4. Quantity
              </label>
              <div className="text-[11px] text-neutral-400 font-mono">
                Min: <span className="text-white font-semibold">{currentService.minQuantity.toLocaleString()}</span> — Max:{' '}
                <span className="text-white font-semibold">{currentService.maxQuantity.toLocaleString()}</span>
              </div>
            </div>
            <input
              id="smm-order-quantity-input"
              type="number"
              min={currentService.minQuantity}
              max={currentService.maxQuantity}
              step={10}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 transition"
            />
            {/* Quick amount chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[100, 500, 1000, 2500, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickQty(amt)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 hover:border-emerald-500/40 transition cursor-pointer"
                >
                  +{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Drip-Feed Option */}
          {currentService.dripFeedAvailable && (
            <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={dripFeedEnabled}
                    onChange={(e) => setDripFeedEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-neutral-900 border-neutral-700 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-neutral-200">Enable Drip-Feed (Natural Pacing)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                  Recommended for Safety
                </span>
              </label>

              {dripFeedEnabled && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800/80">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Runs (Batches)</label>
                    <input
                      type="number"
                      min={2}
                      max={50}
                      value={runs}
                      onChange={(e) => setRuns(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Interval (Minutes)</label>
                    <input
                      type="number"
                      min={5}
                      max={1440}
                      value={intervalMinutes}
                      onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <p className="col-span-2 text-[10px] text-neutral-400 font-mono">
                    Total delivery: {quantity.toLocaleString()} × {runs} runs = {(quantity * runs).toLocaleString()} {currentService.type} every {intervalMinutes} mins.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pricing Calculation Summary */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-neutral-950 border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-400 block">Total Order Charge</span>
              <div className="text-lg sm:text-xl font-mono font-black text-emerald-400">
                Rs. {totalCost.toFixed(2)} <span className="text-xs text-neutral-400 font-normal">NPR</span>
              </div>
            </div>

            <button
              id="btn-submit-smm-order"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition cursor-pointer flex items-center gap-2"
            >
              <span>Submit Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {orderSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{orderSuccessMsg}</span>
            </div>
          )}
        </form>
      </div>

      {/* Right Service Details & Guarantees (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        {/* Service Specs Card */}
        <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-400" /> Package Specifications
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-emerald-400 font-mono">
              #{currentService.serviceId}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-neutral-100 leading-snug">
            {currentService.name}
          </h3>

          <p className="text-xs text-neutral-300 leading-relaxed font-sans bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
            {currentService.description}
          </p>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-0.5">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Start Speed</span>
              <span className="font-semibold text-neutral-200">{currentService.averageTime}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-0.5">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Delivery Speed</span>
              <span className="font-semibold text-neutral-200">{currentService.speed}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-0.5">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Guarantee / Refill</span>
              <span className="font-semibold text-emerald-400">
                {currentService.refill ? `✅ ${currentService.refillDays || 30} Days Auto-Refill` : '❌ No Refill'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-0.5">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Safety Status</span>
              <span className="font-semibold text-emerald-400">100% Monetization Safe</span>
            </div>
          </div>
        </div>

        {/* Quick Instructions & Nepal Local Payments Support */}
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-400" /> Order Tips
          </h4>
          <ul className="text-xs text-neutral-300 space-y-2 list-disc list-inside leading-relaxed font-sans">
            <li>Ensure target account/post is set to <strong>Public</strong> (not private) before ordering.</li>
            <li>Do not change your username or URL while an order is in progress.</li>
            <li>Use <strong>Drip-Feed</strong> for large orders (10K+) to simulate natural viral growth spikes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
