import ShareCard from "./ShareCard";

import { Share2, Download, Zap, TrendingUp, Layers, AlertTriangle, CheckCircle, Shield } from "lucide-react";

interface WhitepaperData {
  tokenomics?: {
    token_name?: string;
    token_type?: string;
    total_supply?: string;
    token_distribution?: Record<string, string>;
    token_unlock_schedule?: Record<string, string>;
  };
  project_viability?: Record<string, string>;
  red_flags?: Record<string, boolean>;
  utility?: {
    unique_value_proposition?: string;
    use_cases?: string[];
    partnerships?: string[];
  };
  analysis: string;
}

interface WhitepaperCardProps {
  data: string | WhitepaperData;
  fileName?: string;
}

export default function WhitepaperCard({ data, fileName }: WhitepaperCardProps) {
  const analysis: WhitepaperData = typeof data === 'string' ? JSON.parse(data) : data;

  const getViabilityColor = (rating?: string) => {
      // ... (keep helper)
      switch(rating?.toLowerCase()) {
      case 'strong':
      case 'advanced':
      case 'experienced':
        return 'text-sentinel-green';
      case 'moderate':
      case 'aggressive':
        return 'text-sentinel-yellow';
      case 'weak':
      case 'low':
        return 'text-sentinel-red';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <ShareCard 
       title="Whitepaper Audit" 
       fileName={`audit-${fileName || 'whitepaper'}`}
       twitterText={`Just analyzed ${fileName || 'a project'} whitepaper with Sentinel AI. Here's the risk breakdown! 📄 #SentinelAI #DYOR`}
    >
      <div className="space-y-6">
        {/* ... (keep existing content intact) */}
        
        {/* Header */}
        <div className="bg-sentinel-bg/50 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center justify-between">
           {/* ... */}
           {/* Basically I just want to wrap the outer div with <ShareCard> and the inner div with a class or just pass children */}
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-sentinel-blue/20 flex items-center justify-center text-sentinel-blue">
                 <Shield size={24} />
              </div>
              <div>
                 <h3 className="text-lg font-bold text-white">Whitepaper Analysis</h3>
                 <p className="text-sm text-gray-400">{fileName || analysis.tokenomics?.token_name || 'Project Audit'}</p>
              </div>
           </div>
           
           <div className="flex gap-2">
              <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-center">
                 <div className="text-xs text-gray-400 uppercase mb-1">Type</div>
                 <div className="text-sm font-bold text-white">{analysis.tokenomics?.token_type || 'N/A'}</div>
              </div>
              <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-center">
                 <div className="text-xs text-gray-400 uppercase mb-1">Supply</div>
                 <div className="text-sm font-bold text-white">{analysis.tokenomics?.total_supply || 'N/A'}</div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Tokenomics */}
           <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h4 className="text-sentinel-blue font-bold mb-4 flex items-center gap-2">
                 <Layers size={18} /> Tokenomics
              </h4>
              <div className="space-y-4">
                 <div>
                    <div className="text-xs text-gray-400 mb-2">Distribution</div>
                    <div className="space-y-2">
                       {Object.entries(analysis.tokenomics?.token_distribution || {}).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                             <span className="text-gray-300 capitalize">{key.replace(/_/g, ' ')}</span>
                             <span className="font-mono text-white">{value}</span>
                          </div>
                       ))}
                    </div>
                 </div>
                 <div className="pt-4 border-t border-white/10">
                    <div className="text-xs text-gray-400 mb-2">Unlock Schedule</div>
                    <div className="space-y-2">
                       {Object.entries(analysis.tokenomics?.token_unlock_schedule || {}).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                             <span className="text-gray-300 capitalize">{key.replace(/_/g, ' ')}</span>
                             <span className="text-gray-400 text-xs text-right max-w-[50%]">{value}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           {/* Project Viability */}
           <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h4 className="text-sentinel-green font-bold mb-4 flex items-center gap-2">
                 <TrendingUp size={18} /> Project Viability
              </h4>
              <div className="space-y-4">
                 {Object.entries(analysis.project_viability || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                       <span className="text-sm text-gray-300 capitalize">{key.replace(/_/g, ' ')}</span>
                       <span className={`text-sm font-bold capitalize ${getViabilityColor(value)}`}>{value}</span>
                    </div>
                 ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                 <h5 className="text-xs text-gray-400 mb-3 uppercase">Red Flags Scan</h5>
                 <div className="grid grid-cols-2 gap-2">
                    {Object.entries(analysis.red_flags || {}).filter(([k]) => k !== 'centralized_team_control').map(([key, isFlagged]) => (
                       <div key={key} className={`flex items-center gap-2 text-xs p-2 rounded-lg border ${
                          isFlagged 
                             ? 'bg-sentinel-red/10 border-sentinel-red/20 text-red-200' 
                             : 'bg-sentinel-green/10 border-sentinel-green/20 text-green-200'
                       }`}>
                          {isFlagged ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                          <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Utility & Use Cases */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
           <h4 className="text-sentinel-yellow font-bold mb-4 flex items-center gap-2">
              <Zap size={18} /> Utility & Ecosystem
           </h4>
           <p className="text-sm text-gray-300 mb-6 italic border-l-2 border-sentinel-yellow pl-4">
              "{analysis.utility?.unique_value_proposition}"
           </p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <div className="text-xs text-gray-400 mb-2 uppercase">Use Cases</div>
                 <div className="flex flex-wrap gap-2">
                    {analysis.utility?.use_cases?.map((useCase) => (
                       <span key={useCase} className="px-3 py-1 bg-white/10 rounded-full text-xs text-white">
                          {useCase}
                       </span>
                    ))}
                 </div>
              </div>
              <div>
                 <div className="text-xs text-gray-400 mb-2 uppercase">Partnerships</div>
                 <div className="flex flex-wrap gap-2">
                    {analysis.utility?.partnerships?.map((partner) => (
                       <span key={partner} className="px-3 py-1 bg-sentinel-blue/10 text-sentinel-blue border border-sentinel-blue/20 rounded-full text-xs">
                          {partner}
                       </span>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </ShareCard>
  );
}
