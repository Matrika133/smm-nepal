import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'card' | 'compact' | 'floating';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header', className = '' }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showDirectInstallModal, setShowDirectInstallModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running as an installed PWA, hide install triggers
  if (isInstalled) {
    return null;
  }

  const handleDirectInstall = async () => {
    setIsInstalling(true);
    try {
      const outcome = await install();
      if (outcome) {
        setShowDirectInstallModal(false);
      }
    } catch (err) {
      console.warn('Direct installation trigger:', err);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleInstallClick = async () => {
    // If the browser already gave us the prompt, fire it directly immediately!
    if (isInstallable) {
      handleDirectInstall();
    } else {
      // Otherwise show direct 1-click install window
      setShowDirectInstallModal(true);
    }
  };

  return (
    <>
      {variant === 'floating' && (
        <div className={`fixed bottom-5 right-5 z-40 ${className}`}>
          <button
            id="floating-pwa-install-btn"
            onClick={handleInstallClick}
            disabled={isInstalling}
            title="Install Mobile App"
            className="group flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-neutral-950 font-black shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-emerald-400/40"
          >
            <Download className="w-5 h-5 text-neutral-950 animate-bounce" />
          </button>
        </div>
      )}

      {variant === 'compact' && (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          title="Install SMM Nepal App"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      )}

      {variant === 'card' && (
        <div className={`p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-neutral-900 border border-emerald-500/20 shadow-lg ${className}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-extrabold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Direct App
            </span>
          </div>
          <div className="mt-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              Install SMM Nepal Mobile App
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h4>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              Install directly to your mobile phone home screen with 1 tap.
            </p>
          </div>
          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-900/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App Now</span>
          </button>
        </div>
      )}

      {variant === 'banner' && (
        <div className={`p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl backdrop-blur-md ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                SMM Panel Nepal Mobile App
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded">PWA</span>
              </p>
              <p className="text-[11px] text-neutral-300">1-Tap installation on Android and iOS devices.</p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        </div>
      )}

      {variant === 'header' && (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 border border-emerald-400/30 transition-all cursor-pointer hover:scale-105 active:scale-95 ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
          <span className="hidden sm:inline">Install App</span>
          <span className="sm:hidden">App</span>
        </button>
      )}

      {/* DIRECT 1-CLICK PWA INSTALL WINDOW (No complex guide, direct action) */}
      {showDirectInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl relative text-neutral-100 space-y-4">
            <button
              onClick={() => setShowDirectInstallModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* App Branding Icon */}
            <div className="flex items-center gap-3.5">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-neutral-950 shadow-lg shadow-emerald-500/25 shrink-0">
                <Zap className="w-7 h-7 fill-neutral-950" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">SMM Panel Nepal</h3>
                <p className="text-xs text-emerald-400 font-semibold">Official Mobile App</p>
                <span className="text-[10px] text-neutral-400 font-mono">v4.9.2 • 2.4 MB • Instant Launch</span>
              </div>
            </div>

            {/* Quick Benefits list */}
            <div className="space-y-2 p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs">
              <div className="flex items-center gap-2 text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero Storage Overhead (Direct Web App)</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant Home Screen Launch</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>100% Secure & Verified Payment Gateway</span>
              </div>
            </div>

            {/* Big Direct Install Button */}
            <button
              id="confirm-pwa-direct-install-btn"
              onClick={async () => {
                await handleDirectInstall();
                setShowDirectInstallModal(false);
              }}
              disabled={isInstalling}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-sm transition cursor-pointer shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isInstalling ? 'Installing App...' : 'Install on Device Now'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
