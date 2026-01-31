"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, RotateCcw, Monitor, Bell, Key, Database, Check, CheckCircle } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface SettingsState {
  refreshInterval: number;
  notifications: boolean;
  autoAudit: boolean;
  discordAlerts: boolean;
  theme: string;
  apiKey: string;
}

const DEFAULT_SETTINGS: SettingsState = {
  refreshInterval: 5,
  notifications: true,
  autoAudit: false,
  discordAlerts: true,
  theme: "cyberpunk",
  apiKey: ""
};

export default function SettingsPage() {
  const { theme: currentTheme, setTheme } = useTheme();
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("sentinel-settings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
        setSavedSettings(parsed);
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    }
  }, []);

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(savedSettings);
    setHasChanges(changed);
  }, [settings, savedSettings]);

  const handleSave = () => {
    localStorage.setItem("sentinel-settings", JSON.stringify(settings));
    setSavedSettings(settings);
    setHasChanges(false);
    setShowSaved(true);
    
    // Apply theme immediately
    if (settings.theme !== currentTheme) {
      setTheme(settings.theme as any);
    }
    
    setTimeout(() => setShowSaved(false), 2000);
  };

  const handleReset = () => {
    setSettings(savedSettings);
    setHasChanges(false);
  };

  const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="bg-sentinel-card border border-white/5 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
        <Icon className="text-sentinel-blue" size={20} />
        <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );

  const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between group">
      <span className="text-gray-400 text-sm group-hover:text-white transition-colors">{label}</span>
      <button 
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${checked ? "bg-sentinel-blue" : "bg-white/10"}`}
      >
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${checked ? "translate-x-6" : "translate-x-0"}`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <h1 className="text-3xl font-bold text-white">SYSTEM <span className="text-gray-400">CONFIG</span></h1>
        <div className="flex gap-3">
          <button 
            onClick={handleReset}
            disabled={!hasChanges}
            className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Reset to last saved"
          >
            <RotateCcw size={20} />
          </button>
          <button 
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-6 py-2 rounded-lg bg-sentinel-blue hover:bg-sentinel-blue/90 text-white font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            {showSaved ? (
              <>
                <CheckCircle size={18} />
                SAVED!
              </>
            ) : (
              <>
                <Save size={18} />
                SAVE
              </>
            )}
          </button>
        </div>
      </motion.div>

      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-sentinel-yellow/10 border border-sentinel-yellow/30 rounded-lg p-3 text-sentinel-yellow text-sm flex items-center gap-2"
        >
          <Bell size={16} />
          You have unsaved changes. Click SAVE to apply them.
        </motion.div>
      )}

      <Section title="Data Feed" icon={Database}>
        <div className="flex items-center justify-between">
          <label className="text-gray-400 text-sm">Auto-Refresh Interval (minutes)</label>
          <div className="flex items-center gap-2 bg-sentinel-bg rounded-lg border border-white/10 p-1">
             <button 
                onClick={() => setSettings(s => ({...s, refreshInterval: Math.max(1, s.refreshInterval - 1)}))}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded text-white transition-colors"
             >-</button>
             <span className="w-8 text-center font-mono text-white">{settings.refreshInterval}</span>
             <button 
                onClick={() => setSettings(s => ({...s, refreshInterval: Math.min(60, s.refreshInterval + 1)}))}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded text-white transition-colors"
             >+</button>
          </div>
        </div>
      </Section>

      <Section title="Notifications" icon={Bell}>
        <Toggle 
          label="Enable System Notifications" 
          checked={settings.notifications} 
          onChange={v => setSettings(s => ({...s, notifications: v}))} 
        />
        <Toggle 
          label="Auto-Audit High Risk Contracts" 
          checked={settings.autoAudit} 
          onChange={v => setSettings(s => ({...s, autoAudit: v}))} 
        />
        <div className="flex items-center justify-between">
           <span className="text-gray-400 text-sm">Discord Webhook Status</span>
           <span className={`text-xs px-2 py-1 rounded border ${
             settings.discordAlerts 
               ? "bg-sentinel-green/10 text-sentinel-green border-sentinel-green/20" 
               : "bg-gray-500/10 text-gray-500 border-gray-500/20"
           }`}>
             {settings.discordAlerts ? "CONNECTED" : "DISCONNECTED"}
           </span>
        </div>
      </Section>

      <Section title="API Configuration" icon={Key}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-gray-400 uppercase">Auditor Endpoint</label>
            <input 
              type="text" 
              value="/api/audit" 
              disabled 
              className="w-full bg-sentinel-bg/30 border border-white/5 rounded-lg px-4 py-2 text-gray-400 font-mono text-sm cursor-not-allowed" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-400 uppercase">OpenRouter API Key</label>
             <div className="relative">
              <input 
                type="password" 
                value={settings.apiKey || "Configured in .env.local"} 
                disabled 
                className="w-full bg-sentinel-bg border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-sm pr-16" 
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-sentinel-green border border-sentinel-green/30 bg-sentinel-green/10 px-2 py-1 rounded">
                ACTIVE
              </span>
             </div>
             <p className="text-xs text-gray-500">
               API keys are managed in <code className="bg-white/5 px-1 py-0.5 rounded">.env.local</code> file
             </p>
          </div>
        </div>
      </Section>

       <Section title="Appearance" icon={Monitor}>
          <div className="grid grid-cols-3 gap-4">
            {["cyberpunk", "matrix", "neon"].map((theme) => (
              <button
                key={theme}
                onClick={() => setSettings(s => ({...s, theme}))}
                className={`
                  relative h-24 rounded-xl border-2 transition-all overflow-hidden group
                  ${settings.theme === theme ? "border-sentinel-blue" : "border-white/5 hover:border-white/20"}
                `}
              >
                <div className={`absolute inset-0 opacity-50 ${
                  theme === "cyberpunk" ? "bg-slate-900" : 
                  theme === "matrix" ? "bg-green-950" : 
                  "bg-purple-950"
                }`} />
                {settings.theme === theme && (
                  <div className="absolute top-2 right-2 bg-sentinel-blue text-white p-1 rounded-full">
                    <Check size={12} />
                  </div>
                )}
                <span className="absolute bottom-3 left-3 text-xs font-bold uppercase text-white tracking-wider">
                  {theme}
                </span>
              </button>
            ))}
          </div>
       </Section>

       {/* Settings Summary */}
       <div className="bg-sentinel-bg/50 border border-white/5 rounded-xl p-4 mt-6">
         <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Current Configuration</h4>
         <div className="grid grid-cols-2 gap-3 text-xs">
           <div>
             <span className="text-gray-500">Refresh:</span>
             <span className="text-white ml-2 font-mono">{settings.refreshInterval}m</span>
           </div>
           <div>
             <span className="text-gray-500">Theme:</span>
             <span className="text-white ml-2 capitalize">{settings.theme}</span>
           </div>
           <div>
             <span className="text-gray-500">Notifications:</span>
             <span className={settings.notifications ? "ml-2 text-sentinel-green" : "ml-2 text-gray-500"}>
               {settings.notifications ? "ON" : "OFF"}
             </span>
           </div>
           <div>
             <span className="text-gray-500">Auto-Audit:</span>
             <span className={settings.autoAudit ? "ml-2 text-sentinel-green" : "ml-2 text-gray-500"}>
               {settings.autoAudit ? "ON" : "OFF"}
             </span>
           </div>
         </div>
       </div>
    </div>
  );
}
