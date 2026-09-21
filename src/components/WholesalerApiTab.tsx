import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  RefreshCw,
  Zap,
  Key,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ShoppingCart,
  DollarSign,
  Activity,
  Layers,
  Send,
  Sliders,
  Check,
  X,
  ExternalLink,
  Clock,
  AlertCircle,
  Wifi,
  WifiOff,
  CheckCircle,
  Server
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WholesalerProvider, SMMOrder, SMMService } from '../types';

interface WholesalerApiTabProps {
  providers: WholesalerProvider[];
  services: SMMService[];
  orders: SMMOrder[];
  onUpdateProviders: (providers: WholesalerProvider[]) => void;
  onUpdateOrders: (orders: SMMOrder[]) => void;
  onUpdateServices: (services: SMMService[]) => void;
  showToast: (msg: string) => void;
  usdToNprRate?: number;
}

const SMM_PROVIDER_PRESETS = [
  { name: 'JustAnotherPanel (JAP)', apiUrl: 'https://justanotherpanel.com/api/v2' },
  { name: 'Peakerr', apiUrl: 'https://peakerr.com/api/v2' },
  { name: 'SMMFollowers', apiUrl: 'https://smmfollowers.com/api/v2' },
  { name: 'Secsers', apiUrl: 'https://secsers.com/api/v2' },
  { name: 'BulkSMM Panel', apiUrl: 'https://bulksmm.com/api/v2' },
  { name: 'Custom SMM v2 Node', apiUrl: 'https://api.smmprovider.com/v2' },
];

