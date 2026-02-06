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

## 🏗️ Architecture

Sentinel uses a hybrid architecture to ensure speed, scalability, and zero-cost AI inference for the MVP.

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: TailwindCSS, Framer Motion (Animations)
- **Backend**: [Cloudflare Workers](https://workers.cloudflare.com/) (Serverless)
- **AI Engine**: Llama-3.3-70b via Groq (Proxied through Cloudflare Worker)
- **Blockchain Data**: Etherscan API, Flashbots RPC

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

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Run Development Server**

    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    Visit `http://localhost:3000`

## 🌍 Deployment

### Frontend (Vercel/Netlify)

The dashboard is stateless and optimized for edge deployment.

```bash
npm run build
```

### Backend (Cloudflare Workers)

The API logic resides in the `sentinel-workers` directory.

```bash
cd sentinel-workers
npx wrangler deploy
```

## 🤝 Contributing

We welcome degens, security researchers, and whiteboard warriors.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

_Built with ❤️ (and paranoia) by the Sentinel Team._
