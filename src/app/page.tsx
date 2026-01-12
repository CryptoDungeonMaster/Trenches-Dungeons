"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction, createAssociatedTokenAccountIdempotentInstruction, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { cn } from "@/lib/utils";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { hasFreeEntry } from "@/lib/admins";

const WalletButton = dynamic(() => import("@/components/WalletButton"), { ssr: false });

const TOKEN_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_TOKEN_MINT || "CkTFDNGUtw58dBDEnMD9RW3tjTVKaoVXctcXdq8Gpump"
);
const TREASURY_WALLET = new PublicKey(
  process.env.NEXT_PUBLIC_TREASURY_WALLET || "CjSqsat78oKYhoSwSkdkQFoXyyBqjhBBqJTwFnvB8K9S"
);
const ENTRY_FEE = 100;

// ============================================
// EMBER PARTICLES
// ============================================
function EmberParticles() {
  const [embers, setEmbers] = useState<Array<{ id: number; x: number; delay: number; size: number }>>([]);

  useEffect(() => {
    setEmbers(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 5,
        size: 2 + Math.random() * 3,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {embers.map((e) => (
        <motion.div
          key={e.id}
          initial={{ x: `${e.x}%`, y: "105%", opacity: 0 }}
          animate={{ y: "-5%", opacity: [0, 0.7, 0] }}
          transition={{ duration: 6 + Math.random() * 4, delay: e.delay, repeat: Infinity }}
          className="absolute rounded-full"
          style={{
            width: e.size,
            height: e.size,
            background: "var(--ember)",
            boxShadow: `0 0 ${e.size * 2}px var(--ember)`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// DUNGEON GATE
// ============================================
function DungeonGate({ canEnter, isProcessing, connected, onClick, onConnect }: {
  canEnter: boolean;
  isProcessing: boolean;
  connected: boolean;
  onClick: () => void;
  onConnect: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (isProcessing) return;
    if (!connected) {
      onConnect();
    } else {
      // Always show mode selection when connected (even without TND)
      onClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Gate glow */}
      <motion.div
        animate={{ opacity: isHovered ? 0.4 : 0.15, scale: isHovered ? 1.1 : 1 }}
        className="absolute inset-0 bg-gold1 rounded-t-[80px] blur-3xl -z-10"
      />

      {/* Gate frame */}
      <div className="relative w-48 h-64 md:w-56 md:h-72">
        {/* Stone arch */}
        <div className="absolute inset-0 rounded-t-[80px] bg-gradient-to-b from-[#3a3a3f] via-[#2a2a2f] to-[#1a1a1f] border-2 border-[#4a4a4f]">
          {/* Inner dark */}
          <div className="absolute inset-3 top-4 rounded-t-[70px] bg-gradient-to-b from-bg1 to-bg0 overflow-hidden">
            {/* Door panels */}
            <motion.div
              animate={{ x: isHovered ? "-15%" : 0 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="absolute inset-0 left-0 w-1/2 bg-gradient-to-r from-[#3d3020] to-[#2d2518] border-r border-[#1a1510]"
            >
              {[20, 40, 60, 80].map((top) => (
                <div key={top} className="absolute left-0 right-0 h-[1px] bg-black/20" style={{ top: `${top}%` }} />
              ))}
              <div className="absolute top-[30%] left-0 right-0 h-3 bg-gradient-to-b from-[#5a5a5f] to-[#3a3a3f] border-y border-[#2a2a2f]" />
              <div className="absolute top-[70%] left-0 right-0 h-3 bg-gradient-to-b from-[#5a5a5f] to-[#3a3a3f] border-y border-[#2a2a2f]" />
            </motion.div>
            <motion.div
              animate={{ x: isHovered ? "15%" : 0 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="absolute inset-0 right-0 left-1/2 bg-gradient-to-l from-[#3d3020] to-[#2d2518] border-l border-[#1a1510]"
            >
              {[20, 40, 60, 80].map((top) => (
                <div key={top} className="absolute left-0 right-0 h-[1px] bg-black/20" style={{ top: `${top}%` }} />
              ))}
              <div className="absolute top-[30%] left-0 right-0 h-3 bg-gradient-to-b from-[#5a5a5f] to-[#3a3a3f] border-y border-[#2a2a2f]" />
              <div className="absolute top-[70%] left-0 right-0 h-3 bg-gradient-to-b from-[#5a5a5f] to-[#3a3a3f] border-y border-[#2a2a2f]" />
            </motion.div>

            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t via-transparent to-transparent",
                    canEnter ? "from-gold1/30 via-gold1/10" : connected ? "from-blood/20 via-blood/5" : "from-arcane/30 via-arcane/10"
                  )}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Rune on door */}
        <motion.svg
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-[35%] left-1/2 -translate-x-1/2 w-10 h-12 text-gold1"
          viewBox="0 0 40 48"
        >
          <path d="M20 4 L36 14 L36 34 L20 44 L4 34 L4 14 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M20 12 L20 36 M10 20 L30 28 M10 28 L30 20" stroke="currentColor" strokeWidth="1" />
        </motion.svg>

        {/* Processing overlay */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-bg0/70 rounded-t-[80px] flex items-center justify-center"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="text-4xl">
              ⚔️
            </motion.div>
          </motion.div>
        )}

        {connected && !canEnter && !isProcessing && (
          <div className="absolute inset-0 bg-bg0/50 rounded-t-[80px]" />
        )}
      </div>

      {/* Torches */}
      {["left", "right"].map((side) => (
        <div key={side} className={cn("absolute top-[30%]", side === "left" ? "-left-8" : "-right-8")}>
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.85] }}
            transition={{ duration: 0.4, repeat: Infinity }}
            className="w-4 h-10 bg-gradient-to-t from-ember via-[#ff8a50] to-gold1 rounded-full blur-[1px]"
          />
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-1.5 h-12 bg-gradient-to-b from-[#4a3020] to-[#2a1810] rounded-b" />
        </div>
      ))}
    </motion.div>
  );
}

// ============================================
// LEADERBOARD MODAL
// ============================================
function LeaderboardModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const mockData = [
    { rank: 1, name: "DragonSlayer", score: 15420, class: "warrior" },
    { rank: 2, name: "ShadowMage", score: 12890, class: "mage" },
    { rank: 3, name: "NightBlade", score: 11540, class: "rogue" },
    { rank: 4, name: "IronFist", score: 9870, class: "warrior" },
    { rank: 5, name: "FrostWizard", score: 8640, class: "mage" },
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg0/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg td-panel-elevated td-rivets overflow-hidden"
      >
        <div className="p-6 border-b border-line flex items-center justify-between">
          <h2 className="font-display text-2xl text-gold1">🏆 Leaderboard</h2>
          <button onClick={onClose} className="text-text2 hover:text-text0 text-2xl">×</button>
        </div>

        <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
          {mockData.map((entry) => (
            <div key={entry.rank} className="flex items-center gap-4 p-4 rounded-lg bg-panel hover:bg-panel2 transition-colors">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-display font-bold",
                  entry.rank === 1 ? "bg-gold1 text-bg0" : entry.rank === 2 ? "bg-text2 text-bg0" : entry.rank === 3 ? "bg-gold3 text-text0" : "bg-bg2 text-text2"
                )}
              >
                {entry.rank}
              </div>
              <div className="flex-1">
                <p className="text-text0 font-ui font-semibold">{entry.name}</p>
                <p className="text-text2 text-sm font-ui capitalize">{entry.class}</p>
              </div>
              <p className="text-gold1 font-display font-bold tabular-nums">{entry.score.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-line text-center text-text2 text-sm font-ui">Season 1 • Updated hourly</div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// PRIZE POOL INDICATOR
// ============================================
function PrizePoolIndicator() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [poolData, setPoolData] = useState({ entries: 0, poolSize: 0 });
  
  // Fetch pool data (count of entries this season)
  useEffect(() => {
    const fetchPool = async () => {
      try {
        const res = await fetch("/api/leaderboard?limit=1000");
        const data = await res.json();
        const entries = data.entries?.length || 0;
        setPoolData({
          entries,
          poolSize: entries * ENTRY_FEE, // Each entry = ENTRY_FEE TND
        });
      } catch {
        // Ignore errors
      }
    };
    fetchPool();
    const interval = setInterval(fetchPool, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const prizes = [
    { place: "1st", percent: 30, icon: "🥇" },
    { place: "2nd", percent: 20, icon: "🥈" },
    { place: "3rd", percent: 12, icon: "🥉" },
    { place: "4-5th", percent: 6, icon: "🏅" },
    { place: "6-10th", percent: 3, icon: "🎖️" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 2 }}
      className="fixed bottom-4 right-4 z-30"
    >
      <motion.div
        onClick={() => setIsExpanded(!isExpanded)}
        className="cursor-pointer"
        whileHover={{ scale: 1.02 }}
      >
        <div className="td-panel rounded-lg px-3 py-2 text-right">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-gold1 text-lg">🏆</span>
            <div>
              <p className="text-text2 text-[10px] font-ui uppercase tracking-wider">Season 1 Pool</p>
              <p className="text-gold1 font-display text-sm">{poolData.poolSize.toLocaleString()} TND</p>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full right-0 mb-2 w-56"
          >
            <div className="td-panel-elevated rounded-lg p-3">
              <p className="text-text2 text-xs font-ui mb-2 border-b border-line pb-2">
                {poolData.entries} entries this season
              </p>
              <div className="space-y-1">
                {prizes.map((p) => (
                  <div key={p.place} className="flex items-center justify-between text-xs">
                    <span className="text-text2 font-ui">
                      <span className="mr-1">{p.icon}</span>
                      {p.place}
                    </span>
                    <span className="text-text0 font-ui">
                      {p.percent}% <span className="text-text2">({Math.floor(poolData.poolSize * p.percent / 100)} TND)</span>
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-text2/50 text-[10px] font-ui mt-2 pt-2 border-t border-line">
                Prizes distributed at season end
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// MAIN PAGE
// ============================================
type GameMode = "solo" | "coop" | null;

// Party Lobby Component
function PartyLobby({ 
  onBack, 
  onStart, 
  onJoinDungeon,
  canEnter, 
  balance, 
  isFreeEntry,
  onPayFee 
}: { 
  onBack: () => void; 
  onStart: (partyId: string) => void; // For leader to start
  onJoinDungeon: (partyId: string) => void; // For members when dungeon starts
  canEnter: boolean;
  balance: number;
  isFreeEntry: boolean;
  onPayFee: () => Promise<boolean>;
}) {
  const { publicKey } = useWallet();
  const [mode, setMode] = useState<"create" | "join" | null>(null);
  const [partyCode, setPartyCode] = useState("");
  const [partyId, setPartyId] = useState<string | null>(null);
  const [members, setMembers] = useState<Array<{ address: string; ready: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPaid, setHasPaid] = useState(isFreeEntry);
  const [isLeader, setIsLeader] = useState(false);

  const createParty = async () => {
    if (!publicKey) return;
    setIsLoading(true);
    setError(null);
    try {
      // Require payment before creating party
      if (!hasPaid && !isFreeEntry) {
        if (!canEnter) {
          setError(`Need ${ENTRY_FEE} TND to create a party`);
          setIsLoading(false);
          return;
        }
        const success = await onPayFee();
        if (!success) {
          setError("Payment failed. Please try again.");
          setIsLoading(false);
          return;
        }
        setHasPaid(true);
      }

      const res = await fetch("/api/party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", leader: publicKey.toBase58() }),
      });
      const data = await res.json();
      if (!res.ok) {
        // If already in a party, clear old data and force retry
        if (data.error?.includes("Already in a party")) {
          localStorage.removeItem("td_party");
          const retryRes = await fetch("/api/party", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "create", leader: publicKey.toBase58(), force: true }),
          });
          const retryData = await retryRes.json();
          if (!retryRes.ok) throw new Error(retryData.error);
          setPartyId(retryData.partyId);
          setPartyCode(retryData.code);
          setMembers([{ address: publicKey.toBase58(), ready: true }]);
          setIsLeader(true);
          return;
        }
        throw new Error(data.error);
      }
      setPartyId(data.partyId);
      setPartyCode(data.code);
      setMembers([{ address: publicKey.toBase58(), ready: true }]);
      setIsLeader(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create party");
    } finally {
      setIsLoading(false);
    }
  };

  const joinParty = async () => {
    if (!publicKey || !partyCode) return;
    setIsLoading(true);
    setError(null);
    try {
      // Require payment before joining party
      if (!hasPaid && !isFreeEntry) {
        if (!canEnter) {
          setError(`Need ${ENTRY_FEE} TND to join a party`);
          setIsLoading(false);
          return;
        }
        const success = await onPayFee();
        if (!success) {
          setError("Payment failed. Please try again.");
          setIsLoading(false);
          return;
        }
        setHasPaid(true);
      }

      const res = await fetch("/api/party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", code: partyCode.toUpperCase(), player: publicKey.toBase58() }),
      });
      const data = await res.json();
      if (!res.ok) {
        // If already in a party, clear old data and force retry
        if (data.error?.includes("Already in a party")) {
          localStorage.removeItem("td_party");
          const retryRes = await fetch("/api/party", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "join", code: partyCode.toUpperCase(), player: publicKey.toBase58(), force: true }),
          });
          const retryData = await retryRes.json();
          if (!retryRes.ok) throw new Error(retryData.error);
          setPartyId(retryData.partyId);
          setMembers(retryData.members || []);
          return;
        }
        throw new Error(data.error);
      }
      setPartyId(data.partyId);
      setMembers(data.members || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join party");
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for party updates
  useEffect(() => {
    if (!partyId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/party?id=${partyId}`);
        if (!res.ok) return; // Skip if error
        const data = await res.json();
        if (data.party && data.party.members) {
          // Ensure members have required fields
          const validMembers = data.party.members.filter(
            (m: { address?: string }) => m && m.address
          );
          setMembers(validMembers);
          
          // When dungeon starts, redirect all members
          if (data.party.status === "in_dungeon") {
            onJoinDungeon(partyId);
          }
        }
      } catch {
        // ignore
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [partyId, onJoinDungeon]);

  if (!mode) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h3 className="font-display text-2xl text-gold1 mb-6">Co-op Mode</h3>
        <div className="flex gap-4 justify-center mb-6">
          <button onClick={() => setMode("create")} className="td-btn td-btn-primary">
            🏰 Create Party
          </button>
          <button onClick={() => setMode("join")} className="td-btn td-btn-secondary">
            🤝 Join Party
          </button>
        </div>
        <button onClick={onBack} className="td-btn td-btn-ghost text-sm">← Back</button>
      </motion.div>
    );
  }

  if (mode === "create" && !partyId) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h3 className="font-display text-2xl text-gold1 mb-6">Create Party</h3>
        {error && <p className="text-blood text-sm mb-4">{error}</p>}
        <button onClick={createParty} disabled={isLoading} className="td-btn td-btn-primary mb-4">
          {isLoading ? "Creating..." : "🎲 Generate Party Code"}
        </button>
        <br />
        <button onClick={() => setMode(null)} className="td-btn td-btn-ghost text-sm">← Back</button>
      </motion.div>
    );
  }

  if (mode === "join" && !partyId) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h3 className="font-display text-2xl text-gold1 mb-6">Join Party</h3>
        {error && <p className="text-blood text-sm mb-4">{error}</p>}
        <input
          type="text"
          value={partyCode}
          onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          maxLength={6}
          className="w-40 px-4 py-3 bg-bg1 border border-line rounded-lg text-center font-display text-2xl text-gold1 tracking-widest mb-4"
        />
        <br />
        <button onClick={joinParty} disabled={isLoading || partyCode.length < 4} className="td-btn td-btn-primary mb-4">
          {isLoading ? "Joining..." : "Join Party"}
        </button>
        <br />
        <button onClick={() => setMode(null)} className="td-btn td-btn-ghost text-sm">← Back</button>
      </motion.div>
    );
  }

  // Party lobby - waiting for members
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <h3 className="font-display text-2xl text-gold1 mb-2">Party Lobby</h3>
      <div className="mb-6">
        <p className="text-text2 text-sm font-ui mb-2">Share this code:</p>
        <p className="font-display text-4xl text-gold1 tracking-[0.3em] bg-bg1 px-6 py-3 rounded-lg inline-block border border-gold1/30">
          {partyCode}
        </p>
      </div>

      <div className="mb-6">
        <p className="text-text2 text-sm font-ui mb-3">Party Members ({members.length}/4):</p>
        <div className="space-y-2 max-w-xs mx-auto">
          {members.filter(m => m?.address).map((m, i) => (
            <div key={m.address} className="flex items-center gap-3 px-4 py-2 td-panel rounded-lg">
              <span className="text-lg">{i === 0 ? "👑" : "⚔️"}</span>
              <span className="text-text0 font-ui text-sm truncate flex-1">
                {m.address?.slice(0, 4)}...{m.address?.slice(-4)}
              </span>
              <span className={cn("text-xs px-2 py-0.5 rounded", m.ready ? "bg-venom/20 text-venom" : "bg-text2/20 text-text2")}>
                {m.ready ? "Ready" : "Waiting"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {members.length >= 2 && members[0]?.address === publicKey?.toBase58() && (
        <button onClick={() => onStart(partyId!)} className="td-btn td-btn-primary mb-4">
          🚀 Start Dungeon
        </button>
      )}
      {members.length < 2 && (
        <p className="text-text2 text-sm font-ui mb-4">Waiting for at least 1 more player...</p>
      )}
      <br />
      <button onClick={onBack} className="td-btn td-btn-ghost text-sm">Leave Party</button>
    </motion.div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { setVisible: setWalletModalVisible } = useWalletModal();
  const { balance, loading: balanceLoading, refresh: refreshBalance } = useTokenBalance();

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [showModeSelect, setShowModeSelect] = useState(false);
  const [currentPartyId, setCurrentPartyId] = useState<string | null>(null);

  const isFreeEntry = publicKey ? hasFreeEntry(publicKey.toBase58()) : false;
  const canEnter = connected && (isFreeEntry || balance >= ENTRY_FEE);

  // Check for existing party on mount and validate it still exists
  useEffect(() => {
    const validateParty = async () => {
      const savedParty = localStorage.getItem("td_party");
      if (!savedParty) return;
      
      try {
        const res = await fetch(`/api/party?id=${savedParty}`);
        const data = await res.json();
        
        // If party exists and user is still a member, keep it
        if (data.party && publicKey) {
          const isMember = data.party.members?.some(
            (m: { player_address: string }) => m.player_address === publicKey.toBase58()
          );
          if (isMember) {
            setCurrentPartyId(savedParty);
            return;
          }
        }
        
        // Party doesn't exist or user not in it - clear localStorage
        localStorage.removeItem("td_party");
        setCurrentPartyId(null);
      } catch {
        // Error fetching - clear to be safe
        localStorage.removeItem("td_party");
        setCurrentPartyId(null);
      }
    };
    
    validateParty();
  }, [publicKey]);

  const handleLeaveParty = async () => {
    if (!currentPartyId || !publicKey) return;
    try {
      await fetch("/api/party", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partyId: currentPartyId, action: "leave", player: publicKey.toBase58() }),
      });
    } catch (e) {
      console.error("Failed to leave party:", e);
    }
    localStorage.removeItem("td_party");
    setCurrentPartyId(null);
    setGameMode(null);
  };

  const handleConnectWallet = useCallback(() => {
    setWalletModalVisible(true);
  }, [setWalletModalVisible]);

  const handleModeSelect = (mode: GameMode) => {
    setGameMode(mode);
    if (mode === "solo") {
      setShowModeSelect(false);
    }
  };

  const handlePartyStart = async (partyId: string) => {
    if (!publicKey) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // First, get party members to initialize game state
      const partyRes = await fetch(`/api/party?id=${partyId}`);
      const partyData = await partyRes.json();
      if (!partyRes.ok) throw new Error(partyData.error || "Failed to get party info");
      
      // Initialize multiplayer game state with party members
      const players = partyData.party.members.map((m: { address: string }, i: number) => ({
        address: m.address,
        name: `Player ${i + 1}`,
        characterClass: "warrior", // Default class - could add selection
      }));
      
      const gameRes = await fetch("/api/party/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partyId, players }),
      });
      
      const gameData = await gameRes.json();
      if (!gameRes.ok) throw new Error(gameData.error || "Failed to initialize game");
      
      // Update party status to in_dungeon
      const res = await fetch("/api/party", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          partyId, 
          action: "start_dungeon", 
          player: publicKey.toBase58() 
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start dungeon");
      
      localStorage.setItem("td_party", partyId);
      router.push(`/dungeon?party=${partyId}`);
    } catch (err) {
      console.error("Party start error:", err);
      setError(err instanceof Error ? err.message : "Failed to start party dungeon");
    } finally {
      setIsProcessing(false);
    }
  };

  // Simple redirect for party members when dungeon starts (no API call needed)
  const handleJoinDungeon = (partyId: string) => {
    localStorage.setItem("td_party", partyId);
    router.push(`/dungeon?party=${partyId}`);
  };

  // Reusable payment function for both solo and party modes
  const processPayment = useCallback(async (): Promise<boolean> => {
    if (!publicKey || !connected) return false;
    
    try {
      const playerAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        mint: TOKEN_MINT,
      });

      if (playerAccounts.value.length === 0) {
        throw new Error("No TND tokens found in your wallet.");
      }

      const playerTokenAccount = playerAccounts.value[0].pubkey;
      const tokenInfo = playerAccounts.value[0].account.data.parsed.info;
      const tokenDecimals = tokenInfo.tokenAmount.decimals || 6;
      const tokenProgramId = playerAccounts.value[0].account.owner;

      const treasuryATA = await getAssociatedTokenAddress(TOKEN_MINT, TREASURY_WALLET, false, tokenProgramId);

      const transaction = new Transaction();
      
      const treasuryATAInfo = await connection.getAccountInfo(treasuryATA);
      if (!treasuryATAInfo) {
        transaction.add(
          createAssociatedTokenAccountIdempotentInstruction(
            publicKey, treasuryATA, TREASURY_WALLET, TOKEN_MINT, tokenProgramId, ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      const transferAmount = BigInt(ENTRY_FEE * Math.pow(10, tokenDecimals));
      transaction.add(
        createTransferInstruction(playerTokenAccount, treasuryATA, publicKey, transferAmount, [], tokenProgramId)
      );

      const { blockhash } = await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection, { skipPreflight: true, maxRetries: 3 });
      await connection.confirmTransaction(signature, "confirmed");
      await refreshBalance();
      
      return true;
    } catch (err) {
      console.error("Payment error:", err);
      return false;
    }
  }, [publicKey, connected, connection, sendTransaction, refreshBalance]);

  const handleEnter = useCallback(async () => {
    if (!publicKey || !connected) return;

    setIsProcessing(true);
    setError(null);

    try {
      if (isFreeEntry) {
        const res = await fetch("/api/free-entry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerPubkey: publicKey.toBase58() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to get free entry");

        localStorage.setItem("td_session", JSON.stringify({ token: data.token, sessionId: data.sessionId, seed: data.seed, expiresAt: data.expiresAt }));
        localStorage.setItem("td_player", publicKey.toBase58());
        router.push("/dungeon");
        return;
      }

      if (balance < ENTRY_FEE) {
        setError(`Need ${ENTRY_FEE} TND to enter`);
        setIsProcessing(false);
        return;
      }

      // Find the player's actual token account (not just the standard ATA)
      const playerAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        mint: TOKEN_MINT,
      });

      if (playerAccounts.value.length === 0) {
        throw new Error("No TND tokens found in your wallet.");
      }

      // Use the first token account that has this mint
      const playerTokenAccount = playerAccounts.value[0].pubkey;
      const tokenInfo = playerAccounts.value[0].account.data.parsed.info;
      const tokenDecimals = tokenInfo.tokenAmount.decimals || 6;
      
      // Detect which token program this mint uses (Token or Token-2022)
      const tokenProgramId = playerAccounts.value[0].account.owner.equals(TOKEN_2022_PROGRAM_ID) 
        ? TOKEN_2022_PROGRAM_ID 
        : TOKEN_PROGRAM_ID;

      console.log("[Entry] Player token account:", playerTokenAccount.toBase58());
      console.log("[Entry] Token balance:", tokenInfo.tokenAmount.uiAmount);
      console.log("[Entry] Token program:", tokenProgramId.toBase58());

      // Get treasury ATA for the correct program
      const treasuryATA = await getAssociatedTokenAddress(TOKEN_MINT, TREASURY_WALLET, false, tokenProgramId);
      console.log("[Entry] Treasury ATA:", treasuryATA.toBase58());

      // Build simple transfer transaction
      const transaction = new Transaction();
      
      // Check if treasury ATA exists first
      const treasuryATAInfo = await connection.getAccountInfo(treasuryATA);
      
      if (!treasuryATAInfo) {
        console.log("[Entry] Treasury ATA doesn't exist, creating...");
        transaction.add(
          createAssociatedTokenAccountIdempotentInstruction(
            publicKey, // payer
            treasuryATA, // ata address
            TREASURY_WALLET, // owner
            TOKEN_MINT, // mint
            tokenProgramId, // use detected program
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      const transferAmount = BigInt(ENTRY_FEE * Math.pow(10, tokenDecimals));
      console.log("[Entry] Transfer amount (raw):", transferAmount.toString());
      console.log("[Entry] From:", playerTokenAccount.toBase58());
      console.log("[Entry] To:", treasuryATA.toBase58());
      
      transaction.add(
        createTransferInstruction(
          playerTokenAccount,
          treasuryATA, 
          publicKey,
          transferAmount,
          [],
          tokenProgramId // use detected program
        )
      );

      const { blockhash } = await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection, { skipPreflight: true, maxRetries: 3 });
      await connection.confirmTransaction(signature, "confirmed");

      const res = await fetch("/api/verify-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature, playerPubkey: publicKey.toBase58() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify payment");

      localStorage.setItem("td_session", JSON.stringify({ token: data.token, sessionId: data.sessionId, seed: data.seed, expiresAt: data.expiresAt }));
      localStorage.setItem("td_player", publicKey.toBase58());
      await refreshBalance();
      router.push("/dungeon");
    } catch (err) {
      console.error("Entry error:", err);
      setError(err instanceof Error ? err.message : "Failed to enter dungeon");
    } finally {
      setIsProcessing(false);
    }
  }, [publicKey, connected, isFreeEntry, balance, connection, sendTransaction, router, refreshBalance]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-bg0">
      {/* Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-radial-void" />
        <div className="absolute inset-0 bg-soot" />
      </div>
      <EmberParticles />

      {/* Top-right controls */}
      <div className="fixed top-4 right-4 z-40 flex flex-col items-end gap-2">
        <div className="flex items-center gap-3">
          {connected && (
            <div className="flex items-center gap-2 px-4 py-2 td-panel rounded-lg">
              <span className="text-text2 text-sm font-ui">TND</span>
              {balanceLoading ? (
                <span className="text-text2">...</span>
              ) : (
                <span className="text-gold1 font-display font-bold">{balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              )}
            </div>
          )}
          <button onClick={() => setShowLeaderboard(true)} className="td-btn td-btn-ghost text-sm">
            🏆
          </button>
          <WalletButton />
        </div>
        
        {/* Party status indicator */}
        {connected && currentPartyId && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-3 py-2 td-panel rounded-lg"
          >
            <span className="text-venom text-xs font-ui">🎮 In Party</span>
            <button 
              onClick={handleLeaveParty}
              className="text-blood text-xs font-ui hover:text-blood/80 underline"
            >
              Leave
            </button>
          </motion.div>
        )}
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mb-6">
          <Image src="/logo.png" alt="Trenches & Dragons" width={140} height={140} className="drop-shadow-[0_0_40px_rgba(232,207,138,0.4)]" />
        </motion.div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mb-8">
          <p className="td-label mb-4 tracking-[0.3em]">A Solana Dungeon Crawler</p>

          <h1 className="font-display font-black leading-none mb-4">
            <span
              className="block text-5xl sm:text-6xl md:text-7xl"
              style={{
                background: "linear-gradient(180deg, var(--gold-0) 0%, var(--gold-1) 40%, var(--gold-2) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 4px 30px rgba(232,207,138,0.4))",
              }}
            >
              TRENCHES
            </span>
            <span className="block text-2xl sm:text-3xl text-blood my-1">&</span>
            <span className="block text-5xl sm:text-6xl md:text-7xl text-text0">DRAGONS</span>
          </h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-lg text-text2 font-flavor italic">
            "Enter the darkness. Claim your glory."
          </motion.p>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 px-6 py-3 bg-blood/20 border border-blood/30 rounded-lg text-blood text-sm font-ui"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Mode Selection or Gate */}
        <AnimatePresence mode="wait">
          {gameMode === "coop" ? (
            <motion.div key="coop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PartyLobby 
                onBack={() => setGameMode(null)} 
                onStart={handlePartyStart}
                onJoinDungeon={handleJoinDungeon}
                canEnter={canEnter}
                balance={balance}
                isFreeEntry={isFreeEntry}
                onPayFee={processPayment}
              />
            </motion.div>
          ) : showModeSelect ? (
            <motion.div key="modes" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center">
              <h3 className="font-display text-2xl text-gold1 mb-6">Select Mode</h3>
              
              <div className="flex gap-6 justify-center mb-8">
                {/* Solo Mode */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (!connected) {
                      handleConnectWallet();
                    } else if (canEnter) {
                      handleModeSelect("solo");
                      handleEnter();
                    } else {
                      setError(`Need ${ENTRY_FEE} TND to enter. You have ${balance.toFixed(0)} TND`);
                    }
                  }}
                  disabled={isProcessing}
                  className="group relative"
                >
                  <div className={cn(
                    "w-36 h-44 td-panel-elevated rounded-xl p-4 flex flex-col items-center justify-center gap-3 border-2 transition-all",
                    canEnter ? "border-transparent hover:border-gold1/50" : "border-transparent hover:border-gold1/30 opacity-80"
                  )}>
                    <span className="text-5xl">🗡️</span>
                    <span className="font-display text-lg text-text0">Solo</span>
                    <span className="text-xs text-text2 font-ui">
                      {!connected ? "Connect wallet" : canEnter ? "Face the dungeon alone" : `Need ${ENTRY_FEE} TND`}
                    </span>
                  </div>
                </motion.button>

                {/* Co-op Mode */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (!connected) {
                      handleConnectWallet();
                    } else {
                      handleModeSelect("coop");
                    }
                  }}
                  className="group relative"
                >
                  <div className={cn(
                    "w-36 h-44 td-panel-elevated rounded-xl p-4 flex flex-col items-center justify-center gap-3 border-2 transition-all",
                    connected ? "border-transparent hover:border-arcane/50" : "border-transparent hover:border-arcane/30 opacity-80"
                  )}>
                    <span className="text-5xl">⚔️</span>
                    <span className="font-display text-lg text-text0">Co-op</span>
                    <span className="text-xs text-text2 font-ui">
                      {!connected ? "Connect wallet" : "Battle with friends"}
                    </span>
                  </div>
                </motion.button>
              </div>

              <div className="h-5 mb-4">
                {!connected ? (
                  <p className="text-text2 text-sm font-ui">Connect wallet to play for real</p>
                ) : isFreeEntry ? (
                  <p className="text-venom text-sm font-ui">🎖️ Admin Access — Free Entry</p>
                ) : balance < ENTRY_FEE ? (
                  <p className="text-blood text-sm font-ui">Need {ENTRY_FEE} TND • You have {balance.toFixed(0)} TND</p>
                ) : (
                  <p className="text-text2 text-sm font-ui">{ENTRY_FEE} TND entry fee per player</p>
                )}
              </div>

              <button onClick={() => setShowModeSelect(false)} className="td-btn td-btn-ghost text-sm">← Back</button>
            </motion.div>
          ) : (
            <motion.div key="gate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Gate */}
              <DungeonGate canEnter={canEnter} isProcessing={isProcessing} connected={connected} onClick={() => setShowModeSelect(true)} onConnect={handleConnectWallet} />

              {/* CTA text */}
              <div className="text-center mt-6">
                <motion.p
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className={cn("font-display tracking-widest uppercase text-sm", canEnter || !connected ? "text-gold1" : "text-text2")}
                >
                  {connected ? "Choose Your Path" : "Enter the Trenches"}
                </motion.p>

                <div className="mt-2 h-5">
                  {!connected ? (
                    <p className="text-text2 text-sm font-ui">Connect wallet to play for real</p>
                  ) : isFreeEntry ? (
                    <p className="text-venom text-sm font-ui">🎖️ Admin Access — Free Entry</p>
                  ) : balance < ENTRY_FEE ? (
                    <p className="text-blood text-sm font-ui">Need {ENTRY_FEE} TND • You have {balance.toFixed(0)} TND</p>
                  ) : (
                    <p className="text-text2 text-sm font-ui">{ENTRY_FEE} TND entry fee</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Demo button - always visible */}
        {!showModeSelect && gameMode !== "coop" && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} onClick={() => router.push("/dungeon?demo=true")} className="mt-6 td-btn td-btn-secondary">
            🎮 Play Free Demo
          </motion.button>
        )}

        {/* Features */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="flex flex-wrap justify-center gap-4 mt-12 mb-6">
          {[
            { icon: "⚔️", title: "Strategic Combat", desc: "Dice-based battles" },
            { icon: "📜", title: "Branching Story", desc: "Your choices matter" },
            { icon: "💰", title: "Real Rewards", desc: "Earn TND tokens" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.1 }}
              className="flex items-center gap-3 px-4 py-3 td-panel"
            >
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="text-text0 font-ui font-medium text-sm">{f.title}</p>
                <p className="text-text2 text-xs font-ui">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer - now part of the flow, not absolute */}
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 1.4 }}
          className="text-text2/40 text-xs font-ui mt-8 pb-6"
        >
          © 2026 Trenches & Dragons • Powered by Solana
        </motion.p>
      </div>

      {/* Prize Pool - subtle bottom right */}
      <PrizePoolIndicator />

      <AnimatePresence>{showLeaderboard && <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />}</AnimatePresence>
    </main>
  );
}
