"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { CLASSES } from "@/data/classes";
import { CharacterClass } from "@/types/game";

interface PartyMember {
  id: string;
  player_pubkey: string;
  character_class?: CharacterClass;
  is_ready: boolean;
  is_leader: boolean;
  joined_at: string;
}

interface Party {
  id: string;
  code: string;
  leader_pubkey: string;
  status: "waiting" | "in_game" | "completed";
  max_members: number;
  created_at: string;
  members: PartyMember[];
}

interface PartyPanelProps {
  onStartGame?: () => void;
  onClose?: () => void;
  className?: string;
}

function formatAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function MemberCard({ member, isCurrentUser }: { member: PartyMember; isCurrentUser: boolean }) {
  const classData = member.character_class ? CLASSES[member.character_class] : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        "p-3 rounded-lg border transition-colors",
        isCurrentUser
          ? "bg-gold/10 border-gold/30"
          : "bg-abyss/30 border-parchment/10"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Class icon or placeholder */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
          style={{
            backgroundColor: classData ? classData.color + "30" : "rgba(255,255,255,0.1)",
          }}
        >
          {classData?.icon || "❓"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("font-cinzel text-sm truncate", isCurrentUser ? "text-gold" : "text-parchment")}>
              {formatAddress(member.player_pubkey)}
            </span>
            {member.is_leader && (
              <span className="text-[10px] bg-gold/20 text-gold px-1.5 py-0.5 rounded">👑 Leader</span>
            )}
            {isCurrentUser && !member.is_leader && (
              <span className="text-[10px] bg-mystic/20 text-mystic-light px-1.5 py-0.5 rounded">You</span>
            )}
          </div>
          <p className="font-crimson text-xs text-parchment/50">
            {classData ? classData.name : "Selecting class..."}
          </p>
        </div>

        {/* Ready indicator */}
        <div className={cn(
          "w-3 h-3 rounded-full",
          member.is_ready ? "bg-green-500" : "bg-parchment/20"
        )} />
      </div>
    </motion.div>
  );
}

