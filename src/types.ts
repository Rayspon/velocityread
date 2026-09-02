export interface TextItem {
  id: string;
  title: string;
  author?: string;
  content: string;
  progress: number; // percentage 0-100
  lastRead: number; // timestamp
  type: 'Article' | 'Book';
  wordCount?: number;
}

export type ViewState = 'library' | 'input' | 'reader' | 'discover' | 'statistics' | 'account';

export interface UserStats {
  totalReadTimeMs: number;
  averageWpm: number;
  totalWordsRead: number;
  sessions: number;
}

export interface UserProfile {
  username: string;
  name: string;
  joinedAt: number;
}

export interface UserAccount {
  username: string;
  password: string; // Stored securely in local credential store
  name: string;
  joinedAt: number;
  library?: TextItem[];
  stats?: UserStats;
}

export interface AppState {
  view: ViewState;
  library: TextItem[];
  activeTextId: string | null;
  stats: UserStats;
}
