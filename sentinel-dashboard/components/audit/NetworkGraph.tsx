"use client";

import { useState, useEffect } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface Node {
  id: string;
  type: 'target' | 'contract' | 'wallet';
  label: string;
  value: number;
  x?: number;
  y?: number;
}

interface Edge {
  source: string;
  target: string;
  value: number;
  count: number;
}

interface NetworkGraphProps {
  nodes: Node[];
  edges: Edge[];
}

export default function NetworkGraph({ nodes, edges }: NetworkGraphProps) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Determine positions manually to simulate a force layout
    // Target in center (0,0)
    const processedNodes = nodes.map((node, index) => {
      if (node.type === 'target') {
        return { ...node, x: 0, y: 0, color: '#d946ef' }; // Magenta
      }
      
      // Contracts in inner ring
      if (node.type === 'contract') {
        const angle = (index * (360 / Math.max(1, nodes.length))) * (Math.PI / 180);
        return { 
          ...node, 
          x: Math.cos(angle) * 50, 
          y: Math.sin(angle) * 50,
          color: '#8b5cf6' // Violet
        }; 
      }

      // Wallets in outer ring
      const angle = (index * (360 / Math.max(1, nodes.length))) * (Math.PI / 180) + 0.5;
      return { 
        ...node, 
        x: Math.cos(angle) * 80, 
        y: Math.sin(angle) * 80,
        color: '#06b6d4' // Cyan
      };
    });

    setData(processedNodes);
  }, [nodes]);

  return (
    <div className="w-full h-[400px] bg-black/20 rounded-xl relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <div className="w-[300px] h-[300px] border border-white/20 rounded-full animate-pulse" />
        <div className="w-[150px] h-[150px] border border-white/20 rounded-full absolute" />
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis type="number" dataKey="x" hide domain={[-100, 100]} />
          <YAxis type="number" dataKey="y" hide domain={[-100, 100]} />
          <ZAxis type="number" dataKey="value" range={[100, 1000]} />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-black/80 border border-white/10 p-2 rounded-lg text-xs backdrop-blur-md">
                    <p className="font-bold text-white mb-1">{data.label}</p>
                    <p className="text-gray-400 capitalize">{data.type}</p>
                    {data.type !== 'target' && (
                      <p className="text-gray-400">Interactions: {data.value / 2}</p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter name="Nodes" data={data} fill="#8884d8">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 text-xs bg-black/40 p-2 rounded-lg backdrop-blur-sm border border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-magenta-500" style={{ backgroundColor: '#d946ef' }} />
          <span className="text-gray-300">Target</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-500" style={{ backgroundColor: '#8b5cf6' }} />
          <span className="text-gray-300">Contracts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500" style={{ backgroundColor: '#06b6d4' }} />
          <span className="text-gray-300">Wallets</span>
        </div>
      </div>
    </div>
  );
}
