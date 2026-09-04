export type MoodType = {
  emoji: string;
  label: string;
};

export type DiaryEntry = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string; // ISO String
  category: string;
  readTime: string;
  mood?: MoodType; // Optional — no longer used in UI
  pinned: boolean;
  coverImage?: string;
  reactions?: {
    loved: number;
    cozy: number;
    thoughtful: number;
    spark: number;
  };
};

export type VisitorQuestion = {
  id: string;
  authorName: string;
  question: string;
  createdAt: string; // ISO string
  retention: 'ephemeral_24h' | 'permanent';
  expiresAt: string | null; // ISO string for 24h items
  adminReply?: string | null;
  repliedAt?: string | null;
  visitorId?: string; // Track which visitor posted this
  visitorReply?: string | null; // Visitor's own follow-up reply
  visitorReplyAt?: string | null;
};

export type AuthStatus = {
  isAdmin: boolean;
};
