
// queue-consumer.js - Background processor (Refactored for Plan B)
import pdfParse from 'pdf-parse';

// Parse PDF from base64 and extract text
async function parseWhitepaper(pdfData) {
  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(pdfData, 'base64');
    
    // Parse PDF
    const pdfResult = await pdfParse(buffer);
    
    // Extract and clean text
    const extractedText = pdfResult.text
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 15000); // Limit to 15k chars for AI
    
    console.log(`📄 Extracted text length: ${extractedText.length} chars`);
    
    if (extractedText.length < 100) {
      throw new Error('Could not extract meaningful text from PDF');
    }
    
    return extractedText;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

export async function processAuditJob(jobId, body, env) {
  const { contractAddress, auditType, sourceCode, walletData, pdfData, fileName } = body;
  
  try {
    let inputText = contractAddress; // Default for contract audits
    
    // Handle whitepaper PDF parsing
    if (auditType === 'whitepaper' && pdfData) {
      console.log(`Parsing whitepaper PDF: ${fileName}`);
      inputText = await parseWhitepaper(pdfData);
    }
    
    console.log(`Processing job ${jobId}: ${auditType}`);

    // Update status to processing
    await env.AUDIT_KV.put(jobId, JSON.stringify({
      status: 'processing',
      progress: 10,
      message: auditType === 'roast' ? 'Roasting wallet history...' : 
               auditType === 'whitepaper' ? 'Analyzing whitepaper...' :
               'AI Agent is analyzing the contract...',
      updatedAt: Date.now()
    }));
    
    // Select API Key (Support both OpenRouter and Groq fallbacks if we want later)
    const apiKey = env.OPENROUTER_API_KEY || env.GROQ_API_KEY;
    
    // Simulation mode if no key (so user can test flow without crashing)
    if (!apiKey) {
      console.warn('No API Key found. Running simulation mode.');
      await new Promise(r => setTimeout(r, 2000)); // Simulate delay
      await env.AUDIT_KV.put(jobId, JSON.stringify({
        status: 'complete',
        result: { simulation: true, message: "Audit simulation complete (No API KEY Configured)" },
        completedAt: Date.now()
      }), { expirationTtl: 60 * 60 * 24 * 7 });
      return;
    }

    // Determine prompt based on type
    const prompt = generatePrompt(auditType, inputText, sourceCode, walletData);
    
    // Call AI API
    const auditResult = await performAudit(prompt, apiKey, env);
    
    // Store final result
    await env.AUDIT_KV.put(jobId, JSON.stringify({
      status: 'complete',
      result: auditResult,
      completedAt: Date.now()
    }), {
      expirationTtl: 60 * 60 * 24 * 7 // Keep for 7 days
    });
    

  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);
    
    // Store error
    await env.AUDIT_KV.put(jobId, JSON.stringify({
      status: 'failed',
      error: error.message,
      failedAt: Date.now()
    }));
  }
}

