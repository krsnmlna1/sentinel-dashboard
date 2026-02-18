# 🛡️ Sentinel Platform

**AI-Powered Crypto Security & Wallet Profiler**

Sentinel is a next-generation security command center for the crypto ecosystem. It combines real-time blockchain data with advanced AI agents to detect vulnerabilities, analyze wallet behaviors, and visualize on-chain activity.

## 🌐 Live Demo

**[🚀 Try Sentinel Now →](https://sentinel-dashboard.vercel.app)**

Experience the full platform with one click - no installation required!


## 🚀 Key Features

### 1. 🧠 AI Smart Contract Audit

- **Instant Analysis**: Paste any contract address to get a security breakdown.
- **Risk Scoring**: 0-100 safety score based on code patterns (Honeypot, Reentrancy, Ownership).
- **Yield Prediction**: For DeFi vaults, AI predicts potential APY sustainability across different market conditions.

### 2. 🤡 Wallet Profiler & Roast

- **Behavioral Analysis**: Scans transaction history to profile a wallet (Whale, Degen, Bot, or Noob).
- **Savage Mode**: Generates a "Roast" of the wallet's trading performance using AI.
- **Viral Export**: One-click generation of shareable "Proof-of-Roast" images for Twitter/X.

### 3. 📡 Scout Radar

- **3D Visualization**: Real-time visualization of blockchain nodes and interactions.
- **Visual Intelligence**: Identify clusters of suspicious activity or whale movements visually.

### 4. 📄 Whitepaper Scanner

- **PDF Analysis**: Upload project whitepapers to detect red flags, vague tokenomics, and unrealistic promises.

---

## 🏗️ Monorepo Architecture

This repository is a **Monorepo** containing the full stack of the Sentinel Platform.

- **`sentinel-dashboard/`** (Frontend)
  - Built with [Next.js 14](https://nextjs.org/) (App Router).
  - Handles UI, Wallet Connection, and Data Visualization.
  - Deployed on Vercel/Netlify.
- **`sentinel-workers/`** (Backend)
  - Built with [Cloudflare Workers](https://workers.cloudflare.com/).
  - Handles AI Inference (Llama 3 via Groq), Database (KV), and Blockchain Parsing.
  - Deployed on Cloudflare Edge Network.

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- NPM or Bun

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/krsnmlna1/sentinel-dashboard.git
    cd sentinel-dashboard
    ```

2.  **Install Frontend Dependencies**

    ```bash
    cd sentinel-dashboard
    npm install
    ```

3.  **Run Development Server**

    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    Visit `http://localhost:3000`

---

## 🌍 Deployment Setup

### Frontend (Next.js)

#### Deploy to Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/krsnmlna1/sentinel-dashboard)

1. **One-Click Deploy**: Click the button above to deploy to Vercel
2. **Manual Setup**: 
   - Connect your repository to Vercel
   - Configure environment variables:
     - `ETHERSCAN_API_KEY` - Your Etherscan API key
     - `GROQ_API_KEY` - Your Groq API key for AI features
   - The `vercel.json` configuration handles the monorepo structure automatically
3. **Build Configuration**: The project is pre-configured with:
   - Build Command: `cd sentinel-dashboard && npm ci && npm run build`
   - Output Directory: `sentinel-dashboard/.next`
   - Framework: Next.js (auto-detected)

For detailed Vercel deployment instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

#### Deploy to Railway
1. **Connect your repository** to Railway
2. **Set environment variables** in Railway dashboard:
   - `ETHERSCAN_API_KEY` - Your Etherscan API key
   - `GROQ_API_KEY` - Your Groq API key for AI features
3. Railway will automatically detect the configuration from `railway.json` / `nixpacks.toml`
4. The deployment will:
   - Install dependencies with `npm ci`
   - Build the Next.js app with `npm run build`
   - Start the server with `npm start`

For detailed Railway deployment instructions, see [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

**Note**: The monorepo structure is handled automatically. Both platforms run from the root directory and execute the scripts that navigate to `sentinel-dashboard/`.

### Backend (Cloudflare)

1. Go to `sentinel-workers/`.
2. Configure `wrangler.toml` with your Cloudflare Account ID.
3. Run `npx wrangler deploy`.

---

## 🤝 Contributing

We welcome degens, security researchers, and whiteboard warriors.

1. Fork the Project
2. Create your Feature Branch
3. Submit a Pull Request

---

_Built with ❤️ (and paranoia) by the Sentinel Team._
