"use client";

import { motion } from "framer-motion";
import { TrendingUp, ArrowRight, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import type { FlowResult } from "@/lib/types/flow";

interface MoneyFlowPanelProps {
  result: FlowResult | null;
  isLoading: boolean;
}

export default function MoneyFlowPanel({ result, isLoading }: MoneyFlowPanelProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-sentinel-card border border-white/10 rounded-xl p-6"
      >
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="animate-spin text-sentinel-blue" size={24} />
          <span className="text-gray-400 font-medium">Tracing fund flow...</span>
        </div>
      </motion.div>
    );
  }

  if (!result) return null;

  if (!result.success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-500/5 border border-red-500/20 rounded-xl p-6"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-red-400 shrink-0" size={24} />
          <div>
            <h4 className="text-red-400 font-bold mb-1">Flow Trace Failed</h4>
            <p className="text-sm text-gray-400">{result.error || "Unknown error"}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header Card */}
      <div className="bg-sentinel-card border border-white/10 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-sentinel-blue/10 border border-sentinel-blue/30 rounded-lg p-3">
              <TrendingUp className="text-sentinel-blue" size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Money Flow Analysis</h3>
              <p className="text-xs text-gray-400 font-mono">
                {result.from.slice(0, 10)}... → {result.to.slice(0, 10)}...
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="text-right">
            <div className="text-2xl font-bold text-sentinel-blue">
              {result.totalAmount.toFixed(4)} ETH
            </div>
            <div className="text-xs text-gray-400">
              {result.paths.length} path{result.paths.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Execution Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Paths Found</div>
            <div className="text-xl font-bold text-white">{result.paths.length}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Search Depth</div>
            <div className="text-xl font-bold text-white">{result.searchDepth} hops</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Exec Time</div>
            <div className="text-xl font-bold text-white">{result.executionTime}ms</div>
          </div>
        </div>
      </div>

      {/* Paths */}
      {result.found ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-sentinel-blue" size={18} />
            <h4 className="text-white font-bold">Transaction Paths</h4>
          </div>

          {result.paths.map((path, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-sentinel-card border border-white/10 rounded-xl p-4"
            >
              {/* Path Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-400">
                  Path {idx + 1} • {path.hops} hop{path.hops !== 1 ? 's' : ''}
                </div>
                <div className="text-sm font-bold text-sentinel-blue">
                  {path.amounts.reduce((a, b) => a + b, 0).toFixed(4)} ETH
                </div>
              </div>

              {/* Wallet Flow */}
              <div className="space-y-2">
                {path.wallets.map((wallet, wIdx) => (
                  <div key={wIdx}>
                    {/* Wallet */}
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${wIdx === 0 ? 'bg-green-500' : wIdx === path.wallets.length - 1 ? 'bg-red-500' : 'bg-blue-500'}`} />
                      <code className="text-xs text-gray-300 font-mono">
                        {wallet.slice(0, 10)}...{wallet.slice(-8)}
                      </code>
                    </div>

                    {/* Arrow + Amount */}
                    {wIdx < path.amounts.length && (
                      <div className="flex items-center gap-2 ml-6 my-1">
                        <ArrowRight className="text-gray-500" size={16} />
                        <span className="text-xs text-gray-400">
                          {path.amounts[wIdx].toFixed(4)} ETH
                        </span>
                        <a
                          href={`https://etherscan.io/tx/${path.txHashes[wIdx]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-sentinel-blue hover:underline"
                        >
                          tx
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-yellow-400" size={24} />
            <div>
              <h4 className="text-yellow-400 font-bold mb-1">No Direct Path Found</h4>
              <p className="text-sm text-gray-400">
                No transaction path found within {result.searchDepth} hops. Funds may have taken a longer route or never reached the destination.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
