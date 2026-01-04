import { SignJWT, jwtVerify, JWTPayload } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "trenches-dragons-super-secret-key-change-in-production"
);

export interface SessionPayload extends JWTPayload {
  sessionId: string;
  player: string;
  seed: string;
  exp: number;
}

/**
 * Create a signed JWT for a game session
 * TTL is 30 minutes by default
 */
export async function createSessionToken(
  sessionId: string,
  player: string,
  seed: string,
  ttlMinutes: number = 30
): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + ttlMinutes * 60;

  return new SignJWT({
    sessionId,
    player,
    seed,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a session JWT
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
