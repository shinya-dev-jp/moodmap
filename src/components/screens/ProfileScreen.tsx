"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import type { MoodType } from "@/lib/types";

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

function moodTopThree(history: { date: string; mood: MoodType | null }[]): [MoodType, number][] {
  const counts: Partial<Record<MoodType, number>> = {};
  for (const { mood } of history) {
    if (mood) counts[mood] = (counts[mood] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 3) as [MoodType, number][];
}

interface VibeCardProps {
  displayName: string;
  streak: number;
  totalLogs: number;
  topMoods: [MoodType, number][];
}

function VibeCard({ displayName, streak, totalLogs, topMoods }: VibeCardProps) {
  return (
    <div
      className="w-full rounded-3xl p-6 flex flex-col gap-4"
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        border: "1px solid rgba(167,139,250,0.3)",
        boxShadow: "0 0 40px rgba(167,139,250,0.12)",
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[rgba(167,139,250,0.7)] uppercase">MoodMap</p>
          <p className="text-white font-extrabold text-lg leading-tight mt-0.5">{displayName}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)" }}>
          🌍
        </div>
      </div>

      {/* Mood trail */}
      <div className="flex gap-1.5">
        {topMoods.map(([mood]) => (
          <div
            key={mood}
            className="flex-1 flex flex-col items-center gap-1 rounded-xl py-2"
            style={{ background: `${MOOD_META[mood].color}18`, border: `1px solid ${MOOD_META[mood].color}30` }}
          >
            <span className="text-2xl">{MOOD_META[mood].emoji}</span>
            <span className="text-[9px] font-bold" style={{ color: MOOD_META[mood].color }}>
              {MOOD_META[mood].label}
            </span>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="flex gap-3">
        <div className="flex-1 text-center">
          <p className="text-xl font-extrabold" style={{ color: "#fb923c" }}>🔥 {streak}</p>
          <p className="text-[9px] text-[rgba(255,255,255,0.4)] mt-0.5">day streak</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-xl font-extrabold text-white">{totalLogs}</p>
          <p className="text-[9px] text-[rgba(255,255,255,0.4)] mt-0.5">total logs</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-xl font-extrabold" style={{ color: "#a78bfa" }}>
            {topMoods[0] ? MOOD_META[topMoods[0][0]].emoji : "–"}
          </p>
          <p className="text-[9px] text-[rgba(255,255,255,0.4)] mt-0.5">top mood</p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-[9px] text-[rgba(255,255,255,0.2)] text-center tracking-wider">
        moodmap.world
      </p>
    </div>
  );
}

export function ProfileScreen() {
  const { walletAddress, user, todayMood, streak, history } = useApp();
  const [showShareCard, setShowShareCard] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayName =
    user?.display_name ?? (walletAddress ? `#${walletAddress.slice(2, 8).toUpperCase()}` : "---");
  const totalLogs = user?.total_logs ?? history.filter((d) => d.mood !== null).length;
  const bestStreak = user?.best_streak ?? 0;
  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  const topMoods = moodTopThree(history);
  const topMood = topMoods[0]?.[0];

  const avatarColor = topMood ? MOOD_META[topMood].color : "#a78bfa";
  const avatarEmoji = todayMood ? MOOD_META[todayMood].emoji : topMood ? MOOD_META[topMood].emoji : "🌍";

  const handleShare = async () => {
    const text = `My MoodMap vibe: ${topMoods.map(([m]) => MOOD_META[m].emoji).join("")} — ${streak} day streak & ${totalLogs} logs. Check yours at moodmap.world`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex-1 flex flex-col px-5 pt-8 pb-4 gap-5 overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div>
        <p className="text-[var(--foreground-muted)] text-sm font-medium">Your profile</p>
        <h1 className="text-[1.75rem] font-extrabold text-[var(--foreground)] text-balance leading-tight">
          {displayName}
        </h1>
        {joinDate && (
          <p className="text-[var(--foreground-subtle)] text-xs mt-0.5">Member since {joinDate}</p>
        )}
      </div>

      {/* Avatar ring */}
      <div className="flex justify-center">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
          style={{
            background: `${avatarColor}18`,
            border: `2.5px solid ${avatarColor}50`,
            boxShadow: `0 0 32px ${avatarColor}30`,
          }}
        >
          {avatarEmoji}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: streak,     label: "Current streak", color: "#fb923c", suffix: "days" },
          { value: bestStreak, label: "Best streak",    color: "#a78bfa", suffix: "days" },
          { value: totalLogs,  label: "Total logs",     color: "#34d399", suffix: "" },
        ].map(({ value, label, color, suffix }) => (
          <div
            key={label}
            className="rounded-2xl p-3 flex flex-col gap-1"
            style={{ background: `${color}10`, border: `1px solid ${color}20` }}
          >
            <span className="text-2xl font-extrabold" style={{ color }}>
              {value}
              {suffix && <span className="text-sm font-medium ml-0.5 opacity-70">{suffix}</span>}
            </span>
            <span className="text-[10px] text-[var(--foreground-muted)] font-medium leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {/* Recent moods trail */}
      {topMoods.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: "var(--background-card)" }}>
          <p className="text-xs font-semibold text-[var(--foreground-muted)] mb-3">Your top vibes</p>
          <div className="flex gap-2">
            {topMoods.map(([mood, count]) => {
              const { emoji, color, label } = MOOD_META[mood];
              return (
                <div
                  key={mood}
                  className="flex-1 flex flex-col items-center gap-1.5 rounded-2xl py-3"
                  style={{ background: `${color}12`, border: `1px solid ${color}25` }}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-[10px] font-bold" style={{ color }}>{label}</span>
                  <span className="text-[9px] text-[var(--foreground-muted)]">{count}x</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent history pills */}
      <div className="rounded-2xl p-4" style={{ background: "var(--background-card)" }}>
        <p className="text-xs font-semibold text-[var(--foreground-muted)] mb-3">Recent entries</p>
        <div className="flex flex-wrap gap-1.5">
          {history
            .filter((d) => d.mood !== null)
            .slice(0, 21)
            .map(({ date, mood }) => {
              const meta = mood ? MOOD_META[mood] : null;
              return (
                <div
                  key={date}
                  className="flex flex-col items-center gap-0.5"
                  title={`${date} — ${mood ? MOOD_META[mood].label : ""}`}
                >
                  <span className="text-xl">{meta?.emoji ?? "⬜"}</span>
                  <span className="text-[8px]" style={{ color: "rgba(244,244,248,0.25)" }}>
                    {new Date(date).getDate()}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Share vibe button */}
      <button
        onClick={() => setShowShareCard(!showShareCard)}
        className="w-full py-4 rounded-2xl font-bold text-sm text-white transition-all active:scale-95"
        style={{
          background: "linear-gradient(135deg, #a78bfa, #818cf8)",
          boxShadow: "0 4px 20px rgba(167,139,250,0.3)",
        }}
      >
        {showShareCard ? "Hide card" : "Share your vibe"}
      </button>

      {/* Share card */}
      {showShareCard && (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <VibeCard
            displayName={displayName}
            streak={streak}
            totalLogs={totalLogs}
            topMoods={topMoods}
          />
          <button
            onClick={handleShare}
            className="w-full py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95"
            style={{
              background: "rgba(167,139,250,0.15)",
              border: "1px solid rgba(167,139,250,0.3)",
              color: "#a78bfa",
            }}
          >
            {copied ? "Copied to clipboard!" : "Share"}
          </button>
        </div>
      )}
    </div>
  );
}
