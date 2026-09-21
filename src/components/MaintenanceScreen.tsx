import React from 'react';
import { Wrench, Zap, Mail, Copy, Check } from 'lucide-react';
import { SystemSettings } from '../types';

interface MaintenanceScreenProps {
  systemSettings?: SystemSettings;
}

export function MaintenanceScreen({
  systemSettings,
}: MaintenanceScreenProps) {
  const [copiedEmail, setCopiedEmail] = React.useState(false);
  const brandName = systemSettings?.siteName || 'SMM Panel Nepal';
  const customTitle = systemSettings?.maintenanceTitle || `${brandName} Under Scheduled Maintenance`;
  const customMessage =
    systemSettings?.maintenanceMessage ||
    'Our platform is currently performing high-speed database optimizations and system upgrades. All customer balances and orders are completely safe and preserved.';
  const estimatedTime = systemSettings?.maintenanceEstimatedTime || '< 15 Minutes';
  const supportEmail = systemSettings?.supportEmail || 'support@smmpanelnepal.com';

  const handleCopyEmail = () => {
    try {
      navigator.clipboard.writeText(supportEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex items-center justify-center p-4 sm:p-6 text-center overflow-y-auto">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Brand Logo or Icon */}
        <div className="flex justify-center">
          {systemSettings?.siteLogoUrl ? (
            <div className="h-16 w-16 rounded-2xl bg-neutral-950 border border-neutral-800 p-2.5 flex items-center justify-center shadow-inner">
              <img
                src={systemSettings.siteLogoUrl}
                alt={brandName}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Wrench className="w-8 h-8 animate-pulse" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono font-black uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping"></span>
            Maintenance Mode Active
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
            {customTitle}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm mx-auto">
            {customMessage}
          </p>
        </div>

        {/* Downtime & Status Box */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-bold">
            <Zap className="w-4 h-4" />
            <span>Estimated Downtime: {estimatedTime}</span>
          </div>
          <p className="text-[11px] text-neutral-500">
            Automated server dispatch will resume as soon as maintenance completes.
          </p>
        </div>

        {/* Only Email Contact Section */}
        <div className="pt-2 border-t border-neutral-800/80 space-y-3">
          <span className="text-[11px] text-neutral-400 block font-medium">
            For urgent inquiries or official assistance:
          </span>
          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
            <a
              href={`mailto:${supportEmail}?subject=Urgent%20Inquiry%20-%20Maintenance%20Mode`}
              className="flex items-center gap-2.5 text-left min-w-0 flex-1 hover:text-white transition group"
            >
              <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 group-hover:bg-red-500/20">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-neutral-500 uppercase font-mono block">Contact Email</span>
                <span className="text-xs font-mono font-bold text-white group-hover:text-red-300 truncate block">
                  {supportEmail}
                </span>
              </div>
            </a>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 cursor-pointer transition shrink-0"
              title="Copy Email Address"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


