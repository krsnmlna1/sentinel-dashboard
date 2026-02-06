import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Radar, Search, Crosshair } from 'lucide-react';

const Scout: React.FC = () => {
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
            SCOUT <span className="text-sentinel-muted">NETWORK</span>
          </h1>
          <p className="text-sentinel-muted text-sm">Autonomous protocol discovery and analysis engine.</p>
        </div>
        <div className="flex items-center gap-2 text-sentinel-green text-xs font-mono bg-sentinel-green/5 border border-sentinel-green/20 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-sentinel-green animate-pulse" />
          SCANNING: 12 CHAINS
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
            
            {/* Blips */}
            <motion.div 
              className="absolute top-10 right-12 w-2 h-2 bg-sentinel-red rounded-full shadow-[0_0_10px_red]"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
            />
             <motion.div 
              className="absolute bottom-16 left-8 w-2 h-2 bg-sentinel-green rounded-full shadow-[0_0_10px_green]"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 3, delay: 1 }}
            />
          </div>
          
          <div className="mt-8 text-center relative z-10">
            <h3 className="text-xl font-bold text-white mb-1">DEEP SCAN ACTIVE</h3>
            <p className="text-sentinel-muted text-xs font-mono">Monitoring mempools for large movements...</p>
          </div>
        </div>

        {/* Data Panel */}
        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-sentinel-muted" />
            </div>
            <input 
              type="text" 
              placeholder="Search by contract address or protocol name..." 
              className="w-full bg-sentinel-card border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white placeholder-sentinel-muted focus:outline-none focus:border-sentinel-blue/50 focus:ring-1 focus:ring-sentinel-blue/50 transition-all font-mono text-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-sentinel-muted border border-white/10 px-2 py-1 rounded">
              CMD+K
            </div>
          </div>

          <div className="bg-sentinel-card border border-white/5 rounded-xl p-6 h-[calc(100%-80px)]">
            <h3 className="text-sm font-bold text-sentinel-muted mb-4 uppercase tracking-wider flex items-center gap-2">
              <Radar size={16} /> Recent Discoveries
            </h3>
            <div className="space-y-4">
               {[1,2,3,4].map((i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sentinel-blue/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-white">
                        0x
                     </div>
                     <div>
                       <div className="text-sm text-white font-mono group-hover:text-sentinel-blue transition-colors">0x7a2...8b91</div>
                       <div className="text-[10px] text-sentinel-muted">Found 2m ago • Ethereum</div>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="text-sm text-sentinel-green font-mono">+$2.4M</div>
                     <div className="text-[10px] text-sentinel-muted">LIQUIDITY ADD</div>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Scout;