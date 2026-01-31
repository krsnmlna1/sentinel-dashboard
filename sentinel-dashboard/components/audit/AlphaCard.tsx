"use client";

import { motion } from "framer-motion";
import { TrendingUp, Shield, DollarSign, ExternalLink, Sparkles } from "lucide-react";
import { AlphaScore, YieldPrediction, VaultLinks } from "@/lib/auditUtils";
import { getAlphaRatingDisplay, formatCurrency } from "@/lib/auditUtils";

interface AlphaCardProps {
  alphaScore: AlphaScore;
  yieldPrediction?: YieldPrediction | null;
  vaultLinks?: VaultLinks | null;
  protocolName?: string;
}

export default function AlphaCard({ alphaScore, yieldPrediction, vaultLinks, protocolName }: AlphaCardProps) {
  const { color, emoji, bgColor } = getAlphaRatingDisplay(alphaScore.rating);
  
  // Only show for GOOD, ALPHA, or GEM ratings
  if (alphaScore.rating === 'AVOID' || alphaScore.rating === 'NEUTRAL') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-2xl border-2 ${
        alphaScore.rating === 'GEM' ? 'border-yellow-500' : 
        alphaScore.rating === 'ALPHA' ? 'border-green-500' : 
        'border-blue-500'
      } ${bgColor} p-6`}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{emoji}</div>
            <div>
              <h3 className={`text-2xl font-bold ${color}`}>
                {alphaScore.rating} DETECTED
              </h3>
              <p className="text-sm text-gray-400">
                Investment Opportunity Score: {alphaScore.score}/100
              </p>
            </div>
          </div>
          <Sparkles className={color} size={32} />
        </div>

        {/* Signal Breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-black/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={16} className="text-green-400" />
              <span className="text-xs text-gray-400">Security</span>
            </div>
            <div className="text-lg font-bold text-white">
              {alphaScore.signals.security.toFixed(1)}/25
            </div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-blue-400" />
              <span className="text-xs text-gray-400">APY</span>
            </div>
            <div className="text-lg font-bold text-white">
              {alphaScore.signals.apy.toFixed(1)}/25
            </div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={16} className="text-yellow-400" />
              <span className="text-xs text-gray-400">Growth</span>
            </div>
            <div className="text-lg font-bold text-white">
              {alphaScore.signals.tvlGrowth.toFixed(1)}/25
            </div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🐋</span>
              <span className="text-xs text-gray-400">Whales</span>
            </div>
            <div className="text-lg font-bold text-white">
              {alphaScore.signals.whaleActivity.toFixed(1)}/25
            </div>
          </div>
        </div>

        {/* Yield Prediction */}
        {yieldPrediction && (
          <div className="bg-black/30 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <DollarSign size={16} className="text-green-400" />
              Profit Potential (Based on $1,000 deposit)
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xs text-gray-400 mb-1">Daily</div>
                <div className="text-sm font-bold text-green-400">
                  ${yieldPrediction.dailyProfit.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Monthly</div>
                <div className="text-sm font-bold text-green-400">
                  ${yieldPrediction.monthlyProfit.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Yearly</div>
                <div className="text-sm font-bold text-green-400">
                  ${yieldPrediction.yearlyProfit.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-xs text-gray-400 mb-1">With Monthly Compounding (1 year)</div>
              <div className="text-lg font-bold text-yellow-400">
                ${yieldPrediction.compounded.yearly.toFixed(2)}
                <span className="text-xs text-gray-400 ml-2">
                  (+{((yieldPrediction.compounded.yearly / yieldPrediction.yearlyProfit - 1) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {vaultLinks && (
          <div className="flex gap-2">
            <a
              href={vaultLinks.depositUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 py-3 rounded-lg font-bold text-center transition-all ${
                alphaScore.rating === 'GEM' ? 'bg-yellow-500 text-black hover:bg-yellow-400' :
                alphaScore.rating === 'ALPHA' ? 'bg-green-500 text-black hover:bg-green-400' :
                'bg-blue-500 text-white hover:bg-blue-400'
              }`}
            >
              🚀 GO TO VAULT
            </a>
            <a
              href={vaultLinks.dashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center"
              title="View on DeFiLlama"
            >
              <ExternalLink size={20} />
            </a>
          </div>
        )}

        {/* Recommendation */}
        <div className={`mt-4 text-center text-sm font-bold ${color}`}>
          {alphaScore.rating === 'GEM' && '💎 STRONG BUY - Exceptional opportunity detected!'}
          {alphaScore.rating === 'ALPHA' && '🚀 BUY - Great risk/reward ratio!'}
          {alphaScore.rating === 'GOOD' && '✅ CONSIDER - Solid fundamentals!'}
        </div>
      </div>
    </motion.div>
  );
}
