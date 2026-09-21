export interface LiveChatMessage {
  id: string;
  sender: 'user' | 'agent';
  senderName?: string;
  text: string;
  time: string;
  timestamp: number;
}

export interface LiveChatConversation {
  id: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  userTier?: string;
  lastMessage: string;
  lastUpdated: number;
  unreadByAdmin: number;
  unreadByUser: number;
  status: 'active' | 'resolved';
  messages: LiveChatMessage[];
}

const STORAGE_KEY = 'smm_nepal_live_chats_v3';

export const DEFAULT_LIVE_CHATS: LiveChatConversation[] = [
  {
    id: 'client_live_01',
    userName: 'sujan_smm',
    userEmail: 'sujan@gmail.com',
    userPhone: '9841234567',
    userTier: 'VIP',
    lastMessage: 'I transferred Rs. 2,000 via Fonepay QR, please verify and credit balance.',
    lastUpdated: Date.now() - 1000 * 60 * 3,
    unreadByAdmin: 1,
    unreadByUser: 0,
    status: 'active',
    messages: [
      {
        id: 'msg_01',
        sender: 'agent',
        senderName: 'SMM Support Agent',
        text: 'Namaste! Welcome to SMM Panel Nepal 🇳🇵. How can our support team assist your orders or deposits today?',
        time: '10:15 AM',
        timestamp: Date.now() - 1000 * 60 * 15,
      },
      {
        id: 'msg_02',
        sender: 'user',
        senderName: 'sujan_smm',
        text: 'I transferred Rs. 2,000 via Fonepay QR, please verify and credit balance.',
        time: '10:27 AM',
        timestamp: Date.now() - 1000 * 60 * 3,
      },
    ],
  },
  {
    id: 'client_live_02',
    userName: 'bishal_marketing',
    userEmail: 'bishal@outlook.com',
    userPhone: '9801987654',
    userTier: 'Reseller',
    lastMessage: 'What is the speed for Instagram Followers Service #102 today?',
    lastUpdated: Date.now() - 1000 * 60 * 25,
    unreadByAdmin: 0,
    unreadByUser: 0,
    status: 'active',
    messages: [
      {
        id: 'msg_11',
        sender: 'user',
        senderName: 'bishal_marketing',
        text: 'What is the speed for Instagram Followers Service #102 today?',
        time: '09:40 AM',
        timestamp: Date.now() - 1000 * 60 * 25,
      },
      {
        id: 'msg_12',
        sender: 'agent',
        senderName: 'Admin Support',
        text: 'Hello Bishal! Service #102 is delivering at 15k - 20k per day with 0 drop rate and automatic refill guarantee.',
        time: '09:42 AM',
        timestamp: Date.now() - 1000 * 60 * 23,
      },
    ],
  },
];

export function getLiveChatConversations(): LiveChatConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  saveLiveChatConversations(DEFAULT_LIVE_CHATS);
  return DEFAULT_LIVE_CHATS;
}

export function saveLiveChatConversations(convos: LiveChatConversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convos));
    window.dispatchEvent(new CustomEvent('smm_live_chat_event', { detail: { convos } }));
  } catch (e) {}
}

export function getOrCreateConversation(
  convoId: string,
  userName: string,
  email?: string,
  phone?: string,
  tier?: string
): LiveChatConversation {
  const convos = getLiveChatConversations();
  let existing = convos.find((c) => c.id === convoId);
  if (!existing) {
    existing = {
      id: convoId,
      userName: userName || 'Visitor',
      userEmail: email,
      userPhone: phone,
      userTier: tier || 'Standard',
      lastMessage: 'Started conversation',
      lastUpdated: Date.now(),
      unreadByAdmin: 0,
      unreadByUser: 0,
      status: 'active',
      messages: [
        {
          id: `msg_welcome_${Date.now()}`,
          sender: 'agent',
          senderName: 'SMM Support Agent',
          text: 'Namaste! Welcome to SMM Panel Nepal 🇳🇵. How can our support team assist your orders or deposits today?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
        },
      ],
    };
    convos.unshift(existing);
    saveLiveChatConversations(convos);
  }
  return existing;
}

