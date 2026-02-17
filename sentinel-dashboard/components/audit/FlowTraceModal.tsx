"use client";

import { useState } from "react";
import { X, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FlowTraceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrace: (destination: string, maxHops: number) => void;
  sourceAddress: string;
  chain: string;
}

export default function FlowTraceModal({ isOpen, onClose, onTrace, sourceAddress, chain }: FlowTraceModalProps) {
  const [destination, setDestination] = useState("");
  const [maxHops, setMaxHops] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination.trim()) {
      onTrace(destination.trim(), maxHops);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-sentinel-card border border-white/10 rounded-2xl p-6 z-50"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-sentinel-blue/10 border border-sentinel-blue/30 rounded-lg p-2">
                  <TrendingUp className="text-sentinel-blue" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Trace Money Flow</h3>
                  <p className="text-xs text-gray-400">Track fund movements between wallets</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Source Address (readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Source Address
                </label>
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                  <code className="text-sm text-gray-300 font-mono">
                    {sourceAddress.slice(0, 20)}...{sourceAddress.slice(-18)}
                  </code>
                </div>
              </div>

              {/* Destination Address */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Destination Address *
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-sentinel-blue/50"
                  required
                />
              </div>

              {/* Max Hops */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Max Hops: {maxHops}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={maxHops}
                  onChange={(e) => setMaxHops(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 (faster)</span>
                  <span>5 (deeper)</span>
                </div>
              </div>

              {/* Info */}
              <div className="bg-sentinel-blue/5 border border-sentinel-blue/20 rounded-lg p-3">
                <p className="text-xs text-gray-400">
                  <span className="text-sentinel-blue font-bold">Note:</span> Higher hop counts may take longer to process. We recommend starting with 3 hops.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-sentinel-blue hover:bg-sentinel-blue/80 text-white font-bold rounded-xl transition-all"
                >
                  Trace Flow
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
