import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, ShieldCheck, User, UserCheck } from 'lucide-react';
import { UserAccount, SystemSettings } from '../types';
import {
  getOrCreateConversation,
  sendMessageFromUser,
  markConversationAsReadByUser,
  LiveChatMessage,
} from '../utils/liveChatStore';

interface LiveChatWidgetProps {
  currentUser?: UserAccount;
  systemSettings?: SystemSettings;
}

export function LiveChatWidget({ currentUser, systemSettings }: LiveChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const convoId = currentUser ? `user_${currentUser.id}` : 'guest_client_session';
  const userName = currentUser?.username || 'Guest Client';
  const userEmail = currentUser?.email || 'guest@nepal.com';
  const userPhone = currentUser?.phone || '9841000000';
  const userTier = currentUser?.tier || 'Standard';

  const [messages, setMessages] = useState<LiveChatMessage[]>(() => {
    const convo = getOrCreateConversation(convoId, userName, userEmail, userPhone, userTier);
    return convo.messages;
  });

  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Sync messages on mount, open, and when live chat events fire
  useEffect(() => {
    const loadConversation = () => {
      const convo = getOrCreateConversation(convoId, userName, userEmail, userPhone, userTier);
      setMessages([...convo.messages]);
      if (isOpen) {
        markConversationAsReadByUser(convoId);
        setUnreadCount(0);
      } else {
        setUnreadCount(convo.unreadByUser || 0);
      }
    };

    loadConversation();

    const handleChatEvent = () => {
      loadConversation();
    };

    window.addEventListener('smm_live_chat_event', handleChatEvent);
    window.addEventListener('storage', handleChatEvent);

    return () => {
      window.removeEventListener('smm_live_chat_event', handleChatEvent);
      window.removeEventListener('storage', handleChatEvent);
    };
  }, [convoId, userName, userEmail, userPhone, userTier, isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const query = inputText.trim();
    setInputText('');

    sendMessageFromUser(convoId, query, userName, userEmail, userPhone);

    const convo = getOrCreateConversation(convoId, userName, userEmail, userPhone, userTier);
    setMessages([...convo.messages]);
  };

  return (
    <>
      {/* Floating Chat Button at Bottom Left */}
      <div className="fixed bottom-5 left-5 z-40">
        {!isOpen ? (
          <button
            id="open-live-chat-widget-btn"
            onClick={() => {
              setIsOpen(true);
              markConversationAsReadByUser(convoId);
              setUnreadCount(0);
            }}
            className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-neutral-950 font-black shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 cursor-pointer border border-emerald-400/40"
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 text-neutral-950 fill-neutral-950" />
              {unreadCount > 0 ? (
                <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-red-500 text-white font-mono text-[9px] font-black flex items-center justify-center border-2 border-neutral-950 animate-bounce">
                  {unreadCount}
                </span>
              ) : (
                <>
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-300 animate-ping" />
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 border border-neutral-950" />
                </>
              )}
            </div>
            <div className="text-left hidden sm:block">
              <span className="block text-[10px] text-neutral-950/80 font-bold uppercase tracking-wider">
                Live Support
              </span>
              <span className="block text-xs font-black">
                {unreadCount > 0 ? `${unreadCount} New Admin Reply` : 'Chat with Admin'}
              </span>
            </div>
          </button>
        ) : null}
      </div>

      {/* Chat Window Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-5 left-5 z-50 w-80 sm:w-96 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[550px]">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-neutral-950 to-neutral-900 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-neutral-900" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white flex items-center gap-1">
                  {systemSettings?.siteName ? `${systemSettings.siteName} Live Support` : 'SMM Nepal Live Support'}{' '}
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
                    Online
                  </span>
                </h4>
                <p className="text-[10px] text-neutral-400">
                  Chat directly with Admin & Support
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-neutral-950/60 font-sans max-h-[360px] min-h-[240px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[9px] font-bold text-neutral-400">
                    {msg.sender === 'user' ? (msg.senderName || 'You') : (msg.senderName || 'Admin Desk')}
                  </span>
                  {msg.sender === 'agent' && (
                    <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-mono">
                      STAFF
                    </span>
                  )}
                </div>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-500 text-neutral-950 font-medium rounded-br-none shadow-md'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-neutral-500 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Chips */}
          <div className="p-2 bg-neutral-900 border-t border-neutral-800 flex gap-1.5 overflow-x-auto text-[10px] scrollbar-none">
            <button
              type="button"
              onClick={() => setInputText('How to deposit funds via Fonepay / eSewa QR?')}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 shrink-0 cursor-pointer"
            >
              QR Deposit Help
            </button>
            <button
              type="button"
              onClick={() => setInputText('Please check my order status speed')}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 shrink-0 cursor-pointer"
            >
              Order Status
            </button>
            <button
              type="button"
              onClick={() => setInputText('I have paid via QR, please approve my balance')}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 shrink-0 cursor-pointer"
            >
              Deposit Approval
            </button>
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type message to admin..."
              className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-emerald-500/50"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
