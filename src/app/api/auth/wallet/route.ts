import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifySiweMessage,
  type MiniAppWalletAuthSuccessPayload,
} from "@worldcoin/minikit-js";
import { supabaseAdmin } from "@/lib/supabase";
import { issueAuthToken } from "@/lib/auth";
import { logError, logInfo } from "@/lib/server-log";

export async function POST(req: NextRequest) {
  try {
    let body: { payload?: MiniAppWalletAuthSuccessPayload; nonce?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const { payload, nonce } = body;
    if (!payload || !nonce) {
      return NextResponse.json(
        { success: false, error: "Missing payload or nonce" },
        { status: 400 }
      );
    }

    const store = await cookies();
    const cookieNonce = store.get("siwe")?.value;
    if (!cookieNonce || cookieNonce !== nonce) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired nonce" },
        { status: 400 }
      );
    }

    let verification: { isValid: boolean };
    try {
      verification = await verifySiweMessage(payload, nonce);
    } catch (err) {
      logError("api/auth/wallet", "verifySiweMessage threw", {
        error: err instanceof Error ? err.message : String(err),
      });
      return NextResponse.json(
        { success: false, error: "Signature verification failed" },
        { status: 400 }
      );
    }

    if (!verification.isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 400 }
      );
    }

    const rawAddress = payload.address;
    if (
      typeof rawAddress !== "string" ||
      !/^0x[a-fA-F0-9]{40}$/.test(rawAddress)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const walletAddress = rawAddress.toLowerCase();
    store.delete("siwe");

    const defaultName = `#${walletAddress.slice(2, 8)}`;
    const { data: existing } = await supabaseAdmin
      .from("mm_users")
      .select("address, display_name")
      .eq("address", walletAddress)
      .maybeSingle();

    const upsertPayload: { address: string; display_name?: string } = {
      address: walletAddress,
    };
    if (!existing?.display_name) upsertPayload.display_name = defaultName;

    const { data: user, error: upsertErr } = await supabaseAdmin
      .from("mm_users")
      .upsert(upsertPayload, { onConflict: "address", ignoreDuplicates: false })
      .select(
        "address, display_name, streak, best_streak, total_logs, created_at"
      )
      .single();

    if (upsertErr) {
      logError("api/auth/wallet", "upsert failed", { code: upsertErr.code });
      return NextResponse.json(
        { success: false, error: "Failed to create user" },
        { status: 500 }
      );
    }

    const auth_token = issueAuthToken(walletAddress);
    logInfo("api/auth/wallet", "success", {
      prefix: walletAddress.slice(0, 6),
    });
    return NextResponse.json({ success: true, auth_token, user });
  } catch (err) {
    logError("api/auth/wallet", "unexpected error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
