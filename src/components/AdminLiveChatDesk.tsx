import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  User,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  Phone,
  Mail,
  Award,
  Check,
  X
} from 'lucide-react';
import { UserAccount } from '../types';
import {
  getLiveChatConversations,
  sendMessageFromAdmin,
  markConversationAsReadByAdmin,
  toggleConversationStatus,
  deleteConversation,
  LiveChatConversation,
} from '../utils/liveChatStore';

interface AdminLiveChatDeskProps {
  currentUser: UserAccount;
}

export function AdminLiveChatDesk({ currentUser }: AdminLiveChatDeskProps) {
  const [conversations, setConversations] = useState<LiveChatConversation[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'active' | 'resolved'>('all');
  const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadChats = () => {
    const data = getLiveChatConversations();
    setConversations([...data]);
    if (data.length > 0 && !selectedConvoId) {
      setSelectedConvoId(data[0].id);
      markConversationAsReadByAdmin(data[0].id);
    }
  };

  useEffect(() => {
    loadChats();

    const handleChatUpdate = () => {
      const data = getLiveChatConversations();
      setConversations([...data]);
    };

    window.addEventListener('smm_live_chat_event', handleChatUpdate);
    window.addEventListener('storage', handleChatUpdate);

    return () => {
      window.removeEventListener('smm_live_chat_event', handleChatUpdate);
      window.removeEventListener('storage', handleChatUpdate);
    };
  }, []);

  const selectedConvo = conversations.find((c) => c.id === selectedConvoId);

  useEffect(() => {
    if (selectedConvoId) {
      markConversationAsReadByAdmin(selectedConvoId);
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConvoId, selectedConvo?.messages.length]);

  const handleSelectConvo = (id: string) => {
    setSelectedConvoId(id);
    markConversationAsReadByAdmin(id);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConvoId || !replyText.trim()) return;

    sendMessageFromAdmin(selectedConvoId, replyText.trim(), currentUser.username || 'Admin Support');
    setReplyText('');
    loadChats();
  };

  const handleQuickReply = (text: string) => {
    setReplyText(text);
  };

  const handleToggleStatus = (id: string) => {
    toggleConversationStatus(id);
    loadChats();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to remove this chat session?')) return;
    deleteConversation(id);
    if (selectedConvoId === id) {
      setSelectedConvoId(null);
    }
    loadChats();
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.userEmail && c.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'waiting') return (c.unreadByAdmin || 0) > 0;
    if (statusFilter === 'active') return c.status === 'active';
    if (statusFilter === 'resolved') return c.status === 'resolved';
    return true;
  });

  const totalUnreadCount = conversations.reduce((acc, c) => acc + (c.unreadByAdmin || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Live Chat Support Desk</span>
              {totalUnreadCount > 0 ? (
                <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                  {totalUnreadCount} UNREAD CLIENT QUERIES
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  ● REAL-TIME DISPATCH ACTIVE
                </span>
              )}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Respond directly to visitor and registered user live chat inquiries in real time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadChats}
            className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Desk</span>
          </button>
        </div>
      </div>

      {/* Main Chat Interface Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
        {/* Left Column: Conversations List */}
        <div className="lg:col-span-5 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-4 shadow-xl flex flex-col space-y-3">
          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user, email or query..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1 text-[11px] overflow-x-auto scrollbar-none pb-1">
              {[
                { id: 'all', label: `All (${conversations.length})` },
                { id: 'waiting', label: `Waiting Reply (${conversations.filter((c) => (c.unreadByAdmin || 0) > 0).length})` },
                { id: 'active', label: `Active (${conversations.filter((c) => c.status === 'active').length})` },
                { id: 'resolved', label: `Resolved (${conversations.filter((c) => c.status === 'resolved').length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations Thread List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[500px]">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center bg-neutral-950 rounded-2xl border border-neutral-800 text-neutral-400 space-y-1">
                <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-xs font-bold text-white">No live conversations found</p>
                <p className="text-[11px]">Inquiries from the floating chat widget will arrive here.</p>
              </div>
            ) : (
              filteredConversations.map((convo) => {
                const isSelected = selectedConvoId === convo.id;
                const hasUnread = (convo.unreadByAdmin || 0) > 0;

                return (
                  <div
                    key={convo.id}
                    onClick={() => handleSelectConvo(convo.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-emerald-950/20 border-emerald-500/40 shadow-md'
                        : hasUnread
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-neutral-950/70 border-neutral-800/80 hover:bg-neutral-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-8 w-8 rounded-xl bg-neutral-800 border border-neutral-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {convo.userName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                            <span className="truncate">{convo.userName}</span>
                            {convo.userTier && (
                              <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-mono shrink-0">
                                {convo.userTier}
                              </span>
                            )}
                          </div>
                          {convo.userEmail && (
                            <span className="text-[10px] text-neutral-400 font-mono truncate block">
                              {convo.userEmail}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[9px] text-neutral-500 font-mono block">
                          {new Date(convo.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {hasUnread && (
                          <span className="inline-block mt-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white font-mono text-[9px] font-black animate-pulse">
                            {convo.unreadByAdmin} new
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-neutral-300 mt-2 line-clamp-1 pl-1 border-l-2 border-emerald-500/50">
                      {convo.lastMessage}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat History & Reply Box */}
        <div className="lg:col-span-7 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          {selectedConvo ? (
            <>
              {/* Active Conversation Top Bar */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    {selectedConvo.userName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>{selectedConvo.userName}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          selectedConvo.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {selectedConvo.status}
                      </span>
                    </h3>
                    <div className="text-[11px] text-neutral-400 flex items-center gap-3 font-mono">
                      {selectedConvo.userPhone && <span>📞 {selectedConvo.userPhone}</span>}
                      {selectedConvo.userEmail && <span>✉️ {selectedConvo.userEmail}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(selectedConvo.id)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition cursor-pointer"
                  >
                    {selectedConvo.status === 'active' ? 'Mark Resolved' : 'Re-open Chat'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedConvo.id)}
                    className="p-1.5 rounded-xl bg-neutral-800 hover:bg-red-950/60 text-neutral-400 hover:text-red-400 transition cursor-pointer"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Thread Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-3 bg-neutral-950/80 p-4 rounded-2xl border border-neutral-800 max-h-[360px] min-h-[260px]">
                {selectedConvo.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold text-neutral-400">
                        {msg.sender === 'user' ? (msg.senderName || selectedConvo.userName) : (msg.senderName || 'Staff Reply')}
                      </span>
                      {msg.sender === 'agent' && (
                        <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-mono">
                          ADMIN
                        </span>
                      )}
                      <span className="text-[9px] text-neutral-500">{msg.time}</span>
                    </div>

                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-none'
                          : 'bg-emerald-500 text-neutral-950 font-medium rounded-br-none shadow-md'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatMessagesEndRef} />
              </div>

              {/* Quick Reply Snippets */}
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                  Fast Canned Replies:
                </span>
                <div className="flex gap-1.5 overflow-x-auto text-[11px] scrollbar-none pb-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickReply(
                        'Namaste! Your payment proof has been verified and your wallet balance is credited now. Thank you!'
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 whitespace-nowrap cursor-pointer"
                  >
                    ✅ Deposit Approved
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickReply(
                        'Your order has been queued to our fastest high-speed server node and will start delivering shortly!'
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 whitespace-nowrap cursor-pointer"
                  >
                    🚀 Order Speed Up
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickReply(
                        'Please provide your registered username and screenshot of the payment slip so we can verify.'
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 whitespace-nowrap cursor-pointer"
                  >
                    🔍 Request Proof
                  </button>
                </div>
              </div>

              {/* Staff / Admin Reply Input Form */}
              <form onSubmit={handleSendReply} className="space-y-2">
                <div className="flex items-center gap-2">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type official reply to client..."
                    className="flex-1 px-3 py-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 font-black text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-neutral-400 space-y-2">
              <MessageSquare className="w-12 h-12 text-neutral-600" />
              <h4 className="text-sm font-bold text-white">Select a conversation</h4>
              <p className="text-xs max-w-sm">
                Choose an active chat from the left column to view message history and send live replies.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
