"use client";

import dynamic from "next/dynamic";

// Dynamically import WalletMultiButton with SSR disabled to prevent hydration mismatch
const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false, loading: () => <button className="btn btn-primary">Connect Wallet</button> }
);

export function WalletButton() {
  return <WalletMultiButton />;
}
