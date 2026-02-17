// Money Flow Tracking Types

export interface FlowPath {
  hops: number;
  wallets: string[];
  amounts: number[]; // in ETH
  timestamps: number[];
  txHashes: string[];
}

export interface FlowNode {
  address: string;
  amount: number;
  timestamp: number;
  txHash: string;
}

export interface FlowResult {
  success: boolean;
  from: string;
  to: string;
  chain: string;
  paths: FlowPath[];
  totalAmount: number;
  found: boolean;
  searchDepth: number;
  executionTime: number; // ms
  error?: string;
}

export interface FlowRequest {
  from: string;
  to: string;
  chain?: string;
  maxHops?: number; // 1-5, default 3
}
