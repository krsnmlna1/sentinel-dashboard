export interface Protocol {
  id: string;
  name: string;
  chain: string;
  change24h: number; // Percentage
  change7d: number; // Percentage
  tvl: number;
  riskScore: number; // 0-100
  lastUpdated: string;
  address?: string;
}

export interface StatData {
  title: string;
  value: string | number;
  subValue: string;
  trend: 'up' | 'down' | 'neutral';
  color: 'blue' | 'green' | 'red' | 'yellow';
}

export type Theme = 'cyberpunk' | 'matrix' | 'neon';

export interface SettingsState {
  refreshInterval: number;
  notifications: boolean;
  autoAudit: boolean;
  discordAlerts: boolean;
  theme: Theme;
}