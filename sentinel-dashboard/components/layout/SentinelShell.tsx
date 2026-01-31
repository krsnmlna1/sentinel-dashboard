import { Navbar } from "./Navbar";

export function SentinelShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sentinel-bg text-text-primary font-mono relative selection:bg-sentinel-green/30">
      {/* Background Grid Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none" 
           style={{ 
             backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(79, 172, 254, 0.05) 0%, transparent 50%), linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
             backgroundSize: '100% 100%, 40px 40px, 40px 40px'
           }} 
      />
      
      <Navbar />
      
      <main className="relative z-10 pt-24 px-10 pb-16 max-w-[1600px] mx-auto">
        {children}
      </main>
    </div>
  );
}
