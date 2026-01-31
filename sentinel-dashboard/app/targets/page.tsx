"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, TrendingDown, TrendingUp, Minus, ExternalLink, Shield, Loader2 } from "lucide-react";
import Link from "next/link";

interface Protocol {
  name: string;
  slug: string;
  tvl: number;
  change_7d: number;
  chain: string;
  score: number;
  category?: string;
}

export default function TargetsPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [filteredProtocols, setFilteredProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [chainFilter, setChainFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"tvl" | "change_7d" | "score">("score");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchProtocols();
  }, []);

  useEffect(() => {
    filterAndSort();
  }, [protocols, searchTerm, chainFilter, sortBy]);

  const fetchProtocols = async () => {
    try {
      const response = await fetch("/api/scout?limit=100");
      const data = await response.json();
      setProtocols(data.protocols || []);
    } catch (error) {
      console.error("Failed to fetch protocols:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSort = () => {
    let filtered = [...protocols];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Chain filter
    if (chainFilter !== "all") {
      filtered = filtered.filter(p => p.chain === chainFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "tvl") return (b.tvl || 0) - (a.tvl || 0);
      if (sortBy === "change_7d") return (a.change_7d || 0) - (b.change_7d || 0);
      if (sortBy === "score") return (b.score || 0) - (a.score || 0);
      return 0;
    });

    setFilteredProtocols(filtered);
    setPage(1); // Reset to first page when filtering
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-sentinel-red";
    if (score >= 40) return "text-sentinel-yellow";
    return "text-sentinel-green";
  };

  const getRiskBg = (score: number) => {
    if (score >= 70) return "bg-sentinel-red/10 border-sentinel-red/30";
    if (score >= 40) return "bg-sentinel-yellow/10 border-sentinel-yellow/30";
    return "bg-sentinel-green/10 border-sentinel-green/30";
  };

  const formatTVL = (tvl: number) => {
    if (tvl >= 1e9) return `$${(tvl / 1e9).toFixed(2)}B`;
    if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(2)}M`;
    if (tvl >= 1e3) return `$${(tvl / 1e3).toFixed(2)}K`;
    return `$${tvl.toFixed(2)}`;
  };

  const paginatedProtocols = filteredProtocols.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredProtocols.length / ITEMS_PER_PAGE);

  const chains = ["all", ...Array.from(new Set(protocols.map(p => p.chain)))];

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">ALL TARGETS</h1>
        <p className="text-gray-400">
          Monitoring {filteredProtocols.length} protocols across {chains.length - 1} chains
        </p>
      </motion.div>

      {/* Filters */}
      <div className="bg-sentinel-card border border-white/5 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search protocols..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-sentinel-bg border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-sentinel-blue/50 transition-colors"
            />
          </div>

          {/* Chain Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={chainFilter}
              onChange={(e) => setChainFilter(e.target.value)}
              className="w-full bg-sentinel-bg border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-sentinel-blue/50 transition-colors appearance-none cursor-pointer"
            >
              {chains.map(chain => (
                <option key={chain} value={chain}>
                  {chain === "all" ? "All Chains" : chain}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("score")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                sortBy === "score"
                  ? "bg-sentinel-red text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              Risk Score
            </button>
            <button
              onClick={() => setSortBy("tvl")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                sortBy === "tvl"
                  ? "bg-sentinel-blue text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              TVL
            </button>
            <button
              onClick={() => setSortBy("change_7d")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                sortBy === "change_7d"
                  ? "bg-sentinel-yellow text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              Change
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-sentinel-blue" size={40} />
        </div>
      ) : (
        <>
          <div className="bg-sentinel-card border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase">Protocol</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase">Chain</th>
                  <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase">TVL</th>
                  <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase">7d Change</th>
                  <th className="text-center py-4 px-6 text-xs font-bold text-gray-400 uppercase">Risk Score</th>
                  <th className="text-center py-4 px-6 text-xs font-bold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProtocols.map((protocol, index) => (
                  <motion.tr
                    key={protocol.slug}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sentinel-blue to-sentinel-green flex items-center justify-center text-white font-bold text-sm">
                          {protocol.name[0]}
                        </div>
                        <div>
                          <div className="text-white font-medium">{protocol.name}</div>
                          <div className="text-xs text-gray-400 font-mono">{protocol.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-300">{protocol.chain}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-white font-mono">{formatTVL(protocol.tvl)}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {protocol.change_7d < 0 ? (
                          <TrendingDown className="text-sentinel-red" size={16} />
                        ) : protocol.change_7d > 0 ? (
                          <TrendingUp className="text-sentinel-green" size={16} />
                        ) : (
                          <Minus className="text-gray-400" size={16} />
                        )}
                        <span className={`font-mono ${
                          protocol.change_7d < 0 ? "text-sentinel-red" :
                          protocol.change_7d > 0 ? "text-sentinel-green" :
                          "text-gray-400"
                        }`}>
                          {protocol.change_7d > 0 ? "+" : ""}{protocol.change_7d.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskBg(protocol.score)} ${getRiskColor(protocol.score)}`}>
                          {protocol.score}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/auditor?address=${protocol.slug}`}
                          className="p-2 rounded-lg bg-sentinel-red/20 hover:bg-sentinel-red/30 text-sentinel-red transition-colors"
                          title="Audit Contract"
                        >
                          <Shield size={16} />
                        </Link>
                        <a
                          href={`https://defillama.com/protocol/${protocol.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-sentinel-blue/20 hover:bg-sentinel-blue/30 text-sentinel-blue transition-colors"
                          title="View on DeFiLlama"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-400 text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
