require('dotenv').config();
const { ethers } = require('ethers');
const OpenAI = require('openai');
const readlineSync = require('readline-sync');
const readline = require('readline');
const axios = require('axios');

// --- CONFIG ---
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": process.env.SITE_URL,
        "X-Title": process.env.APP_NAME,
    }
});

// --- 1. DEFINE TOOLS (Kemampuan Baru) ---

// Tool A: Cek Saldo ETH
async function getEthBalance(address) {
    try {
        console.log(`\n⚙️  [System] Checking blockchain for: ${address}...`);
        const balanceWei = await provider.getBalance(address);
        const balanceEth = ethers.formatEther(balanceWei);
        return `${balanceEth} ETH`; // Kita kunci satuannya di sini
    } catch (error) {
        return "Error: Invalid address.";
    }
}

// Tool B: Cek Gas Price (Fixed Unit)
async function getGasPrice() {
    try {
        console.log(`\n⚙️  [System] Checking gas price...`);
        const feeData = await provider.getFeeData();
        // Fallback logic kalau feeData null
        const gasPrice = feeData.gasPrice || feeData.maxFeePerGas; 
        const gasPriceGwei = ethers.formatUnits(gasPrice, 'gwei');
        // Return string yang JELAS agar AI tidak halusinasi
        return `${parseFloat(gasPriceGwei).toFixed(2)} Gwei (Low < 15, High > 30)`;
    } catch (error) {
        return "Error fetching gas.";
    }
}

// Tool C: Cek Harga Crypto (CoinGecko)
async function getTokenPrice(ticker) {
    try {
        console.log(`\n💰 [System] Checking price for: ${ticker}...`);
        // Mapping simple ticker ke ID CoinGecko
        const map = { 'eth': 'ethereum', 'btc': 'bitcoin', 'sol': 'solana' };
        const id = map[ticker.toLowerCase()] || ticker.toLowerCase();
        
        const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
        const price = res.data[id]?.usd;
        
        if (!price) return "Error: Token not found.";
        return `$${price} USD`;
    } catch (error) {
        return "Error checking price.";
    }
}

// Schema JSON untuk OpenAI
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
            description: "Get current gas price in Gwei. Use this to tell users if fees are cheap or expensive.",
            parameters: { type: "object", properties: {} },
        },
    },
    {
        type: "function",
        function: {
            name: "getTokenPrice",
            description: "Get the current price of a crypto token in USD (e.g. 'eth', 'btc').",
            parameters: {
                type: "object",
                properties: { ticker: { type: "string", description: "Token symbol (e.g. eth)" } },
                required: ["ticker"],
            },
        },
    },
];

// --- 2. THE AI BRAIN (ReAct Loop) ---
async function chatWithAI(userMessage, messageHistory) {
    messageHistory.push({ role: "user", content: userMessage });

    // Call 1: AI Mikir
    const completion = await openai.chat.completions.create({
        messages: messageHistory,
        model: "openai/gpt-4o-mini", // Pastikan model support tool calling
        tools: tools,
        tool_choice: "auto",
    });

    const aiMessage = completion.choices[0].message;

    // Cek apakah AI mau pakai tool
    if (aiMessage.tool_calls) {
        // Masukkan pesan AI (yang berisi request tool) ke history DULUAN
        messageHistory.push(aiMessage);

        // Loop semua tool calls (bisa > 1 kalau user tanya macem-macem)
        for (const toolCall of aiMessage.tool_calls) {
            const fnName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);
            
            let result;
            if (fnName === "getEthBalance") result = await getEthBalance(args.address);
            if (fnName === "getGasPrice") result = await getGasPrice();
            if (fnName === "getTokenPrice") result = await getTokenPrice(args.ticker);

            console.log(`⚡ [Tool Result] ${fnName}: ${result}`);

            // Masukkan hasil tool ke memory
            messageHistory.push({
                role: "tool",
                tool_call_id: toolCall.id,
                name: fnName,
                content: result
            });
        }

        // Call 2: AI Jawab Final setelah dapet SEMUA data
        const secondResponse = await openai.chat.completions.create({
            messages: messageHistory,
            model: "openai/gpt-4o-mini",
        });

        return secondResponse.choices[0].message.content;
    } 
    
    return aiMessage.content;
}

// --- 3. EXECUTION ---
async function main() {
    console.log("🤖 ChainSupport V2 Ready! (Tools: Balance, Gas, Price)\n");
    const history = [{ role: "system", content: "You are a helpful Web3 Assistant. Be concise." }];

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