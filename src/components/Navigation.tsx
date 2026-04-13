"use client";

import { SmilePlus, BarChart2, User, Globe } from "lucide-react";
import type { TabKey } from "@/lib/types";

interface TabConfig {
  key: TabKey;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

const TABS: TabConfig[] = [
  { key: "mood",     label: "Home",    Icon: SmilePlus  },
  { key: "map",      label: "Explore", Icon: Globe      },
  { key: "calendar", label: "History", Icon: BarChart2  },
  { key: "profile",  label: "Profile", Icon: User       },
];

interface NavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  hasNewMood?: boolean;
}

export function Navigation({ activeTab, onTabChange, hasNewMood }: NavigationProps) {
  return (
    <nav
      className="sticky bottom-0 pb-safe z-10"
      role="tablist"
      aria-label="Main navigation"
      style={{
        background: "rgba(13,13,20,0.92)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-stretch px-2 py-2">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = key === activeTab;
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              role="tab"
              aria-selected={isActive}
              aria-label={label}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all duration-200 active:scale-90 relative"
              style={{
                background: isActive ? "rgba(167,139,250,0.12)" : "transparent",
                border: isActive ? "1px solid rgba(167,139,250,0.2)" : "1px solid transparent",
              }}
            >
              {/* Notification dot */}
              {key === "mood" && hasNewMood && !isActive && (
                <span
                  className="absolute top-1.5 right-4 w-2 h-2 rounded-full animate-pulse"
                  style={{ background: "#fb923c" }}
                />
              )}
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                aria-hidden="true"
                color={isActive ? "#a78bfa" : "rgba(244,244,248,0.35)"}
              />
              <span
                className="text-[10px] font-semibold leading-none"
                style={{ color: isActive ? "#a78bfa" : "rgba(244,244,248,0.35)" }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
