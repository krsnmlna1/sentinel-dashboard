# 🛡️ Sentinel Platform

**AI-Powered Crypto Security Dashboard**

Sentinel is a full-stack security command center for the crypto ecosystem. It combines real-time on-chain data with AI to audit smart contracts, profile wallets, monitor DeFi protocols, and scan project whitepapers for red flags.

## 🌐 Live Demo

**[🚀 Try Sentinel Now →](https://sentinel-dashboard.vercel.app)**

---

## 🚀 Features

### Command Dashboard
Real-time overview of DeFi protocol health. Displays market sentiment, whale activity, social volume, and a live feed of on-chain events.

### Smart Contract & Wallet Auditor
Paste a contract address or wallet address to receive an AI-generated security report including risk scoring, honeypot detection, reentrancy analysis, and ownership pattern checks.

### Scout Network
Autonomous protocol discovery engine backed by DeFiLlama data. Displays a radar visualization of monitored protocols ranked by TVL and risk score. Supports search by protocol name or chain.

### AI Terminal
A terminal-style chat interface powered by a large language model. Ask anything about on-chain data, protocols, or security concepts.

### Whitepaper Scanner
Upload a project whitepaper (PDF) to detect red flags such as vague tokenomics, unrealistic promises, and missing technical detail.

---

## 🏗️ Architecture

This is a **monorepo** with two packages:

| Package | Description | Stack |
|---|---|---|
| `sentinel-dashboard/` | Frontend application | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion |
| `sentinel-workers/` | Backend API | Cloudflare Workers, Cloudflare KV |

The backend handles audit job queuing and result storage via Cloudflare KV. The frontend calls both the backend API and Next.js API routes (Etherscan, DeFiLlama, Groq).

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/krsnmlna1/sentinel-dashboard.git
   cd sentinel-dashboard
   ```

2. Copy the environment file and fill in your API keys:

   ```bash
   cp .env.example .env
   ```

   | Variable | Required | Description |
   |---|---|---|
   | `ETHERSCAN_API_KEY` | Yes | Etherscan API key for on-chain data |
   | `GROQ_API_KEY` | Yes | Groq API key for AI features |
   | `NEXT_PUBLIC_API_URL` | No | URL of the deployed Cloudflare Worker (defaults to `http://localhost:8787`) |

3. Install dependencies and start the frontend:

   ```bash
   cd sentinel-dashboard
   npm install
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌍 Deployment

### Frontend

#### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/krsnmlna1/sentinel-dashboard)

The `vercel.json` file handles the monorepo structure automatically. Set `ETHERSCAN_API_KEY` and `GROQ_API_KEY` in the Vercel dashboard environment variables.

For detailed instructions see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md).

#### Railway

Connect the repository to Railway. The `railway.json` and `nixpacks.toml` files configure the build and start commands automatically. Set `ETHERSCAN_API_KEY` and `GROQ_API_KEY` as environment variables in the Railway dashboard.

For detailed instructions see [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md).

### Backend (Cloudflare Workers)

1. Navigate to `sentinel-workers/`.
2. Add your Cloudflare Account ID to `wrangler.toml`.
3. Deploy:

   ```bash
   npx wrangler deploy
   ```

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch.
3. Submit a pull request.

---

_Built by the Sentinel Team._
