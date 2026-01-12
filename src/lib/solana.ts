import {
  Connection,
  PublicKey,
  ParsedTransactionWithMeta,
  Commitment,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  getMint,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// The SPL token mint address for the game
export const TOKEN_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_TOKEN_MINT || "CkTFDNGUtw58dBDEnMD9RW3tjTVKaoVXctcXdq8Gpump"
);

// RPC endpoint (Helius for reliability)
export const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://mainnet.helius-rpc.com/?api-key=7784bded-75ad-4ea5-89dd-41962df75552";

// Create connection instance
export function getConnection(commitment: Commitment = "confirmed"): Connection {
  return new Connection(RPC_ENDPOINT, {
    commitment,
    confirmTransactionInitialTimeout: 60000,
  });
}

/**
 * Get the token balance for a wallet
 */
export async function getTokenBalance(
  walletPubkey: PublicKey
): Promise<{ balance: number; decimals: number; rawBalance: bigint }> {
  const connection = getConnection();

  try {
    // Get the ATA for this wallet and mint
    const ata = await getAssociatedTokenAddress(TOKEN_MINT, walletPubkey);

    // Get token account info
    const tokenAccount = await connection.getTokenAccountBalance(ata);

    // Get mint info for decimals
    const mintInfo = await getMint(connection, TOKEN_MINT);

    return {
      balance: tokenAccount.value.uiAmount || 0,
      decimals: mintInfo.decimals,
      rawBalance: BigInt(tokenAccount.value.amount),
    };
  } catch (error) {
    // If token account doesn't exist, return 0
    console.error("Error fetching token balance:", error);
    return { balance: 0, decimals: 9, rawBalance: BigInt(0) };
  }
}

/**
 * Get mint decimals (cached)
 */
let cachedDecimals: number | null = null;
export async function getMintDecimals(): Promise<number> {
  if (cachedDecimals !== null) return cachedDecimals;

  const connection = getConnection();
  const mintInfo = await getMint(connection, TOKEN_MINT);
  cachedDecimals = mintInfo.decimals;
  return cachedDecimals;
}

/**
 * Convert base units to display units
 */
export function toDisplayAmount(baseUnits: bigint | number, decimals: number): number {
  const base = typeof baseUnits === "bigint" ? baseUnits : BigInt(baseUnits);
  return Number(base) / Math.pow(10, decimals);
}

/**
 * Convert display units to base units
 */
export function toBaseUnits(displayAmount: number, decimals: number): bigint {
  return BigInt(Math.floor(displayAmount * Math.pow(10, decimals)));
}

export interface TransferValidationResult {
  valid: boolean;
  error?: string;
  amount?: bigint;
  sender?: string;
  recipient?: string;
  blockTime?: number;
}

/**
 * Verify an SPL token transfer transaction
 * CRITICAL SECURITY: This validates that a transfer actually happened on-chain
 */
export async function verifyTokenTransfer(
  signature: string,
  expectedSender: string,
  expectedRecipient: string,
  minimumAmount: bigint,
  maxAgeMinutes: number = 10
): Promise<TransferValidationResult> {
  const connection = getConnection("confirmed");

  try {
    // Fetch the transaction with parsed instructions
    const tx: ParsedTransactionWithMeta | null = await connection.getParsedTransaction(
      signature,
      {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      }
    );

    if (!tx) {
      return { valid: false, error: "Transaction not found or not finalized" };
    }

    // Check if transaction was successful
    if (tx.meta?.err) {
      console.error("[verifyTokenTransfer] Transaction error:", JSON.stringify(tx.meta.err));
      return { valid: false, error: `Transaction failed on-chain: ${JSON.stringify(tx.meta.err)}` };
    }

    // Validate block time is within acceptable range
    const blockTime = tx.blockTime;
    if (!blockTime) {
      return { valid: false, error: "Transaction has no block time" };
    }

    const now = Math.floor(Date.now() / 1000);
    const maxAge = maxAgeMinutes * 60;
    if (now - blockTime > maxAge) {
      return { valid: false, error: `Transaction is too old (>${maxAgeMinutes} minutes)` };
    }

    // Find the SPL token transfer instruction
    const instructions = tx.transaction.message.instructions;
    let transferFound = false;
    let transferAmount: bigint = BigInt(0);
    let actualSender = "";
    let actualRecipient = "";

    for (const instruction of instructions) {
      // Check if this is a parsed SPL token instruction
      if ("parsed" in instruction && instruction.program === "spl-token") {
        const parsed = instruction.parsed;

        // Handle both 'transfer' and 'transferChecked' instructions
        if (parsed.type === "transfer" || parsed.type === "transferChecked") {
          const info = parsed.info;

          // Get the source and destination token accounts
          const sourceAta = info.source || info.account;
          const destAta = info.destination;
          const amount = info.amount || info.tokenAmount?.amount;

          if (!sourceAta || !destAta || !amount) continue;

          // For transferChecked, verify the mint
          if (parsed.type === "transferChecked" && info.mint) {
            if (info.mint !== TOKEN_MINT.toBase58()) {
              continue; // Wrong mint
            }
          }

          // Get the owner of source token account from pre/post token balances
          const preBalances = tx.meta?.preTokenBalances || [];
          const postBalances = tx.meta?.postTokenBalances || [];

          // Find the source account owner
          let sourceOwner: string | null = null;
          let destOwner: string | null = null;
          let correctMint = false;

          for (const balance of [...preBalances, ...postBalances]) {
            if (balance.mint === TOKEN_MINT.toBase58()) {
              correctMint = true;
              const accountIndex = balance.accountIndex;
              const accountKey = tx.transaction.message.accountKeys[accountIndex];
              const pubkey = typeof accountKey === "string" ? accountKey : accountKey.pubkey.toBase58();

              if (pubkey === sourceAta) {
                sourceOwner = balance.owner || null;
              }
              if (pubkey === destAta) {
                destOwner = balance.owner || null;
              }
            }
          }

          if (!correctMint) continue;

          // Validate sender and recipient match expected
          if (sourceOwner === expectedSender && destOwner === expectedRecipient) {
            transferAmount = BigInt(amount);
            actualSender = sourceOwner;
            actualRecipient = destOwner;
            transferFound = true;
            break;
          }
        }
      }
    }

    if (!transferFound) {
      return {
        valid: false,
        error: "No valid SPL token transfer found for the correct mint/sender/recipient",
      };
    }

    // Validate amount is sufficient
    if (transferAmount < minimumAmount) {
      return {
        valid: false,
        error: `Transfer amount (${transferAmount}) is less than required (${minimumAmount})`,
      };
    }

    return {
      valid: true,
      amount: transferAmount,
      sender: actualSender,
      recipient: actualRecipient,
      blockTime,
    };
  } catch (error) {
    console.error("Error verifying transfer:", error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Unknown error verifying transfer",
    };
  }
}

/**
 * Get the Associated Token Address for a wallet
 */
export async function getWalletATA(walletPubkey: PublicKey): Promise<PublicKey> {
  return getAssociatedTokenAddress(TOKEN_MINT, walletPubkey);
}

/**
 * Check if an ATA exists
 */
export async function checkATAExists(ata: PublicKey): Promise<boolean> {
  const connection = getConnection();
  const info = await connection.getAccountInfo(ata);
  return info !== null;
}