export function sendMessageFromUser(
  convoId: string,
  text: string,
  userName: string,
  email?: string,
  phone?: string
): LiveChatMessage {
  const convos = getLiveChatConversations();
  let convo = convos.find((c) => c.id === convoId);
  const now = Date.now();
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newMsg: LiveChatMessage = {
    id: `user_msg_${now}_${Math.random().toString(36).substring(2, 6)}`,
    sender: 'user',
    senderName: userName || 'Visitor',
    text: text.trim(),
    time: timeStr,
    timestamp: now,
  };

  if (!convo) {
    convo = {
      id: convoId,
      userName: userName || 'Visitor',
      userEmail: email,
      userPhone: phone,
      lastMessage: text.trim(),
      lastUpdated: now,
      unreadByAdmin: 1,
      unreadByUser: 0,
      status: 'active',
      messages: [
        {
          id: `welcome_${now}`,
          sender: 'agent',
          senderName: 'SMM Support Agent',
          text: 'Namaste! Welcome to SMM Panel Nepal 🇳🇵. How can our support team assist your orders or deposits today?',
          time: timeStr,
          timestamp: now - 1000,
        },
        newMsg,
      ],
    };
    convos.unshift(convo);
  } else {
    convo.messages.push(newMsg);
    convo.lastMessage = text.trim();
    convo.lastUpdated = now;
    convo.unreadByAdmin = (convo.unreadByAdmin || 0) + 1;
    convo.status = 'active';
    if (userName) convo.userName = userName;
    if (email) convo.userEmail = email;
    if (phone) convo.userPhone = phone;
  }

  saveLiveChatConversations(convos);
  return newMsg;
}

export function sendMessageFromAdmin(
  convoId: string,
  text: string,
  adminName: string
): LiveChatMessage | null {
  const convos = getLiveChatConversations();
  const convo = convos.find((c) => c.id === convoId);
  if (!convo) return null;

  const now = Date.now();
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newMsg: LiveChatMessage = {
    id: `admin_msg_${now}_${Math.random().toString(36).substring(2, 6)}`,
    sender: 'agent',
    senderName: adminName || 'Admin Support',
    text: text.trim(),
    time: timeStr,
    timestamp: now,
  };

  convo.messages.push(newMsg);
  convo.lastMessage = text.trim();
  convo.lastUpdated = now;
  convo.unreadByUser = (convo.unreadByUser || 0) + 1;
  convo.unreadByAdmin = 0; // Admin replied, mark read

  saveLiveChatConversations(convos);
  return newMsg;
}

export function markConversationAsReadByAdmin(convoId: string) {
  const convos = getLiveChatConversations();
  const convo = convos.find((c) => c.id === convoId);
  if (convo && convo.unreadByAdmin > 0) {
    convo.unreadByAdmin = 0;
    saveLiveChatConversations(convos);
  }
}

export function markConversationAsReadByUser(convoId: string) {
  const convos = getLiveChatConversations();
  const convo = convos.find((c) => c.id === convoId);
  if (convo && convo.unreadByUser > 0) {
    convo.unreadByUser = 0;
    saveLiveChatConversations(convos);
  }
}

export function toggleConversationStatus(convoId: string): 'active' | 'resolved' {
  const convos = getLiveChatConversations();
  const convo = convos.find((c) => c.id === convoId);
  if (convo) {
    convo.status = convo.status === 'active' ? 'resolved' : 'active';
    saveLiveChatConversations(convos);
    return convo.status;
  }
  return 'active';
}

export function deleteConversation(convoId: string) {
  const convos = getLiveChatConversations().filter((c) => c.id !== convoId);
  saveLiveChatConversations(convos);
}

export function getConversationsSummary(): { total: number; active: number; unreadByAdmin: number; totalUnread: number } {
  const convos = getLiveChatConversations();
  const total = convos.length;
  const active = convos.filter((c) => c.status === 'active').length;
  const unreadByAdmin = convos.reduce((sum, c) => sum + (c.unreadByAdmin || 0), 0);
  return { total, active, unreadByAdmin, totalUnread: unreadByAdmin };
}
