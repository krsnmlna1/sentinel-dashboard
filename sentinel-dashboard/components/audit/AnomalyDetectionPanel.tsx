"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import AnomalyAlertCard from "./AnomalyAlertCard";
import type { AnomalyDetectionResult } from "@/lib/types/anomaly";

interface AnomalyDetectionPanelProps {
  result: AnomalyDetectionResult | null;
  isLoading: boolean;
}

export default function AnomalyDetectionPanel({ result, isLoading }: AnomalyDetectionPanelProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-sentinel-card border border-white/10 rounded-xl p-6"
      >
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="animate-spin text-sentinel-blue" size={24} />
          <span className="text-gray-400 font-medium">Analyzing transaction patterns...</span>
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
            <h4 className="text-red-400 font-bold mb-1">Analysis Failed</h4>
            <p className="text-sm text-gray-400">{result.error || "Unknown error"}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const riskLevel = 
    result.overallRisk >= 70 ? { label: "CRITICAL", color: "text-red-400", bg: "bg-red-500" } :
    result.overallRisk >= 50 ? { label: "HIGH", color: "text-orange-400", bg: "bg-orange-500" } :
    result.overallRisk >= 30 ? { label: "MEDIUM", color: "text-yellow-400", bg: "bg-yellow-500" } :
    { label: "LOW", color: "text-green-400", bg: "bg-green-500" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header Card */}
      <div className="bg-sentinel-card border border-white/10 rounded-xl p-6 relative overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 h-1 ${riskLevel.bg} opacity-50`} />
        
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-sentinel-blue/10 border border-sentinel-blue/30 rounded-lg p-3">
              <Shield className="text-sentinel-blue" size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Anomaly Detection Report</h3>
              <p className="text-xs text-gray-400 font-mono">{result.address}</p>
            </div>
          </div>

          {/* Risk Score */}
          <div className="text-right">
            <div className="text-xs text-gray-400 mb-1">Overall Risk</div>
            <div className={`text-3xl font-bold ${riskLevel.color}`}>
              {result.overallRisk}
            </div>
            <div className={`text-xs font-bold ${riskLevel.color}`}>
              {riskLevel.label}
            </div>
          </div>
        </div>

        {/* AI Insight */}
        {result.aiInsight && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="text-xs text-gray-400 font-medium mb-3 flex items-center gap-2">
              <span>🤖</span>
              <span>AI Analysis</span>
            </div>
            <div className="text-sm text-gray-300 leading-relaxed space-y-2 ai-analysis">
              {result.aiInsight.split('\n').map((line, idx) => {
                // Bold headers (e.g., **WALLET TYPE**)
                if (line.startsWith('**') && line.endsWith('**')) {
                  return (
                    <div key={idx} className="text-sentinel-blue font-bold text-xs uppercase tracking-wide mt-3 first:mt-0">
                      {line.replace(/\*\*/g, '')}
                    </div>
                  );
                }
                // Bullet points (e.g., • Finding)
                if (line.trim().startsWith('•')) {
                  return (
                    <div key={idx} className="flex items-start gap-2 ml-2">
                      <span className="text-sentinel-blue mt-0.5">•</span>
                      <span className="flex-1">{line.trim().substring(1).trim()}</span>
                    </div>
                  );
                }
                // Regular text
                if (line.trim()) {
                  return <p key={idx}>{line}</p>;
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Anomalies */}
      {result.anomalies.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-sentinel-red" size={18} />
            <h4 className="text-white font-bold">
              {result.anomalies.length} Anomal{result.anomalies.length === 1 ? 'y' : 'ies'} Detected
            </h4>
          </div>
          
          <AnimatePresence>
            {result.anomalies.map((anomaly, index) => (
              <AnomalyAlertCard key={index} anomaly={anomaly} index={index} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-400" size={24} />
            <div>
              <h4 className="text-green-400 font-bold mb-1">No Anomalies Detected</h4>
              <p className="text-sm text-gray-400">
                Transaction patterns appear normal. No suspicious activity found.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
