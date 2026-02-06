// server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const OpenAI = require("openai");
const cors = require('cors');

const app = express();
const upload = multer(); // Penyimpanan file sementara di RAM
app.use(cors());
app.use(express.static('public')); // Folder untuk file HTML nanti

// Setup AI
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Crypto Ruthless Auditor",
  }
});

app.post('/audit', upload.single('whitepaper'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Where is the file, bro?" });
        }

        console.log("📂 Receiving file:", req.file.originalname);

        // 1. Read PDF from Buffer
        const pdfData = await pdf(req.file.buffer);
        const text = pdfData.text.replace(/\n\s*\n/g, '\n').substring(0, 100000); // Limit characters

        console.log("🕵️  Sending to AI...");

        // 2. Send to AI
        const prompt = `
        ROLE: You are a Senior Blockchain Security Auditor & Game Theory Expert who is EXTREMELY SKEPTICAL and RUTHLESS.
        
        TASK: Audit the content of this crypto whitepaper. Look for scam loopholes, logical fallacies, rug-pull tokenomics, or "red flags".
        DO NOT BE POLITE. Destroy their arguments if they are illogical.
        
        OUTPUT FORMAT (Use Markdown/Bold for emphasis):
        1. 🚩 MAJOR RED FLAGS: (Minimum 3 critical points).
        2. 📉 TOKENOMICS ANALYSIS: (Is it sustainable? Who holds the most supply?).
        3. 🧠 GAME THEORY CHECK: (Is this a Ponzi? What is the real user incentive?).
        4. ⚖️ VERDICT (SCORE 0-100): (0 = Trash, 100 = Gem). 
        5. 💡 ADVICE: (Run away or Buy?).
        
        WHITEPAPER DATA:
        "${text}"
        `;

        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-001",
            messages: [{ role: "user", content: prompt }]
        });

        const result = completion.choices[0].message.content;
        console.log("✅ Audit Complete!");
        
        res.json({ success: true, report: result });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "AI is tired or error: " + error.message });
    }
});

// --- NEW FEATURE: SMART CONTRACT AUDIT ---

// Middleware for JSON body parsing
app.use(express.json());

app.post('/audit-contract', async (req, res) => {
    try {
        const { contractAddress, chain } = req.body;
        
        if (!contractAddress) {
            return res.status(400).json({ error: "Where is the contract address?" });
        }

        console.log(`🔍 Peeking Blockchain (${chain || 'Ethereum'}) for: ${contractAddress}`);

        // 1. Determine Chain ID (Etherscan V2 Unified Access)
        const getChainId = (chainName) => {
            const c = chainName ? chainName.toLowerCase() : 'ethereum';
            switch (c) {
                case 'arbitrum': return 42161; 
                case 'base': return 8453;
                case 'optimism': return 10;
                case 'polygon': return 137;
                case 'bsc': return 56;
                case 'avalanche': return 43114;
                case 'fantom': return 250;
                case 'ethereum': 
                default: return 1;
            }
        };

        const chainId = getChainId(chain);
        const apiKey = process.env.ETHERSCAN_API_KEY;

        // Use Unified Endpoint V2 for ALL chains
        let url = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=contract&action=getsourcecode&address=${contractAddress}`;
        
        // Append API Key (If available)
        if (apiKey) {
            url += `&apikey=${apiKey}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();

        // DEBUG LOGGING
        console.log("Status Etherscan:", data.message);

        if (data.message !== 'OK' || !data.result[0].SourceCode) {
            const errorMessage = typeof data.result === 'string' ? data.result : "Failed to fetch code/Contract not verified";
            throw new Error(`Etherscan Error: ${errorMessage}`);
        }

        let sourceCode = data.result[0].SourceCode;
        
        // Clean code (remove JSON wrapping if present)
        if (sourceCode.startsWith('{{')) {
            sourceCode = sourceCode.replace(/[{}]/g, ''); 
        }
        
        // Truncate if too long
        const cleanCode = sourceCode.substring(0, 100000); 

        console.log("🕵️  Code received! Sending to AI Auditor...");

        // 2. Send to AI (Coding Prompt)
        const prompt = `
        ROLE: You are a Smart Contract Security Auditor & White Hat Hacker who is EXTREMELY SHARP.
        
        TASK: Audit the Solidity code below. Look for critical security vulnerabilities, backdoors, or suspicious functions.
        IGNORE MARKETING FEATURES. FOCUS ON THE CODE.
        
        OUTPUT FORMAT (Markdown):
        1. 🐛 CRITICAL VULNERABILITIES: (Look for Reentrancy, Overflow, Unchecked Return, etc.).
        2. 🍯 HONEYPOT CHECK: (Can the owner blacklist users? Can users sell? Look for dangerous 'onlyOwner' functions).
        3. ⚖️ VERDICT (0-100): (Security Score).
        4. 💡 AUDITOR ADVICE: (Safe to deploy or needs rewrite?).
        
        CODE SNIPPET (Solidity):
        ${cleanCode}
        `;

        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-001", 
            messages: [{ role: "user", content: prompt }]
        });

        const result = completion.choices[0].message.content;
        console.log("✅ Contract Audit Complete!");
        
        res.json({ success: true, report: result });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to audit contract: " + error.message });
    }
});

const PORT = process.env.PORT || 7860;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    });
}

module.exports = app;