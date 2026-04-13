"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import type { MoodType, MoodHistoryDay } from "@/lib/types";

const MOOD_META: Record<MoodType, { emoji: string; color: string; label: string }> = {
  happy:    { emoji: "😊", color: "#fbbf24", label: "Happy"    },
  excited:  { emoji: "🤩", color: "#f472b6", label: "Excited"  },
  peaceful: { emoji: "😌", color: "#34d399", label: "Peaceful" },
  neutral:  { emoji: "😐", color: "#94a3b8", label: "Neutral"  },
  tired:    { emoji: "😴", color: "#818cf8", label: "Tired"    },
  anxious:  { emoji: "😰", color: "#fb923c", label: "Anxious"  },
  sad:      { emoji: "😢", color: "#60a5fa", label: "Sad"      },
  angry:    { emoji: "😡", color: "#f87171", label: "Angry"    },
};

const DOW_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function moodFrequency(history: MoodHistoryDay[]) {
  const counts: Partial<Record<MoodType, number>> = {};
  for (const { mood } of history) {
    if (mood) counts[mood] = (counts[mood] ?? 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => (b[1] as number) - (a[1] as number)) as [MoodType, number][];
}

function WeekBar({ history }: { history: MoodHistoryDay[] }) {
  // Last 7 days, oldest → newest
  const week = [...history].reverse().slice(-7);
  return (
    <div className="flex gap-1.5 items-end h-16">
      {week.map(({ date, mood }, i) => {
        const color = mood ? MOOD_META[mood].color : "rgba(255,255,255,0.08)";
        const height = mood ? `${40 + Math.random() * 24}px` : "8px"; // visual only
        return (
          <div key={date ?? i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-lg transition-all"
              style={{ height, backgroundColor: color, minHeight: "8px" }}
            />
            <span className="text-[9px] text-[rgba(244,244,248,0.3)]">
              {DOW_LABELS[new Date(date ?? "").getDay()] ?? ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function CalendarScreen() {
  const { history, streak } = useApp();
  const [selected, setSelected] = useState<MoodHistoryDay | null>(null);

  const totalLogged = history.filter((d) => d.mood !== null).length;
  const freq = moodFrequency(history);
  const topMood = freq[0]?.[0];

  // Calendar grid — reverse so oldest is first
  const days = [...history].reverse();
  const firstDow = days.length > 0 ? new Date(days[0].date).getDay() : 0;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex-1 flex flex-col px-5 pt-8 pb-4 gap-5 overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div>
        <p className="text-[var(--foreground-muted)] text-sm font-medium">Your patterns</p>
        <h1 className="text-[1.75rem] font-extrabold text-[var(--foreground)] text-balance leading-tight">
          Mood History
        </h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: `${streak}`, unit: "day streak", color: "#fb923c", icon: "🔥" },
          { value: `${totalLogged}`, unit: "total logs", color: "#a78bfa", icon: "📝" },
          { value: topMood ? MOOD_META[topMood].emoji : "–", unit: topMood ? MOOD_META[topMood].label : "top mood", color: topMood ? MOOD_META[topMood].color : "#94a3b8", icon: null },
        ].map(({ value, unit, color, icon }) => (
          <div
            key={unit}
            className="rounded-2xl p-3 flex flex-col gap-1"
            style={{ background: `${color}12`, border: `1px solid ${color}25` }}
          >
            <span className="text-2xl font-extrabold leading-none" style={{ color }}>
              {icon && value === icon ? value : value}
            </span>
            <span className="text-[10px] text-[var(--foreground-muted)] font-medium leading-tight">{unit}</span>
          </div>
        ))}
      </div>

      {/* Weekly bar chart */}
      <div className="rounded-2xl p-4" style={{ background: "var(--background-card)" }}>
        <p className="text-xs font-semibold text-[var(--foreground-muted)] mb-3">Last 7 days</p>
        <WeekBar history={history} />
      </div>

      {/* Calendar grid */}
      <div className="rounded-2xl p-4" style={{ background: "var(--background-card)" }}>
        <p className="text-xs font-semibold text-[var(--foreground-muted)] mb-3">30-day view</p>
        <div className="grid grid-cols-7 gap-1.5">
          {DOW_LABELS.map((d) => (
            <div key={d} className="text-center text-[9px] text-[var(--foreground-subtle)] pb-1">
              {d}
            </div>
          ))}
          {/* Spacer cells */}
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`sp-${i}`} />
          ))}
          {days.map(({ date, mood }) => {
            const dayNum = new Date(date).getDate();
            const isToday = date === today;
            const meta = mood ? MOOD_META[mood] : null;
            const isSelected = selected?.date === date;
            return (
              <button
                key={date}
                onClick={() => setSelected(isSelected ? null : { date, mood })}
                aria-label={`${date}${mood ? ` — ${MOOD_META[mood].label}` : ""}`}
                className="aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90"
                style={{
                  background: meta ? `${meta.color}20` : "rgba(255,255,255,0.04)",
                  border: isToday
                    ? "1.5px solid #a78bfa"
                    : isSelected
                    ? `1.5px solid ${meta?.color ?? "#a78bfa"}`
                    : "1.5px solid transparent",
                  boxShadow: isSelected && meta ? `0 0 10px ${meta.color}40` : undefined,
                }}
              >
                <span className="text-[9px] leading-none" style={{ color: meta ? meta.color : "rgba(244,244,248,0.25)" }}>
                  {dayNum}
                </span>
                {mood && (
                  <span className="text-sm leading-none">{meta?.emoji}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selected && (
        <div
          className="rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{
            background: selected.mood ? `${MOOD_META[selected.mood].color}12` : "var(--background-card)",
            border: `1px solid ${selected.mood ? `${MOOD_META[selected.mood].color}30` : "rgba(255,255,255,0.08)"}`,
          }}
        >
          <span className="text-4xl">{selected.mood ? MOOD_META[selected.mood].emoji : "⬜"}</span>
          <div>
            <p className="text-sm font-bold text-[var(--foreground)]">
              {selected.mood ? MOOD_META[selected.mood].label : "No entry"}
            </p>
            <p className="text-xs text-[var(--foreground-muted)]">
              {new Date(selected.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </p>
          </div>
        </div>
      )}

      {/* Top moods breakdown */}
      {freq.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: "var(--background-card)" }}>
          <p className="text-xs font-semibold text-[var(--foreground-muted)] mb-3">Vibe breakdown</p>
          <div className="flex flex-col gap-2.5">
            {freq.slice(0, 5).map(([mood, count]) => {
              const { emoji, color, label } = MOOD_META[mood];
              const pct = Math.round((count / totalLogged) * 100);
              return (
                <div key={mood} className="flex items-center gap-3">
                  <span className="text-xl w-6 text-center">{emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold text-[var(--foreground)]">{label}</span>
                      <span className="text-xs" style={{ color }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
