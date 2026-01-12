"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
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
function DungeonGate({ canEnter, isProcessing, onClick }: {
  canEnter: boolean;
  isProcessing: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={canEnter && !isProcessing ? onClick : undefined}
    >
      {/* Gate glow */}
      <motion.div
        animate={{ opacity: isHovered && canEnter ? 0.4 : 0.15, scale: isHovered && canEnter ? 1.1 : 1 }}
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
              animate={{ x: isHovered && canEnter ? "-15%" : 0 }}
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
              animate={{ x: isHovered && canEnter ? "15%" : 0 }}
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
              {isHovered && canEnter && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-t from-gold1/30 via-gold1/10 to-transparent"
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

        {!canEnter && !isProcessing && (
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
// MAIN PAGE
// ============================================
export default function LandingPage() {
  const router = useRouter();
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { balance, loading: balanceLoading, decimals, refresh: refreshBalance } = useTokenBalance();

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFreeEntry = publicKey ? hasFreeEntry(publicKey.toBase58()) : false;
  const canEnter = connected && (isFreeEntry || balance >= ENTRY_FEE);

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

      console.log("[Entry] Player token account:", playerTokenAccount.toBase58());
      console.log("[Entry] Token balance:", tokenInfo.tokenAmount.uiAmount);

      // Get treasury ATA
      const treasuryATA = await getAssociatedTokenAddress(TOKEN_MINT, TREASURY_WALLET);
      console.log("[Entry] Treasury ATA:", treasuryATA.toBase58());

      // Check if treasury ATA exists, if not create it
      const transaction = new Transaction();
      const treasuryATAInfo = await connection.getAccountInfo(treasuryATA);
      
      if (!treasuryATAInfo) {
        console.log("[Entry] Creating treasury ATA...");
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey, // payer
            treasuryATA, // ata address
            TREASURY_WALLET, // owner
            TOKEN_MINT, // mint
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      const transferAmount = BigInt(ENTRY_FEE * Math.pow(10, tokenDecimals));
      transaction.add(
        createTransferInstruction(playerTokenAccount, treasuryATA, publicKey, transferAmount, [], TOKEN_PROGRAM_ID)
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
      <div className="fixed top-4 right-4 z-40 flex items-center gap-3">
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

        {/* Gate */}
        <DungeonGate canEnter={canEnter} isProcessing={isProcessing} onClick={handleEnter} />

        {/* CTA text */}
        <div className="text-center mt-6">
          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className={cn("font-display tracking-widest uppercase text-sm", canEnter ? "text-gold1" : "text-text2")}
          >
            Enter the Trenches
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

        {/* Demo button */}
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} onClick={() => router.push("/dungeon?demo=true")} className="mt-6 td-btn td-btn-secondary">
          🎮 Play Free Demo
        </motion.button>

        {/* Features */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="flex flex-wrap justify-center gap-4 mt-12">
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
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-10">
        <p className="text-text2/40 text-xs font-ui">© 2026 Trenches & Dragons • Powered by Solana</p>
      </div>

      <AnimatePresence>{showLeaderboard && <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />}</AnimatePresence>
    </main>
  );
}