export default function PartyPanel({ onStartGame, onClose, className }: PartyPanelProps) {
  const { publicKey, connected } = useWallet();
  const [party, setParty] = useState<Party | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [isReady, setIsReady] = useState(false);

  const isLeader = party?.leader_pubkey === publicKey?.toBase58();
  const allReady = party?.members.every((m) => m.is_ready) ?? false;
  const canStart = isLeader && allReady && (party?.members.length ?? 0) >= 2;

  // Create a new party
  const createParty = useCallback(async () => {
    if (!publicKey) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaderAddress: publicKey.toBase58(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create party");
      }

      setParty(data.party);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create party");
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  // Join an existing party
  const joinParty = useCallback(async () => {
    if (!publicKey || !joinCode.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/party", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          playerAddress: publicKey.toBase58(),
          partyCode: joinCode.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to join party");
      }

      // Fetch full party data after joining
      const partyRes = await fetch(`/api/party?player=${publicKey.toBase58()}`);
      const partyData = await partyRes.json();
      setParty(partyData.party);
      setJoinCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join party");
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, joinCode]);

  // Toggle ready status
  const toggleReady = useCallback(async () => {
    if (!publicKey || !party) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/party", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ready",
          playerAddress: publicKey.toBase58(),
          partyId: party.id,
          isReady: !isReady,
        }),
      });

      if (res.ok) {
        setIsReady(!isReady);
      }
    } catch (err) {
      console.error("Toggle ready error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, party, isReady]);

  // Leave party
  const leaveParty = useCallback(async () => {
    if (!publicKey || !party) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/party", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "leave",
          playerAddress: publicKey.toBase58(),
          partyId: party.id,
        }),
      });

      if (res.ok) {
        setParty(null);
        setIsReady(false);
      }
    } catch (err) {
      console.error("Leave party error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, party]);

  // Poll for party updates
  useEffect(() => {
    if (!party?.id) return;
    const partyId = party.id;

    const pollParty = async () => {
      try {
        const res = await fetch(`/api/party?id=${partyId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.party) {
            setParty(data.party);
            // Update our ready status from server
            const currentMember = data.party.members?.find(
              (m: PartyMember) => m.player_pubkey === publicKey?.toBase58()
            );
            if (currentMember) {
              setIsReady(currentMember.is_ready);
            }
          }
        }
      } catch (err) {
        console.error("Poll error:", err);
      }
    };

    const interval = setInterval(pollParty, 3000);
    return () => clearInterval(interval);
  }, [party?.id, publicKey]);

  // Not connected state
  if (!connected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "bg-gradient-to-br from-abyss-light via-abyss to-abyss-light",
          "rounded-xl border-2 border-gold/20 p-6 text-center",
          className
        )}
      >
        <p className="font-cinzel text-lg text-gold mb-2">⚔️ Co-op Party</p>
        <p className="font-crimson text-parchment/60">Connect your wallet to join or create a party</p>
      </motion.div>
    );
  }

  // No party yet - show create/join
  if (!party) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "bg-gradient-to-br from-abyss-light via-abyss to-abyss-light",
          "rounded-xl border-2 border-gold/20 overflow-hidden max-w-md w-full",
          className
        )}
      >
        <div className="p-6 border-b border-gold/10 bg-gradient-to-r from-gold/5 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-cinzel text-xl text-gold font-bold">⚔️ Co-op Party</h2>
              <p className="font-crimson text-parchment/60 text-sm mt-1">
                Team up with friends to conquer the trenches
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-abyss/50 border border-parchment/10 flex items-center justify-center text-parchment/60 hover:text-parchment"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="p-3 bg-blood/20 border border-blood/40 rounded-lg text-blood font-crimson text-sm">
              {error}
            </div>
          )}

          {/* Create party */}
          <div className="space-y-3">
            <p className="font-cinzel text-sm text-parchment/60">Start a new party</p>
            <Button
              variant="gold"
              onClick={createParty}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Creating..." : "Create Party"}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-parchment/10" />
            <span className="font-cinzel text-xs text-parchment/40">OR</span>
            <div className="flex-1 h-px bg-parchment/10" />
          </div>

          {/* Join party */}
          <div className="space-y-3">
            <p className="font-cinzel text-sm text-parchment/60">Join existing party</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter code..."
                maxLength={6}
                className="flex-1 px-4 py-2 bg-abyss/60 border border-parchment/20 rounded-lg font-cinzel text-center text-parchment uppercase tracking-widest placeholder-parchment/30 focus:outline-none focus:border-gold/50"
              />
              <Button
                variant="primary"
                onClick={joinParty}
                disabled={isLoading || !joinCode.trim()}
              >
                Join
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // In a party - show members and controls
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "bg-gradient-to-br from-abyss-light via-abyss to-abyss-light",
        "rounded-xl border-2 border-gold/20 overflow-hidden max-w-md w-full",
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-gold/10 bg-gradient-to-r from-gold/5 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-cinzel text-xl text-gold font-bold">⚔️ Party Lobby</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-crimson text-parchment/60 text-sm">Code:</span>
              <span className="font-cinzel text-lg text-gold tracking-widest">{party.code}</span>
              <button
                onClick={() => navigator.clipboard.writeText(party.code)}
                className="text-parchment/40 hover:text-gold transition-colors"
                title="Copy code"
              >
                📋
              </button>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-abyss/50 border border-parchment/10 flex items-center justify-center text-parchment/60 hover:text-parchment"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between mb-3">
          <p className="font-cinzel text-sm text-parchment/60">
            Party Members ({party.members.length}/{party.max_members})
          </p>
          {allReady && party.members.length >= 2 && (
            <span className="text-xs text-green-400 font-cinzel">✓ All Ready!</span>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {party.members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              isCurrentUser={member.player_pubkey === publicKey?.toBase58()}
            />
          ))}
        </AnimatePresence>

        {/* Empty slots */}
        {Array.from({ length: party.max_members - party.members.length }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="p-3 rounded-lg border border-dashed border-parchment/10 text-center"
          >
            <p className="font-crimson text-xs text-parchment/30">Waiting for player...</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-gold/10 bg-abyss/30 space-y-3">
        {/* Ready button */}
        <Button
          variant={isReady ? "gold" : "primary"}
          onClick={toggleReady}
          disabled={isLoading}
          className="w-full"
        >
          {isReady ? "✓ Ready!" : "Ready Up"}
        </Button>

        {/* Start game (leader only) */}
        {isLeader && (
          <Button
            variant="gold"
            onClick={onStartGame}
            disabled={!canStart || isLoading}
            className="w-full"
          >
            {!canStart
              ? party.members.length < 2
                ? "Need 2+ players"
                : "Wait for all ready"
              : "⚔️ Start Dungeon"}
          </Button>
        )}

        {/* Leave party */}
        <Button variant="ghost" onClick={leaveParty} disabled={isLoading} className="w-full">
          Leave Party
        </Button>
      </div>
    </motion.div>
  );
}
