import { NextRequest, NextResponse } from "next/server";
import type { AnomalyAlert, AnomalyDetectionResult, TransactionPattern } from "@/lib/types/anomaly";

export async function POST(request: NextRequest) {
  try {
    const { address, chain = "ethereum" } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    console.log(`🔍 [Anomaly Detection] Analyzing ${address} on ${chain}`);

    // 1. Get Chain ID
    const chainId = getChainId(chain);
    const apiKey = process.env.ETHERSCAN_API_KEY;

    // 2. Fetch transaction history
    const txPattern = await fetchTransactionPattern(address, chainId, apiKey);

    // 3. Analyze patterns with AI
    const anomalies = await detectAnomalies(address, chain, txPattern);

    // 4. Calculate overall risk score
    const overallRisk = calculateOverallRisk(anomalies);

    // 5. Generate AI insight
    const aiInsight = await generateAIInsight(address, chain, txPattern, anomalies);

    console.log(`✅ [Anomaly Detection] Found ${anomalies.length} anomalies`);

    return NextResponse.json({
      success: true,
      address,
      chain,
      anomalies,
      overallRisk,
      aiInsight,
    } as AnomalyDetectionResult);

  } catch (error: any) {
    console.error("❌ [Anomaly Detection] Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to detect anomalies"
      },
      { status: 500 }
    );
  }
}

// Helper: Get Chain ID
function getChainId(chainName: string): number {
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
}

