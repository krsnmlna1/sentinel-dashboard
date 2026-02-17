"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Shield, Activity, Users, Clock, TrendingUp } from "lucide-react";
import type { AnomalyAlert } from "@/lib/types/anomaly";

interface AnomalyAlertCardProps {
  anomaly: AnomalyAlert;
  index: number;
}

export default function AnomalyAlertCard({ anomaly, index }: AnomalyAlertCardProps) {
  // Severity styling
  const severityStyles = {
    critical: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-400",
      badge: "bg-red-500",
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
    },
    high: {
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      text: "text-orange-400",
      badge: "bg-orange-500",
      glow: "shadow-[0_0_15px_rgba(249,115,22,0.2)]",
    },
    medium: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      text: "text-yellow-400",
      badge: "bg-yellow-500",
      glow: "shadow-[0_0_10px_rgba(234,179,8,0.2)]",
    },
    low: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-400",
      badge: "bg-blue-500",
      glow: "",
    },
  };

  const style = severityStyles[anomaly.severity];

  // Type icons
  const typeIcons = {
    unusual_transfer: TrendingUp,
    honeypot_pattern: AlertTriangle,
    bot_activity: Activity,
    connected_wallets: Users,
    suspicious_timing: Clock,
    wash_trading: TrendingUp,
  };

  const Icon = typeIcons[anomaly.type] || Shield;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`${style.bg} border ${style.border} rounded-xl p-4 ${style.glow} relative overflow-hidden`}
    >
      {/* Decorative gradient */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${style.badge} opacity-50`} />

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`${style.bg} border ${style.border} rounded-lg p-3 shrink-0`}>
          <Icon className={style.text} size={24} />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${style.badge} text-white`}>
                  {anomaly.severity}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {anomaly.type.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
              <h4 className={`font-bold ${style.text} text-sm`}>
                {anomaly.description}
              </h4>
            </div>

            {/* Confidence Badge */}
            <div className="text-right shrink-0">
              <div className="text-xs text-gray-400 mb-1">Confidence</div>
              <div className={`text-lg font-bold ${style.text}`}>
                {anomaly.confidence}%
              </div>
            </div>
          </div>

          {/* Evidence */}
          {anomaly.evidence.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-gray-400 font-medium">Evidence:</div>
              <ul className="space-y-1">
                {anomaly.evidence.map((item, i) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className={`${style.text} mt-1`}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-gray-500 font-mono">
            Detected: {new Date(anomaly.timestamp).toLocaleString()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
