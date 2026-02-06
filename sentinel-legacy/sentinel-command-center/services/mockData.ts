import { Protocol } from '../types';

export const mockProtocols: Protocol[] = [
  {
    id: '1',
    name: 'Aether Lens',
    chain: 'Arbitrum',
    change24h: 2.5,
    change7d: -12.4,
    tvl: 45000000,
    riskScore: 85,
    lastUpdated: new Date().toISOString(),
    address: '0x1234567890abcdef1234567890abcdef12345678'
  },
  {
    id: '2',
    name: 'Nexus Vault',
    chain: 'Optimism',
    change24h: -0.8,
    change7d: -5.2,
    tvl: 12500000,
    riskScore: 42,
    lastUpdated: new Date().toISOString(),
    address: '0xabcdef1234567890abcdef1234567890abcdef12'
  },
  {
    id: '3',
    name: 'Stark Flow',
    chain: 'Starknet',
    change24h: 5.1,
    change7d: 18.2,
    tvl: 8900000,
    riskScore: 12,
    lastUpdated: new Date().toISOString(),
    address: '0x7890abcdef1234567890abcdef1234567890abcd'
  },
  {
    id: '4',
    name: 'Base Alpha',
    chain: 'Base',
    change24h: -15.4,
    change7d: -45.1,
    tvl: 3200000,
    riskScore: 92,
    lastUpdated: new Date().toISOString(),
    address: '0x567890abcdef1234567890abcdef1234567890ab'
  },
  {
    id: '5',
    name: 'Solana Yield',
    chain: 'Solana',
    change24h: 1.2,
    change7d: 4.5,
    tvl: 156000000,
    riskScore: 65,
    lastUpdated: new Date().toISOString(),
    address: 'So11111111111111111111111111111111111111112'
  },
];