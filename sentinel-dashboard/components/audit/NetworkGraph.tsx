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
    // Separate nodes by type
    const targetNode = nodes.find(n => n.type === 'target');
    const contractNodes = nodes.filter(n => n.type === 'contract');
    const walletNodes = nodes.filter(n => n.type === 'wallet');

    const processedNodes: any[] = [];

    // 1. Target in center
    if (targetNode) {
      processedNodes.push({ 
        ...targetNode, 
        x: 0, 
        y: 0, 
        color: '#d946ef' // Magenta
      });
    }

    // 2. Contracts in inner ring (radius 40)
    contractNodes.forEach((node, index) => {
      const angle = (index / contractNodes.length) * 2 * Math.PI;
      processedNodes.push({
        ...node,
        x: Math.cos(angle) * 40,
        y: Math.sin(angle) * 40,
        color: '#8b5cf6' // Violet
      });
    });

    // 3. Wallets in outer ring (radius 70)
    walletNodes.forEach((node, index) => {
      const angle = (index / walletNodes.length) * 2 * Math.PI + 0.3; // offset for better spacing
      processedNodes.push({
        ...node,
        x: Math.cos(angle) * 70,
        y: Math.sin(angle) * 70,
        color: '#06b6d4' // Cyan
      });
    });

    setData(processedNodes);
  }, [nodes]);

  return (
    <div className="w-full h-[400px] bg-black/20 rounded-xl relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <div className="w-[300px] h-[300px] border border-white/20 rounded-full animate-pulse" />
        <div className="w-[150px] h-[150px] border border-white/20 rounded-full absolute" />
      </div>

      {/* SVG Layer for Edges */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid meet" style={{ zIndex: 1 }}>
        {edges.map((edge, idx) => {
          const sourceNode = data.find((n: any) => n.id === edge.source);
          const targetNode = data.find((n: any) => n.id === edge.target);
          
          if (!sourceNode || !targetNode) return null;

          // Use the same coordinate system as the scatter chart
          const x1 = sourceNode.x || 0;
          const y1 = sourceNode.y || 0;
          const x2 = targetNode.x || 0;
          const y2 = targetNode.y || 0;

          // Line thickness based on edge value (thicker = more interactions)
          const strokeWidth = Math.max(0.5, Math.min(edge.value / 100, 2));

          return (
            <line
              key={`edge-${idx}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(14, 165, 233, 0.25)"
              strokeWidth={strokeWidth}
              className="transition-all"
            />
          );
        })}
      </svg>

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
