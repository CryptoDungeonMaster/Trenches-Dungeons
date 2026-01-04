"use client";

import { useState, useCallback } from "react";

interface GameSession {
  sessionId: string;
  token: string;
  seed: string;
  expiresAt: number;
}

interface UseGameSessionReturn {
  session: GameSession | null;
  loading: boolean;
  error: string | null;
  verifyAndCreateSession: (signature: string, playerPubkey: string) => Promise<boolean>;
  clearSession: () => void;
  submitScore: (score: number) => Promise<boolean>;
}

export function useGameSession(): UseGameSessionReturn {
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyAndCreateSession = useCallback(
    async (signature: string, playerPubkey: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        // Step 1: Verify the payment transaction
        const verifyRes = await fetch("/api/verify-entry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signature, playerPubkey }),
        });

        const verifyData = await verifyRes.json();

        if (!verifyRes.ok) {
          throw new Error(verifyData.error || "Failed to verify payment");
        }

        // Step 2: Create the game session
        const sessionRes = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerPubkey,
            signature,
          }),
        });

        const sessionData = await sessionRes.json();

        if (!sessionRes.ok) {
          throw new Error(sessionData.error || "Failed to create session");
        }

        // Store session
        const newSession: GameSession = {
          sessionId: sessionData.sessionId,
          token: sessionData.token,
          seed: sessionData.seed,
          expiresAt: sessionData.expiresAt,
        };

        setSession(newSession);

        // Also store in localStorage for page refreshes
        localStorage.setItem("gameSession", JSON.stringify(newSession));

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearSession = useCallback(() => {
    setSession(null);
    localStorage.removeItem("gameSession");
  }, []);

  const submitScore = useCallback(
    async (score: number): Promise<boolean> => {
      if (!session) {
        setError("No active session");
        return false;
      }

      try {
        const res = await fetch("/api/session/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
          body: JSON.stringify({
            sessionId: session.sessionId,
            score,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to submit score");
        }

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return false;
      }
    },
    [session]
  );

  return {
    session,
    loading,
    error,
    verifyAndCreateSession,
    clearSession,
    submitScore,
  };
}
