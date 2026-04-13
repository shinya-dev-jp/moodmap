"use client";

import { useApp } from "@/components/providers/AppProvider";
import { useI18n } from "@/i18n";
import type { MoodType } from "@/lib/types";

const MOOD_EMOJI: Record<MoodType, string> = {
  happy:    "😊",
  excited:  "🤩",
  peaceful: "😌",
  neutral:  "😐",
  tired:    "😴",
  anxious:  "😰",
  sad:      "😢",
  angry:    "😡",
};

export function ProfileScreen() {
  const { walletAddress, user, todayMood, streak, history } = useApp();
  const { t } = useI18n();

  const displayName = user?.display_name ?? (walletAddress ? `#${walletAddress.slice(2, 8)}` : "---");
  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "";

  const recentHistory = history.filter((d) => d.mood !== null).slice(0, 14);

  return (
    <div className="flex-1 flex flex-col px-4 pt-6 pb-4 gap-4">
      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F97316] to-[#F59E0B] flex items-center justify-center text-3xl shadow-lg shadow-[#F97316]/30">
          {todayMood ? MOOD_EMOJI[todayMood] : "🌍"}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">{displayName}</h2>
          {joinDate && (
            <p className="text-white/40 text-xs mt-0.5">
              {t("profile.memberSince", { date: joinDate })}
            </p>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-[#F97316]">
            🔥 {user?.streak ?? streak}
          </div>
          <div className="text-white/50 text-xs mt-1">
            {t("profile.streak")} ({t("profile.days")})
          </div>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-[#F59E0B]">
            {user?.best_streak ?? 0}
          </div>
          <div className="text-white/50 text-xs mt-1">
            {t("profile.bestStreak", { n: user?.best_streak ?? 0 })}
          </div>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-white/80">
            {user?.total_logs ?? 0}
          </div>
          <div className="text-white/50 text-xs mt-1">
            {t("profile.totalLogs")}
          </div>
        </div>
      </div>

      {/* Recent moods */}
      {recentHistory.length > 0 && (
        <div className="bg-white/5 rounded-2xl p-4">
          <h3 className="text-white/70 text-sm font-semibold mb-3">
            Recent Moods
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentHistory.map(({ date, mood }) => (
              <div
                key={date}
                className="flex flex-col items-center gap-0.5"
                title={date}
              >
                <span className="text-xl">
                  {mood ? MOOD_EMOJI[mood] : "⬜"}
                </span>
                <span className="text-[9px] text-white/30">
                  {new Date(date).getDate()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wallet address */}
      {walletAddress && (
        <div className="bg-white/5 rounded-2xl p-4">
          <p className="text-white/30 text-[10px] font-mono break-all">
            {walletAddress}
          </p>
        </div>
      )}
    </div>
  );
}
