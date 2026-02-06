import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue: string;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'neutral';
  color: 'blue' | 'green' | 'red' | 'yellow';
  delay?: number;
}

const colorMap = {
  blue: {
    text: 'text-sentinel-blue',
    bg: 'bg-sentinel-blue/10',
    border: 'border-sentinel-blue/20',
    glow: 'group-hover:shadow-[0_0_20px_rgba(14,165,233,0.2)]'
  },
  green: {
    text: 'text-sentinel-green',
    bg: 'bg-sentinel-green/10',
    border: 'border-sentinel-green/20',
    glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'
  },
  red: {
    text: 'text-sentinel-red',
    bg: 'bg-sentinel-red/10',
    border: 'border-sentinel-red/20',
    glow: 'group-hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]'
  },
  yellow: {
    text: 'text-sentinel-yellow',
    bg: 'bg-sentinel-yellow/10',
    border: 'border-sentinel-yellow/20',
    glow: 'group-hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]'
  }
};

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subValue, 
  icon: Icon, 
  trend, 
  color,
  delay = 0 
}) => {
  const styles = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`
        group relative overflow-hidden rounded-xl bg-sentinel-card border border-white/5 
        p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/10 ${styles.glow}
      `}
    >
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-${color}-500/5 to-transparent rounded-bl-full -mr-8 -mt-8`} />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sentinel-muted text-xs font-bold tracking-widest uppercase">
            {title}
          </h3>
          <div className={`p-2 rounded-lg ${styles.bg} ${styles.text}`}>
            <Icon size={20} />
          </div>
        </div>

        <div className="flex items-end gap-3 mb-2">
          <span className="text-3xl font-bold text-white tracking-tight">
            {value}
          </span>
          <div className={`flex items-center gap-1 text-sm font-medium mb-1 ${styles.text}`}>
            {trend === 'up' && <TrendingUp size={16} />}
            {trend === 'down' && <TrendingDown size={16} />}
            {trend === 'neutral' && <Minus size={16} />}
          </div>
        </div>

        <p className="text-xs text-sentinel-muted font-mono border-t border-white/5 pt-3 mt-1 flex items-center justify-between">
          <span>{subValue}</span>
          <span className={`w-2 h-2 rounded-full ${styles.bg.replace('/10', '')} animate-pulse`} />
        </p>
      </div>

      {/* Left accent border */}
      <div className={`absolute top-4 bottom-4 left-0 w-1 rounded-r-full ${styles.bg.replace('/10', '')}`} />
    </motion.div>
  );
};

export default StatCard;