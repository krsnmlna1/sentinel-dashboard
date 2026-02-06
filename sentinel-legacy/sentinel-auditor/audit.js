// audit.js
require('dotenv').config();
const fs = require('fs');
const pdf = require('pdf-parse');
const OpenAI = require("openai");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Crypto Ruthless Auditor",
  }
});

// Function to clean garbage text from PDF (excessive spaces, empty lines)
function cleanText(text) {
    return text.replace(/\n\s*\n/g, '\n').substring(0, 100000); // Take first 100k chars for safety
}

async function auditWhitepaper(filename) {
  try {
    console.log(`📂 Reading file: ${filename}...`);
    
    // 1. READ PDF
    let dataBuffer = fs.readFileSync(filename);
    let pdfData = await pdf(dataBuffer);
    
    if (!pdfData.text) {
        throw new Error("PDF is empty or text cannot be read (maybe it's all images?)");
    }

    const cleanContent = cleanText(pdfData.text);
    console.log(`✅ Successfully read! Text length: ${cleanContent.length} chars.`);
    console.log("🕵️  Sending to AI Auditor (via OpenRouter)... please wait...");

    // 2. SEND TO AI
    const prompt = `
      ROLE: You are a Senior Blockchain Security Auditor & Game Theory Expert who is EXTREMELY SKEPTICAL and RUTHLESS.
      
      TASK: Audit this crypto whitepaper. Find scam loopholes, logical fallacies, unfair tokenomics, or "red flags".
      DO NOT BE POLITE. Destroy their arguments if they are illogical.
      
      OUTPUT FORMAT (English):
      1. 🚩 MAJOR RED FLAGS: (Minimum 3 critical points).
      2. 📉 TOKENOMICS ANALYSIS: (Is it sustainable? Who holds the most supply?).
      3. 🧠 GAME THEORY CHECK: (Is this a Ponzi? What is the real user incentive?).
      4. ⚖️ VERDICT (SCORE 0-100): (0 = Trash/Scam, 100 = Gem). 
      5. 💡 ADVICE: (What should the user do? Run or Buy?).
      
      WHITEPAPER DATA:
      "${cleanContent}"
    `;

    const completion = await openai.chat.completions.create({
      // Using Google Gemini 2.0 Flash (Free) for its massive context window (1M Tokens)
      // So it can read thick PDFs without error.
      model: "google/gemini-2.0-flash-001", 
      messages: [
        { role: "user", content: prompt }
      ]
    });

    // 3. DISPLAY RESULTS
    console.log("\n==========================================");
    console.log(`💀 RUTHLESS AUDIT REPORT: ${filename}`);
    console.log("==========================================\n");
    console.log(completion.choices[0].message.content);

  } catch (error) {
    console.error("❌ ERROR OCCURRED:", error.message);
  }
}

// --- RUN HERE ---
// Make sure the filename matches the one in your folder
const targetFile = "solana-whitepaper.pdf"; 

if (fs.existsSync(targetFile)) {
    auditWhitepaper(targetFile);
} else {
    console.log(`❌ File '${targetFile}' not found in this folder!`);
    console.log("👉 Tip: Download whitepaper, rename it to 'target.pdf', then run again.");
}