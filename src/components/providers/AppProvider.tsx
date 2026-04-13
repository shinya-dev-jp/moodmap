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
  updateDisplayName: (name: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const AUTH_KEY = "mm_auth_token";
const ADDR_KEY = "mm_wallet_address";

export function AppProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<MoodUser | null>(null);
  const [todayMood, setTodayMood] = useState<MoodType | null>(null);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState<MoodHistoryDay[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("mood");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEY);
    const addr = localStorage.getItem(ADDR_KEY);
    if (token && addr) {
      setAuthToken(token);
      setWalletAddress(addr);
    }
  }, []);

  const refreshMe = useCallback(async () => {
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
  }, [authToken]);

  // Fetch /me whenever auth token is available
  useEffect(() => {
    if (authToken) refreshMe();
  }, [authToken, refreshMe]);

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

  const updateDisplayName = useCallback(
    async (name: string) => {
      const token = authToken ?? localStorage.getItem(AUTH_KEY);
      if (!token) return;
      const res = await fetch("/api/mood/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ display_name: name }),
      });
      if (res.ok) {
        setUser((prev) => prev ? { ...prev, display_name: name } : prev);
      }
    },
    [authToken]
  );

  const handleLogMood = useCallback(
    async (mood: MoodType) => {
      const token = authToken ?? localStorage.getItem(AUTH_KEY);
      if (!token) return;
      // Optimistic update: respond immediately before API call
      setTodayMood(mood);
      try {
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
          setStreak(data.streak ?? streak);
          await refreshMe();
        } else {
          // Revert on failure
          setTodayMood(null);
        }
      } catch {
        setTodayMood(null);
      }
    },
    [authToken, streak, refreshMe]
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
        updateDisplayName,
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
