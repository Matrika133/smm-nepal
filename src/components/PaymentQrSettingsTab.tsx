import React, { useState } from 'react';
import {
  QrCode,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldCheck,
  Building,
  CreditCard,
  Sparkles,
  Smartphone,
  Wallet,
  Coins,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SystemSettings } from '../types';

interface PaymentQrSettingsTabProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  showToast: (msg: string) => void;
}

export function PaymentQrSettingsTab({
  settings,
  onUpdateSettings,
  showToast,
}: PaymentQrSettingsTabProps) {
  const [form, setForm] = useState<SystemSettings>(settings);
  const [selectedGateway, setSelectedGateway] = useState<
    'fonepay' | 'esewa' | 'khalti' | 'bank' | 'imepay' | 'usdt'
  >('fonepay');
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Helper for image file uploads (converts file to Base64 dataURL)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: keyof SystemSettings
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, JPEG, WebP).');
      return;
    }

    if (file.size > 1024 * 1024 * 1024) {
      alert('Image size exceeds 1GB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setForm((prev) => ({
          ...prev,
          [fieldKey]: result,
        }));
        showToast(`QR Code image uploaded successfully for ${fieldKey}!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onUpdateSettings(form);
    try {
      localStorage.setItem('smm_nepal_system_settings', JSON.stringify(form));
    } catch (e) {}
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    showToast('Payment QR codes & gateway settings updated! Live in User Panel.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Payment QR Codes & Gateways Manager</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                LIVE SYNC
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Upload custom QR codes or update account numbers. All changes reflect instantly in user Add Funds screen.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save & Apply to User Panel</span>
        </button>
      </div>

      {/* Gateway Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'fonepay', name: 'Fonepay (All Banks QR)', icon: QrCode, color: 'text-red-400' },
          { id: 'esewa', name: 'eSewa QR & ID', icon: Smartphone, color: 'text-green-400' },
          { id: 'khalti', name: 'Khalti QR & ID', icon: Wallet, color: 'text-purple-400' },
          { id: 'bank', name: 'Bank (ConnectIPS) QR', icon: Building, color: 'text-blue-400' },
          { id: 'imepay', name: 'IME Pay QR', icon: Smartphone, color: 'text-amber-400' },
          { id: 'usdt', name: 'USDT (TRC-20) Crypto QR', icon: Coins, color: 'text-teal-400' },
        ].map((gw) => {
          const Icon = gw.icon;
          const isActive = selectedGateway === gw.id;
          return (
            <button
              key={gw.id}
              type="button"
              onClick={() => setSelectedGateway(gw.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
                isActive
                  ? 'bg-neutral-800 text-white border-neutral-700 shadow-md ring-1 ring-emerald-500/50'
                  : 'bg-neutral-900/80 text-neutral-400 hover:text-white border-neutral-800 hover:bg-neutral-800/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${gw.color}`} />
              <span>{gw.name}</span>
            </button>
          );
        })}
      </div>

      {/* Gateway Configuration Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Settings Form (7 cols) */}
        <div className="lg:col-span-7 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-5">
          {/* FONEPAY */}
          {selectedGateway === 'fonepay' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500"></span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Fonepay All Banks Interoperable QR
                  </h3>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">Accepts all 30+ Nepal Banks</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-neutral-400 block mb-1 font-semibold">Fonepay Registered Mobile Number</label>
                  <input
                    type="text"
                    value={form.fonepayNumber}
                    onChange={(e) => setForm({ ...form, fonepayNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="9841000000"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1 font-semibold">Merchant / Business Name</label>
                  <input
                    type="text"
                    value={form.fonepayMerchant}
                    onChange={(e) => setForm({ ...form, fonepayMerchant: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="SMM PANEL NEPAL TECH"
                  />
                </div>
              </div>

              {/* Upload or URL */}
              <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                <label className="text-xs font-semibold text-neutral-300 block">
                  Fonepay QR Code Image (File Upload or Image Link)
                </label>
                
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <label className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-dashed border-neutral-700 hover:border-emerald-500 text-neutral-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Upload QR Image from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'fonepayQrImage')}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="mt-2">
                  <label className="text-[11px] text-neutral-500 block mb-1">Or Direct QR Image URL</label>
                  <input
                    type="url"
                    value={form.fonepayQrImage}
                    onChange={(e) => setForm({ ...form, fonepayQrImage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* ESEWA */}
          {selectedGateway === 'esewa' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-green-500"></span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    eSewa Wallet QR & Account
                  </h3>
                </div>
                <span className="text-[10px] text-green-400 font-mono font-bold">Direct eSewa Ingress</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-neutral-400 block mb-1 font-semibold">eSewa ID (Phone Number or Email)</label>
                  <input
                    type="text"
                    value={form.esewaId}
                    onChange={(e) => setForm({ ...form, esewaId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="9841000000"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1 font-semibold">Account Full Name</label>
                  <input
                    type="text"
                    value={form.esewaName}
                    onChange={(e) => setForm({ ...form, esewaName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="SMM PANEL NEPAL (OFFICIAL)"
                  />
                </div>
              </div>

              {/* Upload QR */}
              <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                <label className="text-xs font-semibold text-neutral-300 block">
                  eSewa QR Code Image
                </label>
                <label className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-dashed border-neutral-700 hover:border-green-500 text-neutral-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition">
                  <Upload className="w-4 h-4 text-green-400" />
                  <span>Upload eSewa QR Image from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'esewaQrImage')}
                    className="hidden"
                  />
                </label>
                <div className="mt-2">
                  <label className="text-[11px] text-neutral-500 block mb-1">Or Direct QR Image URL</label>
                  <input
                    type="url"
                    value={form.esewaQrImage || ''}
                    onChange={(e) => setForm({ ...form, esewaQrImage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* KHALTI */}
          {selectedGateway === 'khalti' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-purple-500"></span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Khalti Wallet QR & Account
                  </h3>
                </div>
                <span className="text-[10px] text-purple-400 font-mono font-bold">Khalti Digital Payment</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-neutral-400 block mb-1 font-semibold">Khalti ID / Registered Number</label>
                  <input
                    type="text"
                    value={form.khaltiId}
                    onChange={(e) => setForm({ ...form, khaltiId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="9841000000"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1 font-semibold">Account / Merchant Name</label>
                  <input
                    type="text"
                    value={form.khaltiName}
                    onChange={(e) => setForm({ ...form, khaltiName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="SMM PANEL NEPAL KHALTI"
                  />
                </div>
              </div>

              {/* Upload QR */}
              <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                <label className="text-xs font-semibold text-neutral-300 block">
                  Khalti QR Code Image
                </label>
                <label className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-dashed border-neutral-700 hover:border-purple-500 text-neutral-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition">
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span>Upload Khalti QR Image from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'khaltiQrImage')}
                    className="hidden"
                  />
                </label>
                <div className="mt-2">
                  <label className="text-[11px] text-neutral-500 block mb-1">Or Direct QR Image URL</label>
                  <input
                    type="url"
                    value={form.khaltiQrImage || ''}
                    onChange={(e) => setForm({ ...form, khaltiQrImage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* BANK TRANSFER (CONNECTIPS) */}
          {selectedGateway === 'bank' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Bank Transfer & ConnectIPS QR
                  </h3>
                </div>
                <span className="text-[10px] text-blue-400 font-mono font-bold">Nepal Clearing House / ConnectIPS</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-neutral-400 block mb-1 font-semibold">Bank Name</label>
                  <input
                    type="text"
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="Nabil Bank Ltd."
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1 font-semibold">Account Name</label>
                  <input
                    type="text"
                    value={form.bankAccountName}
                    onChange={(e) => setForm({ ...form, bankAccountName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="SMM PANEL NEPAL IT SERVICES"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1 font-semibold">Account Number</label>
                  <input
                    type="text"
                    value={form.bankAccountNumber}
                    onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="012001750000123"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1 font-semibold">Branch Name</label>
                  <input
                    type="text"
                    value={form.bankBranch}
                    onChange={(e) => setForm({ ...form, bankBranch: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="Kathmandu Main Branch"
                  />
                </div>
              </div>

              {/* Upload QR */}
              <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                <label className="text-xs font-semibold text-neutral-300 block">
                  Bank / ConnectIPS QR Code Image
                </label>
                <label className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-dashed border-neutral-700 hover:border-blue-500 text-neutral-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>Upload Bank QR Image from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'bankQrImage')}
                    className="hidden"
                  />
                </label>
                <div className="mt-2">
                  <label className="text-[11px] text-neutral-500 block mb-1">Or Direct QR Image URL</label>
                  <input
                    type="url"
                    value={form.bankQrImage || ''}
                    onChange={(e) => setForm({ ...form, bankQrImage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* IME PAY */}
          {selectedGateway === 'imepay' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500"></span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    IME Pay QR & Mobile Wallet
                  </h3>
                </div>
                <span className="text-[10px] text-amber-400 font-mono font-bold">IME Pay Digital</span>
              </div>

              {/* Upload QR */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 block">
                  IME Pay QR Code Image
                </label>
                <label className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-dashed border-neutral-700 hover:border-amber-500 text-neutral-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Upload IME Pay QR Image from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'imePayQrImage')}
                    className="hidden"
                  />
                </label>
                <div className="mt-2">
                  <label className="text-[11px] text-neutral-500 block mb-1">Or Direct QR Image URL</label>
                  <input
                    type="url"
                    value={form.imePayQrImage || ''}
                    onChange={(e) => setForm({ ...form, imePayQrImage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* USDT TRC20 */}
          {selectedGateway === 'usdt' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-teal-500"></span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    USDT (TRC-20) Crypto QR & Address
                  </h3>
                </div>
                <span className="text-[10px] text-teal-400 font-mono font-bold">Auto USD-NPR Conversion</span>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 text-xs font-semibold">TRC-20 Wallet Deposit Address</label>
                <input
                  type="text"
                  value={form.usdtTrc20Address}
                  onChange={(e) => setForm({ ...form, usdtTrc20Address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  placeholder="TYD8npofficialTRC20depositWalletAddress99"
                />
              </div>

              {/* Upload QR */}
              <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                <label className="text-xs font-semibold text-neutral-300 block">
                  USDT TRC20 QR Code Image
                </label>
                <label className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-dashed border-neutral-700 hover:border-teal-500 text-neutral-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition">
                  <Upload className="w-4 h-4 text-teal-400" />
                  <span>Upload USDT QR Image from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'usdtQrImage')}
                    className="hidden"
                  />
                </label>
                <div className="mt-2">
                  <label className="text-[11px] text-neutral-500 block mb-1">Or Direct QR Image URL</label>
                  <input
                    type="url"
                    value={form.usdtQrImage || ''}
                    onChange={(e) => setForm({ ...form, usdtQrImage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-[11px] text-neutral-500">
              Changes sync directly to localStorage & state.
            </span>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Update QR Gateway</span>
            </button>
          </div>
        </div>

        {/* Right Live User View Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="w-full flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live User Preview</span>
              </span>
              <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded font-mono">
                {selectedGateway.toUpperCase()}
              </span>
            </div>

            {/* Current Active QR Image */}
            {(() => {
              let currentImage = form.fonepayQrImage;
              let currentTitle = 'Fonepay Interoperable QR';
              let currentSubtitle = `${form.fonepayMerchant} • ${form.fonepayNumber}`;

              if (selectedGateway === 'esewa') {
                currentImage = form.esewaQrImage || form.fonepayQrImage;
                currentTitle = 'eSewa Direct QR';
                currentSubtitle = `${form.esewaName} • ${form.esewaId}`;
              } else if (selectedGateway === 'khalti') {
                currentImage = form.khaltiQrImage || form.fonepayQrImage;
                currentTitle = 'Khalti Official QR';
                currentSubtitle = `${form.khaltiName} • ${form.khaltiId}`;
              } else if (selectedGateway === 'bank') {
                currentImage = form.bankQrImage || form.fonepayQrImage;
                currentTitle = 'Bank / ConnectIPS QR';
                currentSubtitle = `${form.bankName} • ${form.bankAccountNumber}`;
              } else if (selectedGateway === 'imepay') {
                currentImage = form.imePayQrImage || form.fonepayQrImage;
                currentTitle = 'IME Pay QR';
                currentSubtitle = `IME Pay • ${form.fonepayNumber}`;
              } else if (selectedGateway === 'usdt') {
                currentImage =
                  form.usdtQrImage ||
                  `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
                    form.usdtTrc20Address
                  )}`;
                currentTitle = 'USDT (TRC-20) Deposit';
                currentSubtitle = form.usdtTrc20Address;
              }

              return (
                <div className="w-full flex flex-col items-center space-y-3">
                  <div className="p-3 bg-white rounded-2xl shadow-2xl border border-neutral-200 w-56 h-56 flex items-center justify-center relative group">
                    <img
                      src={currentImage}
                      alt={currentTitle}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=SMMPANELNEPAL`;
                      }}
                    />
                    <div className="absolute inset-0 bg-neutral-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-2xl backdrop-blur-[2px]">
                      <button
                        type="button"
                        onClick={() => setPreviewModalUrl(currentImage)}
                        className="px-3 py-1.5 bg-emerald-500 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow-lg"
                      >
                        <Eye className="w-3.5 h-3.5" /> Full Zoom
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-white">{currentTitle}</h4>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5 truncate max-w-[280px]">
                      {currentSubtitle}
                    </p>
                  </div>

                  <div className="w-full pt-3 border-t border-neutral-800 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(currentSubtitle, 'account_info')}
                      className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedField === 'account_info' ? 'Copied!' : 'Copy Info'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewModalUrl(currentImage)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Enlarge View</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* FULL ZOOM MODAL */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Full-Resolution QR Code
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="p-1 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl flex items-center justify-center">
              <img
                src={previewModalUrl}
                alt="Enlarged QR Code"
                className="w-64 h-64 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
