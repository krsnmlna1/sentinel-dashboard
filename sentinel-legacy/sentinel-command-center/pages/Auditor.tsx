import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, Code, Upload, AlertTriangle, CheckCircle, Search } from 'lucide-react';

const Auditor: React.FC = () => {
  const [mode, setMode] = useState<'contract' | 'whitepaper'>('contract');
  const [dragActive, setDragActive] = useState(false);

  const styles = {
    contract: {
      primary: 'text-sentinel-red',
      border: 'border-sentinel-red',
      bg: 'bg-sentinel-red',
      gradient: 'from-sentinel-red'
    },
    whitepaper: {
      primary: 'text-sentinel-blue',
      border: 'border-sentinel-blue',
      bg: 'bg-sentinel-blue',
      gradient: 'from-sentinel-blue'
    }
  };

  const currentStyle = styles[mode];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-block p-4 rounded-full bg-white/5 mb-4 relative group">
           <div className={`absolute inset-0 bg-gradient-to-r ${currentStyle.gradient} to-purple-500 opacity-20 blur-xl rounded-full transition-all duration-500`} />
           <Shield className={`w-12 h-12 ${currentStyle.primary} relative z-10 transition-colors duration-300`} />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">SECURITY AUDITOR</h1>
        <p className="text-sentinel-muted">AI-powered vulnerability detection and risk assessment.</p>
      </motion.div>

      {/* Mode Switcher */}
      <div className="flex justify-center mb-10">
        <div className="bg-sentinel-card border border-white/10 rounded-full p-1 flex relative">
          <motion.div 
            className={`absolute top-1 bottom-1 w-[140px] rounded-full ${currentStyle.bg} opacity-10`}
            animate={{ x: mode === 'contract' ? 0 : 140 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <button 
            onClick={() => setMode('contract')}
            className={`
              relative z-10 w-[140px] py-2 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-colors
              ${mode === 'contract' ? 'text-white' : 'text-sentinel-muted hover:text-white'}
            `}
          >
            <Code size={16} />
            Smart Contract
          </button>
          <button 
            onClick={() => setMode('whitepaper')}
            className={`
              relative z-10 w-[140px] py-2 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-colors
              ${mode === 'whitepaper' ? 'text-white' : 'text-sentinel-muted hover:text-white'}
            `}
          >
            <FileText size={16} />
            Whitepaper
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-sentinel-card border border-white/5 rounded-2xl p-8 relative overflow-hidden"
        >
          {/* Decorative Gradient Border */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${currentStyle.gradient} to-transparent opacity-50`} />

          {mode === 'contract' ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono text-sentinel-muted uppercase ml-1">Contract Address</label>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sentinel-muted" size={18} />
                    <input 
                      type="text" 
                      placeholder="0x..." 
                      className="w-full bg-sentinel-bg/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white font-mono focus:outline-none focus:border-sentinel-red/50 transition-colors"
                    />
                  </div>
                  <button className="px-8 bg-sentinel-red hover:bg-sentinel-red/90 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] active:scale-95">
                    AUDIT
                  </button>
                </div>
              </div>

              <div className="bg-sentinel-red/5 border border-sentinel-red/10 rounded-xl p-4 flex gap-4 items-start">
                <AlertTriangle className="text-sentinel-red shrink-0" size={24} />
                <div className="space-y-1">
                  <h4 className="text-sentinel-red font-bold text-sm">Warning: High Gas Usage Detected</h4>
                  <p className="text-xs text-sentinel-muted leading-relaxed">
                    Preliminary scan indicates this contract consumes 40% more gas than average for similar interaction types.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div 
              className={`
                border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
                ${dragActive ? 'border-sentinel-blue bg-sentinel-blue/5 scale-[1.02]' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}
              `}
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
            >
              <div className="w-16 h-16 rounded-full bg-sentinel-blue/10 flex items-center justify-center mx-auto mb-6 text-sentinel-blue">
                <Upload size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Upload Whitepaper</h3>
              <p className="text-sentinel-muted text-sm mb-6 max-w-sm mx-auto">
                Drag and drop your PDF documentation here for AI analysis and contradiction detection.
              </p>
              <button className="px-6 py-2 rounded-lg border border-white/20 hover:bg-white/5 text-sm font-medium transition-colors">
                Select File
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Auditor;