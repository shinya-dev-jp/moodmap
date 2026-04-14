"use client";

import { useState, useRef } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { useI18n } from "@/i18n";
import type { MoodType } from "@/lib/types";
import type { Locale } from "@/i18n";
import { Pencil, Check, X } from "lucide-react";

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

const LOCALES: { code: Locale; label: string }[] = [
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
  { code: "ko", label: "한국어" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "th", label: "ภาษาไทย" },
];

export function ProfileScreen() {
  const { walletAddress, user, todayMood, streak, history, updateDisplayName } = useApp();
  const { t, locale, setLocale } = useI18n();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayName = user?.display_name || t("profile.anonymous");

  function startEdit() {
    setNameInput(user?.display_name ?? "");
    setIsEditingName(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function cancelEdit() {
    setIsEditingName(false);
    setNameInput("");
  }

  async function saveName() {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === user?.display_name) { cancelEdit(); return; }
    setIsSavingName(true);
    try {
      await updateDisplayName(trimmed);
      setIsEditingName(false);
    } finally {
      setIsSavingName(false);
    }
  }

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "—";

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "";

  const recentHistory = history.filter((d) => d.mood !== null).slice(0, 14);

  const moodCounts = history.reduce<Record<string, number>>((acc, d) => {
    if (d.mood) acc[d.mood] = (acc[d.mood] ?? 0) + 1;
    return acc;
  }, {});
  const topVibes = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3) as [MoodType, number][];

  return (
    <div className="flex-1 flex flex-col px-4 pt-6 pb-4 gap-4 overflow-y-auto">
      {/* Avatar + name */}
      <div>
        <p className="text-white/50 text-sm">{t("profile.yourProfile")}</p>

        {/* Nickname row */}
        {isEditingName ? (
          <div className="flex items-center gap-2 mt-1">
            <input
              ref={inputRef}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") cancelEdit(); }}
              maxLength={24}
              className="flex-1 bg-white/10 text-white text-lg font-bold rounded-xl px-3 py-1 outline-none border border-[#F97316]/50 focus:border-[#F97316]"
              placeholder={t("profile.namePlaceholder")}
              disabled={isSavingName}
            />
            <button
              onClick={saveName}
              disabled={isSavingName}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F97316] text-white disabled:opacity-50"
            >
              <Check size={14} />
            </button>
            <button
              onClick={cancelEdit}
              disabled={isSavingName}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/60"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-1">
            <h2 className="text-2xl font-bold text-white">{displayName}</h2>
            <button
              onClick={startEdit}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-white/40 hover:bg-white/20 hover:text-white/70 transition-colors"
            >
              <Pencil size={13} />
            </button>
          </div>
        )}

        <p className="text-white/30 text-xs mt-0.5 font-mono">{shortAddress}</p>
        {joinDate && (
          <p className="text-white/40 text-xs mt-0.5">
            {t("profile.memberSince", { date: joinDate })}
          </p>
        )}
      </div>
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F97316] to-[#F59E0B] flex items-center justify-center text-3xl shadow-lg shadow-[#F97316]/30 ring-4 ring-[#F97316]/30">
          {todayMood ? MOOD_EMOJI[todayMood] : "🌍"}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-[#F97316]">
            🔥 {user?.streak ?? streak}
          </div>
          <div className="text-white/50 text-xs mt-1">
            {t("profile.streak")}
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

      {/* Top vibes */}
      {topVibes.length > 0 && (
        <div className="bg-white/5 rounded-2xl p-4">
          <h3 className="text-white/70 text-sm font-semibold mb-3">{t("profile.topVibes")}</h3>
          <div className="grid grid-cols-3 gap-2">
            {topVibes.map(([mood, count]) => (
              <div key={mood} className="bg-white/5 rounded-xl p-3 flex flex-col items-center gap-1">
                <span className="text-2xl">{MOOD_EMOJI[mood]}</span>
                <span className="text-white/80 text-xs font-medium">{t(`mood.${mood}`)}</span>
                <span className="text-white/30 text-[10px]">{count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent moods trail */}
      {recentHistory.length > 0 && (
        <div className="bg-white/5 rounded-2xl p-4">
          <h3 className="text-white/70 text-sm font-semibold mb-3">{t("profile.recentEntries")}</h3>
          <div className="flex flex-wrap gap-2">
            {recentHistory.map(({ date, mood }) => (
              <div key={date} className="flex flex-col items-center gap-0.5" title={date}>
                <span className="text-xl">{mood ? MOOD_EMOJI[mood as MoodType] : "⬜"}</span>
                <span className="text-[9px] text-white/30">{new Date(date).getDate()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Language toggle */}
      <div className="bg-white/5 rounded-2xl p-4">
        <h3 className="text-white/70 text-sm font-semibold mb-3">{t("profile.langLabel")}</h3>
        <div className="flex flex-wrap gap-2">
          {LOCALES.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLocale(code)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                locale === code
                  ? "bg-[#F97316] text-white"
                  : "bg-white/10 text-white/50 hover:bg-white/20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
