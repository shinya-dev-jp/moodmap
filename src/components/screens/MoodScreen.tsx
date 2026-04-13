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

  return (
    <div className="flex-1 flex flex-col items-center px-4 pt-8 pb-4 gap-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">
          {todayMood
            ? t("mood.todaysMood", { mood: t(`mood.${todayMood}`) })
            : t("mood.title")}
        </h1>
        <p className="text-white/50 text-sm mt-1">
          {todayMood ? t("mood.alreadyLogged") : t("mood.subtitle")}
        </p>
        {streak > 0 && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-[#F97316]/20 text-[#F97316] px-3 py-1 rounded-full text-sm font-semibold">
            🔥 {t("mood.streak", { n: streak })}
          </div>
        )}
      </div>

      {/* Today's mood big display */}
      {todayMood && (
        <div className="w-32 h-32 rounded-full flex items-center justify-center text-6xl bg-gradient-to-br from-[#F97316]/30 to-[#F59E0B]/20 border-2 border-[#F97316]/40 shadow-lg shadow-[#F97316]/20">
          {MOODS.find((m) => m.key === todayMood)?.emoji}
        </div>
      )}

      {/* Mood grid */}
      <div className="w-full max-w-sm grid grid-cols-4 gap-3">
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
                  : "bg-white/10 hover:bg-white/15"
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

      {todayMood && (
        <p className="text-white/30 text-xs text-center">
          {t("mood.alreadyLogged")} — {t("mood.logged")}
        </p>
      )}
    </div>
  );
}
