import { NextResponse } from 'next/server';
import axios from 'axios';

// Scout scoring logic (replicated from sentinel-scout)
function calculateScore(protocol: any) {
  let score = 0;
  const tvl = protocol.tvl || 0;
  const drop = protocol.change_7d || 0;

  if (tvl > 10000000) score += 40;
  else if (tvl > 5000000) score += 20;

  if (drop < -30) score += 30;
  else if (drop < -15) score += 15;

  if (protocol.chain === "Ethereum" || protocol.chain === "Arbitrum") score += 10;

  return Math.min(score, 100);
}

function categorize(protocol: any, score: number) {
  if (score >= 70) return "HIGH PRIORITY";
  if (protocol.change_7d < -50) return "REKT/PANIC";
  return "WATCHLIST";
}

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Fetch protocols from DeFiLlama
    const response = await axios.get('https://api.llama.fi/protocols');
    const allProtocols = response.data;
    
    // Filter candidates (TVL > 1M)
    // We want high drops, but if none, we still want to show meaningful protocols
    let candidates = allProtocols.filter((p: any) => p.tvl > 1000000);
    
    // Sort by "Drop severity" (most negative change first) to find "Threats"
    candidates.sort((a: any, b: any) => (a.change_7d || 0) - (b.change_7d || 0));
    
    // Take top 50 "Riskiest" (biggest drops) + some random large protocols if needed
    // Actually, just taking the top 100 with lowest change_7d is good for "Scout" context
    candidates = candidates.slice(0, 100);

    // Score and categorize
    const scoredCandidates = candidates.map((p: any) => {
      const score = calculateScore(p);
      return {
        id: p.slug,
        name: p.name,
        score,
        change: p.change_7d,
        change_7d: p.change_7d,
        tvl: p.tvl,
        chain: p.chain || 'Multi-Chain',
        category: categorize(p, score),
        url: p.url,
        slug: p.slug
      };
    });

    // Get top N targets
    const topTargets = scoredCandidates
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, Math.min(limit, 100)); // Max 100

    return NextResponse.json({
      success: true,
      data: topTargets,
      protocols: topTargets, // For Targets page compatibility
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Scout API Error:', error.message);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