// Helper: Fetch and analyze transaction patterns
async function fetchTransactionPattern(
  address: string,
  chainId: number,
  apiKey: string | undefined
): Promise<TransactionPattern> {
  // Fetch transaction history
  let txUrl = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc`;
  if (apiKey) {
    txUrl += `&apikey=${apiKey}`;
  }

  const txResponse = await fetch(txUrl);
  const txData = await txResponse.json();
  const transactions = Array.isArray(txData.result) ? txData.result : [];

  // Analyze patterns
  let incomingTx = 0;
  let outgoingTx = 0;
  let contractInteractions = 0;
  let totalGasPrice = 0;
  let totalValue = 0;
  const uniqueAddresses = new Set<string>();
  const suspiciousPatterns: string[] = [];

  const addressLower = address.toLowerCase();

  for (const tx of transactions) {
    const isIncoming = tx.to?.toLowerCase() === addressLower;
    const isOutgoing = tx.from?.toLowerCase() === addressLower;

    if (isIncoming) incomingTx++;
    if (isOutgoing) outgoingTx++;

    // Track contract interactions
    if (tx.input && tx.input !== '0x') {
      contractInteractions++;
    }

    // Track gas and value
    totalGasPrice += parseInt(tx.gasPrice || '0');
    totalValue += parseFloat(tx.value || '0') / 1e18;

    // Track unique addresses
    if (tx.from) uniqueAddresses.add(tx.from.toLowerCase());
    if (tx.to) uniqueAddresses.add(tx.to.toLowerCase());
  }

  // Calculate time span
  let timeSpan = 0;
  if (transactions.length > 0) {
    const oldest = parseInt(transactions[transactions.length - 1].timeStamp);
    const newest = parseInt(transactions[0].timeStamp);
    timeSpan = Math.floor((newest - oldest) / (60 * 60 * 24)); // days
  }

  // Detect suspicious patterns
  if (incomingTx > outgoingTx * 10) {
    suspiciousPatterns.push("Extremely high incoming vs outgoing ratio (possible honeypot)");
  }
  if (outgoingTx > incomingTx * 10) {
    suspiciousPatterns.push("Extremely high outgoing vs incoming ratio (possible drainer)");
  }
  if (timeSpan < 7 && transactions.length > 50) {
    suspiciousPatterns.push("High activity in short timespan (possible bot)");
  }
  if (uniqueAddresses.size < 5 && transactions.length > 20) {
    suspiciousPatterns.push("Limited unique addresses (possible wash trading)");
  }

  return {
    totalTransactions: transactions.length,
    incomingTx,
    outgoingTx,
    contractInteractions,
    avgGasPrice: transactions.length > 0 ? totalGasPrice / transactions.length : 0,
    avgValue: transactions.length > 0 ? totalValue / transactions.length : 0,
    uniqueAddresses: uniqueAddresses.size,
    timeSpan,
    suspiciousPatterns,
  };
}

// Helper: Detect anomalies using pattern analysis
async function detectAnomalies(
  address: string,
  chain: string,
  pattern: TransactionPattern
): Promise<AnomalyAlert[]> {
  const anomalies: AnomalyAlert[] = [];

  // 1. Unusual Transfer Pattern
  if (pattern.incomingTx > pattern.outgoingTx * 10) {
    anomalies.push({
      severity: 'critical',
      type: 'unusual_transfer',
      description: 'Honeypot Pattern: Extremely high incoming vs outgoing transactions',
      confidence: 95,
      evidence: [
        `Incoming: ${pattern.incomingTx} transactions`,
        `Outgoing: ${pattern.outgoingTx} transactions`,
        `Ratio: ${(pattern.incomingTx / Math.max(pattern.outgoingTx, 1)).toFixed(1)}:1`,
      ],
      timestamp: Date.now(),
    });
  }

  // 2. Bot Activity Detection
  if (pattern.timeSpan < 7 && pattern.totalTransactions > 50) {
    anomalies.push({
      severity: 'high',
      type: 'bot_activity',
      description: 'Potential Bot Activity: High transaction volume in short timespan',
      confidence: 85,
      evidence: [
        `${pattern.totalTransactions} transactions in ${pattern.timeSpan} days`,
        `Average: ${(pattern.totalTransactions / Math.max(pattern.timeSpan, 1)).toFixed(1)} tx/day`,
      ],
      timestamp: Date.now(),
    });
  }

  // 3. Wash Trading Detection
  if (pattern.uniqueAddresses < 5 && pattern.totalTransactions > 20) {
    anomalies.push({
      severity: 'high',
      type: 'wash_trading',
      description: 'Possible Wash Trading: Limited unique addresses with high activity',
      confidence: 80,
      evidence: [
        `Only ${pattern.uniqueAddresses} unique addresses`,
        `${pattern.totalTransactions} total transactions`,
        'Suggests circular trading pattern',
      ],
      timestamp: Date.now(),
    });
  }

  // 4. Suspicious Timing
  if (pattern.timeSpan < 1 && pattern.totalTransactions > 10) {
    anomalies.push({
      severity: 'medium',
      type: 'suspicious_timing',
      description: 'Suspicious Timing: Burst of activity in less than 24 hours',
      confidence: 75,
      evidence: [
        `${pattern.totalTransactions} transactions in < 24 hours`,
        'Possible coordinated attack or bot deployment',
      ],
      timestamp: Date.now(),
    });
  }

  // 5. Connected Wallets (if very few unique addresses)
  if (pattern.uniqueAddresses <= 2 && pattern.totalTransactions > 5) {
    anomalies.push({
      severity: 'medium',
      type: 'connected_wallets',
      description: 'Connected Wallets: Transactions limited to very few addresses',
      confidence: 70,
      evidence: [
        `Only ${pattern.uniqueAddresses} unique addresses involved`,
        'Possible sybil attack or controlled cluster',
      ],
      timestamp: Date.now(),
    });
  }

  return anomalies;
}

// Helper: Calculate overall risk score
function calculateOverallRisk(anomalies: AnomalyAlert[]): number {
  if (anomalies.length === 0) return 0;

  const severityWeights = {
    critical: 40,
    high: 25,
    medium: 15,
    low: 5,
  };

  let totalRisk = 0;
  for (const anomaly of anomalies) {
    const baseWeight = severityWeights[anomaly.severity];
    const confidenceFactor = anomaly.confidence / 100;
    totalRisk += baseWeight * confidenceFactor;
  }

  // Cap at 100
  return Math.min(Math.round(totalRisk), 100);
}

// Helper: Generate AI insight using Groq
async function generateAIInsight(
  address: string,
  chain: string,
  pattern: TransactionPattern,
  anomalies: AnomalyAlert[]
): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return "AI analysis unavailable (API key not configured)";
  }

  const prompt = `You are a blockchain security expert analyzing transaction patterns for anomalies.

ADDRESS: ${address}
CHAIN: ${chain}

TRANSACTION PATTERN:
- Total Transactions: ${pattern.totalTransactions}
- Incoming: ${pattern.incomingTx} | Outgoing: ${pattern.outgoingTx}
- Contract Interactions: ${pattern.contractInteractions}
- Unique Addresses: ${pattern.uniqueAddresses}
- Time Span: ${pattern.timeSpan} days

DETECTED ANOMALIES (${anomalies.length}):
${anomalies.map(a => `- [${a.severity.toUpperCase()}] ${a.type}: ${a.description} (${a.confidence}% confidence)`).join('\n')}

Provide analysis in this EXACT format with bullet points:

**WALLET TYPE**
• [One line describing wallet type: trader/whale/bot/normal user]

**KEY FINDINGS**
• [Finding 1]
• [Finding 2]
• [Finding 3 if applicable]

**PRIMARY RISK**
• [Main risk in one clear sentence]

**RECOMMENDATION**
• [Action: SAFE/CAUTION/AVOID with brief reason]

Keep each bullet point to ONE line. Be direct and actionable.`;

  try {
    const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 300,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!aiResponse.ok) {
      throw new Error(`Groq API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    return aiData.choices[0].message.content;
  } catch (error: any) {
    console.error("AI Insight Error:", error.message);
    return `Pattern analysis complete. ${anomalies.length} anomalies detected with varying severity levels.`;
  }
}
