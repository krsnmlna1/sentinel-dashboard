// Utility functions for smart audit system

export interface YieldPrediction {
  apy: number;
  dailyProfit: number;
  monthlyProfit: number;
  yearlyProfit: number;
  compounded: {
    monthly: number;
    yearly: number;
  };
}

export interface AlphaScore {
  score: number; // 0-100
  rating: 'AVOID' | 'NEUTRAL' | 'GOOD' | 'ALPHA' | 'GEM';
  signals: {
    security: number;    // 0-25 (lower risk is better)
    apy: number;         // 0-25 (higher is better)
    tvlGrowth: number;   // 0-25 (higher is better)
    whaleActivity: number; // 0-25 (higher is better)
  };
}

export interface VaultLinks {
  depositUrl: string;
  dashboardUrl: string;
  docsUrl?: string;
}

/**
 * Calculate yield predictions for a given deposit amount and APY
 */
export function calculateYield(depositAmount: number, apy: number): YieldPrediction {
  const daily = (depositAmount * apy / 100) / 365;
  const monthly = (depositAmount * apy / 100) / 12;
  const yearly = depositAmount * apy / 100;
  
  // Compound interest (monthly compounding)
  const monthlyRate = apy / 100 / 12;
  const compoundedMonthly = depositAmount * Math.pow(1 + monthlyRate, 1) - depositAmount;
  const compoundedYearly = depositAmount * Math.pow(1 + monthlyRate, 12) - depositAmount;
  
  return {
    apy,
    dailyProfit: daily,
    monthlyProfit: monthly,
    yearlyProfit: yearly,
    compounded: {
      monthly: compoundedMonthly,
      yearly: compoundedYearly
    }
  };
}

/**
 * Calculate ALPHA score based on multiple signals
 */
export function calculateAlphaScore(data: {
  riskScore: number;      // 0-100 (higher is worse)
  apy?: number;           // percentage
  tvlChange7d?: number;   // percentage
  hasWhales?: boolean;    // detected whale activity
}): AlphaScore {
  // Security signal (0-25): Lower risk score is better
  const security = Math.max(0, 25 - (data.riskScore / 4));
  
  // APY signal (0-25): Higher APY is better
  const apy = data.apy ? Math.min(25, data.apy / 4) : 0;
  
  // TVL Growth signal (0-25): Positive growth is good
  const tvlGrowth = data.tvlChange7d ? 
    Math.min(25, Math.max(0, data.tvlChange7d)) : 0;
  
  // Whale Activity signal (0-25): Presence of whales is bullish
  const whaleActivity = data.hasWhales ? 20 : 0;
  
  const signals = { security, apy, tvlGrowth, whaleActivity };
  const score = Math.round(security + apy + tvlGrowth + whaleActivity);
  
  // Determine rating based on score
  let rating: AlphaScore['rating'];
  if (score >= 80) rating = 'GEM';
  else if (score >= 60) rating = 'ALPHA';
  else if (score >= 40) rating = 'GOOD';
  else if (score >= 20) rating = 'NEUTRAL';
  else rating = 'AVOID';
  
  return { score, rating, signals };
}

/**
 * Generate vault/protocol links
 */
export function generateVaultLinks(protocolSlug: string): VaultLinks {
  const baseUrls: Record<string, string> = {
    'aave': 'https://app.aave.com',
    'compound': 'https://app.compound.finance',
    'yearn': 'https://yearn.finance',
    'curve': 'https://curve.fi',
    'convex': 'https://www.convexfinance.com',
    'lido': 'https://lido.fi',
    'rocket-pool': 'https://rocketpool.net',
    'morpheusai': 'https://mor.org',
  };
  
  const depositUrl = baseUrls[protocolSlug] || `https://defillama.com/protocol/${protocolSlug}`;
  
  return {
    depositUrl,
    dashboardUrl: `https://defillama.com/protocol/${protocolSlug}`,
    docsUrl: `https://docs.${protocolSlug}.com`
  };
}

/**
 * Format currency with appropriate suffix
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
  if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`;
  return `$${amount.toFixed(2)}`;
}

/**
 * Get risk level color class
 */
export function getRiskColorClass(score: number): string {
  if (score >= 70) return 'text-sentinel-red';
  if (score >= 40) return 'text-sentinel-yellow';
  return 'text-sentinel-green';
}

/**
 * Get ALPHA rating color and emoji
 */
export function getAlphaRatingDisplay(rating: AlphaScore['rating']): {
  color: string;
  emoji: string;
  bgColor: string;
} {
  switch (rating) {
    case 'GEM':
      return { color: 'text-yellow-400', emoji: '💎', bgColor: 'bg-yellow-500/20' };
    case 'ALPHA':
      return { color: 'text-green-400', emoji: '🚀', bgColor: 'bg-green-500/20' };
    case 'GOOD':
      return { color: 'text-blue-400', emoji: '✅', bgColor: 'bg-blue-500/20' };
    case 'NEUTRAL':
      return { color: 'text-gray-400', emoji: '➖', bgColor: 'bg-gray-500/20' };
    case 'AVOID':
      return { color: 'text-red-400', emoji: '❌', bgColor: 'bg-red-500/20' };
  }
}
