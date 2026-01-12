// Admin wallets - these get free entry and admin access
export const ADMIN_WALLETS = [
  "CjSqsat78oKYhoSwSkdkQFoXyyBqjhBBqJTwFnvB8K9S", // Treasury/main admin
  "FyafA5iMiBrbwjYrQRPCyyMPP61HCQzEUwbDa5Jjwhxa",
  "5inT8iwuCZgAX5i1G3dLK6SJnMjZQGvTvqp64j7YJJFk",
];

/**
 * Check if a wallet is an admin
 */
export function isAdmin(walletPubkey: string): boolean {
  return ADMIN_WALLETS.includes(walletPubkey);
}

/**
 * Check if a wallet gets free entry
 */
export function hasFreeEntry(walletPubkey: string): boolean {
  return ADMIN_WALLETS.includes(walletPubkey);
}