export function WholesalerApiTab({
  providers,
  services,
  orders,
  onUpdateProviders,
  onUpdateOrders,
  onUpdateServices,
  showToast,
  usdToNprRate,
}: WholesalerApiTabProps) {
  const effectiveUsdRate = usdToNprRate || (JSON.parse(localStorage.getItem('smm_nepal_system_settings') || '{}').usdToNprRate) || 136.5;

  const getNprEquivalent = (balance: number = 0, currency: string = 'USD') => {
    const curr = (currency || 'USD').toUpperCase();
    if (curr === 'INR') return balance * 1.6;
    if (curr === 'NPR') return balance;
    return balance * effectiveUsdRate;
  };

  const [selectedProvider, setSelectedProvider] = useState<WholesalerProvider>(
    providers[0] || {
      id: 'prov-new',
      name: 'Custom SMM Wholesaler Provider',
      apiUrl: 'https://justanotherpanel.com/api/v2',
      apiKey: '',
      status: 'active',
      balance: 0,
      currency: 'USD',
      autoDispatch: true,
      serviceMapping: {},
    }
  );

  const [isAddProviderModalOpen, setIsAddProviderModalOpen] = useState(false);
  const [isEditProviderModalOpen, setIsEditProviderModalOpen] = useState(false);
  const [providerForm, setProviderForm] = useState<Partial<WholesalerProvider>>({
    name: '',
    apiUrl: 'https://justanotherpanel.com/api/v2',
    apiKey: '',
    status: 'active',
    autoDispatch: true,
    currency: 'USD',
    notes: '',
    testMode: false,
  });

  const [isTestingBalance, setIsTestingBalance] = useState(false);
  const [isSyncingServices, setIsSyncingServices] = useState(false);
  const [isSyncingOrders, setIsSyncingOrders] = useState(false);
  const [isSendingTestOrder, setIsSendingTestOrder] = useState(false);
  const [activeTabSub, setActiveTabSub] = useState<'providers' | 'mapping' | 'test_order' | 'synced_services' | 'orders_log'>('providers');

  // Connection Test State
  const [connectionTestResult, setConnectionTestResult] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error';
    latencyMs?: number;
    message?: string;
    error?: string;
    details?: string;
  }>({ status: 'idle' });

  // Test Order Form
  const [testOrderForm, setTestOrderForm] = useState({
    serviceId: '1001',
    link: 'https://instagram.com/nepal_creator',
    quantity: 100,
  });
  const [testOrderResult, setTestOrderResult] = useState<any>(null);

  // Sync / Fetch Wholesaler Services
  const [fetchedServices, setFetchedServices] = useState<any[]>([]);
  const [selectedServicesToImport, setSelectedServicesToImport] = useState<number[]>([]);
  const [importMarkupPercent, setImportMarkupPercent] = useState<number>(35);
  const [importUsdRate, setImportUsdRate] = useState<number>(136.5);
  const [importCategoryFilter, setImportCategoryFilter] = useState<string>('all');
  const [importSearchTerm, setImportSearchTerm] = useState<string>('');
  const [isImportingServices, setIsImportingServices] = useState(false);

  // Test Connection to Provider API
  const handleTestConnection = async (targetProvider?: WholesalerProvider | Partial<WholesalerProvider>) => {
    const prov = targetProvider || selectedProvider;
    if (!prov.apiUrl) {
      showToast('API URL is required to test connection.');
      return;
    }
    setConnectionTestResult({ status: 'testing' });
    try {
      const res = await fetch('/api/wholesaler/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiUrl: prov.apiUrl,
          apiKey: prov.apiKey || '',
          name: prov.name || 'Wholesaler',
          usdToNprRate: effectiveUsdRate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const balNum = typeof data.balance === 'number' ? data.balance : parseFloat(data.balance || 0);
        const curr = data.currency || 'USD';
        const balNpr = data.balanceNpr || getNprEquivalent(balNum, curr);

        setConnectionTestResult({
          status: 'success',
          latencyMs: data.latencyMs,
          message: data.message,
          details: `Endpoint: ${data.endpointUsed} • Ping: ${data.latencyMs}ms • Balance: $${balNum.toFixed(2)} ${curr} (≈ Rs. ${balNpr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NPR)`,
        });
        showToast(`✅ ${prov.name || 'Provider'} Connected! Balance: $${balNum.toFixed(2)} ${curr} (≈ Rs. ${balNpr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NPR)`);

        // If testing active provider and balance came back, update state
        if (targetProvider && 'id' in targetProvider && targetProvider.id === selectedProvider.id && data.balance !== undefined) {
          const updated = providers.map((p) =>
            p.id === selectedProvider.id
              ? {
                  ...p,
                  balance: balNum,
                  currency: curr,
                  balanceNpr: balNpr,
                  status: 'active' as const,
                  lastSync: 'Just now',
                }
              : p
          );
          onUpdateProviders(updated);
          setSelectedProvider((prev) => ({
            ...prev,
            balance: balNum,
            currency: curr,
            balanceNpr: balNpr,
            status: 'active',
            lastSync: 'Just now',
          }));
        }
      } else {
        setConnectionTestResult({
          status: 'error',
          error: data.error || 'Connection rejected by external provider endpoint.',
          details: `Endpoint: ${data.endpointUsed || prov.apiUrl} • ${data.message || ''}`,
        });
        showToast(`❌ API Error: ${data.error || 'Provider rejected connection'}`);
      }
    } catch (err: any) {
      setConnectionTestResult({
        status: 'error',
        error: err.message || 'Network failure communicating with API proxy.',
      });
      showToast(`❌ Connection failure: ${err.message}`);
    }
  };

  // Handle Save New Provider
  const handleSaveNewProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerForm.name || !providerForm.apiUrl) {
      alert('Please fill provider name and API endpoint.');
      return;
    }

    const newProv: WholesalerProvider = {
      id: `prov-${Date.now()}`,
      name: providerForm.name,
      apiUrl: providerForm.apiUrl.trim(),
      apiKey: (providerForm.apiKey || '').trim(),
      status: (providerForm.status as any) || 'active',
      balance: 0,
      currency: providerForm.currency || 'USD',
      autoDispatch: providerForm.autoDispatch ?? true,
      serviceMapping: {},
      lastSync: 'Just created',
      notes: providerForm.notes || '',
      testMode: providerForm.testMode ?? false,
    };

    const updated = [newProv, ...providers];
    onUpdateProviders(updated);
    setSelectedProvider(newProv);
    setIsAddProviderModalOpen(false);
    showToast(`Wholesaler Provider "${newProv.name}" added successfully.`);

    // Automatically test balance in background
    setTimeout(() => {
      handleTestConnection(newProv);
    }, 300);
  };

  // Handle Edit Provider
  const handleUpdateProvider = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = providers.map((p) =>
      p.id === selectedProvider.id
        ? {
            ...p,
            name: providerForm.name || p.name,
            apiUrl: (providerForm.apiUrl || p.apiUrl).trim(),
            apiKey: providerForm.apiKey !== undefined ? providerForm.apiKey.trim() : p.apiKey,
            status: (providerForm.status as any) || p.status,
            autoDispatch: providerForm.autoDispatch ?? p.autoDispatch,
            notes: providerForm.notes || p.notes,
            testMode: providerForm.testMode ?? p.testMode,
          }
        : p
    );
    onUpdateProviders(updated);
    setSelectedProvider((prev) => ({
      ...prev,
      name: providerForm.name || prev.name,
      apiUrl: (providerForm.apiUrl || prev.apiUrl).trim(),
      apiKey: providerForm.apiKey !== undefined ? providerForm.apiKey.trim() : prev.apiKey,
      status: (providerForm.status as any) || prev.status,
      autoDispatch: providerForm.autoDispatch ?? prev.autoDispatch,
      testMode: providerForm.testMode ?? prev.testMode,
    }));
    setIsEditProviderModalOpen(false);
    showToast('Provider API settings updated.');
  };

  // Handle Delete Provider
  const handleDeleteProvider = (id: string) => {
    if (providers.length <= 1) {
      alert('You must keep at least one provider profile.');
      return;
    }
    if (!confirm('Are you sure you want to remove this wholesaler provider?')) return;
    const updated = providers.filter((p) => p.id !== id);
    onUpdateProviders(updated);
    setSelectedProvider(updated[0]);
    showToast('Wholesaler provider removed.');
  };

  // Handle Live Balance Check via Real API Proxy
  const handleCheckBalance = async () => {
    if (!selectedProvider.apiUrl) {
      alert('Please specify provider API URL endpoint.');
      return;
    }
    if (!selectedProvider.apiKey) {
      alert('Please enter your Wholesaler API Key first.');
      return;
    }
    setIsTestingBalance(true);

    try {
      const res = await fetch('/api/wholesaler/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiUrl: selectedProvider.apiUrl,
          apiKey: selectedProvider.apiKey,
          name: selectedProvider.name,
          testMode: selectedProvider.testMode,
          usdToNprRate: effectiveUsdRate,
        }),
      });
      const data = await res.json();

      if (data.success) {
        const bal = typeof data.balance === 'number' ? data.balance : parseFloat(data.balance || 0);
        const curr = data.currency || 'USD';
        const balNpr = data.balanceNpr || getNprEquivalent(bal, curr);
        const updated = providers.map((p) =>
          p.id === selectedProvider.id
            ? {
                ...p,
                balance: bal,
                currency: curr,
                balanceNpr: balNpr,
                lastSync: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'active' as const,
              }
            : p
        );
        onUpdateProviders(updated);
        setSelectedProvider((prev) => ({
          ...prev,
          balance: bal,
          currency: curr,
          balanceNpr: balNpr,
          lastSync: 'Just now',
          status: 'active',
        }));
        showToast(`✅ Live Balance: $${bal.toFixed(2)} ${curr} (≈ Rs. ${balNpr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NPR) on ${selectedProvider.name}!`);
      } else {
        showToast(`❌ Balance query failed: ${data.error || 'Provider rejected request'}`);
      }
    } catch (e: any) {
      showToast(`Error connecting to provider API: ${e.message}`);
    } finally {
      setIsTestingBalance(false);
    }
  };

  // Handle Fetch Services from Wholesaler via Real API Proxy
  const handleFetchServices = async () => {
    if (!selectedProvider.apiUrl) {
      alert('Please configure API URL endpoint before syncing services catalog.');
      return;
    }
    setIsSyncingServices(true);

    try {
      const res = await fetch('/api/wholesaler/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiUrl: selectedProvider.apiUrl,
          apiKey: selectedProvider.apiKey,
          name: selectedProvider.name,
          testMode: selectedProvider.testMode,
        }),
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.services) && data.services.length > 0) {
        setFetchedServices(data.services);
        setActiveTabSub('synced_services');
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        showToast(`✅ Successfully fetched ${data.services.length} live services from ${selectedProvider.name}!`);
      } else if (data.fallbackAvailable && data.fallbackServices) {
        setFetchedServices(data.fallbackServices);
        setActiveTabSub('synced_services');
        showToast(`Loaded ${data.fallbackServices.length} standard catalog services (${data.error || 'Remote error'}).`);
      } else {
        showToast(`❌ Could not fetch services: ${data.error || 'Invalid API response format'}`);
      }
    } catch (e: any) {
      showToast(`Error syncing services catalog: ${e.message}`);
    } finally {
      setIsSyncingServices(false);
    }
  };

  // Handle Direct Import of Wholesale Services to Platform Catalog
  const handleImportServices = (serviceIdsToImport: number[]) => {
    if (serviceIdsToImport.length === 0) {
      alert('Please select at least one service to import.');
      return;
    }

    setIsImportingServices(true);

    const targetWholesaleItems = fetchedServices.filter((s) => serviceIdsToImport.includes(s.service));
    const newServiceMappings = { ...(selectedProvider.serviceMapping || {}) };

    let nextServiceIdNumber = Math.max(...services.map((s) => s.serviceId || 100), 100);

    const newlyCreatedServices: SMMService[] = targetWholesaleItems.map((item) => {
      nextServiceIdNumber += 1;
      const customLocalId = `srv-wh-${item.service}-${Date.now().toString(36)}`;
      const wholesaleRateUsd = parseFloat(item.rate) || 0.5;
      const calculatedNprRate = Math.round(wholesaleRateUsd * importUsdRate * (1 + importMarkupPercent / 100));

      // Map local service to wholesaler provider remote service ID
      newServiceMappings[customLocalId] = item.service;

      return {
        id: customLocalId,
        serviceId: nextServiceIdNumber,
        name: `${item.name}`,
        category: (item.category as any) || 'Other',
        type: item.type || 'Standard',
        ratePer1k: Math.max(calculatedNprRate, 5),
        minQuantity: parseInt(item.min) || 50,
        maxQuantity: parseInt(item.max) || 50000,
        speed: item.speed || 'Super Fast',
        averageTime: item.avgTime || '15 Minutes',
        description: `⚡ Direct Wholesaler API Service (Provider: ${selectedProvider.name}, Remote ID: #${item.service}). Automated dispatch with real-time tracking and delivery guarantee.`,
        refill: true,
        refillDays: 30,
        guaranteed: true,
        dripFeedAvailable: true,
        cancelAvailable: false,
        isActive: true,
      };
    });

    const updatedServices = [...services, ...newlyCreatedServices];
    onUpdateServices(updatedServices);

    const updatedProviders = providers.map((p) =>
      p.id === selectedProvider.id
        ? { ...p, serviceMapping: newServiceMappings, lastSync: 'Just now' }
        : p
    );
    onUpdateProviders(updatedProviders);
    setSelectedProvider((prev) => ({ ...prev, serviceMapping: newServiceMappings, lastSync: 'Just now' }));

    setIsImportingServices(false);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    showToast(`🎉 Direct Import Success! Added ${newlyCreatedServices.length} services with +${importMarkupPercent}% profit markup.`);
  };

  // Handle Sync All Pending Orders with Wholesaler via Real Status API
  const handleSyncPendingOrders = async () => {
    setIsSyncingOrders(true);
    let updatedCount = 0;

    try {
      const activeOrders = orders.filter(
        (o) => o.wholesalerOrderId && o.status !== 'Completed' && o.status !== 'Canceled'
      );

      if (activeOrders.length === 0) {
        showToast('No active orders with Wholesaler IDs found to synchronize.');
        setIsSyncingOrders(false);
        return;
      }

      const updated = [...orders];

      for (const ord of activeOrders) {
        const prov = providers.find((p) => p.id === ord.wholesalerProviderId) || selectedProvider;
        if (!prov.apiUrl) continue;

        try {
          const res = await fetch('/api/wholesaler/order/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiUrl: prov.apiUrl,
              apiKey: prov.apiKey,
              order: ord.wholesalerOrderId,
              name: prov.name,
              testMode: prov.testMode,
            }),
          });
          const resp = await res.json();
          const statusData = resp.data || resp;

          if (resp.success && statusData) {
            const rawStatus = String(statusData.status || resp.status || '').trim();
            const remains = statusData.remains !== undefined ? Number(statusData.remains) : ord.remains;
            const startCount = statusData.start_count !== undefined ? Number(statusData.start_count) : ord.startCount;

            let mappedStatus = ord.status;
            const norm = rawStatus.toLowerCase();
            if (norm.includes('completed') || norm.includes('finished')) mappedStatus = 'Completed';
            else if (norm.includes('progress') || norm.includes('processing')) mappedStatus = 'In progress';
            else if (norm.includes('cancel')) mappedStatus = 'Canceled';
            else if (norm.includes('partial')) mappedStatus = 'Partial';

            const idx = updated.findIndex((o) => o.id === ord.id);
            if (idx !== -1) {
              updated[idx] = {
                ...updated[idx],
                status: mappedStatus as any,
                remains: mappedStatus === 'Completed' ? 0 : remains,
                startCount,
                wholesalerStatus: rawStatus || mappedStatus,
              };
              updatedCount++;
            }
          }
        } catch {
          // ignore single item network drop
        }
      }

      onUpdateOrders(updated);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      showToast(`Synchronized ${updatedCount} orders with Wholesaler API statuses.`);
    } catch (e: any) {
      showToast(`Error during order synchronization: ${e.message}`);
    } finally {
      setIsSyncingOrders(false);
    }
  };

  // Handle Manual Order Dispatch to Wholesaler
  const handleManualDispatchOrder = async (order: SMMOrder) => {
    const prov = providers.find((p) => p.id === order.wholesalerProviderId) || selectedProvider;
    const remoteId = prov.serviceMapping?.[order.serviceId] || 1001;

    showToast(`Dispatching Order #${order.orderId} to ${prov.name}...`);
    try {
      const res = await fetch('/api/wholesaler/order/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiUrl: prov.apiUrl,
          apiKey: prov.apiKey,
          service: remoteId,
          link: order.link,
          quantity: order.quantity,
          name: prov.name,
          testMode: prov.testMode,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        const updated = orders.map((o) =>
          o.id === order.id
            ? {
                ...o,
                wholesalerProviderId: prov.id,
                wholesalerOrderId: data.order,
                wholesalerStatus: 'In progress',
                wholesalerError: undefined,
                wholesalerDispatchedAt: new Date().toISOString(),
                status: 'In progress' as const,
              }
            : o
        );
        onUpdateOrders(updated);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        showToast(`✅ Order #${order.orderId} dispatched to ${prov.name}! Wholesaler ID: #${data.order}`);
      } else {
        const updated = orders.map((o) =>
          o.id === order.id
            ? {
                ...o,
                wholesalerStatus: 'Dispatch Failed',
                wholesalerError: data.error || 'Provider rejected request',
              }
            : o
        );
        onUpdateOrders(updated);
        showToast(`❌ Dispatch failed: ${data.error || 'Rejected by wholesaler'}`);
      }
    } catch (err: any) {
      showToast(`Network error: ${err.message}`);
    }
  };

  // Handle Test Order API Dispatch
  const handleSendTestOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider.apiUrl) {
      alert('Please set Wholesaler API URL.');
      return;
    }
    if (!selectedProvider.apiKey) {
      alert('Please set Wholesaler API Key.');
      return;
    }

    setIsSendingTestOrder(true);
    setTestOrderResult(null);

    try {
      const res = await fetch('/api/wholesaler/order/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiUrl: selectedProvider.apiUrl,
          apiKey: selectedProvider.apiKey,
          service: testOrderForm.serviceId,
          link: testOrderForm.link,
          quantity: testOrderForm.quantity,
          name: selectedProvider.name,
          testMode: selectedProvider.testMode,
        }),
      });
      const data = await res.json();
      setTestOrderResult(data);

      if (data.success && data.order) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        showToast(`✅ Wholesaler Order #${data.order} created on ${selectedProvider.name}!`);
      } else {
        showToast(`❌ Wholesaler error: ${data.error || 'Order rejected'}`);
      }
    } catch (e: any) {
      setTestOrderResult({ error: e.message, success: false });
      showToast(`Failed to dispatch test order: ${e.message}`);
    } finally {
      setIsSendingTestOrder(false);
    }
  };

  // Filtered dispatched orders for the Dispatched Orders Tab
  const dispatchedOrders = orders.filter(
    (o) => o.wholesalerOrderId || o.wholesalerProviderId || o.wholesalerStatus
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Wholesaler SMM Provider APIs</span>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                API V2 COMPLIANT
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Connect external wholesale SMM panels. Automatically route incoming Nepal orders, query live balances, and sync real-time delivery statuses.
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reserve Pool: ${(providers.reduce((sum, p) => sum + (p.balance || 0), 0)).toFixed(2)} USD</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
                <span>≈ Rs. {(providers.reduce((sum, p) => sum + getNprEquivalent(p.balance || 0, p.currency || 'USD'), 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NPR</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSyncPendingOrders}
            disabled={isSyncingOrders}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold text-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isSyncingOrders ? 'animate-spin' : ''}`} />
            <span>Sync Pending Orders</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setProviderForm({
                name: '',
                apiUrl: 'https://justanotherpanel.com/api/v2',
                apiKey: '',
                status: 'active',
                autoDispatch: true,
                currency: 'USD',
                notes: '',
                testMode: false,
              });
              setIsAddProviderModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-neutral-950 font-bold text-xs transition shadow-lg shadow-teal-500/20 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Wholesaler Provider</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 overflow-x-auto scrollbar-none">
        {[
          { id: 'providers', label: `Active Providers (${providers.length})`, icon: Globe },
          { id: 'mapping', label: `Service Mapping & Markup`, icon: Layers },
          { id: 'synced_services', label: `Fetched Catalog (${fetchedServices.length})`, icon: ShoppingCart },
          { id: 'test_order', label: `API Order Dispatch Tester`, icon: Send },
          { id: 'orders_log', label: `Wholesaler Orders Queue (${dispatchedOrders.length})`, icon: CheckCircle },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTabSub === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTabSub(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-teal-500 text-neutral-950 shadow-md font-extrabold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROVIDERS OVERVIEW */}
      {activeTabSub === 'providers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Provider List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">
              Configured SMM Wholesaler Nodes
            </h3>

            {providers.map((prov) => {
              const isSelected = selectedProvider.id === prov.id;
              return (
                <div
                  key={prov.id}
                  onClick={() => setSelectedProvider(prov)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col gap-3 ${
                    isSelected
                      ? 'bg-neutral-800/90 border-teal-500 shadow-xl ring-1 ring-teal-500/50'
                      : 'bg-neutral-900/80 hover:bg-neutral-800/60 border-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            prov.status === 'active'
                              ? 'bg-emerald-400 animate-pulse'
                              : 'bg-amber-400'
                          }`}
                        />
                        <h4 className="text-sm font-bold text-white tracking-wide">{prov.name}</h4>
                        {prov.testMode && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                            SANDBOX
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-400 font-mono block mt-0.5 truncate max-w-[240px]">
                        {prov.apiUrl}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        prov.autoDispatch
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      {prov.autoDispatch ? 'Auto Dispatch ON' : 'Manual Route'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800/80">
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Live Balance</span>
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-emerald-400">
                          ${(prov.balance || 0).toFixed(2)} {prov.currency || 'USD'}
                        </span>
                        <span className="font-mono text-[10.5px] text-amber-400 font-semibold">
                          ≈ Rs. {getNprEquivalent(prov.balance || 0, prov.currency || 'USD').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NPR
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-500 block">API Key Status</span>
                      <span className="font-mono text-[11px] text-neutral-300">
                        {prov.apiKey ? '••••••••' + prov.apiKey.slice(-4) : 'Not Configured'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Provider Details & Controls (7 cols) */}
          <div className="lg:col-span-7 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">{selectedProvider.name}</h3>
                  {selectedProvider.testMode && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                      SANDBOX MODE
                    </span>
                  )}
                </div>
                <span className="text-xs text-neutral-400 font-mono">{selectedProvider.apiUrl}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setProviderForm({
                      name: selectedProvider.name,
                      apiUrl: selectedProvider.apiUrl,
                      apiKey: selectedProvider.apiKey,
                      status: selectedProvider.status,
                      autoDispatch: selectedProvider.autoDispatch,
                      notes: selectedProvider.notes,
                      testMode: selectedProvider.testMode,
                    });
                    setIsEditProviderModalOpen(true);
                  }}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
                  title="Edit API Details"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteProvider(selectedProvider.id)}
                  className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white transition cursor-pointer border border-red-500/30"
                  title="Delete Provider"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-semibold">Wholesaler Balance</span>
                  <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold">
                    1 USD = Rs. {effectiveUsdRate} NPR
                  </span>
                </div>
                <div>
                  <div className="text-lg font-black text-emerald-400 font-mono">
                    ${(selectedProvider.balance || 0).toFixed(2)} {selectedProvider.currency || 'USD'}
                  </div>
                  <div className="text-xs font-bold text-amber-400 font-mono mt-0.5 flex items-center gap-1.5">
                    <span className="text-neutral-400 text-[10px] font-sans font-medium">NPR Eqv:</span>
                    <span>≈ Rs. {getNprEquivalent(selectedProvider.balance || 0, selectedProvider.currency || 'USD').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NPR</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCheckBalance}
                  disabled={isTestingBalance}
                  className="w-full py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-teal-300 font-bold text-xs border border-neutral-700 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isTestingBalance ? 'animate-spin' : ''}`} />
                  <span>Check Live Balance</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between space-y-2">
                <span className="text-xs text-neutral-400 font-semibold">Catalog Sync</span>
                <div className="text-sm font-bold text-white">
                  {fetchedServices.length > 0 ? `${fetchedServices.length} Services Synced` : 'Ready to fetch'}
                </div>
                <button
                  type="button"
                  onClick={handleFetchServices}
                  disabled={isSyncingServices}
                  className="w-full py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-teal-300 font-bold text-xs border border-neutral-700 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ShoppingCart className="w-3 h-3" />
                  <span>Fetch Services</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between space-y-2">
                <span className="text-xs text-neutral-400 font-semibold">Auto Dispatch</span>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      selectedProvider.autoDispatch ? 'bg-emerald-400' : 'bg-neutral-500'
                    }`}
                  />
                  <span>{selectedProvider.autoDispatch ? 'Enabled' : 'Disabled'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const updated = providers.map((p) =>
                      p.id === selectedProvider.id ? { ...p, autoDispatch: !p.autoDispatch } : p
                    );
                    onUpdateProviders(updated);
                    setSelectedProvider((prev) => ({ ...prev, autoDispatch: !prev.autoDispatch }));
                    showToast(
                      `Auto Dispatch ${!selectedProvider.autoDispatch ? 'Enabled' : 'Disabled'}.`
                    );
                  }}
                  className="w-full py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-teal-300 font-bold text-xs border border-neutral-700 transition cursor-pointer"
                >
                  Toggle State
                </button>
              </div>
            </div>

            {/* Connection Test & Latency Ping */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-300 uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <Wifi className="w-3.5 h-3.5 text-teal-400" />
                  <span>API Latency & Connectivity Diagnostics</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleTestConnection()}
                  disabled={connectionTestResult.status === 'testing'}
                  className="px-3 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Zap className={`w-3 h-3 ${connectionTestResult.status === 'testing' ? 'animate-spin' : ''}`} />
                  <span>{connectionTestResult.status === 'testing' ? 'Testing Ping...' : '⚡ Test Connection & Latency'}</span>
                </button>
              </div>

              {connectionTestResult.status !== 'idle' && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
                    connectionTestResult.status === 'testing'
                      ? 'bg-neutral-900 text-neutral-300 border-neutral-800'
                      : connectionTestResult.status === 'success'
                      ? 'bg-emerald-950/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-red-950/20 text-red-300 border-red-500/30'
                  }`}
                >
                  {connectionTestResult.status === 'testing' ? (
                    <RefreshCw className="w-4 h-4 text-teal-400 animate-spin shrink-0 mt-0.5" />
                  ) : connectionTestResult.status === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="font-bold">
                      {connectionTestResult.message || connectionTestResult.error || 'Running ping test...'}
                    </div>
                    {connectionTestResult.details && (
                      <div className="text-[10px] text-neutral-400">{connectionTestResult.details}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Provider API Details Sheet */}
            <div className="space-y-3 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs">
              <span className="font-bold text-neutral-300 block uppercase tracking-wider text-[11px]">
                API Node Credentials & Specs
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                <div>
                  <span className="text-neutral-500 block text-[10px]">API Endpoint</span>
                  <span className="text-white truncate block">{selectedProvider.apiUrl}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">API Key</span>
                  <span className="text-white">
                    {selectedProvider.apiKey ? '••••••••' + selectedProvider.apiKey.slice(-6) : 'Not Provided'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Mapped Services Count</span>
                  <span className="text-teal-400 font-bold">
                    {Object.keys(selectedProvider.serviceMapping || {}).length} Services Linked
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Last Status Sync</span>
                  <span className="text-neutral-400">{selectedProvider.lastSync || 'Never'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SERVICE MAPPING & MARKUP */}
      {activeTabSub === 'mapping' && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-sm font-black text-white">Local to Wholesaler Service Mappings</h3>
              <p className="text-xs text-neutral-400">
                When a user places an order on your Nepal panel, it is automatically routed to this remote service ID on {selectedProvider.name}.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTabSub('synced_services')}
              className="px-3.5 py-2 rounded-xl bg-teal-500 text-neutral-950 font-bold text-xs hover:bg-teal-400 transition cursor-pointer flex items-center gap-1.5 self-start md:self-auto"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Import Wholesale Services</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-mono">
                  <th className="py-2.5 px-3">Local SMM ID</th>
                  <th className="py-2.5 px-3">Service Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Local Rate (NPR)</th>
                  <th className="py-2.5 px-3">Remote Service ID</th>
                  <th className="py-2.5 px-3 text-right">Routing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {services.map((srv) => {
                  const mappedRemoteId = selectedProvider.serviceMapping?.[srv.id];
                  return (
                    <tr key={srv.id} className="hover:bg-neutral-800/40 transition">
                      <td className="py-3 px-3 text-neutral-400">#{srv.serviceId}</td>
                      <td className="py-3 px-3 font-sans font-semibold text-white max-w-[280px] truncate">
                        {srv.name}
                      </td>
                      <td className="py-3 px-3 text-neutral-300 font-sans">{srv.category}</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">Rs. {srv.ratePer1k}</td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          value={mappedRemoteId || ''}
                          placeholder="e.g. 1001"
                          onChange={(e) => {
                            const val = e.target.value ? parseInt(e.target.value) : undefined;
                            const newMap = { ...(selectedProvider.serviceMapping || {}) };
                            if (val) {
                              newMap[srv.id] = val;
                            } else {
                              delete newMap[srv.id];
                            }
                            const updated = providers.map((p) =>
                              p.id === selectedProvider.id ? { ...p, serviceMapping: newMap } : p
                            );
                            onUpdateProviders(updated);
                            setSelectedProvider((prev) => ({ ...prev, serviceMapping: newMap }));
                          }}
                          className="w-28 px-2 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-teal-300 font-mono text-xs focus:border-teal-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-3 px-3 text-right">
                        {mappedRemoteId ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            Auto Route Ready
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-500 text-[10px]">
                            Manual / Unmapped
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FETCHED WHOLESALE SERVICES CATALOG */}
      {activeTabSub === 'synced_services' && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>Wholesaler Catalog: {selectedProvider.name}</span>
                <span className="text-[11px] font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md">
                  {fetchedServices.length} Services Available
                </span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Select services to import directly into your platform catalog with auto-calculated profit margins in Nepali Rupees.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFetchServices}
                disabled={isSyncingServices}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-teal-300 border border-neutral-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingServices ? 'animate-spin' : ''}`} />
                <span>Refresh Catalog</span>
              </button>
            </div>
          </div>

          {/* Pricing & Markup Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs">
            <div>
              <label className="text-neutral-400 font-semibold block mb-1">Exchange Rate (1 USD to NPR)</label>
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500 font-mono">Rs.</span>
                <input
                  type="number"
                  value={importUsdRate}
                  onChange={(e) => setImportUsdRate(parseFloat(e.target.value) || 136.5)}
                  className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-mono text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-neutral-400 font-semibold block mb-1">Profit Markup Percentage</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={importMarkupPercent}
                  onChange={(e) => setImportMarkupPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-emerald-400 font-bold font-mono text-xs focus:border-teal-500 focus:outline-none"
                />
                <span className="text-neutral-500 font-mono">%</span>
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => handleImportServices(selectedServicesToImport)}
                disabled={selectedServicesToImport.length === 0 || isImportingServices}
                className="w-full py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-neutral-950 font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Import Selected ({selectedServicesToImport.length})</span>
              </button>
            </div>
          </div>

          {fetchedServices.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingCart className="w-12 h-12 text-neutral-600 mx-auto" />
              <div className="text-sm font-bold text-neutral-300">Catalog Not Yet Synced</div>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Click "Fetch Services" above to query {selectedProvider.name} for their live available SMM services.
              </p>
              <button
                type="button"
                onClick={handleFetchServices}
                disabled={isSyncingServices}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-neutral-950 font-bold text-xs transition cursor-pointer inline-flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingServices ? 'animate-spin' : ''}`} />
                <span>Fetch Services Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search and Category Filter */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Search wholesale services by title..."
                  value={importSearchTerm}
                  onChange={(e) => setImportSearchTerm(e.target.value)}
                  className="w-full sm:w-80 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:border-teal-500 focus:outline-none"
                />

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs text-neutral-400">Filter Category:</span>
                  <select
                    value={importCategoryFilter}
                    onChange={(e) => setImportCategoryFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 focus:border-teal-500 focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Telegram">Telegram</option>
                    <option value="Twitter">Twitter / X</option>
                    <option value="Spotify">Spotify</option>
                  </select>
                </div>
              </div>

              {/* Table of Remote Services */}
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-neutral-900 z-10">
                    <tr className="border-b border-neutral-800 text-neutral-400 font-mono">
                      <th className="py-3 px-3 w-8 text-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedServicesToImport.length > 0 &&
                            selectedServicesToImport.length === fetchedServices.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedServicesToImport(fetchedServices.map((s) => s.service));
                            } else {
                              setSelectedServicesToImport([]);
                            }
                          }}
                          className="rounded border-neutral-700 text-teal-500 focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-3">Remote ID</th>
                      <th className="py-3 px-3">Wholesaler Service Name</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Wholesale Rate ($ USD)</th>
                      <th className="py-3 px-3">Calculated Price (NPR)</th>
                      <th className="py-3 px-3">Min / Max</th>
                      <th className="py-3 px-3 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-sans">
                    {fetchedServices
                      .filter((fs) => {
                        const matchCat =
                          importCategoryFilter === 'all' ||
                          fs.category.toLowerCase() === importCategoryFilter.toLowerCase();
                        const matchSearch =
                          !importSearchTerm ||
                          fs.name.toLowerCase().includes(importSearchTerm.toLowerCase());
                        return matchCat && matchSearch;
                      })
                      .map((fs) => {
                        const isSelected = selectedServicesToImport.includes(fs.service);
                        const wholesaleRateUsd = parseFloat(fs.rate) || 0.5;
                        const calculatedNprRate = Math.round(
                          wholesaleRateUsd * importUsdRate * (1 + importMarkupPercent / 100)
                        );

                        return (
                          <tr
                            key={fs.service}
                            className={`hover:bg-neutral-800/40 transition ${
                              isSelected ? 'bg-teal-950/10' : ''
                            }`}
                          >
                            <td className="py-3 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedServicesToImport([...selectedServicesToImport, fs.service]);
                                  } else {
                                    setSelectedServicesToImport(
                                      selectedServicesToImport.filter((id) => id !== fs.service)
                                    );
                                  }
                                }}
                                className="rounded border-neutral-700 text-teal-500 focus:ring-0 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-teal-400">#{fs.service}</td>
                            <td className="py-3 px-3 font-semibold text-white">
                              <div>{fs.name}</div>
                              <span className="text-[10px] text-neutral-500 font-mono">
                                Speed: {fs.speed || 'Instant'} • {fs.avgTime || '15m'}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 text-[10px] font-semibold">
                                {fs.category}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-neutral-300">
                              ${fs.rate} <span className="text-[10px] text-neutral-500">USD</span>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                              Rs. {calculatedNprRate} <span className="text-[10px] text-neutral-400">NPR/1K</span>
                            </td>
                            <td className="py-3 px-3 font-mono text-neutral-400 text-[11px]">
                              {fs.min} - {Number(fs.max).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleImportServices([fs.service])}
                                className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-neutral-950 border border-teal-500/30 text-[11px] font-bold transition cursor-pointer"
                              >
                                + Import
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TEST ORDER DISPATCH */}
      {activeTabSub === 'test_order' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white border-b border-neutral-800 pb-3 flex items-center justify-between">
              <span>Direct API Order Dispatch Tester</span>
              <span className="text-[10px] text-neutral-400 font-mono">Target: {selectedProvider.name}</span>
            </h3>

            <form onSubmit={handleSendTestOrder} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1 font-semibold">Wholesaler Remote Service ID</label>
                <input
                  type="text"
                  value={testOrderForm.serviceId}
                  onChange={(e) => setTestOrderForm({ ...testOrderForm, serviceId: e.target.value })}
                  placeholder="e.g. 1001"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 font-semibold">Target Link / URL</label>
                <input
                  type="text"
                  value={testOrderForm.link}
                  onChange={(e) => setTestOrderForm({ ...testOrderForm, link: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 font-semibold">Quantity</label>
                <input
                  type="number"
                  value={testOrderForm.quantity}
                  onChange={(e) =>
                    setTestOrderForm({ ...testOrderForm, quantity: Number(e.target.value) })
                  }
                  required
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSendingTestOrder}
                className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-neutral-950 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Send className={`w-3.5 h-3.5 ${isSendingTestOrder ? 'animate-spin' : ''}`} />
                <span>{isSendingTestOrder ? 'Dispatching to API Node...' : 'Send API Test Order Request'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-3">
            <h3 className="text-sm font-black text-white border-b border-neutral-800 pb-3">
              Raw API Response Output
            </h3>

            {testOrderResult ? (
              <pre className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
                {JSON.stringify(testOrderResult, null, 2)}
              </pre>
            ) : (
              <div className="py-12 text-center text-xs text-neutral-500 font-mono">
                Awaiting test order execution. Response JSON will display here.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: WHOLESALER ORDERS QUEUE & AUTO-SYNC LOGS */}
      {activeTabSub === 'orders_log' && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-sm font-black text-white">Wholesaler Orders Dispatch Queue & Live Status</h3>
              <p className="text-xs text-neutral-400">
                Track all incoming Nepal panel orders that are linked to wholesale SMM providers with 1-click manual dispatch & live sync.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSyncPendingOrders}
              disabled={isSyncingOrders}
              className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-neutral-950 font-bold text-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingOrders ? 'animate-spin' : ''}`} />
              <span>Query All Live Statuses</span>
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="py-16 text-center text-xs text-neutral-500">
              No orders placed yet. Placed orders will automatically show here for routing and tracking.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 font-mono">
                    <th className="py-2.5 px-3">Local Order ID</th>
                    <th className="py-2.5 px-3">Service</th>
                    <th className="py-2.5 px-3">Wholesaler Provider</th>
                    <th className="py-2.5 px-3">Wholesaler Order ID</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Target Link</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono">
                  {orders.map((ord) => {
                    const prov = providers.find((p) => p.id === ord.wholesalerProviderId);
                    return (
                      <tr key={ord.id} className="hover:bg-neutral-800/40 transition">
                        <td className="py-3 px-3 text-neutral-300 font-bold">#{ord.orderId}</td>
                        <td className="py-3 px-3 font-sans font-semibold text-white max-w-[220px] truncate">
                          {ord.serviceName}
                        </td>
                        <td className="py-3 px-3 text-neutral-300 font-sans">
                          {prov ? prov.name : selectedProvider.name}
                        </td>
                        <td className="py-3 px-3">
                          {ord.wholesalerOrderId ? (
                            <span className="font-mono font-bold text-teal-400">
                              #{ord.wholesalerOrderId}
                            </span>
                          ) : (
                            <span className="text-neutral-500 text-[11px]">Unsent</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              ord.status === 'Completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : ord.status === 'In progress'
                                ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                                : ord.wholesalerStatus === 'Dispatch Failed'
                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {ord.wholesalerStatus || ord.status}
                          </span>
                          {ord.wholesalerError && (
                            <div className="text-[10px] text-red-400 font-sans mt-0.5 truncate max-w-[180px]">
                              {ord.wholesalerError}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-neutral-400 max-w-[160px] truncate font-sans">
                          {ord.link}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {!ord.wholesalerOrderId || ord.wholesalerStatus === 'Dispatch Failed' ? (
                            <button
                              type="button"
                              onClick={() => handleManualDispatchOrder(ord)}
                              className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-neutral-950 border border-teal-500/30 text-[11px] font-bold transition cursor-pointer"
                            >
                              ⚡ Dispatch Now
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSyncPendingOrders()}
                              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] transition cursor-pointer"
                            >
                              🔄 Sync Status
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD PROVIDER */}
      {isAddProviderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="text-sm font-bold text-white">Add Wholesaler SMM Provider</span>
              <button
                type="button"
                onClick={() => setIsAddProviderModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-neutral-400 text-[11px] block">Quick Presets (1-Click Fill)</label>
              <div className="flex flex-wrap gap-1.5">
                {SMM_PROVIDER_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setProviderForm({
                        ...providerForm,
                        name: preset.name,
                        apiUrl: preset.apiUrl,
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-teal-500/50 text-[11px] text-neutral-300 hover:text-white transition cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveNewProvider} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Provider Display Name</label>
                <input
                  type="text"
                  value={providerForm.name}
                  onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                  placeholder="e.g. JustAnotherPanel (JAP)"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">API Endpoint URL</label>
                <input
                  type="url"
                  value={providerForm.apiUrl}
                  onChange={(e) => setProviderForm({ ...providerForm, apiUrl: e.target.value })}
                  placeholder="https://justanotherpanel.com/api/v2"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">API Key</label>
                <input
                  type="text"
                  value={providerForm.apiKey}
                  onChange={(e) => setProviderForm({ ...providerForm, apiKey: e.target.value })}
                  placeholder="Enter secret API key from wholesaler account settings"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="auto_disp"
                    checked={providerForm.autoDispatch}
                    onChange={(e) =>
                      setProviderForm({ ...providerForm, autoDispatch: e.target.checked })
                    }
                    className="rounded bg-neutral-950 border-neutral-800 text-teal-500"
                  />
                  <label htmlFor="auto_disp" className="text-neutral-300 text-xs font-semibold cursor-pointer">
                    Auto-forward placed orders
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="test_mode"
                    checked={providerForm.testMode}
                    onChange={(e) =>
                      setProviderForm({ ...providerForm, testMode: e.target.checked })
                    }
                    className="rounded bg-neutral-950 border-neutral-800 text-amber-500"
                  />
                  <label htmlFor="test_mode" className="text-amber-300 text-xs font-semibold cursor-pointer">
                    Sandbox / Test Mode
                  </label>
                </div>
              </div>

              {/* In-Modal Test Connection Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleTestConnection(providerForm)}
                  disabled={!providerForm.apiUrl}
                  className="w-full py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-teal-300 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Verify Credentials & Test Endpoint</span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddProviderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-neutral-950 font-bold text-xs cursor-pointer shadow-md"
                >
                  Save Provider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PROVIDER */}
      {isEditProviderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="text-sm font-bold text-white">Edit Wholesaler API Settings</span>
              <button
                type="button"
                onClick={() => setIsEditProviderModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProvider} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Provider Display Name</label>
                <input
                  type="text"
                  value={providerForm.name}
                  onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">API Endpoint URL</label>
                <input
                  type="url"
                  value={providerForm.apiUrl}
                  onChange={(e) => setProviderForm({ ...providerForm, apiUrl: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">API Key</label>
                <input
                  type="text"
                  value={providerForm.apiKey}
                  onChange={(e) => setProviderForm({ ...providerForm, apiKey: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit_auto_disp"
                    checked={providerForm.autoDispatch}
                    onChange={(e) =>
                      setProviderForm({ ...providerForm, autoDispatch: e.target.checked })
                    }
                    className="rounded bg-neutral-950 border-neutral-800 text-teal-500"
                  />
                  <label htmlFor="edit_auto_disp" className="text-neutral-300 text-xs font-semibold cursor-pointer">
                    Auto-forward placed orders
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit_test_mode"
                    checked={providerForm.testMode}
                    onChange={(e) =>
                      setProviderForm({ ...providerForm, testMode: e.target.checked })
                    }
                    className="rounded bg-neutral-950 border-neutral-800 text-amber-500"
                  />
                  <label htmlFor="edit_test_mode" className="text-amber-300 text-xs font-semibold cursor-pointer">
                    Sandbox / Test Mode
                  </label>
                </div>
              </div>

              {/* In-Modal Test Connection Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleTestConnection(providerForm)}
                  disabled={!providerForm.apiUrl}
                  className="w-full py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-teal-300 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Verify Credentials & Test Endpoint</span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEditProviderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-neutral-950 font-bold text-xs cursor-pointer shadow-md"
                >
                  Update Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
