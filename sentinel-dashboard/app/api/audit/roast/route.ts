import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Config
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

// OpenAI/OpenRouter Setup
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": "Sentinel Dashboard",
    }
});

// Helper: Wei to ETH
const toEth = (wei: string) => (parseFloat(wei) / 1e18).toFixed(5);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { address } = body;

        if (!address) {
            return NextResponse.json({ error: "Where is the wallet address?" }, { status: 400 });
        }

        console.log(`🔥 Preparing the roast for: ${address}`);

        // 1. Get Last 50 Transactions from Etherscan
        const url = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "1" || !data.result) {
             // Handle empty wallet or API error by returning a generic mock or error
             console.warn("Etherscan fetch failed or empty:", data.message);
             // If completely empty, maybe just roast them for being poor?
             if(data.message === "No transactions found") {
                return NextResponse.json({
                    title: "The Ghost Town",
                    roast: "This wallet is emptier than my soul. Do you even crypto, bro? 0 transactions. Are you saving up for gas fees on a testnet?",
                    score: 10
                });
             }
             throw new Error("Failed to fetch Etherscan data.");
        }

        const txList = data.result;

        // 2. Process Data (Simplify for AI)
        let totalGasSpent = 0;
        let totalSent = 0;
        let totalReceived = 0;
        
        // Summarize text for prompt
        const txSummary = txList.map((tx: any) => {
            const isOut = tx.from.toLowerCase() === address.toLowerCase();
            const valEth = parseFloat(toEth(tx.value));
            const gasEth = parseFloat(toEth((tx.gasUsed * tx.gasPrice).toString()));
            
            totalGasSpent += gasEth;
            if (isOut) totalSent += valEth;
            else totalReceived += valEth;

            return `- [${new Date(Number(tx.timeStamp) * 1000).toLocaleDateString()}] ${isOut ? 'SENT' : 'RECEIVED'} ${valEth} ETH (Gas: ${gasEth} ETH)`;
        }).join('\n');

        const netWorthFlow = totalReceived - totalSent;

        // 3. Prompt AI
        const prompt = `
        ROLE: You are a RUTHLESS and CRUEL Crypto Stand-up Comedian.
        TASK: Roast this wallet owner based on their transaction history.
        
        STATISTICS:
        - Address: ${address}
        - Total Transactions (checked): ${txList.length}
        - Total Gas Fee Wasted: ${totalGasSpent.toFixed(4)} ETH (This is burnt money!)
        - Net Flow (In - Out): ${netWorthFlow.toFixed(4)} ETH
        
        RECENT HISTORY:
        ${txSummary}

        INSTRUCTIONS:
        1. Analyze their behavior. Are they a "Gas Donor"? "Exit Liquidity"? or "Degen"?
        2. Give a insulting NICKNAME (Title). E.g. "Miner's Charity", "Bag Holder Supreme".
        3. Use slang/informal English. Be funny but savage.
        4. Focus on the financial stupidity.
        
        FORMAT OUTPUT (JSON only):
        {
            "title": "SAVAGE TITLE",
            "roast": "Long roast paragraph (min 3 sentences)...",
            "score": "Stupidity Score (0-100, higher is dumber)"
        }
        `;

        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-exp:free", // Or use process.env.MODEL if preferred
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });

        const rawContent = completion.choices[0].message.content || "{}";
        // Clean potential generic thinking tokens if using deepseek or similar, though Gemini usually fine with json_object
        const cleanContent = rawContent.replace(/<think>[\s\S]*?<\/think>/, '').trim();
        
        const jsonResult = JSON.parse(cleanContent);

        return NextResponse.json(jsonResult);

    } catch (error: any) {
        console.error("Roast Error:", error);
        return NextResponse.json({ error: "Failed to roast: " + error.message }, { status: 500 });
    }
}
