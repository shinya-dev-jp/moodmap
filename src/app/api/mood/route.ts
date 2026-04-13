import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authenticateRequest } from "@/lib/auth";
import { logError } from "@/lib/server-log";
import type { MoodType } from "@/lib/types";

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

export async function POST(req: NextRequest) {
  try {
    const address = authenticateRequest(req);
    if (!address) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    let body: { mood?: string; country_code?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const { mood, country_code } = body;
    if (!mood || !VALID_MOODS.includes(mood as MoodType)) {
      return NextResponse.json(
        { success: false, error: "Invalid mood value" },
        { status: 400 }
      );
    }

    // Country from Vercel header or body fallback
    const countryCode = (
      req.headers.get("x-vercel-ip-country") ??
      country_code ??
      "XX"
    )
      .toUpperCase()
      .slice(0, 2);

    // Insert mood (UNIQUE constraint prevents duplicates per user per day)
    const { data, error } = await supabaseAdmin
      .from("moods")
      .insert({ user_address: address, mood, country_code: countryCode })
      .select("id, mood, country_code, created_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { success: false, error: "already_logged_today" },
          { status: 409 }
        );
      }
      logError("api/mood POST", "insert failed", { code: error.code });
      return NextResponse.json(
        { success: false, error: "Failed to save mood" },
        { status: 500 }
      );
    }

    // Update streak in mm_users
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const { data: prev } = await supabaseAdmin
      .from("moods")
      .select("created_at")
      .eq("user_address", address)
      .gte("created_at", `${yesterday}T00:00:00Z`)
      .lt("created_at", `${today}T00:00:00Z`)
      .maybeSingle();

    const { data: userRow } = await supabaseAdmin
      .from("mm_users")
      .select("streak, best_streak, total_logs")
      .eq("address", address)
      .single();

    const currentStreak = prev ? (userRow?.streak ?? 0) + 1 : 1;
    const bestStreak = Math.max(currentStreak, userRow?.best_streak ?? 0);

    await supabaseAdmin
      .from("mm_users")
      .update({
        streak: currentStreak,
        best_streak: bestStreak,
        total_logs: (userRow?.total_logs ?? 0) + 1,
      })
      .eq("address", address);

    return NextResponse.json({
      success: true,
      entry: data,
      streak: currentStreak,
    });
  } catch (err) {
    logError("api/mood POST", "unexpected", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
