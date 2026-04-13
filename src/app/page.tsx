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

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 text-center">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl shadow-[#F97316]/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-512.png" alt="MoodMap" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-3xl font-bold text-white">{t("app.title")}</h1>
        <p className="text-white/60 text-sm max-w-xs">{t("verify.subtitle")}</p>
      </div>

      {/* Features */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {(["verify.feature1", "verify.feature2", "verify.feature3"] as const).map(
          (key, i) => (
            <div
              key={key}
              className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3"
            >
              <span className="text-xl">
                {["😊", "🗺️", "🔥"][i]}
              </span>
              <span className="text-white/80 text-sm">{t(key)}</span>
            </div>
          )
        )}
      </div>

      {/* CTA */}
      {!isInWorldApp ? (
        <p className="text-white/40 text-sm">{t("verify.notInWorldApp")}</p>
      ) : (
        <button
          onClick={handleWalletAuth}
          disabled={isAuthLoading}
          className="w-full max-w-xs bg-gradient-to-r from-[#F97316] to-[#F59E0B] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#F97316]/30 active:scale-95 transition-all disabled:opacity-60"
        >
          {isAuthLoading ? t("verify.verifying") : t("verify.button")}
        </button>
      )}

      <p className="text-white/20 text-xs">{t("verify.footer")}</p>
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
