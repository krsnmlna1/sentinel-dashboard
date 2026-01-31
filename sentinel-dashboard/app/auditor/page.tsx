"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, FileText, Code, Upload, AlertTriangle, Search, Loader2, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import AlphaCard from "@/components/audit/AlphaCard";
import WalletProfileCard from "@/components/audit/WalletProfileCard";
import { AlphaScore, YieldPrediction, VaultLinks } from "@/lib/auditUtils";

interface AuditResult {
  success: boolean;
  type?: 'contract' | 'wallet'; // Added type field
  report?: string;
  analysis?: string;
  contractAddress?: string;
  address?: string; // For wallet results
  chain?: string;
  contractName?: string;
  fileName?: string;
  error?: string;
  contractType?: 'token' | 'vault' | 'unknown';
  riskScore?: number;
  alphaScore?: AlphaScore | null;
  yieldPrediction?: YieldPrediction | null;
  vaultLinks?: VaultLinks | null;
  protocolData?: any;
  // Wallet Profile Specific
  graph?: {
    nodes: any[];
    edges: any[];
  }
  // Wallet-specific fields
  stats?: {
    balance: string;
    txCount: number;
    firstSeen: string;
    walletAge: number;
    incomingTx: number;
    outgoingTx: number;
    contractInteractions: number;
  };
}

