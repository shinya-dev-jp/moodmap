"use client";

import { useApp, AppProvider } from "@/components/providers/AppProvider";
import { I18nProvider, useI18n } from "@/i18n";
import { Navigation } from "@/components/Navigation";
import { MoodScreen } from "@/components/screens/MoodScreen";
import { MapScreen } from "@/components/screens/MapScreen";
import { CalendarScreen } from "@/components/screens/CalendarScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { MiniKit } from "@worldcoin/minikit-js";

// ── Not in World App Screen ────────────────────────────────────
function NotInWorldAppScreen() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0F0C29] via-[#1E1B4B] to-[#111827] px-8 gap-6 text-center">
      <div className="w-20 h-20 rounded-2xl overflow-hidden drop-shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-512.png" alt="MoodMap" width={80} height={80} className="w-full h-full object-cover" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-white">{t("notInWorldApp.title")}</h1>
        <p className="text-white/50 text-sm mt-2 leading-relaxed max-w-[280px]">
          {t("notInWorldApp.line1")}
        </p>
        <p className="text-white/50 text-sm leading-relaxed max-w-[280px]">
          {t("notInWorldApp.line2")}
        </p>
      </div>
      <a
        href="https://worldcoin.org/download"
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#F97316] to-[#F59E0B] text-white font-bold text-sm shadow-lg shadow-[#F97316]/30"
      >
        {t("notInWorldApp.button")}
      </a>
      <p className="text-white/20 text-xs">{t("verify.footer")}</p>
    </div>
  );
}

// ── Wallet Auth Screen ─────────────────────────────────────────
const MOOD_FLOATS = ["😊", "😢", "😡", "😴", "🥰", "😎", "😰", "🤩"];

function WalletAuthScreen() {
  const { handleWalletAuth, isAuthLoading } = useApp();
  const { t } = useI18n();

  const isInWorldApp =
    typeof window !== "undefined" && MiniKit.isInstalled();

  if (!isInWorldApp) return <NotInWorldAppScreen />;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-b from-[#0F0C29] via-[#1E1B4B] to-[#111827] relative overflow-hidden">
      {/* Floating mood emojis background */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
        {MOOD_FLOATS.map((emoji, i) => (
          <span
            key={i}
            className="absolute text-2xl opacity-10"
            style={{
              left: `${10 + (i * 11) % 80}%`,
              top: `${8 + (i * 17) % 75}%`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 text-center relative z-10">
        {/* Hero */}
        <div className="flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-512.png" alt="MoodMap" width={96} height={96} className="drop-shadow-2xl" />
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">{t("app.title")}</h1>
            <p className="text-white/50 text-sm mt-1 max-w-[260px]">{t("verify.subtitle")}</p>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-col gap-2.5 w-full max-w-[300px]">
          {([
            { key: "verify.feature1", emoji: "😊", color: "from-orange-500/20 to-orange-500/5", border: "border-orange-500/20" },
            { key: "verify.feature2", emoji: "🗺️", color: "from-indigo-500/20 to-indigo-500/5", border: "border-indigo-500/20" },
            { key: "verify.feature3", emoji: "🔥", color: "from-rose-500/20 to-rose-500/5",    border: "border-rose-500/20" },
          ] as const).map(({ key, emoji, color, border }) => (
            <div
              key={key}
              className={`flex items-center gap-3 bg-gradient-to-r ${color} border ${border} rounded-2xl px-4 py-3`}
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-white/80 text-sm font-medium">{t(key)}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 w-full max-w-[300px]">
          <button
            onClick={handleWalletAuth}
            disabled={isAuthLoading}
            className="w-full bg-gradient-to-r from-[#F97316] to-[#F59E0B] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#F97316]/40 active:scale-95 transition-all disabled:opacity-60 text-base"
          >
            {isAuthLoading ? t("verify.verifying") : t("verify.button")}
          </button>
          <p className="text-white/20 text-xs">{t("verify.footer")}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────
function MoodMapApp() {
  const { walletAddress, activeTab, setActiveTab, todayMood } = useApp();

  if (!walletAddress) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#1E1B4B] via-[#1E1B4B] to-[#111827]">
        <WalletAuthScreen />
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "mood":     return <MoodScreen />;
      case "map":      return <MapScreen />;
      case "calendar": return <CalendarScreen />;
      case "profile":  return <ProfileScreen />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#1E1B4B] via-[#1E1B4B] to-[#111827]">
      {renderTab()}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasNewMood={!todayMood}
      />
    </div>
  );
}

// ── Root export ─────────────────────────────────────────────────
export default function Page() {
  return (
    <I18nProvider>
      <AppProvider>
        <MoodMapApp />
      </AppProvider>
    </I18nProvider>
  );
}
