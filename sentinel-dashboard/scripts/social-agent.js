require('dotenv').config({ path: '.env.local' }); // Load from next.js .env.local
const { ethers } = require('ethers');
const OpenAI = require('openai');
const readlineSync = require('readline-sync');
const readline = require('readline');
const axios = require('axios');

// --- CONFIG ---
// Use a public RPC if env not set for script
const RPC = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.ankr.com/eth";
const provider = new ethers.JsonRpcProvider(RPC);

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Sentinel Agent",
    }
});

// --- 1. DEFINE TOOLS ---

// Tool A: Check ETH Balance
async function getEthBalance(address) {
    try {
        console.log(`\n⚙️  [System] Checking blockchain for: ${address}...`);
        const balanceWei = await provider.getBalance(address);
        const balanceEth = ethers.formatEther(balanceWei);
        return `${balanceEth} ETH`; 
    } catch (error) {
        return "Error: Invalid address or RPC error.";
    }
}

// Tool B: Check Gas Price
async function getGasPrice() {
    try {
        console.log(`\n⚙️  [System] Checking gas price...`);
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice || feeData.maxFeePerGas; 
        const gasPriceGwei = ethers.formatUnits(gasPrice, 'gwei');
        return `${parseFloat(gasPriceGwei).toFixed(2)} Gwei (Low < 15, High > 30)`;
    } catch (error) {
        return "Error fetching gas.";
    }
}

// Tool C: Check Token Price (CoinGecko)
async function getTokenPrice(ticker) {
    try {
        console.log(`\n💰 [System] Checking price for: ${ticker}...`);
        const map = { 'eth': 'ethereum', 'btc': 'bitcoin', 'sol': 'solana', 'link': 'chainlink', 'uni': 'uniswap' };
        const id = map[ticker.toLowerCase()] || ticker.toLowerCase();
        
        const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
        const price = res.data[id]?.usd;
        
        if (!price) return "Error: Token not found or API limit.";
        return `$${price} USD`;
    } catch (error) {
        return "Error checking price.";
    }
}

// Schema 
const tools = [
    {
        type: "function",
        function: {
            name: "getEthBalance",
            description: "Get the ETH balance of a wallet address.",
            parameters: {
                type: "object",
                properties: { address: { type: "string" } },
                required: ["address"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "getGasPrice",
            description: "Get current gas price in Gwei.",
            parameters: { type: "object", properties: {} },
        },
    },
    {
        type: "function",
        function: {
            name: "getTokenPrice",
            description: "Get the current price of a crypto token in USD (e.g. 'eth', 'btc', 'link').",
            parameters: {
                type: "object",
                properties: { ticker: { type: "string" } },
                required: ["ticker"],
            },
        },
    },
];

// --- 2. THE AI BRAIN ---
async function chatWithAI(userMessage, messageHistory) {
    messageHistory.push({ role: "user", content: userMessage });

    try {
        // Call 1: AI Decides
        const completion = await openai.chat.completions.create({
            messages: messageHistory,
            model: "google/gemini-2.0-flash-exp:free", // Better model for tools?
            tools: tools,
            tool_choice: "auto",
        });

        const aiMessage = completion.choices[0].message;

        // Check if tool used
        if (aiMessage.tool_calls) {
            messageHistory.push(aiMessage);

            for (const toolCall of aiMessage.tool_calls) {
                const fnName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);
                
                let result;
                if (fnName === "getEthBalance") result = await getEthBalance(args.address);
                if (fnName === "getGasPrice") result = await getGasPrice();
                if (fnName === "getTokenPrice") result = await getTokenPrice(args.ticker);

                console.log(`⚡ [Tool Result] ${fnName}: ${result}`);

                messageHistory.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: fnName,
                    content: result
                });
            }

            // Call 2: Final Answer
            const secondResponse = await openai.chat.completions.create({
                messages: messageHistory,
                model: "google/gemini-2.0-flash-exp:free",
            });

            return secondResponse.choices[0].message.content;
        } 
        
        return aiMessage.content;
    } catch (e) {
        return "AI Brain Freeze (Error): " + e.message;
    }
}

// --- 3. EXECUTION ---
async function main() {
    console.log("🤖 Sentinel Agent V1 Ready! (Tools: Balance, Gas, Price)\n");
    if(!process.env.OPENROUTER_API_KEY) console.warn("WARNING: OPENROUTER_API_KEY not found in .env.local");

    const history = [{ role: "system", content: "You are Sentinel, a helpful Web3 Security Assistant. Be concise." }];

    while (true) {
        const input = readlineSync.question("You: ");
        if (input.toLowerCase() === 'exit') break;
        
        process.stdout.write("🤖 Thinking...");
        const response = await chatWithAI(input, history);
        
        readline.cursorTo(process.stdout, 0); 
        readline.clearLine(process.stdout, 0);
        console.log(`Agent: ${response}\n`);
        
        history.push({ role: "assistant", content: response });
    }
}

main();
