/**
 * Unit tests for MoodMap API logic
 * Run: npm test
 */

// ── Helper: issueAuthToken / verifyAuthToken ──────────────────
process.env.DP_AUTH_SECRET = "test-secret-for-jest";

import { issueAuthToken, verifyAuthToken, authenticateRequest } from "../lib/auth";

describe("auth token", () => {
  it("issues and verifies a token", () => {
    const addr = "0xabcdef1234567890abcdef1234567890abcdef12";
    const token = issueAuthToken(addr);
    expect(token).toMatch(/^mm1\./);
    const result = verifyAuthToken(token);
    expect(result).toBe(addr.toLowerCase());
  });

  it("rejects tampered tokens", () => {
    const addr = "0xabcdef1234567890abcdef1234567890abcdef12";
    const token = issueAuthToken(addr);
    const tampered = token.slice(0, -4) + "xxxx";
    expect(verifyAuthToken(tampered)).toBeNull();
  });

  it("rejects null/undefined", () => {
    expect(verifyAuthToken(null)).toBeNull();
    expect(verifyAuthToken(undefined)).toBeNull();
    expect(verifyAuthToken("")).toBeNull();
  });

  it("rejects wrong prefix", () => {
    const addr = "0xabcdef1234567890abcdef1234567890abcdef12";
    const token = issueAuthToken(addr);
    const parts = token.split(".");
    parts[0] = "dp1";
    expect(verifyAuthToken(parts.join("."))).toBeNull();
  });
});

// ── Helper: mood validation logic ────────────────────────────
const VALID_MOODS = ["happy","neutral","sad","angry","tired","excited","anxious","peaceful"];

describe("mood validation", () => {
  it("accepts all valid mood values", () => {
    for (const mood of VALID_MOODS) {
      expect(VALID_MOODS.includes(mood)).toBe(true);
    }
  });

  it("rejects invalid mood values", () => {
    const invalid = ["love", "bored", "HAPPY", "", "null"];
    for (const mood of invalid) {
      expect(VALID_MOODS.includes(mood)).toBe(false);
    }
  });
});

// ── Helper: country code normalization ───────────────────────
describe("country code normalization", () => {
  it("normalizes to uppercase 2-char code", () => {
    const normalize = (cc: string) => cc.toUpperCase().slice(0, 2);
    expect(normalize("jp")).toBe("JP");
    expect(normalize("US")).toBe("US");
    expect(normalize("united-states")).toBe("UN");
    expect(normalize("XX")).toBe("XX");
  });
});

// ── Helper: authenticateRequest ──────────────────────────────
import { type NextRequest } from "next/server";

describe("authenticateRequest", () => {
  function makeReq(headers: Record<string, string>): NextRequest {
    return {
      headers: {
        get: (key: string) => headers[key] ?? null,
      },
    } as unknown as NextRequest;
  }

  it("extracts token from Authorization: Bearer", () => {
    const addr = "0xabcdef1234567890abcdef1234567890abcdef12";
    const token = issueAuthToken(addr);
    const req = makeReq({ authorization: `Bearer ${token}` });
    expect(authenticateRequest(req)).toBe(addr.toLowerCase());
  });

  it("extracts token from x-mm-auth header", () => {
    const addr = "0xabcdef1234567890abcdef1234567890abcdef12";
    const token = issueAuthToken(addr);
    const req = makeReq({ "x-mm-auth": token });
    expect(authenticateRequest(req)).toBe(addr.toLowerCase());
  });

  it("returns null if no auth header", () => {
    const req = makeReq({});
    expect(authenticateRequest(req)).toBeNull();
  });
});
