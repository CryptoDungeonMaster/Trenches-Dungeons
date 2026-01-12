"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

const TOKEN_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_TOKEN_MINT || "GA4fvhBSG5RCDMfczewNePy6xJWTN3p4JRExia2bpump"
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
      // Use getParsedTokenAccountsByOwner with mint filter - most reliable method
      const accounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        mint: TOKEN_MINT,
      });

      if (accounts.value.length > 0) {
        const tokenAccount = accounts.value[0];
        const info = tokenAccount.account.data.parsed.info;
        const tokenAmount = info.tokenAmount;
        
        const tokenDecimals = tokenAmount.decimals || 6;
        const amount = BigInt(tokenAmount.amount);
        const uiAmount = tokenAmount.uiAmount || 0;

        console.log("[TokenBalance] Found balance:", uiAmount, "TND");
        
        setDecimals(tokenDecimals);
        setRawBalance(amount);
        setBalance(uiAmount);
      } else {
        // No token account found - balance is 0
        console.log("[TokenBalance] No token account found for this mint");
        setBalance(0);
        setRawBalance(BigInt(0));
      }
    } catch (err) {
      console.error("[TokenBalance] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch balance");
      setBalance(0);
      setRawBalance(BigInt(0));
    } finally {
      setLoading(false);
    }
  }, [publicKey, connected, connection]);

  useEffect(() => {
    fetchBalance();

    // Poll every 15 seconds
    const interval = setInterval(fetchBalance, 15000);
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
