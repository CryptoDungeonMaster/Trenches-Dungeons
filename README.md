# ⚔️ Trenches & Dragons

A browser-based dungeon crawler / D&D-lite session game powered by Solana. Players pay with SPL tokens to enter dungeons and can claim rewards upon completion.

![Trenches & Dragons](https://img.shields.io/badge/Solana-Powered-9945FF?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14+-000000?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square)

## 🎮 Features

- **Solana Wallet Integration**: Connect with Phantom, Solflare, and other wallets
- **SPL Token Payments**: Pay entry fees with your custom token
- **Off-Chain Gameplay**: Fast, deterministic dungeon runs with seeded RNG
- **Anti-Cheat Protection**: Server-side transaction verification and signature replay prevention
- **Session Management**: JWT-based session handling with expiration
- **Admin Dashboard**: Configure fees, rewards, and game parameters
- **Dark Trench Aesthetic**: Immersive UI with animations and effects

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Wallet    │  │   Game UI   │  │   Admin     │     │
│  │   Connect   │  │  (Off-chain)│  │   Panel     │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
└─────────┼────────────────┼────────────────┼─────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                    API Routes                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │verify-entry │  │   session   │  │    claim    │     │
│  │(tx verify)  │  │ (JWT issue) │  │  (rewards)  │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
└─────────┼────────────────┼────────────────┼─────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend Services                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Solana    │  │   SQLite    │  │   JWT/Auth  │     │
│  │    RPC      │  │     DB      │  │   Service   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- A Solana wallet (Phantom/Solflare)
- SOL for transaction fees
- Your SPL token for game entry

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/yourusername/trenches-dragons.git
   cd trenches-dragons
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your values:
   ```env
   NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
   NEXT_PUBLIC_TOKEN_MINT=CkTFDNGUtw58dBDEnMD9RW3tjTVKaoVXctcXdq8Gpump
   NEXT_PUBLIC_ADMIN_WALLET=YOUR_ADMIN_WALLET
   ADMIN_WALLET=YOUR_ADMIN_WALLET
   JWT_SECRET=your-secure-random-secret
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

4. **Configure game settings**
   - Navigate to `/admin`
   - Connect with your admin wallet
   - Set treasury public key
   - Configure entry fee and rewards

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main landing page
│   ├── dungeon/
│   │   └── page.tsx          # Game page
│   ├── admin/
│   │   └── page.tsx          # Admin dashboard
│   └── api/
│       ├── verify-entry/     # Transaction verification
│       ├── session/          # Session management
│       ├── claim/            # Reward claims
│       └── settings/         # Game settings
├── components/
│   └── WalletProvider.tsx    # Solana wallet context
├── hooks/
│   ├── useTokenBalance.ts    # Token balance hook
│   └── useGameSession.ts     # Game session hook
└── lib/
    ├── db/                   # Database (Drizzle + SQLite)
    ├── game.ts               # Game logic & RNG
    ├── jwt.ts                # JWT handling
    ├── settings.ts           # Settings management
    └── solana.ts             # Solana utilities
```

## 🔒 Security Features

### Transaction Verification
- Validates transaction is finalized on-chain
- Verifies correct SPL token mint
- Confirms sender/recipient match expected
- Checks amount >= entry fee
- Ensures transaction is recent (configurable window)

### Anti-Cheat
- **Signature Replay Prevention**: Each transaction signature can only be used once
- **Rate Limiting**: API endpoints are rate-limited per IP
- **JWT Sessions**: Short-lived tokens (30 min) for game access
- **Server-Side Seed**: RNG seed generated server-side for determinism

### Best Practices
- Treasury private keys should **NEVER** be used in production
- Use a multisig or separate payout service for rewards
- Use a dedicated RPC endpoint for production
- Enable HTTPS in production

## 🎮 Gameplay

### Flow
1. **Connect Wallet** - Link your Phantom/Solflare wallet
2. **Pay Entry Fee** - Transfer tokens to treasury
3. **Verify & Start** - Server validates payment, issues session
4. **Dungeon Run** - Navigate encounters (5 stages)
5. **Claim Reward** - Submit score and claim tokens

### Encounters
- **Combat** - Fight enemies with attack/defend/escape
- **Treasure** - Collect gold or leave it
- **Traps** - Take damage from hazards
- **Rest** - Recover health

### Scoring
- Defeating enemies: 75-100+ points
- Collecting treasure: Gold value as points
- Surviving: 25-50 points
- Victory bonus: 500 points + health + gold

## 🖥️ Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
# Or deploy via CLI
npx vercel
```

### Environment Variables for Production

```env
NEXT_PUBLIC_RPC_ENDPOINT=https://your-rpc-endpoint.com
NEXT_PUBLIC_TOKEN_MINT=your-token-mint
NEXT_PUBLIC_ADMIN_WALLET=your-admin-wallet
ADMIN_WALLET=your-admin-wallet
JWT_SECRET=strong-random-secret-min-32-chars
```

**Important**: SQLite works in Vercel's serverless functions but data won't persist across deployments. For production, consider:
- PostgreSQL (Vercel Postgres, Supabase, Neon)
- PlanetScale
- Or any other persistent database

## 🛠️ Development

### Database Migrations

```bash
# Generate migrations
npx drizzle-kit generate

# Push schema changes
npx drizzle-kit push
```

### Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🔧 Configuration

### Admin Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Entry Fee | Tokens required to enter | 1.0 |
| Reward Amount | Base reward for completion | 0.5 |
| Treasury | Wallet receiving fees | - |
| Difficulty | easy/normal/hard | normal |
| Payout Enabled | Auto-payout (dev only) | false |

## ⚠️ Production Checklist

- [ ] Set strong JWT_SECRET (min 32 chars)
- [ ] Configure dedicated RPC endpoint
- [ ] Set up persistent database (not SQLite)
- [ ] Enable rate limiting with Redis
- [ ] Use multisig for treasury
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Configure CORS properly
- [ ] Enable HTTPS
- [ ] Review all security settings

## 📄 License

MIT License - see LICENSE file

## 🙏 Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Drizzle ORM](https://orm.drizzle.team/)
- [TailwindCSS](https://tailwindcss.com/)

---

**⚔️ Enter the Trenches. Survive. Claim your glory. ⚔️**
