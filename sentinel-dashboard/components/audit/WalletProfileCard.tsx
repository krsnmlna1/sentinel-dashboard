import { useState } from "react";
import { motion } from "framer-motion";
import { User, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Activity, Wallet, Network } from "lucide-react";
import NetworkGraph from "./NetworkGraph";
import ShareCard from "./ShareCard";

interface WalletStats {
  balance: string;
  txCount: number;
  firstSeen: string;
  walletAge: number;
  incomingTx: number;
  outgoingTx: number;
  contractInteractions: number;
}

interface WalletProfileCardProps {
  address: string;
  chain: string;
  riskScore: number;
  analysis: string;
  stats: WalletStats;
  graph?: {
    nodes: any[];
    edges: any[];
  }
}

export default function WalletProfileCard({ address, chain, riskScore, analysis, stats, graph }: WalletProfileCardProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'graph'>('stats');

  // Determine risk level and colors
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: "AVOID", color: "red", emoji: "🚨", bgColor: "bg-red-500/10", borderColor: "border-red-500/30" };
    if (score >= 60) return { level: "HIGH RISK", color: "orange", emoji: "⚠️", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/30" };
    if (score >= 40) return { level: "MODERATE", color: "yellow", emoji: "⚡", bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/30" };
    if (score >= 20) return { level: "LOW RISK", color: "green", emoji: "✅", bgColor: "bg-green-500/10", borderColor: "border-green-500/30" };
    return { level: "TRUSTED", color: "blue", emoji: "💎", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30" };
  };

  const risk = getRiskLevel(riskScore);

  // Determine wallet badges
  const getBadges = () => {
    const badges = [];
    
    if (stats.walletAge < 30) {
      badges.push({ text: "Fresh Wallet", icon: "🆕", color: "text-yellow-400" });
    } else if (stats.walletAge > 365) {
      badges.push({ text: "Veteran", icon: "👴", color: "text-blue-400" });
    }

    if (stats.txCount > 500) {
      badges.push({ text: "Active Trader", icon: "📈", color: "text-green-400" });
    }

    if (stats.contractInteractions > stats.txCount * 0.7) {
      badges.push({ text: "DeFi User", icon: "🔗", color: "text-purple-400" });
    }

    if (parseFloat(stats.balance) > 10) {
      badges.push({ text: "Whale", icon: "🐋", color: "text-cyan-400" });
    }

    return badges;
  };

  const badges = getBadges();

  // Parse analysis to get title/roast if possible
  let roastTitle = "The Crypto Clown";
  let roastBody = analysis;
  
  const titleMatch = analysis.match(/^## (.*)$/m);
  if (titleMatch) {
    roastTitle = titleMatch[1];
    roastBody = analysis.replace(/^## .*$/m, "").trim();
  }

  return (
    <ShareCard 
       title="Wallet Integrity Scan" 
       fileName={`wallet-roast-${address.slice(0, 6)}`}
       twitterText={`Just got ROASTED by Sentinel AI! My wallet score is ${riskScore}/100 ("${roastTitle}"). Can you beat my stupidity? 🤡 #SentinelAI #CryptoRoast`}
    >
      <div className={`relative overflow-hidden rounded-2xl border-2 ${risk.borderColor} ${risk.bgColor} p-6 mb-6 bg-sentinel-card`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/5 rounded-xl">
              <User className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {risk.emoji} WALLET PROFILE
              </h3>
              <p className="text-xs text-gray-400 font-mono">{address.slice(0, 10)}...{address.slice(-8)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold text-${risk.color}-400`}>{riskScore}/100</div>
            <div className={`text-xs font-bold text-${risk.color}-400`}>{risk.level}</div>
          </div>
        </div>

        {/* Risk Score Bar */}
        <div className="mb-6">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r from-${risk.color}-500 to-${risk.color}-400`}
              style={{ width: `${riskScore}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
              ${activeTab === 'stats' 
                ? 'bg-white/20 text-white' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            <Activity size={16} />
            Stats & Analysis
          </button>
          {graph && graph.nodes.length > 0 && (
            <button
              onClick={() => setActiveTab('graph')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
                ${activeTab === 'graph' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
              <Network size={16} />
              Visual Graph
            </button>
          )}
        </div>

        {activeTab === 'stats' ? (
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
          >
            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {badges.map((badge, idx) => (
                  <div key={idx} className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold flex items-center gap-1">
                    <span>{badge.icon}</span>
                    <span className={badge.color}>{badge.text}</span>
                  </div>
                ))}
              </div>
            )}

             {/* Stats Grid */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-3">
                   <div className="text-xs text-gray-400 mb-1">Balance</div>
                   <div className="text-lg font-bold text-white">{parseFloat(stats.balance).toFixed(4)} ETH</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                   <div className="text-xs text-gray-400 mb-1">Transactions</div>
                   <div className="text-lg font-bold text-white">{stats.txCount}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                   <div className="text-xs text-gray-400 mb-1">Wallet Age</div>
                   <div className="text-lg font-bold text-white">{stats.walletAge}d</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                   <div className="text-xs text-gray-400 mb-1">Gas Wasted</div>
                   <div className="text-lg font-bold text-white">{stats.outgoingTx}</div>
                </div>
             </div>

             {/* Roast Section */}
             <div className="bg-black/40 rounded-xl p-6 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-sentinel-yellow" />
                <h4 className="text-sentinel-yellow font-bold mb-3 flex items-center gap-2">
                   <AlertTriangle size={16} />
                   AI Analysis: {roastTitle}
                </h4>
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-mono relative z-10">
                   {roastBody}
                </div>
             </div>

          </motion.div>
        ) : (
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
          >
            {graph && <NetworkGraph nodes={graph.nodes} edges={graph.edges} />}
            <div className="mt-4 p-3 bg-white/5 rounded-xl">
               <h4 className="text-sm font-bold text-white mb-2">Investigation Notes</h4>
               <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                   <li>Central node (magenta) is the target wallet</li>
                   <li>Purple nodes are Smart Contracts interacting with the wallet</li>
                   <li>Cyan nodes are other Wallets connected via transfers</li>
                   <li>Node size represents value/volume of interaction</li>
               </ul>
            </div>
          </motion.div>
        )}

        {/* First Seen */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          First Activity: {stats.firstSeen} • Chain: {chain.toUpperCase()}
        </div>
      </div>
    </ShareCard>
  );
}
