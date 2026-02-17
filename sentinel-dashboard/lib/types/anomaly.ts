// Anomaly Detection Type Definitions

export type AnomalySeverity = 'critical' | 'high' | 'medium' | 'low';

export type AnomalyType = 
  | 'unusual_transfer'
  | 'honeypot_pattern'
  | 'bot_activity'
  | 'connected_wallets'
  | 'suspicious_timing'
  | 'wash_trading';

export interface AnomalyAlert {
  severity: AnomalySeverity;
  type: AnomalyType;
  description: string;
  confidence: number; // 0-100
  evidence: string[];
  timestamp: number;
}

export interface AnomalyDetectionResult {
  success: boolean;
  address: string;
  chain: string;
  anomalies: AnomalyAlert[];
  overallRisk: number; // 0-100
  aiInsight: string;
  error?: string;
}

export interface TransactionPattern {
  totalTransactions: number;
  incomingTx: number;
  outgoingTx: number;
  contractInteractions: number;
  avgGasPrice: number;
  avgValue: number;
  uniqueAddresses: number;
  timeSpan: number; // in days
  suspiciousPatterns: string[];
}
