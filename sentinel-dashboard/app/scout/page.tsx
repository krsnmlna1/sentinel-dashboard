"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Radar, Search, Crosshair, TrendingDown, ExternalLink, Shield } from "lucide-react";
import Link from "next/link";

interface Protocol {
  name: string;
  slug: string;
  tvl: number;
  change_7d: number;
  chain: string;
  score: number;
}

export default function ScoutPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeScans, setActiveScans] = useState(0);

  useEffect(() => {
    fetchProtocols();
    // Simulate active scans counter
    const interval = setInterval(() => {
      setActiveScans(prev => (prev + 1) % 15 + 8);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchProtocols = async () => {
    try {
      const response = await fetch("/api/scout?limit=20");
      const data = await response.json();
      if (data.success) {
        setProtocols(data.protocols || []);
      }
    } catch (error) {
      console.error("Failed to fetch protocols:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProtocols = protocols.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTVL = (tvl: number) => {
    if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(2)}B`;
    if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(2)}M`;
    return `$${tvl.toFixed(0)}`;
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-sentinel-red";
    if (score >= 40) return "text-sentinel-yellow";
    return "text-sentinel-green";
  };

  // CMD+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col gap-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Radio className="text-sentinel-blue" />
            SCOUT <span className="text-gray-400">NETWORK</span>
          </h1>
          <p className="text-gray-400 text-sm">Autonomous protocol discovery and analysis engine.</p>
        </div>
        <div className="flex items-center gap-2 text-sentinel-green text-xs font-mono bg-sentinel-green/5 border border-sentinel-green/20 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-sentinel-green animate-pulse" />
          SCANNING: {activeScans} PROTOCOLS
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 relative"
      >
        {/* Radar Visualization */}
        <div className="bg-sentinel-card rounded-2xl border border-white/5 p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.1)_0%,transparent_70%)]" />
          
          {/* Radar Circles */}
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 border border-sentinel-blue/30 rounded-full animate-ping opacity-20" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-4 border border-sentinel-blue/20 rounded-full" />
            <div className="absolute inset-12 border border-sentinel-blue/10 rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Crosshair className="text-sentinel-blue/50" size={32} />
            </div>
            
            {/* Rotating Scan Line */}
            <div className="absolute inset-0 w-full h-full animate-spin-slow origin-center">
              <div className="h-1/2 w-[1px] bg-gradient-to-t from-sentinel-blue to-transparent mx-auto mt-1/2" />
            </div>
            
            {/* Dynamic Blips based on real data */}
            {filteredProtocols.slice(0, 5).map((protocol, index) => (
              <motion.div 
                key={protocol.slug}
                className={`absolute w-2 h-2 rounded-full ${
                  protocol.score >= 70 ? 'bg-sentinel-red shadow-[0_0_10px_red]' :
                  protocol.score >= 40 ? 'bg-sentinel-yellow shadow-[0_0_10px_yellow]' :
                  'bg-sentinel-green shadow-[0_0_10px_green]'
                }`}
                style={{
                  top: `${20 + (index * 15)}%`,
                  left: `${30 + (index * 10)}%`,
                }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 2 + index, delay: index * 0.3 }}
              />
            ))}
          </div>
          
          <div className="mt-8 text-center relative z-10">
            <h3 className="text-xl font-bold text-white mb-1">DEEP SCAN ACTIVE</h3>
            <p className="text-gray-400 text-xs font-mono">
              {loading ? "Initializing..." : `Monitoring ${protocols.length} protocols...`}
            </p>
          </div>
        </div>

        {/* Data Panel */}
        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search by protocol name or slug..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-sentinel-card border border-white/10 rounded-xl py-4 pl-10 pr-20 text-white placeholder-gray-400 focus:outline-none focus:border-sentinel-blue/50 focus:ring-1 focus:ring-sentinel-blue/50 transition-all font-mono text-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 border border-white/10 px-2 py-1 rounded">
              CMD+K
            </div>
          </div>

          <div className="bg-sentinel-card border border-white/5 rounded-xl p-6 h-[calc(100%-80px)] overflow-y-auto custom-scrollbar">
            <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-2 sticky top-0 bg-sentinel-card pb-2">
              <Radar size={16} />
              Recent Discoveries ({filteredProtocols.length})
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sentinel-blue"></div>
              </div>
            ) : (
              <AnimatePresence>
                <div className="space-y-3">
                  {filteredProtocols.slice(0, 10).map((protocol, index) => (
                    <motion.div
                      key={protocol.slug}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sentinel-blue/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {protocol.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white font-medium group-hover:text-sentinel-blue transition-colors truncate">
                            {protocol.name}
                          </div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-2">
                            <span>{protocol.chain}</span>
                            <span>•</span>
                            <span className={getRiskColor(protocol.score)}>
                              Risk: {protocol.score}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <div className="text-sm font-mono text-white">
                          {formatTVL(protocol.tvl)}
                        </div>
                        <div className={`text-[10px] font-mono flex items-center gap-1 justify-end ${
                          protocol.change_7d < 0 ? 'text-sentinel-red' : 'text-gray-400'
                        }`}>
                          {protocol.change_7d < 0 && <TrendingDown size={10} />}
                          {protocol.change_7d.toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/auditor?address=${protocol.slug}&chain=${protocol.chain.toLowerCase()}`}
                          className="p-1.5 rounded bg-sentinel-red/20 hover:bg-sentinel-red/30 text-sentinel-red transition-colors"
                          title="Audit Protocol"
                        >
                          <Shield size={12} />
                        </Link>
                        <a
                          href={`https://defillama.com/protocol/${protocol.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded bg-sentinel-blue/20 hover:bg-sentinel-blue/30 text-sentinel-blue transition-colors"
                          title="View on DeFiLlama"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}

            {!loading && filteredProtocols.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Search className="mx-auto mb-2" size={32} />
                <p>No protocols found matching "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
