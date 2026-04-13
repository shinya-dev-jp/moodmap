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

const MOOD_BG: Record<MoodType, string> = {
  happy:    "bg-yellow-400/80",
  excited:  "bg-pink-400/80",
  peaceful: "bg-teal-400/80",
  neutral:  "bg-slate-400/80",
  tired:    "bg-indigo-400/80",
  anxious:  "bg-amber-400/80",
  sad:      "bg-blue-400/80",
  angry:    "bg-red-400/80",
};

export function CalendarScreen() {
  const { history, streak, refreshMe } = useApp();
  const { t } = useI18n();

  // history[0] = today, history[29] = 30 days ago; reverse for display
  const days = [...history].reverse();
  const best = history.reduce((max, d) => {
    // This is a simplification; actual best_streak comes from /me
    return max;
  }, 0);

  return (
    <div className="flex-1 flex flex-col px-4 pt-6 pb-4 gap-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">{t("calendar.title")}</h1>
        <p className="text-white/50 text-sm mt-1">{t("calendar.subtitle")}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-2xl p-3 text-center">
          <div className="text-2xl font-bold text-[#F97316]">🔥 {streak}</div>
          <div className="text-white/50 text-xs mt-1">
            {t("calendar.streak", { n: streak })}
          </div>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 text-center">
          <div className="text-2xl font-bold text-[#F59E0B]">
            {history.filter((d) => d.mood !== null).length}
          </div>
          <div className="text-white/50 text-xs mt-1">
            {t("calendar.totalLogs", { n: history.filter((d) => d.mood !== null).length })}
          </div>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 text-center">
          <div className="text-2xl font-bold text-white/70">30</div>
          <div className="text-white/50 text-xs mt-1">{t("calendar.subtitle")}</div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 gap-1.5">
          {/* Day labels */}
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <div key={i} className="text-center text-white/30 text-[10px] py-1">
              {d}
            </div>
          ))}

          {/* Spacer cells to align first day */}
          {days.length > 0 && (() => {
            const firstDate = new Date(days[0].date);
            const dow = firstDate.getDay();
            return Array.from({ length: dow }).map((_, i) => (
              <div key={`spacer-${i}`} />
            ));
          })()}

          {/* Day cells */}
          {days.map(({ date, mood }) => {
            const d = new Date(date);
            const day = d.getDate();
            const isToday = date === new Date().toISOString().slice(0, 10);
            return (
              <div
                key={date}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs ${
                  mood
                    ? `${MOOD_BG[mood]} text-white`
                    : "bg-white/5 text-white/30"
                } ${isToday ? "ring-2 ring-[#F97316]" : ""}`}
              >
                <span className="text-[10px] leading-none opacity-70">{day}</span>
                {mood && (
                  <span className="text-base leading-none">{MOOD_EMOJI[mood]}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
