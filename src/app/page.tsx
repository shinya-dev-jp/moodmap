"use client";

import { useApp, AppProvider } from "@/components/providers/AppProvider";
import { I18nProvider, useI18n } from "@/i18n";
import { Navigation } from "@/components/Navigation";
import { MoodScreen } from "@/components/screens/MoodScreen";
import { MapScreen } from "@/components/screens/MapScreen";
import { CalendarScreen } from "@/components/screens/CalendarScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { MiniKit } from "@worldcoin/minikit-js";

// ── Wallet Auth Screen ─────────────────────────────────────────
function WalletAuthScreen() {
  const { handleWalletAuth, isAuthLoading } = useApp();
  const { t } = useI18n();

  const isInWorldApp =
    typeof window !== "undefined" && MiniKit.isInstalled();

  const features = [
    { emoji: "😊", text: "Log your mood in under 5 seconds" },
    { emoji: "📊", text: "Discover your emotional patterns" },
    { emoji: "🔥", text: "Build streaks & share your vibe" },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 text-center">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
          style={{
            background: "linear-gradient(135deg, rgba(167,139,250,0.25), rgba(129,140,248,0.15))",
            border: "1.5px solid rgba(167,139,250,0.35)",
            boxShadow: "0 0 40px rgba(167,139,250,0.2)",
          }}
        >
          🌍
        </div>
        <h1 className="text-3xl font-extrabold" style={{ color: "var(--foreground)" }}>
          MoodMap
        </h1>
        <p className="text-sm max-w-xs" style={{ color: "var(--foreground-muted)" }}>
          {t("verify.subtitle")}
        </p>
      </div>

      {/* Features */}
      <div className="flex flex-col gap-2.5 w-full max-w-xs">
        {features.map(({ emoji, text }) => (
          <div
            key={text}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: "var(--background-card)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-xl">{emoji}</span>
            <span className="text-sm" style={{ color: "var(--foreground-muted)" }}>{text}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      {!isInWorldApp ? (
        <p className="text-sm" style={{ color: "var(--foreground-subtle)" }}>
          {t("verify.notInWorldApp")}
        </p>
      ) : (
        <button
          onClick={handleWalletAuth}
          disabled={isAuthLoading}
          className="w-full max-w-xs font-bold py-4 rounded-2xl active:scale-95 transition-all disabled:opacity-60 text-white"
          style={{
            background: "linear-gradient(135deg, #a78bfa, #818cf8)",
            boxShadow: "0 4px 24px rgba(167,139,250,0.3)",
          }}
        >
          {isAuthLoading ? t("verify.verifying") : t("verify.button")}
        </button>
      )}

      <p className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
        {t("verify.footer")}
      </p>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────
function MoodMapApp() {
  const { walletAddress, activeTab, setActiveTab, todayMood } = useApp();

  if (!walletAddress) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
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
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
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
