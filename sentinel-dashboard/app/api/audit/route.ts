import { NextRequest, NextResponse } from "next/server";
import { calculateYield, calculateAlphaScore, generateVaultLinks } from "@/lib/auditUtils";

export async function POST(request: NextRequest) {
  try {
    const { contractAddress, chain = "ethereum", protocolData } = await request.json();

    if (!contractAddress) {
      return NextResponse.json(
        { error: "Contract address is required" },
        { status: 400 }
      );
    }

    console.log(`🔍 Analyzing contract on ${chain}: ${contractAddress}`);

    // 1. Determine Chain ID for Etherscan V2 API
    const getChainId = (chainName: string): number => {
      const c = chainName.toLowerCase();
      switch (c) {
        case "arbitrum": return 42161;
        case "base": return 8453;
        case "optimism": return 10;
        case "polygon": return 137;
        case "bsc": return 56;
        case "avalanche": return 43114;
        case "fantom": return 250;
        case "ethereum":
        default: return 1;
      }
    };

    const chainId = getChainId(chain);
    const apiKey = process.env.ETHERSCAN_API_KEY;

    // 2. Check if address is a contract or wallet (EOA)
    console.log("🔍 Checking address type...");
    let bytecodeUrl = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=proxy&action=eth_getCode&address=${contractAddress}&tag=latest`;
    if (apiKey) {
      bytecodeUrl += `&apikey=${apiKey}`;
    }

    const bytecodeResponse = await fetch(bytecodeUrl);
    const bytecodeData = await bytecodeResponse.json();
    const bytecode = bytecodeData.result;

    console.log(`🔍 Auto-Detect Result for ${contractAddress}:`, bytecode);

    // Check if it's a wallet (EOA) or API error
    const isWallet = 
      bytecode === '0x' || 
      bytecode === '0x0' || 
      // If it's not a valid hex string (likely an error message), assume it might be a wallet or handle safely
      (typeof bytecode === 'string' && !bytecode.startsWith('0x'));

    if (isWallet) {
      console.log("👤 Wallet detected (or API error treated as wallet)! Routing to profiler...");
      // Route to wallet profiler
      return await profileWallet(contractAddress, chain, chainId, apiKey);
    }

    console.log("📜 Contract detected! Proceeding with audit...");

    // 3. Fetch contract source code from Etherscan
    let url = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=contract&action=getsourcecode&address=${contractAddress}`;
    
    if (apiKey) {
      url += `&apikey=${apiKey}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    console.log("Etherscan Status:", data.message);

    if (data.message !== "OK" || !data.result[0]?.SourceCode) {
      console.log("⚠️ Contract source not verifying! Falling back to Profiler (might be Unverified Contract or Smart Wallet)...");
      return await profileWallet(contractAddress, chain, chainId, apiKey);
    }

    let sourceCode = data.result[0].SourceCode;

    // Clean code (remove JSON wrapping if present)
    if (sourceCode.startsWith("{{")) {
      sourceCode = sourceCode.replace(/[{}]/g, "");
    }

    // Truncate if too long (100k chars limit)
    const cleanCode = sourceCode.substring(0, 100000);

    // 3. Detect contract type based on function signatures
    const isToken = cleanCode.includes("function transfer(") && 
                    cleanCode.includes("function balanceOf(");
    const isVault = cleanCode.includes("function deposit(") || 
                    cleanCode.includes("function withdraw(") ||
                    cleanCode.includes("function stake(");

    const contractType = isVault ? 'vault' : isToken ? 'token' : 'unknown';

    console.log(`📋 Contract Type Detected: ${contractType.toUpperCase()}`);
    console.log("🕵️  Code retrieved! Sending to AI Auditor...");

    // 4. Send to Cloudflare Worker for AI Audit
    console.log("🕵️  Code retrieved! Sending to Sentinel Worker...");
    
    const workerUrl = 'https://sentinel-api.krsnmlna1.workers.dev/api/audit';
    
    // Send source code and metadata to worker
    const workerResponse = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contractAddress,
        auditType: contractType, // 'token', 'vault', or 'unknown'
        sourceCode: cleanCode
      })
    });

    const workerData = await workerResponse.json();

    if (!workerData.success) {
      throw new Error(workerData.error || "Worker failed to accept job");
    }

    const { jobId } = workerData;
    console.log(`✅ Audit Job Started: ${jobId}`);

    // Return Job ID immediately for polling
    return NextResponse.json({
      success: true,
      jobId,
      contractAddress,
      chain,
      contractName: data.result[0].ContractName || "Unknown",
      contractType,
      // Metadata to help frontend while waiting
      protocolData
    });



  } catch (error: any) {
    console.error("❌ Audit Error:", error.message);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Failed to audit contract"
      },
      { status: 500 }
    );
  }
}

// Wallet Profiler Function
async function profileWallet(address: string, chain: string, chainId: number, apiKey: string | undefined) {
  try {
    console.log(`👤 Profiling wallet: ${address} on chain ${chain}`);

    // 1. Get transaction history
    let txUrl = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc`;
    if (apiKey) {
      txUrl += `&apikey=${apiKey}`;
    }

    const txResponse = await fetch(txUrl);
    const txData = await txResponse.json();
    const transactions = txData.result || [];
    const txCount = Array.isArray(transactions) ? transactions.length : 0;

    // 2. Get account balance
    let balanceUrl = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=account&action=balance&address=${address}&tag=latest`;
    if (apiKey) {
      balanceUrl += `&apikey=${apiKey}`;
    }

    const balanceResponse = await fetch(balanceUrl);
    const balanceData = await balanceResponse.json();
    const balance = balanceData.result ? (parseInt(balanceData.result) / 1e18).toFixed(4) : "0";

    // 3. Calculate wallet age
    let firstSeen = "Unknown";
    let walletAge = 0;
    if (txCount > 0 && Array.isArray(transactions)) {
      const oldestTx = transactions[transactions.length - 1];
      if (oldestTx && oldestTx.timeStamp) {
        const timestamp = parseInt(oldestTx.timeStamp) * 1000;
        firstSeen = new Date(timestamp).toLocaleDateString();
        walletAge = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24)); // days
      }
    }

    // 4. Analyze transaction patterns & Build Graph Data
    let incomingTx = 0;
    let outgoingTx = 0;
    let contractInteractions = 0;

    // Graph data structures
    const contractMap = new Map<string, { count: number; value: number }>();
    const walletMap = new Map<string, { count: number; value: number }>();

    if (Array.isArray(transactions)) {
      for (const tx of transactions) {
        const isIncoming = tx.to && tx.to.toLowerCase() === address.toLowerCase();
        const isOutgoing = tx.from && tx.from.toLowerCase() === address.toLowerCase();
        
        if (isIncoming) {
          incomingTx++;
        } else if (isOutgoing) {
          outgoingTx++;
        }

        // Track contract interactions
        if (tx.to && tx.input && tx.input !== '0x') {
          contractInteractions++;
          
          // Add to contract map
          const contractAddr = tx.to.toLowerCase();
          if (contractAddr !== address.toLowerCase()) {
            const existing = contractMap.get(contractAddr) || { count: 0, value: 0 };
            const value = parseFloat(tx.value || '0') / 1e18;
            contractMap.set(contractAddr, {
              count: existing.count + 1,
              value: existing.value + value
            });
          }
        }

        // Track wallet connections (simple transfers)
        if (tx.input === '0x' || !tx.input) {
          const otherAddr = isIncoming ? tx.from : tx.to;
          if (otherAddr && otherAddr.toLowerCase() !== address.toLowerCase()) {
            const walletAddr = otherAddr.toLowerCase();
            const existing = walletMap.get(walletAddr) || { count: 0, value: 0 };
            const value = parseFloat(tx.value || '0') / 1e18;
            walletMap.set(walletAddr, {
              count: existing.count + 1,
              value: existing.value + value
            });
          }
        }
      }
    }

    // Build graph nodes and edges
    const graphNodes: any[] = [
      {
        id: address.toLowerCase(),
        type: 'target',
        label: 'Target Wallet',
        value: 100 // Base size
      }
    ];

    const graphEdges: any[] = [];

    // Add top 5 contracts
    const topContracts = Array.from(contractMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    topContracts.forEach(([addr, data]) => {
      graphNodes.push({
        id: addr,
        type: 'contract',
        label: `${addr.slice(0, 6)}...${addr.slice(-4)}`,
        value: Math.min(data.count * 2, 80) // Size based on interaction count
      });

      graphEdges.push({
        source: address.toLowerCase(),
        target: addr,
        value: data.value,
        count: data.count,
        type: 'contract'
      });
    });

    // Add top 5 wallets
    const topWallets = Array.from(walletMap.entries())
      .sort((a, b) => b[1].value - a[1].value)
      .slice(0, 5);

    topWallets.forEach(([addr, data]) => {
      graphNodes.push({
        id: addr,
        type: 'wallet',
        label: `${addr.slice(0, 6)}...${addr.slice(-4)}`,
        value: Math.min(data.value * 10, 60) // Size based on ETH value
      });

      graphEdges.push({
        source: address.toLowerCase(),
        target: addr,
        value: data.value,
        count: data.count,
        type: 'wallet'
      });
    });

    // 5. Create AI analysis prompt
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY not configured");
    }

    const prompt = `You are a blockchain security expert analyzing a wallet address for suspicious behavior and risk assessment.

WALLET DATA:
- Address: ${address}
- Chain: ${chain}
- Balance: ${balance} ETH
- First Activity: ${firstSeen} (${walletAge} days ago)
- Total Transactions: ${txCount}
- Incoming: ${incomingTx} | Outgoing: ${outgoingTx}
- Contract Interactions: ${contractInteractions}

Analyze this wallet and provide:

1. **WALLET TYPE**
   - Is this a developer, trader, whale, or normal user?
   - Activity patterns

2. **RISK ASSESSMENT**
   - Fresh wallet warning (< 30 days)
   - Suspicious patterns
   - Red flags

3. **BEHAVIOR ANALYSIS**
   - Trading style (active/passive)
   - Contract interaction frequency
   - Potential role in ecosystem

4. **RISK SCORE** (0-100, where 100 is highest risk)
   - Calculate based on:
     * Wallet age (newer = higher risk)
     * Transaction patterns
     * Balance vs activity ratio
   - Format: RISK_SCORE: [number]

5. **RECOMMENDATION**
   - TRUSTED (0-20): Established, safe wallet
   - LOW_RISK (20-40): Normal user activity
   - MODERATE (40-60): Some caution advised
   - HIGH_RISK (60-80): Suspicious patterns
   - AVOID (80-100): Likely scammer/bot

Provide detailed analysis. Be critical and honest about red flags.`;

    const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
      signal: AbortSignal.timeout(60000)
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json();
      throw new Error(`AI API Error: ${JSON.stringify(errorData)}`);
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].message.content;

    // 6. Extract risk score from AI response
    const riskScoreMatch = analysis.match(/RISK[_\s]SCORE:\s*(\d+)/i);
    const riskScore = riskScoreMatch ? parseInt(riskScoreMatch[1]) : 50;

    console.log("✅ Wallet Profile Complete!");

    return NextResponse.json({
      success: true,
      type: 'wallet',
      address,
      chain,
      riskScore,
      analysis,
      stats: {
        balance: `${balance} ETH`,
        transactions: txCount,
        firstSeen,
        walletAge: `${walletAge} days`,
        incomingTx,
        outgoingTx,
        contractInteractions
      },
      graph: {
        nodes: graphNodes,
        edges: graphEdges
      },
    });

  } catch (error: any) {
    console.error("❌ Wallet Profile Error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
