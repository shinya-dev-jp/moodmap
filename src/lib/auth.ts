import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

const TOKEN_PREFIX = "mm1";
const TTL_SECONDS = 60 * 60 * 24 * 30;

function getSecret(): string {
  const secret = process.env.DP_AUTH_SECRET ?? process.env.CRON_SECRET;
  if (!secret) throw new Error("DP_AUTH_SECRET not configured");
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function issueAuthToken(address: string): string {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = `${TOKEN_PREFIX}.${address}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAuthToken(token: string | null | undefined): string | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [prefix, address, expStr, sig] = parts;
  if (prefix !== TOKEN_PREFIX) return null;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;
  const expected = sign(`${prefix}.${address}.${exp}`);
  let sigBuf: Buffer, expBuf: Buffer;
  try {
    sigBuf = Buffer.from(sig, "hex");
    expBuf = Buffer.from(expected, "hex");
  } catch { return null; }
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;
  return address;
}

export function authenticateRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return verifyAuthToken(authHeader.slice(7).trim());
  return verifyAuthToken(req.headers.get("x-mm-auth"));
}
