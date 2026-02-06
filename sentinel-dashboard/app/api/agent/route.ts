import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

// --- TOOLS DEFINITIONS ---
const tools = [
  {
    type: "function",
    function: {
      name: "get_token_price",
      description: "Get the current price of a cryptocurrency in USD",
      parameters: {
        type: "object",
        properties: {
          tokenId: {
            type: "string",
            description: "The API id of the token (e.g., 'bitcoin', 'ethereum', 'solana')",
          },
        },
        required: ["tokenId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_gas_price",
      description: "Get the current Ethereum gas price (Safe, Propose, Fast)",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
        name: "get_eth_balance",
        description: "Get the ETH balance of a wallet address",
        parameters: {
            type: "object",
            properties: {
                address: { type: "string", description: "The 0x wallet address" }
            },
            required: ["address"]
        }
    }
  }
];

// --- TOOL HANDLERS ---
async function getTokenPrice(tokenId: string) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd,idr&include_24hr_change=true`);
        const data = await response.json();
        if (!data[tokenId]) return { error: `Token '${tokenId}' not found.` };
        return data[tokenId];
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        return { error: "Failed to fetch price: " + msg };
    }
}

async function getGasPrice() {
    try {
        const url = `https://api.etherscan.io/v2/api?chainid=1&module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.status !== "1") return { error: "Etherscan API error" };
        return {
            safe: data.result.SafeGasPrice + " Gwei",
            propose: data.result.ProposeGasPrice + " Gwei",
            fast: data.result.FastGasPrice + " Gwei"
        };
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        return { error: "Failed to fetch gas: " + msg };
    }
}

async function getEthBalance(address: string) {
    try {
        const url = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        const bal = parseFloat(data.result) / 1e18;
        return { balance: bal.toFixed(4) + " ETH" };
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        return { error: "Failed to fetch balance: " + msg };
    }
}

const SYSTEM_PROMPT = `
ROLE: You are "SENTINEL", an advanced AI Cybersecurity Agent.
TONE: Precise, Cyber-punk, Helpful.

CAPABILITIES:
- You have REAL-TIME access to crypto prices and blockchain data via tools.
- ALWAYS use tools when asked for prices, gas, or balances.
- If the user asks clearly for a price (e.g. "btc price"), CALL THE TOOL 'get_token_price'.
- Do not guess data.
`;

export async function POST(req: Request) {
    try {
        if (!GROQ_API_KEY) {
            return NextResponse.json({ error: "Configuration Error: GROQ_API_KEY missing" }, { status: 500 });
        }

        const body = await req.json();
        const { messages } = body;

        const conversation = [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages
        ];

        // 1. Initial Call to AI (with tools)
        const firstResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: conversation,
                tools: tools,
                tool_choice: "auto",
                temperature: 0.5,
                max_tokens: 1024
            })
        });

        if (!firstResponse.ok) throw new Error(await firstResponse.text());
        const firstData = await firstResponse.json();
        const firstMsg = firstData.choices[0].message;

        // 2. Check if AI wants to use a tool
        if (firstMsg.tool_calls) {
            // Append AI's "intent" to conversation history
            conversation.push(firstMsg);

            // Execute all requested tools
            for (const toolCall of firstMsg.tool_calls) {
                const fnName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);
                let result = {};

                console.log(`🛠️ Agent calling tool: ${fnName}`, args);

                if (fnName === "get_token_price") result = await getTokenPrice(args.tokenId);
                else if (fnName === "get_gas_price") result = await getGasPrice();
                else if (fnName === "get_eth_balance") result = await getEthBalance(args.address);

                // Add tool result to conversation
                conversation.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: fnName,
                    content: JSON.stringify(result)
                });
            }

            // 3. Second Call to AI (with tool results) - Get Final Answer
            const secondResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: conversation,
                    temperature: 0.7
                })
            });
            
            if (!secondResponse.ok) throw new Error(await secondResponse.text());
            const secondData = await secondResponse.json();
            return NextResponse.json({ role: "assistant", content: secondData.choices[0].message.content });

        } else {
            // No tool used, just return the text
            return NextResponse.json({ role: "assistant", content: firstMsg.content });
        }

    } catch (error: unknown) {
        console.error("Agent Error:", error);
        const msg = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: "Agent Malfunction: " + msg }, { status: 500 });
    }
}
