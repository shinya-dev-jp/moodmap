"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { useI18n } from "@/i18n";
import type { MoodType } from "@/lib/types";

const MOODS: {
  key: MoodType;
  emoji: string;
  label: string;
  color: string;
  bg: string;
  glow: string;
}[] = [
  { key: "happy",    emoji: "😊", label: "Happy",    color: "#fbbf24", bg: "bg-[#fbbf24]/15", glow: "shadow-[0_0_24px_rgba(251,191,36,0.35)]"   },
  { key: "excited",  emoji: "🤩", label: "Excited",  color: "#f472b6", bg: "bg-[#f472b6]/15", glow: "shadow-[0_0_24px_rgba(244,114,182,0.35)]"  },
  { key: "peaceful", emoji: "😌", label: "Peaceful", color: "#34d399", bg: "bg-[#34d399]/15", glow: "shadow-[0_0_24px_rgba(52,211,153,0.35)]"   },
  { key: "neutral",  emoji: "😐", label: "Neutral",  color: "#94a3b8", bg: "bg-[#94a3b8]/15", glow: "shadow-[0_0_24px_rgba(148,163,184,0.25)]"  },
  { key: "tired",    emoji: "😴", label: "Tired",    color: "#818cf8", bg: "bg-[#818cf8]/15", glow: "shadow-[0_0_24px_rgba(129,140,248,0.35)]"  },
  { key: "anxious",  emoji: "😰", label: "Anxious",  color: "#fb923c", bg: "bg-[#fb923c]/15", glow: "shadow-[0_0_24px_rgba(251,146,60,0.35)]"   },
  { key: "sad",      emoji: "😢", label: "Sad",      color: "#60a5fa", bg: "bg-[#60a5fa]/15", glow: "shadow-[0_0_24px_rgba(96,165,250,0.35)]"   },
  { key: "angry",    emoji: "😡", label: "Angry",    color: "#f87171", bg: "bg-[#f87171]/15", glow: "shadow-[0_0_24px_rgba(248,113,113,0.35)]"  },
];

interface NoteInputProps {
  onSave: (note: string) => void;
  onSkip: () => void;
}

function NoteInput({ onSave, onSkip }: NoteInputProps) {
  const [note, setNote] = useState("");

  return (
    <div className="w-full flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <p className="text-[var(--foreground-muted)] text-sm text-center">
        Add a quick note? (optional)
      </p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What's on your mind..."
        maxLength={140}
        rows={3}
        className="w-full bg-[var(--background-elevated)] text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] rounded-2xl px-4 py-3 text-sm resize-none outline-none border border-white/10 focus:border-white/25 transition-colors"
      />
      <div className="flex gap-2">
        <button
          onClick={onSkip}
          className="flex-1 py-3 rounded-2xl bg-white/5 text-[var(--foreground-muted)] text-sm font-semibold active:scale-95 transition-transform"
        >
          Skip
        </button>
        <button
          onClick={() => onSave(note)}
          className="flex-1 py-3 rounded-2xl bg-[var(--accent)] text-white text-sm font-bold active:scale-95 transition-transform"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export function MoodScreen() {
  const { todayMood, streak, handleLogMood } = useApp();
  const { t } = useI18n();
  const [pendingMood, setPendingMood] = useState<MoodType | null>(null);
  const [showNote, setShowNote] = useState(false);

  const selectedMood = todayMood;
  const moodData = MOODS.find((m) => m.key === selectedMood);
  const pendingData = MOODS.find((m) => m.key === pendingMood);

  const handleTap = (key: MoodType) => {
    if (todayMood) return;
    setPendingMood(key);
    setShowNote(true);
  };

  const confirmLog = async (note: string) => {
    if (!pendingMood) return;
    setShowNote(false);
    await handleLogMood(pendingMood);
    setPendingMood(null);
  };

  const cancelNote = () => {
    setShowNote(false);
    setPendingMood(null);
  };

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex-1 flex flex-col px-5 pt-8 pb-4 gap-6 overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-[var(--foreground-muted)] text-sm font-medium">{greeting}</p>
        <h1 className="text-[1.75rem] font-extrabold text-[var(--foreground)] leading-tight text-balance">
          {selectedMood
            ? `Feeling ${moodData?.label ?? selectedMood} today`
            : "How are you feeling?"}
        </h1>
        {streak > 0 && (
          <div
            className="mt-1 inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c" }}
          >
            <span>&#128293;</span>
            {streak}-day streak
          </div>
        )}
      </div>

      {/* Selected mood display */}
      {selectedMood && moodData && (
        <div
          className="flex flex-col items-center gap-2 py-6 rounded-3xl animate-in zoom-in-95 fade-in duration-300"
          style={{ background: `${moodData.color}18`, border: `1.5px solid ${moodData.color}35` }}
        >
          <span className="text-7xl leading-none">{moodData.emoji}</span>
          <span className="text-base font-bold" style={{ color: moodData.color }}>
            {moodData.label}
          </span>
          <p className="text-[var(--foreground-muted)] text-xs">Logged for today</p>
        </div>
      )}

      {/* Note input overlay */}
      {showNote && pendingData && !todayMood && (
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-5xl"
            style={{ background: `${pendingData.color}20`, boxShadow: `0 0 32px ${pendingData.color}40` }}
          >
            {pendingData.emoji}
          </div>
          <p className="text-[var(--foreground)] font-bold text-lg">{pendingData.label}</p>
          <NoteInput onSave={confirmLog} onSkip={() => confirmLog("")} />
        </div>
      )}

      {/* Mood grid */}
      {!showNote && (
        <div className="grid grid-cols-4 gap-3">
          {MOODS.map(({ key, emoji, label, color, bg, glow }) => {
            const isSelected = selectedMood === key;
            const isDimmed = !!selectedMood && !isSelected;
            return (
              <button
                key={key}
                onClick={() => handleTap(key)}
                disabled={!!todayMood}
                aria-label={label}
                className={[
                  "flex flex-col items-center gap-2 py-4 px-2 rounded-2xl transition-all duration-200 active:scale-90",
                  isSelected ? `${bg} ${glow} scale-105` : isDimmed ? "bg-white/5 opacity-30" : "bg-[var(--background-card)] hover:bg-[var(--background-elevated)]",
                ].join(" ")}
                style={isSelected ? { border: `1.5px solid ${color}50` } : { border: "1.5px solid transparent" }}
              >
                <span className="text-3xl leading-none">{emoji}</span>
                <span
                  className="text-[10px] font-semibold leading-none"
                  style={{ color: isSelected ? color : "rgba(244,244,248,0.6)" }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Bottom hint */}
      {!todayMood && !showNote && (
        <p className="text-center text-[var(--foreground-subtle)] text-xs">
          Tap a mood to log it — takes less than 5 seconds
        </p>
      )}
    </div>
  );
}
