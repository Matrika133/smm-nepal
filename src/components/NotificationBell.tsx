import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Wallet,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  LifeBuoy,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Clock
} from 'lucide-react';
import { UserNotification } from '../types';

interface NotificationBellProps {
  notifications: UserNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onDeleteNotification: (id: string) => void;
  onNavigateTab: (tab: any) => void;
  onSimulateAlert?: (type: 'deposit_approved' | 'ticket_reply') => void;
}

export function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Tone 2: 880 Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.1);
    gain2.gain.setValueAtTime(0.16, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.35);
  } catch (e) {
    // AudioContext might be prevented before first user interaction
  }
}

export function NotificationBell({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onDeleteNotification,
  onNavigateTab,
  onSimulateAlert,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'deposits' | 'tickets'>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('smm_notification_sound') !== 'false';
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Toggle sound setting
  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('smm_notification_sound', String(next));
    if (next) playNotificationChime();
  };

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filtered notifications
  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'deposits') {
      return item.type.startsWith('deposit');
    }
    if (filter === 'tickets') {
      return item.type.startsWith('ticket');
    }
    return true;
  });

  const depositCount = notifications.filter((n) => n.type.startsWith('deposit')).length;
  const ticketCount = notifications.filter((n) => n.type.startsWith('ticket')).length;

  const handleNotificationClick = (item: UserNotification) => {
    if (!item.isRead) {
      onMarkAsRead(item.id);
    }
    if (item.linkTab) {
      onNavigateTab(item.linkTab);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        id="navbar-notification-bell-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-center shadow-sm ${
          isOpen
            ? 'bg-neutral-800 border-emerald-500/50 text-white'
            : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white'
        }`}
        title={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
      >
        <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-emerald-400' : ''}`} />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-emerald-500 text-neutral-950 text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          id="navbar-notifications-dropdown"
          className="absolute right-0 mt-2.5 w-[330px] sm:w-[390px] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="p-3.5 border-b border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={toggleSound}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                title={soundEnabled ? 'Mute alert sounds' : 'Enable alert sounds'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
                )}
              </button>

              {/* Mark All As Read */}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="text-[11px] text-neutral-400 hover:text-emerald-400 px-2 py-1 rounded-lg hover:bg-neutral-800 transition cursor-pointer flex items-center gap-1 font-medium"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Read all</span>
                </button>
              )}

              {/* Close Popover */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Segment Tabs */}
          <div className="px-3 pt-2.5 pb-2 flex items-center gap-1 border-b border-neutral-800/80 bg-neutral-950/40 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('deposits')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                filter === 'deposits'
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <Wallet className="w-3 h-3" />
              <span>Deposits ({depositCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('tickets')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                filter === 'tickets'
                  ? 'bg-blue-500/20 text-blue-400 font-bold border border-blue-500/40'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <LifeBuoy className="w-3 h-3" />
              <span>Tickets ({ticketCount})</span>
            </button>
          </div>

          {/* Notification Items List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-neutral-800/60 scrollbar-none">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="h-10 w-10 mx-auto rounded-xl bg-neutral-800/60 flex items-center justify-center text-neutral-500">
                  <Bell className="w-5 h-5 opacity-40" />
                </div>
                <p className="text-xs font-semibold text-neutral-300">No notifications here</p>
                <p className="text-[11px] text-neutral-500 max-w-[220px] mx-auto">
                  You'll be alerted in real time whenever an admin approves a deposit or replies to a support ticket.
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const isDeposit = item.type.startsWith('deposit');
                const isTicket = item.type.startsWith('ticket');
                const isApproved = item.type === 'deposit_approved';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3 transition cursor-pointer group flex items-start gap-2.5 ${
                      item.isRead
                        ? 'bg-neutral-900 hover:bg-neutral-800/50 opacity-80'
                        : 'bg-neutral-900/90 hover:bg-neutral-800 border-l-2 border-emerald-500'
                    }`}
                  >
                    {/* Type Icon Badge */}
                    <div className="shrink-0 mt-0.5">
                      {isDeposit ? (
                        isApproved ? (
                          <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <Wallet className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                            <AlertCircle className="w-3.5 h-3.5" />
                          </div>
                        )
                      ) : isTicket ? (
                        <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="h-7 w-7 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-bold truncate ${
                            item.isRead ? 'text-neutral-300' : 'text-white'
                          }`}
                        >
                          {item.title}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-neutral-500 font-mono flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {item.timestamp}
                          </span>
                          {!item.isRead && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed line-clamp-2">
                        {item.message}
                      </p>

                      {/* Action Links */}
                      <div className="flex items-center justify-between mt-1.5 pt-1">
                        {item.linkTab && (
                          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5 group-hover:underline">
                            <span>
                              {isDeposit ? 'View in Transactions' : isTicket ? 'Open Ticket Desk' : 'View Details'}
                            </span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNotification(item.id);
                          }}
                          className="text-neutral-500 hover:text-red-400 p-1 transition cursor-pointer opacity-0 group-hover:opacity-100 ml-auto"
                          title="Dismiss notification"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Live Status & Footer */}
          <div className="p-3 border-t border-neutral-800 bg-neutral-950/90 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live Mode Active • Real-time Sync</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60 text-[11px]">
              <span className="text-neutral-500 font-mono text-[10px]">
                Instant Alerts for Deposits & Tickets
              </span>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="text-neutral-400 hover:text-red-400 transition cursor-pointer flex items-center gap-1 text-[11px]"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
