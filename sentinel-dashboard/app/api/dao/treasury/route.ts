import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import axios from 'axios';
import OpenAI from 'openai';

// --- CONFIG ---
const RPC_URL = "https://rpc.flashbots.net"; // Fallback public RPC
const WALLET_ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"; // Vitalik as Demo Target

// Token Config (Add more here)
const TOKENS = [
    { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', coingeckoId: 'usd-coin' },
    { symbol: 'WBTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', coingeckoId: 'wrapped-bitcoin' },
    { symbol: 'LINK', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', coingeckoId: 'chainlink' },
    { symbol: 'UNI',  address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', coingeckoId: 'uniswap' },
    { symbol: 'SHIB', address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', coingeckoId: 'shiba-inu' },
    { symbol: 'PEPE', address: '0x6982508145454Ce325dDBe47a25d4ec3d2311933', coingeckoId: 'pepe' }
];

const provider = new ethers.JsonRpcProvider(RPC_URL);

// Helper: Format USD
const formatUSD = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

export async function GET() {
    try {
        // 1. Get Token Prices via CoinGecko
        const tokenIds = ['ethereum', ...TOKENS.map(t => t.coingeckoId)].join(',');
        const priceRes = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds}&vs_currencies=usd`);
        const prices = priceRes.data;

        // 2. Get ETH Balance
        const ethPrice = prices['ethereum']?.usd || 0;
        const balanceWei = await provider.getBalance(WALLET_ADDRESS);
        const balanceEth = parseFloat(ethers.formatEther(balanceWei));
        const ethValue = balanceEth * ethPrice;

        // 3. Get ERC20 Balances
        const abi = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"];
        
        const tokenBalances = await Promise.all(TOKENS.map(async (token) => {
            try {
                const contract = new ethers.Contract(token.address, abi, provider);
                // We mock retry or simple fetch here. 
                // For robustness in this demo, if fetch fails we default to 0.
                const raw = await contract.balanceOf(WALLET_ADDRESS);
                const decimals = await contract.decimals();
                const balance = parseFloat(ethers.formatUnits(raw, decimals));
                const price = prices[token.coingeckoId]?.usd || 0;
                
                return {
                    symbol: token.symbol,
                    balance: balance,
                    value: balance * price,
                    price: price
                };
            } catch (e) {
                console.warn(`Failed to fetch ${token.symbol}`, e);
                return { symbol: token.symbol, balance: 0, value: 0, price: 0 };
            }
        }));

        const totalTokenValue = tokenBalances.reduce((acc, t) => acc + t.value, 0);
        const totalValue = ethValue + totalTokenValue;

        // 4. AI Analysis
        let aiAnalysis = "AI Service Unavailable";
        const apiKey = process.env.OPENROUTER_API_KEY;
        
        if (apiKey) {
            const openai = new OpenAI({
                baseURL: "https://openrouter.ai/api/v1",
                apiKey: apiKey,
                defaultHeaders: { "HTTP-Referer": "http://localhost:3000", "X-Title": "DAO Sentinel" }
            });

            // Summary for AI
            const holdingsSummary = tokenBalances
                .filter(t => t.value > 100) // Filter dust
                .map(t => `${t.symbol}: $${formatUSD(t.value)}`)
                .join(', ');

            const prompt = `
            Analyze this DAO Treasury:
            - Address: ${WALLET_ADDRESS}
            - Total Value: ${formatUSD(totalValue)}
            - ETH Holdings: ${balanceEth.toFixed(2)} ETH ($${formatUSD(ethValue)})
            - Major Tokens: ${holdingsSummary}
            
            Risk assessment in 1 short, incisive sentence. Mention diversity or lack thereof.
            `;

            try {
                const completion = await openai.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "google/gemini-2.0-flash-exp:free", // Using free fast model
                });
                aiAnalysis = completion.choices[0].message.content || "No analysis";
            } catch (e) {
                console.error("AI Error", e);
            }
        }

        return NextResponse.json({
            address: WALLET_ADDRESS,
            totalValue,
            eth: { balance: balanceEth, value: ethValue, price: ethPrice },
            tokens: tokenBalances,
            analysis: aiAnalysis,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
