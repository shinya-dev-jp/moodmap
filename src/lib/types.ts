export type MoodType =
  | "happy" | "neutral" | "sad" | "angry"
  | "tired" | "excited" | "anxious" | "peaceful";

export type TabKey = "mood" | "map" | "calendar" | "profile";

export interface MoodEntry {
  id: string;
  user_address: string;
  mood: MoodType;
  country_code: string;
  created_at: string;
}

export interface MoodUser {
  address: string;
  display_name: string;
  streak: number;
  best_streak: number;
  total_logs: number;
  created_at: string;
}

export interface CountryMoodData {
  code: string;
  moods: Record<MoodType, number>;
  total: number;
  top_mood: MoodType;
}

export interface MoodMapResponse {
  countries: CountryMoodData[];
  total_today: number;
}

export interface MoodHistoryDay {
  date: string;
  mood: MoodType | null;
}

export interface MoodMeResponse {
  history: MoodHistoryDay[];
  streak: number;
  best_streak: number;
  total_logs: number;
  today_mood: MoodType | null;
}
