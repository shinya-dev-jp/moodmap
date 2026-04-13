import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logError } from "@/lib/server-log";
import type { MoodType } from "@/lib/types";

export const revalidate = 60;

const VALID_MOODS: MoodType[] = [
  "happy",
  "neutral",
  "sad",
  "angry",
  "tired",
  "excited",
  "anxious",
  "peaceful",
];

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabaseAdmin
      .from("moods")
      .select("country_code, mood")
      .gte("created_at", `${today}T00:00:00Z`);

    if (error) {
      logError("api/mood/map", "select failed", { code: error.code });
      return NextResponse.json(
        { countries: [], total_today: 0 },
        { status: 500 }
      );
    }

    const rows = data ?? [];
    const grouped: Record<string, Record<string, number>> = {};
    for (const row of rows) {
      const cc = row.country_code as string;
      if (!grouped[cc]) grouped[cc] = {};
      grouped[cc][row.mood] = (grouped[cc][row.mood] ?? 0) + 1;
    }

    const countries = Object.entries(grouped)
      .map(([code, moods]) => {
        const total = Object.values(moods).reduce((a, b) => a + b, 0);
        const top_mood = (Object.entries(moods).sort(
          (a, b) => b[1] - a[1]
        )[0]?.[0] ?? "neutral") as MoodType;
        const moodMap = Object.fromEntries(
          VALID_MOODS.map((m) => [m, moods[m] ?? 0])
        ) as Record<MoodType, number>;
        return { code, moods: moodMap, total, top_mood };
      })
      .sort((a, b) => b.total - a.total);

    return NextResponse.json(
      { countries, total_today: rows.length },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err) {
    logError("api/mood/map", "unexpected", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { countries: [], total_today: 0 },
      { status: 500 }
    );
  }
}
