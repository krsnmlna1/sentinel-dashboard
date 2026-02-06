import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Wifi, ExternalLink, Shield, AlertTriangle, ArrowRight, Copy, Check } from 'lucide-react';
import { mockProtocols } from '../../services/mockData';
import { Protocol } from '../../types';

const LiveFeed: React.FC = () => {
  const [protocols, setProtocols] = useState<Protocol[]>(mockProtocols);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API fetch
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
      // Shuffle slightly for effect
      setProtocols([...protocols].sort(() => Math.random() - 0.5));
    }, 1000);
  };

  const handleCopy = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    const interval = setInterval(handleRefresh, 300000); // 5 mins
    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-sentinel-red border-sentinel-red bg-sentinel-red/10 shadow-[0_0_10px_rgba(244,63,94,0.3)]';
    if (score >= 50) return 'text-sentinel-yellow border-sentinel-yellow bg-sentinel-yellow/10';
    return 'text-sentinel-green border-sentinel-green bg-sentinel-green/10';
  };

  return (
    <div className="h-full flex flex-col bg-sentinel-card rounded-xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sentinel-blue opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sentinel-blue"></span>
            </span>
            <Wifi className="text-sentinel-muted" size={18} />
          </div>
          <div>
            <h2 className="text-white font-bold tracking-wider text-sm">LIVE INTELLIGENCE</h2>
            <p className="text-[10px] text-sentinel-muted font-mono">
              UPDATED: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleRefresh}
          className={`
            p-2 rounded-lg bg-white/5 hover:bg-white/10 text-sentinel-blue transition-all
            ${isRefreshing ? 'animate-spin' : ''}
          `}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <AnimatePresence mode='popLayout'>
          {protocols.map((protocol, index) => (
            <motion.div
              key={protocol.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              whileHover={{ 
                scale: 1.02,
                backgroundColor: "rgba(14, 165, 233, 0.05)", // Sentinel Blue tint
                borderColor: "rgba(14, 165, 233, 0.3)",
                boxShadow: "0 0 20px -5px rgba(14, 165, 233, 0.15)"
              }}
              transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 25,
                opacity: { duration: 0.2 }
              }}
              className="group relative p-4 rounded-lg bg-sentinel-bg/50 border border-white/5 cursor-pointer backdrop-blur-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-gray-800 to-black flex items-center justify-center border border-white/10 font-bold text-xs text-gray-400">
                    {protocol.chain.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-sentinel-blue transition-colors flex items-center gap-2">
                      {protocol.name}
                      {protocol.address && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(protocol.address!, protocol.id);
                          }}
                          className="text-sentinel-muted hover:text-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center justify-center w-5 h-5 rounded hover:bg-white/10"
                          title="Copy Address"
                        >
                          {copiedId === protocol.id ? <Check size={12} className="text-sentinel-green" /> : <Copy size={12} />}
                        </button>
                      )}
                    </h3>
                    <span className="text-[10px] text-sentinel-muted uppercase tracking-wider">
                      {protocol.chain}
                    </span>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded border text-xs font-bold font-mono ${getRiskColor(protocol.riskScore)}`}>
                  RISK: {protocol.riskScore}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-[10px] text-sentinel-muted mb-1">TVL</div>
                  <div className="text-sm font-mono text-white">
                    ${(protocol.tvl / 1000000).toFixed(1)}M
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-sentinel-muted mb-1">7D CHANGE</div>
                  <div className={`text-sm font-mono ${protocol.change7d < 0 ? 'text-sentinel-red' : 'text-sentinel-green'}`}>
                    {protocol.change7d > 0 ? '+' : ''}{protocol.change7d}%
                  </div>
                </div>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded bg-sentinel-red/10 text-sentinel-red text-xs hover:bg-sentinel-red/20 transition-colors border border-sentinel-red/20">
                  <Shield size={12} />
                  QUICK AUDIT
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded bg-sentinel-blue/10 text-sentinel-blue text-xs hover:bg-sentinel-blue/20 transition-colors border border-sentinel-blue/20">
                  <ExternalLink size={12} />
                  DETAILS
                </button>
              </div>
              
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 rounded-tr opacity-50" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-3 border-t border-white/5 bg-white/[0.02]">
        <button className="w-full py-2 text-xs text-sentinel-muted hover:text-white flex items-center justify-center gap-2 transition-colors">
          VIEW ALL TARGETS <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default LiveFeed;