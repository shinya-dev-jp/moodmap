"use client";

import { SmilePlus, Globe, CalendarDays, User } from "lucide-react";
import { useI18n } from "@/i18n";
import type { TabKey } from "@/lib/types";

interface TabConfig {
  key: TabKey;
  labelKey: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabConfig[] = [
  { key: "mood",     labelKey: "tabs.mood",     Icon: SmilePlus },
  { key: "map",      labelKey: "tabs.map",       Icon: Globe },
  { key: "calendar", labelKey: "tabs.calendar",  Icon: CalendarDays },
  { key: "profile",  labelKey: "tabs.profile",   Icon: User },
];

interface NavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  hasNewMood?: boolean;
}

export function Navigation({ activeTab, onTabChange, hasNewMood }: NavigationProps) {
  const { t } = useI18n();
  return (
    <nav
      className="sticky bottom-0 pb-safe border-t border-white/[0.08] bg-[#1E1B4B]/95 backdrop-blur-lg z-10"
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex">
        {TABS.map(({ key, labelKey, Icon }) => {
          const label = t(labelKey);
          const isActive = key === activeTab;
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              role="tab"
              aria-selected={isActive}
              aria-label={label}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors active:scale-95 ${
                isActive ? "text-[#F97316]" : "text-white/40"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-all ${isActive ? "scale-110" : "scale-100"}`}
                  aria-hidden="true"
                />
                {key === "mood" && hasNewMood && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                )}
              </div>
              <span className={`text-[10px] transition-colors ${isActive ? "font-bold" : "font-medium"}`}>
                {label}
              </span>
              {isActive && (
                <span className="block w-1 h-1 rounded-full bg-[#F97316] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
