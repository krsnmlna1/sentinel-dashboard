# 🛡️ Sentinel Platform

**AI-Powered Crypto Security & Wallet Profiler**

Sentinel is a next-generation security command center for the crypto ecosystem. It combines real-time blockchain data with advanced AI agents to detect vulnerabilities, analyze wallet behaviors, and visualize on-chain activity.

![Sentinel Dashboard](https://github.com/user-attachments/assets/placeholder-image-url)

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

1. Go to `sentinel-dashboard/`.
2. Run `npm run build`.
3. Deploy the `.next` output or connect repository to Vercel (Root Directory: `sentinel-dashboard`).

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
