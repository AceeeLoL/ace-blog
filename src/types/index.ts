export type DiaryEntry = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  pinned: boolean;
};

export type VisitorQuestion = {
  id: string;
  authorName: string;
  question: string;
  createdAt: string;
  retention: 'ephemeral_24h' | 'permanent';
  expiresAt: string | null;
  adminReply?: string | null;
  repliedAt?: string | null;
  visitorId?: string;
  visitorReply?: string | null;
  visitorReplyAt?: string | null;
};

export type AuthStatus = {
  isAdmin: boolean;
};
