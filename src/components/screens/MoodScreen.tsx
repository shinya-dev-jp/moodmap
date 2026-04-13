"use client";

import { useApp } from "@/components/providers/AppProvider";
import { useI18n } from "@/i18n";
import type { MoodType } from "@/lib/types";

const MOODS: { key: MoodType; emoji: string; color: string }[] = [
  { key: "happy",    emoji: "😊", color: "from-yellow-400 to-orange-400" },
  { key: "excited",  emoji: "🤩", color: "from-pink-400 to-rose-500" },
  { key: "peaceful", emoji: "😌", color: "from-teal-400 to-cyan-500" },
  { key: "neutral",  emoji: "😐", color: "from-slate-400 to-slate-500" },
  { key: "tired",    emoji: "😴", color: "from-indigo-400 to-violet-500" },
  { key: "anxious",  emoji: "😰", color: "from-amber-400 to-yellow-500" },
  { key: "sad",      emoji: "😢", color: "from-blue-400 to-blue-600" },
  { key: "angry",    emoji: "😡", color: "from-red-400 to-red-600" },
];

export function MoodScreen() {
  const { todayMood, streak, handleLogMood } = useApp();
  const { t } = useI18n();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="flex-1 flex flex-col px-4 pt-6 pb-4 gap-4 overflow-y-auto">
      {/* Header */}
      <div>
        <p className="text-white/50 text-sm">{greeting}</p>
        <h1 className="text-2xl font-bold text-white leading-tight">
          {todayMood
            ? `Feeling ${t(`mood.${todayMood}`)} today`
            : t("mood.title")}
        </h1>
        {streak > 0 && (
          <div className="mt-2 inline-flex items-center gap-1.5 bg-[#F97316]/20 text-[#F97316] px-3 py-1 rounded-full text-sm font-semibold">
            🔥 {t("mood.streak", { n: streak })}
          </div>
        )}
      </div>

      {/* Today's mood card */}
      {todayMood ? (
        <div className="w-full rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center py-8 gap-2">
          <span className="text-6xl">{MOODS.find((m) => m.key === todayMood)?.emoji}</span>
          <span className="text-white font-semibold text-lg">{t(`mood.${todayMood}`)}</span>
          <span className="text-white/40 text-sm">Logged for today</span>
        </div>
      ) : (
        <div className="w-full rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center py-6 gap-1">
          <span className="text-white/40 text-sm">How are you feeling today?</span>
          <span className="text-white/20 text-xs">Tap a mood below</span>
        </div>
      )}

      {/* Mood grid */}
      <div className="w-full grid grid-cols-4 gap-2.5">
        {MOODS.map(({ key, emoji, color }) => {
          const isSelected = todayMood === key;
          return (
            <button
              key={key}
              onClick={() => !todayMood && handleLogMood(key)}
              disabled={!!todayMood}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all active:scale-95 ${
                isSelected
                  ? `bg-gradient-to-br ${color} shadow-lg scale-105`
                  : todayMood
                  ? "bg-white/5 opacity-40 cursor-not-allowed"
                  : "bg-white/10 hover:bg-white/15 cursor-pointer"
              }`}
            >
              <span className="text-3xl leading-none">{emoji}</span>
              <span className="text-[10px] text-white/80 font-medium truncate w-full text-center">
                {t(`mood.${key}`)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
