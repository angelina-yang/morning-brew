// ─── Output Language ───

export type OutputLanguage = "en" | "zh" | "es" | "ja" | "ko" | "fr" | "de" | "pt";

// ─── API Keys (localStorage) ───

export interface ApiKeys {
  yutoriApiKey: string;
  claudeApiKey: string;
  outputLanguage: OutputLanguage;
  keysValidated: boolean;
}

// ─── Yutori API Types ───

export interface YutoriScout {
  id: string;
  query: string;
  status: "active" | "paused" | "done";
  output_interval: number;
  user_timezone: string;
  created_at: string;
  updated_at: string;
}

export interface YutoriScoutCreate {
  query: string;
  output_interval?: number;
  user_timezone?: string;
  skip_email?: boolean;
}

export interface YutoriSource {
  url: string;
  title: string;
  snippet?: string;
}

export interface YutoriUpdate {
  id: string;
  scout_id: string;
  content: string;
  sources: YutoriSource[];
  created_at: string;
}

// ─── App Types ───

export interface DigestItem {
  id: string;
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  scoutQuery: string;
  timestamp: string;
  selected: boolean;
}

export interface Digest {
  items: DigestItem[];
  generatedAt: string;
}

// ─── Draft Types ───

export type Platform = "tweet" | "linkedin";

export interface DraftInstructions {
  tweet: string;
  linkedin: string;
}

// ─── User Types ───

export interface UserInfo {
  name: string;
  email: string;
  registeredAt: string;
}
