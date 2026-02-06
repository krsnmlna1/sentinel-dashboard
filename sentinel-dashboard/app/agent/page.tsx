"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Terminal, Send, Cpu, Trash2, StopCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "SENTINEL SYSTEM v2.0 ONLINE.\nINITIALIZING NEURAL LINK...\nCONNECTED.\n\nAwaiting your command, User." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Send context (last 10 messages to keep it cheap but contextual)
      const contextMessages = [...messages.slice(-10), userMsg];

      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: contextMessages })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { role: "assistant", content: data.content }]);

    } catch (error: any) {
      setMessages(prev => [...prev, { role: "system", content: `[ERROR]: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setMessages([{ role: "assistant", content: "SYSTEM LOGS PURGED.\nREADY." }]);
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 md:p-8 flex flex-col">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-6 border-b border-green-900/50 pb-4"
      >
        <div className="flex items-center gap-3">
          <Terminal className="text-green-400" size={24} />
          <div>
            <h1 className="text-xl font-bold tracking-wider text-green-400">SENTINEL_TERMINAL</h1>
            <div className="flex items-center gap-2 text-xs text-green-700">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              ONLINE // ENCRYPTED
            </div>
          </div>
        </div>
        <div className="flex gap-4">
           <button onClick={clearLogs} className="hover:text-green-300 transition-colors" title="Clear Logs">
             <Trash2 size={20} />
           </button>
        </div>
      </motion.div>

      {/* Main Terminal Window */}
      <div className="flex-1 bg-black/50 border border-green-900/50 rounded-lg backdrop-blur-sm shadow-[0_0_30px_rgba(0,255,0,0.05)] flex flex-col overflow-hidden relative">
        
        {/* Scanlines Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] opacity-20"></div>

        {/* Messages Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-transparent pb-20">
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                  <div className={`shrink-0 w-8 h-8 flex items-center justify-center rounded border ${
                    msg.role === 'assistant' ? 'border-green-800 bg-green-900/10 text-green-400' : 
                    msg.role === 'user' ? 'border-gray-700 bg-gray-800/20 text-gray-300' :
                    'border-red-900 bg-red-900/10 text-red-500'
                  }`}>
                      {msg.role === 'assistant' ? <Cpu size={16} /> : msg.role === 'user' ? ">" : "!"}
                  </div>
                  
                  <div className={`max-w-[80%] whitespace-pre-wrap leading-relaxed ${
                    msg.role === 'user' ? 'text-gray-300 text-right' : 
                    msg.role === 'system' ? 'text-red-400' :
                    'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.3)]'
                  }`}>
                    {msg.role === 'assistant' && idx === messages.length - 1 && isLoading ? (
                       <span className="animate-pulse">_</span> 
                    ) : (
                        msg.content
                    )}
                  </div>
              </motion.div>
            ))}
            
            {isLoading && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded border border-green-800 bg-green-900/10 text-green-400">
                      <Cpu size={16} className="animate-spin" />
                  </div>
                  <div className="text-green-600 animate-pulse mt-1">
                      PROCESSING_REQUEST...
                  </div>
               </motion.div>
            )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-green-900/50 bg-black/80 z-20">
          <form onSubmit={handleSubmit} className="flex gap-4 max-w-4xl mx-auto">
             <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600 font-bold">{">"}</span>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter command or query..."
                  className="w-full bg-green-900/10 border border-green-900/30 rounded-lg py-3 pl-10 pr-4 text-green-400 placeholder-green-800 focus:outline-none focus:border-green-500/50 focus:bg-green-900/20 transition-all font-mono"
                  autoFocus
                />
             </div>
             <button 
               type="submit" 
               disabled={isLoading || !input.trim()}
               className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-lg px-6 flex items-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
             >
                <Send size={18} />
                <span className="hidden md:inline">EXECUTE</span>
             </button>
          </form>
        </div>

      </div>
    </div>
  );
}
