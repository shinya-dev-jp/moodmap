"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import type { MoodMapResponse, MoodType } from "@/lib/types";

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

const MOOD_COLOR: Record<MoodType, string> = {
  happy:    "#FBBF24",
  excited:  "#F472B6",
  peaceful: "#34D399",
  neutral:  "#94A3B8",
  tired:    "#818CF8",
  anxious:  "#FCD34D",
  sad:      "#60A5FA",
  angry:    "#F87171",
};

export function MapScreen() {
  const { t } = useI18n();
  const [data, setData] = useState<MoodMapResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/mood/map")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const countries = data?.countries ?? [];
  const total = data?.total_today ?? 0;

  return (
    <div className="flex-1 flex flex-col px-4 pt-6 pb-4 gap-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">{t("map.title")}</h1>
        <p className="text-white/50 text-sm mt-1">
          {total > 0
            ? t("map.totalToday", { n: total })
            : t("map.subtitle")}
        </p>
      </div>

      {countries.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/40 text-sm">{t("map.noData")}</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
          {countries.slice(0, 20).map((c) => {
            const pct = Math.round((c.total / Math.max(total, 1)) * 100);
            const color = MOOD_COLOR[c.top_mood] ?? "#94A3B8";
            return (
              <div
                key={c.code}
                className="bg-white/5 rounded-2xl p-4 flex items-center gap-3"
              >
                <span className="text-2xl w-8 text-center">
                  {MOOD_EMOJI[c.top_mood]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-semibold text-sm">
                      {c.code}
                    </span>
                    <span className="text-white/50 text-xs">{c.total} people</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
                <span
                  className="text-xs font-bold"
                  style={{ color }}
                >
                  {t(`mood.${c.top_mood}` as `mood.${MoodType}`)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