export default function AuditorPage() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"contract" | "whitepaper">("contract");
  const [dragActive, setDragActive] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const [chain, setChain] = useState("ethereum");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  // Pre-fill contract address from URL params
  useEffect(() => {
    const address = searchParams.get('address');
    const chainParam = searchParams.get('chain');
    
    if (address) {
      setContractAddress(address);
      setMode('contract');
      
      // Check if it's a protocol slug (doesn't start with 0x)
      if (!address.startsWith('0x')) {
        // It's likely a protocol slug, show a note
        console.log('Protocol slug detected:', address);
      }
    }
    
    if (chainParam) {
      setChain(chainParam.toLowerCase());
    }
  }, [searchParams]);

  const styles = {
    contract: {
      primary: "text-sentinel-red",
      border: "border-sentinel-red",
      bg: "bg-sentinel-red",
      gradient: "from-sentinel-red"
    },
    whitepaper: {
      primary: "text-sentinel-blue",
      border: "border-sentinel-blue",
      bg: "bg-sentinel-blue",
      gradient: "from-sentinel-blue"
    }
  };

  const currentStyle = styles[mode];

  const handleAudit = async () => {
    if (!contractAddress.trim()) {
      alert("Please enter a contract address");
      return;
    }

    setIsLoading(true);
    setAuditResult(null);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractAddress: contractAddress.trim(),
          chain
        })
      });

      const data = await response.json();
      setAuditResult(data);

    } catch (error: any) {
      setAuditResult({
        success: false,
        error: error.message || "Failed to connect to audit service"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhitepaperUpload = async () => {
    if (!selectedFile) {
      alert("Please select a PDF file");
      return;
    }

    setIsLoading(true);
    setAuditResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch("/api/audit-whitepaper", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setAuditResult({
          success: true,
          analysis: data.analysis,
          fileName: data.fileName
        });
      } else {
        setAuditResult({
          success: false,
          error: data.error || "Failed to analyze whitepaper"
        });
      }

    } catch (error: any) {
      setAuditResult({
        success: false,
        error: error.message || "Failed to upload whitepaper"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file');
        return;
      }
      setSelectedFile(file);
      setAuditResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file');
        return;
      }
      setSelectedFile(file);
      setAuditResult(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-block p-4 rounded-full bg-white/5 mb-4 relative group">
           <div className={`absolute inset-0 bg-gradient-to-r ${currentStyle.gradient} to-purple-500 opacity-20 blur-xl rounded-full transition-all duration-500`} />
           <Shield className={`w-12 h-12 ${currentStyle.primary} relative z-10 transition-colors duration-300`} />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">SECURITY AUDITOR</h1>
        <p className="text-gray-400">AI-powered vulnerability detection and risk assessment.</p>
      </motion.div>

      {/* Mode Switcher */}
      <div className="flex justify-center mb-10">
        <div className="bg-sentinel-card border border-white/10 rounded-full p-1 flex relative">
          <motion.div 
            className={`absolute top-1 bottom-1 w-[140px] rounded-full ${currentStyle.bg} opacity-10`}
            animate={{ x: mode === "contract" ? 0 : 140 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <button 
            onClick={() => {
              setMode("contract");
              setAuditResult(null);
            }}
            className={`
              relative z-10 w-[140px] py-2 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-colors
              ${mode === "contract" ? "text-white" : "text-gray-400 hover:text-white"}
            `}
          >
            <Code size={16} />
            Smart Contract
          </button>
          <button 
            onClick={() => {
              setMode("whitepaper");
              setAuditResult(null);
            }}
            className={`
              relative z-10 w-[140px] py-2 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-colors
              ${mode === "whitepaper" ? "text-white" : "text-gray-400 hover:text-white"}
            `}
          >
            <FileText size={16} />
            Whitepaper
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-sentinel-card border border-white/5 rounded-2xl p-8 relative overflow-hidden"
        >
          {/* Decorative Gradient Border */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${currentStyle.gradient} to-transparent opacity-50`} />

          {mode === "contract" ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono text-gray-400 uppercase ml-1">Contract Address</label>
                
                {/* Protocol Slug Warning */}
                {contractAddress && !contractAddress.startsWith('0x') && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-2">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="text-yellow-400 shrink-0 mt-0.5" size={16} />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-yellow-200 mb-1">Protocol Detected: "{contractAddress}"</p>
                        <p className="text-xs text-yellow-300/80 mb-3">
                          This appears to be a protocol name, not a contract address. Click below to find the actual contract address:
                        </p>
                        <a
                          href={`https://defillama.com/protocol/${contractAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all text-xs"
                        >
                          <ExternalLink size={14} />
                          Open {contractAddress} on DeFiLlama
                        </a>
                        <p className="text-xs text-yellow-300/60 mt-2">
                          Look for the main vault/pool contract address (starts with 0x...), then paste it here to audit.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="0x..." 
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAudit()}
                      disabled={isLoading}
                      className="w-full bg-sentinel-bg/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white font-mono focus:outline-none focus:border-sentinel-red/50 transition-colors disabled:opacity-50"
                    />
                  </div>
                  <button 
                    onClick={handleAudit}
                    disabled={isLoading}
                    className="px-8 bg-sentinel-red hover:bg-sentinel-red/90 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        AUDITING...
                      </>
                    ) : (
                      "AUDIT"
                    )}
                  </button>
                </div>
              </div>

              {/* Chain Selector */}
              <div className="flex gap-2 flex-wrap">
                {["ethereum", "bsc", "polygon", "arbitrum", "base", "optimism"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setChain(c)}
                    disabled={isLoading}
                    className={`
                      px-4 py-2 rounded-lg text-xs font-medium transition-all
                      ${chain === c 
                        ? "bg-sentinel-red/20 text-sentinel-red border border-sentinel-red/30" 
                        : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"}
                      disabled:opacity-50
                    `}
                  >
                    {c.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Results */}
              {auditResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  {auditResult.success ? (
                    <div className="space-y-4">
                      {/* Check if it's a wallet profile */}
                      {auditResult.type === 'wallet' && auditResult.stats ? (
                        <WalletProfileCard
                          address={auditResult.address || auditResult.contractAddress || ''}
                          chain={auditResult.chain || 'ethereum'}
                          riskScore={auditResult.riskScore || 50}
                          analysis={auditResult.analysis || ''}
                          stats={auditResult.stats}
                          graph={auditResult.graph}
                        />
                      ) : (
                        <>
                          {/* ALPHA Score Card - Show first if available */}
                          {auditResult.alphaScore && (
                            <AlphaCard
                              alphaScore={auditResult.alphaScore}
                              yieldPrediction={auditResult.yieldPrediction}
                              vaultLinks={auditResult.vaultLinks}
                              protocolName={auditResult.contractName}
                            />
                          )}

                          {/* Contract Type Badge */}
                          {auditResult.contractType && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Contract Type:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            auditResult.contractType === 'vault' ? 'bg-blue-500/20 text-blue-400' :
                            auditResult.contractType === 'token' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {auditResult.contractType.toUpperCase()}
                          </span>
                          {auditResult.riskScore !== undefined && (
                            <>
                              <span className="text-xs text-gray-400 ml-4">Risk Score:</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                auditResult.riskScore >= 70 ? 'bg-red-500/20 text-red-400' :
                                auditResult.riskScore >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {auditResult.riskScore}/100
                              </span>
                            </>
                          )}
                        </div>
                      )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="bg-sentinel-red/5 border border-sentinel-red/10 rounded-xl p-4 flex gap-4 items-start">
                      <XCircle className="text-sentinel-red shrink-0" size={24} />
                      <div className="space-y-1">
                        <h4 className="text-sentinel-red font-bold text-sm">Audit Failed</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {auditResult.error || "Unknown error occurred"}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {!auditResult && !isLoading && (
                <div className="bg-sentinel-red/5 border border-sentinel-red/10 rounded-xl p-4 flex gap-4 items-start">
                  <AlertTriangle className="text-sentinel-red shrink-0" size={24} />
                  <div className="space-y-1">
                    <h4 className="text-sentinel-red font-bold text-sm">Warning: High Gas Usage Detected</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Preliminary scan indicates this contract consumes 40% more gas than average for similar interaction types.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div 
                className={`
                  border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer
                  ${dragActive ? "border-sentinel-blue bg-sentinel-blue/5 scale-[1.02]" : "border-white/10 hover:border-white/20 hover:bg-white/5"}
                  ${selectedFile ? "border-sentinel-green" : ""}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  selectedFile ? "bg-sentinel-green/10 text-sentinel-green" : "bg-sentinel-blue/10 text-sentinel-blue"
                }`}>
                  {selectedFile ? <CheckCircle size={32} /> : <Upload size={32} />}
                </div>
                
                {selectedFile ? (
                  <>
                    <h3 className="text-xl font-bold text-white mb-2">File Selected</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setAuditResult(null);
                      }}
                      className="text-xs text-gray-400 hover:text-white transition-colors underline"
                    >
                      Remove file
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-white mb-2">Upload Whitepaper</h3>
                    <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                      Drag and drop your PDF documentation here for AI-powered security analysis and risk assessment.
                    </p>
                    <button className="px-6 py-2 rounded-lg border border-white/20 hover:bg-white/5 text-sm font-medium transition-colors">
                      Select PDF File
                    </button>
                    <p className="text-xs text-gray-500 mt-4">
                      Maximum file size: 10MB
                    </p>
                  </>
                )}
                
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {selectedFile && !isLoading && !auditResult && (
                <button
                  onClick={handleWhitepaperUpload}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] ${currentStyle.bg} hover:opacity-90 text-white`}
                >
                  <Shield size={20} />
                  ANALYZE WHITEPAPER
                </button>
              )}

              {/* Results */}
              {auditResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  {auditResult.success ? (
                    <div className="bg-sentinel-bg/50 border border-white/10 rounded-xl p-6 space-y-4">
                      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                        <CheckCircle className="text-sentinel-green" size={24} />
                        <div>
                          <h3 className="text-white font-bold">Analysis Complete</h3>
                          <p className="text-xs text-gray-400">{auditResult.fileName}</p>
                        </div>
                      </div>
                      {/* Contract Report */}
                      <div className="bg-white/5 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Code size={20} />
                          Security Analysis
                        </h3>
                        <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {auditResult.report || auditResult.analysis}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-sentinel-red/5 border border-sentinel-red/10 rounded-xl p-4 flex gap-4 items-start">
                      <XCircle className="text-sentinel-red shrink-0" size={24} />
                      <div className="space-y-1">
                        <h4 className="text-sentinel-red font-bold text-sm">Analysis Failed</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {auditResult.error || "An error occurred during analysis"}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
