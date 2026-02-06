require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');
const OpenAI = require('openai');

// --- CONFIGURATION ---
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const walletAddress = process.env.TARGET_WALLET; // Pastikan ini wallet Vitalik/Whale biar ada isinya

// Config Token (USDC Mainnet)
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
// Minimal ABI untuk membaca saldo token (ERC-20 Standard)
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
];

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": process.env.SITE_URL,
        "X-Title": process.env.APP_NAME,
    }
});

const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
};

// MODULE 1: Price Feed
async function getEthPrice() {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        return response.data.ethereum.usd;
    } catch (error) {
        console.warn("⚠️ Price API limit/error, using fallback.");
        return 3300; 
    }
}

// MODULE 2: Blockchain Data Fetcher (Multi-Asset)
async function getTreasuryData() {
    let targetWallet;
    try {
        targetWallet = ethers.getAddress(walletAddress);
        console.log(`🔍 Scanning Treasury: ${targetWallet}...`);
    } catch (e) {
        console.error("❌ Fatal: Address Invalid.");
        return null;
    }
    
    try {
        // A. Ambil Saldo ETH (Native)
        const balanceWei = await provider.getBalance(targetWallet);
        const balanceEth = ethers.formatEther(balanceWei);
        const ethPrice = await getEthPrice();
        const ethValue = parseFloat(balanceEth) * ethPrice;

        // B. Ambil Saldo USDC (ERC-20)
        const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
        const usdcRaw = await usdcContract.balanceOf(targetWallet);
        const usdcDecimals = await usdcContract.decimals(); // USDC biasanya 6 decimals
        const usdcBalance = ethers.formatUnits(usdcRaw, usdcDecimals);
        const usdcValue = parseFloat(usdcBalance); // 1 USDC = $1 (Approx)

        // C. Total Portfolio
        const totalValue = ethValue + usdcValue;

        return {
            address: targetWallet,
            eth: { balance: parseFloat(balanceEth).toFixed(4), value: ethValue },
            usdc: { balance: parseFloat(usdcBalance).toFixed(2), value: usdcValue },
            totalValueUsd: totalValue,
            ethPrice: ethPrice
        };
    } catch (error) {
        console.error("❌ Blockchain Error:", error.message);
        return null;
    }
}

// MODULE 3: AI Analyst (Updated Prompt)
async function generateAIAnalysis(data) {
    if (!data) return null;
    console.log(`🧠 AI Analyzing Portfolio Mix...`);

    const prompt = `
    Role: Financial Risk Analyst for a Web3 DAO.
    
    Treasury Snapshot:
    - Total Value: ${formatCurrency(data.totalValueUsd)}
    - ETH Holdings: ${data.eth.balance} ETH ($${formatCurrency(data.eth.value)})
    - USDC Holdings: ${formatCurrency(data.usdc.value)}
    
    Task:
    Provide a concise risk assessment (Max 2 sentences).
    Focus on the ratio of Volatile Assets (ETH) vs Stablecoins (USDC).
    Example: "High exposure to ETH volatility. Stablecoin reserves are healthy/low."
    `;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: process.env.AI_MODEL,
        });
        return completion.choices[0].message.content;
    } catch (error) {
        console.error("❌ AI Error:", error);
        return "⚠️ AI Analysis temporarily unavailable.";
    }
}

// MODULE 4: Discord Rich Embed Reporter (Visual Upgrade)
async function postToDiscord(data, aiAnalysis) {
    console.log("🚀 Building Rich Embed...");
    
    // Tentukan warna embed berdasarkan saldo (Hijau jika > $10k, Merah jika kurang)
    const statusColor = data.totalValueUsd > 10000 ? 5763719 : 15548997; // Green vs Red code

    const embedPayload = {
        embeds: [{
            title: "🛡️ DAO Treasury Daily Report",
            description: `**Analysis:**\n${aiAnalysis}`, // Hasil AI ditaruh di atas
            color: statusColor,
            fields: [
                {
                    name: "💎 Total Treasury Value",
                    value: `**${formatCurrency(data.totalValueUsd)}**`,
                    inline: false
                },
                {
                    name: "Ξ Ethereum (ETH)",
                    value: `${data.eth.balance} ETH\n(~$${formatCurrency(data.eth.value)})`,
                    inline: true
                },
                {
                    name: "💵 USD Coin (USDC)",
                    value: `$${data.usdc.balance}`,
                    inline: true
                }
            ],
            footer: {
                text: `DAO Sentinel • ETH Price: $${data.ethPrice}`
            },
            timestamp: new Date().toISOString()
        }]
    };

    try {
        await axios.post(process.env.DISCORD_WEBHOOK_URL, embedPayload);
        console.log("✅ Rich Report Sent!");
    } catch (error) {
        console.error("❌ Discord Error:", error.message);
    }
}

// EXECUTION PIPELINE
(async () => {
    // 1. Fetch
    const data = await getTreasuryData();
    
    if (data) {
        // 2. Analyze
        const analysis = await generateAIAnalysis(data);
        
        // 3. Report
        await postToDiscord(data, analysis);
    }
})();