function generatePrompt(type, address, sourceCode, walletData) {
  if (type === 'whitepaper') {
    return `Analyze the whitepaper and project viability for contract: ${address}. Focus on tokenomics, utility, and red flags. Return JSON format.`;
  }

  if (type === 'roast') {
    return `
    ROLE: You are a RUTHLESS and CRUEL Crypto Stand-up Comedian.
    TASK: Roast this wallet owner based on their transaction history.
    
    STATISTICS:
    - Address: ${address}
    - Balance: ${walletData.balance} 
    - Total Transactions: ${walletData.txCount}
    - Total Gas Fee Wasted: ${walletData.totalGasSpent} ETH
    - Net Flow: ${walletData.netWorthFlow} ETH
    - Win/Loss Ratio: ${walletData.winLossRatio || 'UNKNOWN'}
    
    RECENT ACTIVITY SUMMARY:
    ${walletData.txSummary}

    INSTRUCTIONS:
    1. Analyze their behavior.
    2. Give a insulting NICKNAME (Title).
    3. Use slang/informal English. Be funny but savage.
    4. Focus on the financial stupidity.
    
    FORMAT OUTPUT (JSON only):
    {
        "title": "SAVAGE TITLE",
        "roast": "Long roast paragraph (min 3 sentences)...",
        "score": "Stupidity Score (0-100, higher is dumber)"
    }
    `;
  }
  
  if (type === 'token') {
    return `
ROLE: You are a Token Security Auditor specializing in detecting scams and honeypots.

TASK: Audit this ERC20 token contract. Focus on user safety and scam detection.

ANALYZE:
1. 🍯 HONEYPOT CHECK:
   - Can users sell tokens?
   - Are there blacklist functions?
   - Hidden sell restrictions?

2. 💸 TAX ANALYSIS:
   - Buy tax percentage
   - Sell tax percentage
   - Max transaction limits

3. 🔒 OWNERSHIP:
   - Is ownership renounced?
   - Can owner mint unlimited tokens?
   - Can owner pause trading?

4. 💧 LIQUIDITY:
   - Is liquidity locked?
   - Can owner remove liquidity?

5. ⚖️ RISK SCORE (0-100):
   - 0-30: Low risk (Safe)
   - 31-70: Medium risk (Caution)
   - 71-100: High risk (SCAM/HONEYPOT)

OUTPUT FORMAT (Markdown):
- Clear verdict at the top
- Risk score with explanation
- Specific vulnerabilities found
- Recommendation: BUY/AVOID

CODE:
${sourceCode}
    `;
  }

  if (type === 'vault') {
    return `
ROLE: You are a DeFi Protocol Security Auditor specializing in vault/protocol safety.

TASK: Audit this DeFi Vault/Protocol contract. Focus on rugpull capabilities and centralization risks.

ANALYZE:
1. 🚨 OWNERSHIP PRIVILEGES (CRITICAL):
   - Can owner drain user funds via withdraw()?
   - Can owner call emergencyWithdraw()?
   - Can owner change fees to 100%?
   - Is there a timelock on admin functions?

2. ⚠️ UPGRADEABILITY RISK:
   - Is this a Proxy Contract?
   - Can implementation be changed?
   - Who controls upgrades?
   - Is there an upgrade delay?

3. 🔗 DEPENDENCY ANALYSIS:
   - Where does this vault deposit funds?
   - Are dependencies verified/audited?
   - Single point of failure risks?

4. 🛑 EMERGENCY FUNCTIONS:
   - pause() function exists?
   - Who can call it?
   - Can it be abused?

5. ⚖️ RISK SCORE (0-100):
   - 0-30: Low risk (Decentralized, Safe)
   - 31-70: Medium risk (Some centralization)
   - 71-100: High risk (RUGPULL CAPABLE)

OUTPUT FORMAT (Markdown):
- Security verdict at the top
- Risk score with detailed explanation
- Specific centralization risks
- Recommendation: DEPOSIT/AVOID

CODE:
${sourceCode}
    `;
  }

  // Generic fallback
  return `
ROLE: You are a Smart Contract Security Auditor.

TASK: Audit the Solidity code below. Look for critical security vulnerabilities.

OUTPUT FORMAT (Markdown):
1. 🐛 CRITICAL VULNERABILITIES
2. 🍯 HONEYPOT CHECK
3. ⚖️ RISK SCORE (0-100)
4. 💡 RECOMMENDATION

CODE:
${sourceCode}
  `;
}

// Retry utility with exponential backoff for rate limit handling
async function retryWithBackoff(fn, maxRetries = 3) {
  const delays = [5000, 10000, 20000]; // 5s, 10s, 20s
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Check if it's a rate limit error
      const isRateLimit = error.message.includes('429') || 
                         error.message.includes('rate_limit') ||
                         error.message.includes('Rate limit');
      
      if (!isRateLimit || attempt === maxRetries) {
        throw error; // Not a rate limit or final attempt, throw error
      }
      
      // Extract wait time from error message if available
      let waitTime = delays[attempt] || 20000;
      const retryMatch = error.message.match(/try again in ([\d.]+)s/i);
      if (retryMatch) {
        waitTime = Math.ceil(parseFloat(retryMatch[1]) * 1000);
      }
      
      console.log(`Rate limit hit. Retrying in ${waitTime/1000}s... (Attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

async function performAudit(prompt, apiKey, env) {
  // Wrap the API call in retry logic
  return await retryWithBackoff(async () => {
    // Use OpenRouter or Groq based on available env
    const isGroq = !env.OPENROUTER_API_KEY && !!env.GROQ_API_KEY;
    const url = isGroq 
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://openrouter.ai/api/v1/chat/completions';
      
    // Use Llama 3 70b on Groq as it's reliable and fast
    const model = isGroq ? 'llama-3.3-70b-versatile' : 'deepseek/deepseek-r1';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // OpenRouter specific headers
        'HTTP-Referer': 'https://sentinel-platform.com',
        'X-Title': 'Sentinel Auditor'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { 
            role: 'system', 
            content: 'You are Sentinel AI, an elite smart contract auditor. detailed, cynical, and technical. Output MUST be valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000, // Limit response to prevent TPM overshoot
        response_format: { type: "json_object" } // Force JSON if supported
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`AI API Failed: ${response.status} - ${err}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  });
}
