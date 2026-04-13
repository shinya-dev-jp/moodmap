import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { logError } from "@/lib/server-log";

export async function GET() {
  try {
    const nonce = randomBytes(16).toString("hex");
    const store = await cookies();
    store.set("siwe", nonce, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
    return NextResponse.json({ nonce });
  } catch (err) {
    logError("api/auth/nonce", "failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to generate nonce" },
      { status: 500 }
    );
  }
}
