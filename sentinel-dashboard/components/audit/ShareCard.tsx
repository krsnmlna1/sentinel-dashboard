"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Share2, Download, Loader2 } from "lucide-react";

interface ShareCardProps {
  children: React.ReactNode;
  title?: string;
  twitterText?: string;
  fileName?: string;
}

export default function ShareCard({ children, title = "Sentinel Analysis", twitterText, fileName = "sentinel-audit" }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#030712", // sentinel-bg
        scale: 2, // Retina quality
        useCORS: true,
        logging: false
      });

      const image = canvas.toDataURL("image/png", 1.0);
      
      // Create download link
      const link = document.createElement("a");
      link.href = image;
      link.download = `${fileName}-${Date.now()}.png`;
      link.click();

    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareTwitter = () => {
    const text = twitterText || "Just audited this contract with Sentinel AI. Check the results! 🕵️‍♂️";
    const url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text);
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Action Bar */}
      <div className="flex justify-end gap-2">
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-400 hover:text-white transition-colors border border-white/5"
        >
          {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          Export Image
        </button>
        
        <button 
          onClick={handleShareTwitter}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-xs font-medium text-[#1DA1F2] transition-colors border border-[#1DA1F2]/20"
        >
          <Share2 size={14} />
          Share on X
        </button>
      </div>

      {/* Capture Area */}
      <div ref={cardRef} className="relative bg-sentinel-bg rounded-xl overflow-hidden">
        {children}
        
        {/* Watermark (visible only in export if we wanted, but here it shows always) */}
        <div className="absolute bottom-2 right-4 opacity-30 pointer-events-none">
           <span className="text-[10px] font-mono text-white tracking-widest">SENTINEL.AI</span>
        </div>
      </div>
    </div>
  );
}
