import React, { useState } from 'react';
import {
  LifeBuoy,
  MessageSquare,
  Send,
  Bot,
  User,
  CheckCircle2,
  Clock,
  PlusCircle,
  Sparkles,
  Loader2
} from 'lucide-react';
import { SupportTicket, SMMOrder } from '../types';

interface SupportTabProps {
  tickets: SupportTicket[];
  orders: SMMOrder[];
  onCreateTicket: (subject: string, orderId?: number, initialMessage?: string) => void;
  onAddTicketMessage: (ticketId: string, text: string) => void;
}

export function SupportTab({
  tickets,
  orders,
  onCreateTicket,
  onAddTicketMessage,
}: SupportTabProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [isAskingAI, setIsAskingAI] = useState(false);

  // New ticket modal
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newOrderId, setNewOrderId] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');

  const currentTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentTicket) return;

    onAddTicketMessage(currentTicket.id, replyText.trim());
    setReplyText('');
  };

  const handleAskAIAssistant = async () => {
    if (!replyText.trim() || !currentTicket) return;
    setIsAskingAI(true);

    const relatedOrder = orders.find((o) => o.orderId === currentTicket.orderId);

    try {
      const res = await fetch('/api/ai/ticket-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderDetails: relatedOrder,
          userQuestion: replyText,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        onAddTicketMessage(currentTicket.id, replyText.trim());
        // Simulate immediate AI agent reply
        setTimeout(() => {
          onAddTicketMessage(currentTicket.id, data.reply);
        }, 500);
        setReplyText('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAskingAI(false);
    }
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    const ordNum = newOrderId ? Number(newOrderId) : undefined;
    onCreateTicket(newSubject.trim(), ordNum, newMessage.trim());

    setShowNewTicketModal(false);
    setNewSubject('');
    setNewOrderId('');
    setNewMessage('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left List of Tickets (4 cols) */}
      <div className="lg:col-span-4 bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Support Tickets
            </h3>
          </div>
          <button
            onClick={() => setShowNewTicketModal(true)}
            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {tickets.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6 text-center">No tickets yet.</p>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicketId(t.id)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                  selectedTicketId === t.id
                    ? 'bg-neutral-800/90 border-emerald-500/50 text-white'
                    : 'bg-neutral-950 border-neutral-800/80 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-emerald-400 font-bold">
                    #{t.ticketNumber}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      t.status === 'Answered'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <h4 className="font-semibold line-clamp-1 text-neutral-100">{t.subject}</h4>
                <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-1 font-mono">
                  <span>{t.orderId ? `Order #${t.orderId}` : 'General'}</span>
                  <span>{t.updatedAt}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Conversation Window (8 cols) */}
      <div className="lg:col-span-8 bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between min-h-[500px]">
        {currentTicket ? (
          <>
            {/* Header */}
            <div className="border-b border-neutral-800 pb-3 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-emerald-400">
                    Ticket #{currentTicket.ticketNumber}
                  </span>
                  {currentTicket.orderId && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
                      Target Order: #{currentTicket.orderId}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white mt-1">{currentTicket.subject}</h3>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-neutral-500 block font-mono">Created</span>
                <span className="text-xs text-neutral-300 font-mono">{currentTicket.createdAt}</span>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 py-4 space-y-3 overflow-y-auto max-h-[350px] pr-2">
              {currentTicket.messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${
                    m.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.sender !== 'user' && (
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      {m.sender === 'ai_agent' ? <Sparkles className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-2xl text-xs max-w-md ${
                      m.sender === 'user'
                        ? 'bg-emerald-600 text-neutral-950 rounded-br-none font-medium'
                        : m.sender === 'ai_agent'
                        ? 'bg-neutral-950 border border-emerald-500/30 text-neutral-100 rounded-bl-none'
                        : 'bg-neutral-800 text-neutral-100 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] opacity-70 mb-1">
                      <span>
                        {m.sender === 'user'
                          ? 'You'
                          : m.sender === 'ai_agent'
                          ? '🤖 Automated 24/7 Node Agent'
                          : 'Support Staff'}
                      </span>
                      <span className="font-mono ml-2">{m.timestamp}</span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                  </div>

                  {m.sender === 'user' && (
                    <div className="h-7 w-7 rounded-lg bg-neutral-800 text-neutral-300 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Reply Input Area */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-neutral-800 space-y-2">
              <div className="relative">
                <textarea
                  rows={2}
                  placeholder="Type your message or inquiry..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleAskAIAssistant}
                  disabled={isAskingAI || !replyText.trim()}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40"
                >
                  {isAskingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Instant AI Node Answer</span>
                </button>

                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="py-24 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center mx-auto text-emerald-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-neutral-200">24/7 Nepali & English Support</h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Need assistance with an order, payment verification, or custom SMM API integration? Open a ticket below.
            </p>
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Ticket</span>
            </button>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white">Create Support Ticket</h3>
              <button
                onClick={() => setShowNewTicketModal(false)}
                className="text-neutral-500 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Order speed or Refill issue"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Related Order ID (Optional)</label>
                <select
                  value={newOrderId}
                  onChange={(e) => setNewOrderId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">No specific order (General Inquiry)</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.orderId}>
                      #{o.orderId} - {o.serviceName} ({o.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your issue or question in detail..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-xs text-neutral-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
