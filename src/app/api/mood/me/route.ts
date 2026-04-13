import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authenticateRequest } from "@/lib/auth";
import { logError } from "@/lib/server-log";
import type { MoodType, MoodHistoryDay } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const address = authenticateRequest(req);
    if (!address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    const { data: moods, error } = await supabaseAdmin
      .from("moods")
      .select("mood, created_at")
      .eq("user_address", address)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      logError("api/mood/me", "select failed", { code: error.code });
      return NextResponse.json(
        { error: "Failed to fetch history" },
        { status: 500 }
      );
    }

    const { data: userRow } = await supabaseAdmin
      .from("mm_users")
      .select("streak, best_streak, total_logs")
      .eq("address", address)
      .single();

    // Build 30-day calendar
    const moodByDate: Record<string, MoodType> = {};
    for (const m of moods ?? []) {
      const date = m.created_at.slice(0, 10);
      if (!moodByDate[date]) moodByDate[date] = m.mood as MoodType;
    }

    const history: MoodHistoryDay[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(now.getTime() - i * 86400000);
      const date = d.toISOString().slice(0, 10);
      history.push({ date, mood: moodByDate[date] ?? null });
    }

    const today_mood = moodByDate[now.toISOString().slice(0, 10)] ?? null;

    return NextResponse.json({
      history,
      streak: userRow?.streak ?? 0,
      best_streak: userRow?.best_streak ?? 0,
      total_logs: userRow?.total_logs ?? 0,
      today_mood,
    });
  } catch (err) {
    logError("api/mood/me", "unexpected", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
