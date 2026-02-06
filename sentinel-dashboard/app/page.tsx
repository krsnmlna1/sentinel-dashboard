"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Zap, Search, ChevronRight, Lock, Activity, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-sentinel-bg z-0">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-sentinel-blue/10 to-transparent opacity-30" />
        <div className="absolute inset-0" 
             style={{ 
               backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.03) 0%, transparent 50%), linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
               backgroundSize: '100% 100%, 60px 60px, 60px 60px'
             }} 
        />
      </div>

      {/* Hero Content */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
        >
          <div className="w-2 h-2 rounded-full bg-sentinel-green animate-pulse" />
          <span className="text-xs font-mono text-sentinel-green tracking-widest uppercase">Sentinel Protocol Active</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-6xl md:text-8xl font-bold text-white tracking-tighter mb-6 relative"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            AUDIT YOUR
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sentinel-blue via-purple-500 to-sentinel-red">
            CRYPTO WALLET.
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-400 max-w-2xl mb-12 leading-relaxed"
        >
          AI-powered security analysis, risk scoring, and ruthless wallet roasting. 
          Detect rugs before they pull.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center"
        >
          <Link href="/dashboard" className="px-8 py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 group">
            <Zap className="fill-black" size={20} />
            LAUNCH SENTINEL
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link href="/auditor?mode=wallet" className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold text-lg rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            <Search size={20} />
            ROAST MY WALLET
          </Link>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full"
        >
          <FeatureCard 
            icon={Search} 
            title="Smart Contract Audits" 
            desc="Paste any contract address. Get a rapid security score, honeypot detection, and risk analysis in seconds."
            color="text-sentinel-blue"
          />
          <FeatureCard 
            icon={Globe} 
            title="Wallet Profiler" 
            desc="Analyze behavior patterns, transaction history, and get a 'Savage Roast' of your trading skills."
            color="text-sentinel-green"
          />
          <FeatureCard 
            icon={Lock} 
            title="Rug Pull Detection" 
            desc="Advanced heuristics scan for liquidity locks, ownership capabilities, and malicious code patterns."
            color="text-sentinel-red"
          />
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="absolute bottom-6 text-center text-gray-500 text-sm font-mono z-10">
        POWERED BY SENTINEL AI • 2026
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: any) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-8 text-left hover:border-white/10 transition-colors group">
      <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        <Icon size={24} className={color} />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}
