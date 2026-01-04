"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect, useCallback } from "react";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

const TOKEN_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_TOKEN_MINT || "CkTFDNGUtw58dBDEnMD9RW3tjTVKaoVXctcXdq8Gpump"
);

interface TokenBalance {
  balance: number;
  rawBalance: bigint;
  decimals: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useTokenBalance(): TokenBalance {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState(0);
  const [rawBalance, setRawBalance] = useState<bigint>(BigInt(0));
  const [decimals, setDecimals] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connected) {
      setBalance(0);
      setRawBalance(BigInt(0));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the ATA for this wallet
      const ata = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);

      try {
        // Try to get the token account
        const account = await getAccount(connection, ata);
        const amount = account.amount;

        // Get mint info for decimals
        const mintInfo = await connection.getParsedAccountInfo(TOKEN_MINT);
        const mintData = mintInfo.value?.data;
        
        let tokenDecimals = 6; // Default
        if (mintData && "parsed" in mintData) {
          tokenDecimals = mintData.parsed.info.decimals;
        }

        setDecimals(tokenDecimals);
        setRawBalance(amount);
        setBalance(Number(amount) / Math.pow(10, tokenDecimals));
      } catch {
        // Token account doesn't exist - balance is 0
        setBalance(0);
        setRawBalance(BigInt(0));
      }
    } catch (err) {
      console.error("Error fetching token balance:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch balance");
    } finally {
      setLoading(false);
    }
  }, [publicKey, connected, connection]);

  useEffect(() => {
    fetchBalance();

    // Set up polling every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  return {
    balance,
    rawBalance,
    decimals,
    loading,
    error,
    refresh: fetchBalance,
  };
}
