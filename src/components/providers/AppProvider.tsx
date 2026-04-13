"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import type { MoodType, MoodUser, MoodHistoryDay, TabKey } from "@/lib/types";

// ── Mock data for preview (used when not inside World App) ──────
const MOCK_MOODS: MoodType[] = [
  "happy","excited","peaceful","happy","neutral","tired","happy","peaceful",
  "sad","anxious","happy","excited","peaceful","happy","neutral","happy",
  "excited","tired","happy","peaceful","neutral","happy","anxious","excited",
  "happy","peaceful","happy","excited","neutral","happy",
];

function buildMockHistory(): MoodHistoryDay[] {
  const today = new Date();
  return MOCK_MOODS.map((mood, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (MOCK_MOODS.length - 1 - i));
    return { date: d.toISOString().slice(0, 10), mood };
  });
}

const MOCK_HISTORY = buildMockHistory();
const MOCK_USER: MoodUser = {
  address: "0xdemo",
  display_name: "moodmapper",
  streak: 7,
  best_streak: 14,
  total_logs: 30,
  created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
};

interface AppContextValue {
  walletAddress: string | null;
  authToken: string | null;
  user: MoodUser | null;
  todayMood: MoodType | null;
  streak: number;
  history: MoodHistoryDay[];
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  isAuthLoading: boolean;
  handleWalletAuth: () => Promise<void>;
  handleLogMood: (mood: MoodType) => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const AUTH_KEY = "mm_auth_token";
const ADDR_KEY = "mm_wallet_address";

// Evaluated once at module level on the client; false during SSR
const IS_MOCK_MODE =
  typeof window !== "undefined" && !MiniKit.isInstalled();

export function AppProvider({ children }: { children: ReactNode }) {
  const isMockMode = IS_MOCK_MODE;

  const [walletAddress, setWalletAddress] = useState<string | null>(
    isMockMode ? MOCK_USER.address : null
  );
  const [authToken, setAuthToken] = useState<string | null>(
    isMockMode ? "mock-token" : null
  );
  const [user, setUser] = useState<MoodUser | null>(
    isMockMode ? MOCK_USER : null
  );
  const [todayMood, setTodayMood] = useState<MoodType | null>(
    isMockMode ? (MOCK_HISTORY[MOCK_HISTORY.length - 1]?.mood ?? null) : null
  );
  const [streak, setStreak] = useState(isMockMode ? MOCK_USER.streak : 0);
  const [history, setHistory] = useState<MoodHistoryDay[]>(
    isMockMode ? MOCK_HISTORY : []
  );
  const [activeTab, setActiveTab] = useState<TabKey>("mood");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Restore session from localStorage (real mode only)
  useEffect(() => {
    if (isMockMode) return;
    const token = localStorage.getItem(AUTH_KEY);
    const addr = localStorage.getItem(ADDR_KEY);
    if (token && addr) {
      setAuthToken(token);
      setWalletAddress(addr);
    }
  }, [isMockMode]);

  const refreshMe = useCallback(async () => {
    if (isMockMode) return; // mock mode: data already seeded
    const token = authToken ?? localStorage.getItem(AUTH_KEY);
    if (!token) return;
    try {
      const res = await fetch("/api/mood/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setTodayMood(data.today_mood);
      setStreak(data.streak);
      setHistory(data.history ?? []);
    } catch {
      // ignore
    }
  }, [authToken, isMockMode]);

  // Fetch /me whenever auth token is available (real mode only)
  useEffect(() => {
    if (!isMockMode && authToken) refreshMe();
  }, [authToken, isMockMode, refreshMe]);

  const handleWalletAuth = useCallback(async () => {
    if (!MiniKit.isInstalled()) return;
    setIsAuthLoading(true);
    try {
      const nonceRes = await fetch("/api/auth/nonce");
      const { nonce } = await nonceRes.json();

      const { commandPayload, finalPayload } =
        await MiniKit.commandsAsync.walletAuth({
          nonce,
          statement: "Sign in to MoodMap",
          expirationTime: new Date(Date.now() + 10 * 60 * 1000),
        });

      if (finalPayload.status === "error" || !commandPayload) return;

      const authRes = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: finalPayload, nonce }),
      });

      if (!authRes.ok) return;
      const { success, auth_token, user: u } = await authRes.json();
      if (!success) return;

      const addr = (finalPayload as { address?: string }).address?.toLowerCase() ?? "";
      setAuthToken(auth_token);
      setWalletAddress(addr);
      setUser(u);
      localStorage.setItem(AUTH_KEY, auth_token);
      localStorage.setItem(ADDR_KEY, addr);

      await refreshMe();
    } finally {
      setIsAuthLoading(false);
    }
  }, [refreshMe]);

  const handleLogMood = useCallback(
    async (mood: MoodType) => {
      if (isMockMode) {
        setTodayMood(mood);
        setStreak((s) => s + 1);
        return;
      }
      const token = authToken ?? localStorage.getItem(AUTH_KEY);
      if (!token) return;
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mood }),
      });
      const data = await res.json();
      if (data.success) {
        setTodayMood(mood);
        setStreak(data.streak ?? streak);
        await refreshMe();
      }
    },
    [authToken, isMockMode, streak, refreshMe]
  );

  return (
    <AppContext.Provider
      value={{
        walletAddress,
        authToken,
        user,
        todayMood,
        streak,
        history,
        activeTab,
        setActiveTab,
        isAuthLoading,
        handleWalletAuth,
        handleLogMood,
        refreshMe,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
