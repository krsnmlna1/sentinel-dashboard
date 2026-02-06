"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, AlertOctagon, Eye, Activity, BarChart3, Globe, AlertTriangle, Shield, Zap, MessageSquare, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { LiveFeed } from "@/components/dashboard/LiveFeed";

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeScans: 0,
    analyzedToday: 0,
    highRisk: 0,
    watchlist: 0,
    avgDrop: 0
  });

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/scout');
        const result = await response.json();
        
        if (result.success) {
          const data = result.data;
          setStats({
            activeScans: data.length,
            analyzedToday: data.length,
            highRisk: data.filter((p: any) => p.score > 70).length,
            watchlist: data.filter((p: any) => p.score <= 70 && p.score > 40).length,
            avgDrop: data.reduce((acc: number, p: any) => acc + Math.abs(p.change), 0) / data.length
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
            COMMAND <span className="text-sentinel-blue">DASHBOARD</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-xl">
            Real-time surveillance of decentralized protocols. Anomaly detection active.
          </p>
        </div>
        <div className="flex gap-3">
           <div className="px-3 py-1 rounded bg-sentinel-green/10 border border-sentinel-green/20 text-sentinel-green text-xs font-mono flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-sentinel-green animate-pulse"></span>
             LIVE FEED
           </div>
           <div className="px-3 py-1 rounded bg-sentinel-card border border-white/10 text-gray-400 text-xs font-mono">
             v2.4.0-BETA
           </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Targets"
          value={stats.activeScans}
          subValue={`AVG DROP: ${stats.avgDrop.toFixed(1)}%`}
          icon={Target}
          trend="down"
          color="blue"
          delay={0.1}
        />
        <StatCard
          title="High Priority"
          value={stats.highRisk}
          subValue="RISK SCORE > 70"
          icon={AlertOctagon}
          trend={stats.highRisk > 3 ? "up" : "neutral"}
          color="red"
          delay={0.2}
        />
        <StatCard
          title="Watchlist"
          value={stats.watchlist}
          subValue="POTENTIAL VULNERABILITIES"
          icon={Eye}
          trend="neutral"
          color="yellow"
          delay={0.3}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
        
        {/* Sentiment Analysis Section (2/3 width) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-sentinel-card rounded-xl border border-white/5 p-6 relative overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="text-sentinel-blue" size={20} />
                MARKET SENTIMENT
              </h2>
              <p className="text-xs text-gray-400 mt-1">AI-driven cross-chain volatility analysis</p>
            </div>
            <div className="flex gap-2">
              {['1H', '24H', '7D'].map((tf) => (
                <button 
                  key={tf}
                  className={`px-3 py-1 rounded text-xs transition-colors font-mono ${tf === '24H' ? 'bg-sentinel-blue/20 text-sentinel-blue border border-sentinel-blue/30' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 flex-1 relative z-10">
            {/* Chart Area */}
            <div className="flex-1 relative rounded-lg border border-white/5 bg-sentinel-bg/50 backdrop-blur-sm p-1 flex flex-col overflow-hidden group">
              {/* Grid Background */}
              <div className="absolute inset-0 z-0 opacity-10" 
                style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
              </div>
              
              <div className="relative z-10 w-full h-full flex items-end pb-2 px-2">
                 <svg className="w-full h-3/4 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Data Line */}
                    <path 
                      d="M0,45 Q10,40 20,42 T40,30 T60,35 T80,15 T100,5" 
                      fill="url(#chartGradient)" 
                      stroke="none"
                    />
                    <path 
                      d="M0,45 Q10,40 20,42 T40,30 T60,35 T80,15 T100,5" 
                      fill="none" 
                      stroke="#0ea5e9" 
                      strokeWidth="1.5"
                      filter="url(#glow)"
                      className="drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]"
                    />
                    
                    {/* Scanning Cursor */}
                    <line x1="80" y1="0" x2="80" y2="50" stroke="#fff" strokeWidth="0.5" strokeDasharray="2,2" className="opacity-50" />
                    <circle cx="80" cy="15" r="3" fill="#fff" className="animate-pulse shadow-[0_0_10px_white]" />
                 </svg>
                 
                 {/* Scanning Bar Animation */}
                 <motion.div 
                    className="absolute inset-y-0 w-[2px] bg-sentinel-blue/50 shadow-[0_0_15px_rgba(14,165,233,0.8)] z-20"
                    animate={{ left: ['0%', '100%'], opacity: [0, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                 />
              </div>

              {/* X-Axis Labels */}
              <div className="h-6 border-t border-white/5 flex justify-between px-2 items-center text-[10px] text-gray-400 font-mono relative z-10 bg-sentinel-bg/80">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>NOW</span>
              </div>
            </div>

            {/* Side Metrics */}
            <div className="w-full md:w-56 flex flex-col gap-3">
              <div className="bg-white/5 border border-white/5 rounded-lg p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors group">
                 <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                   <span>Fear & Greed</span>
                   <Activity size={14} className="text-sentinel-green" />
                 </div>
                 <div className="text-2xl font-bold text-white group-hover:text-sentinel-green transition-colors">62</div>
                 <div className="text-xs text-sentinel-green font-mono flex items-center gap-1">
                   <TrendingUp size={12} /> GREED
                 </div>
                 <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                   <div className="h-full w-[62%] bg-sentinel-green shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                 </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-lg p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors group">
                 <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                   <span>Whale Activity</span>
                   <Zap size={14} className="text-sentinel-yellow" />
                 </div>
                 <div className="text-2xl font-bold text-white group-hover:text-sentinel-yellow transition-colors">HIGH</div>
                 <div className="text-xs text-gray-400 font-mono">
                   $4.2B Volume (24h)
                 </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-lg p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors group">
                 <div className="flex items-center justify-between text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                   <span>Social Vol</span>
                   <MessageSquare size={14} className="text-sentinel-blue" />
                 </div>
                 <div className="text-2xl font-bold text-white group-hover:text-sentinel-blue transition-colors">+124%</div>
                 <div className="text-xs text-gray-400 font-mono">
                   Trending: #L2Wars
                 </div>
              </div>
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-sentinel-blue/5 rounded-full blur-3xl pointer-events-none" />
        </motion.div>

        {/* Live Feed Section (1/3 width) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-1 h-full"
        >
          <LiveFeed />
        </motion.div>
      </div>

      {/* Bottom Ticker */}
      <div className="fixed bottom-0 left-0 right-0 h-8 bg-sentinel-bg/90 border-t border-white/5 flex items-center overflow-hidden z-40 backdrop-blur">
        <div className="px-4 bg-sentinel-blue/10 h-full flex items-center text-[10px] font-bold text-sentinel-blue border-r border-white/10">
          SYSTEM ALERTS
        </div>
        <div className="flex-1 overflow-hidden whitespace-nowrap">
           <motion.div 
             animate={{ x: ["100%", "-100%"] }} 
             transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
             className="flex gap-12 text-xs font-mono text-gray-400 items-center h-full"
           >
             <span className="flex items-center gap-2"><Globe size={12}/> HIGH GAS FEES DETECTED ON ETH MAINNET</span>
             <span className="flex items-center gap-2 text-sentinel-red"><AlertTriangle size={12}/> SUSPICIOUS TX PATTERN: 0x82...1a2</span>
             <span className="flex items-center gap-2 text-sentinel-green"><Shield size={12}/> AUDIT COMPLETED: UNISWAP V4 PROPOSAL</span>
           </motion.div>
        </div>
      </div>
    </div>
  );
}
