import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw, Monitor, Bell, Key, Database, Check } from 'lucide-react';
import { SettingsState } from '../types';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
    refreshInterval: 5,
    notifications: true,
    autoAudit: false,
    discordAlerts: true,
    theme: 'cyberpunk'
  });

  const Section: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
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

  const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between group">
      <span className="text-sentinel-muted text-sm group-hover:text-white transition-colors">{label}</span>
      <button 
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${checked ? 'bg-sentinel-blue' : 'bg-white/10'}`}
      >
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
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
        <h1 className="text-3xl font-bold text-white">SYSTEM <span className="text-sentinel-muted">CONFIG</span></h1>
        <div className="flex gap-3">
          <button className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-sentinel-muted hover:text-white transition-colors">
            <RotateCcw size={20} />
          </button>
          <button className="px-6 py-2 rounded-lg bg-sentinel-blue hover:bg-sentinel-blue/90 text-white font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)]">
            <Save size={18} /> SAVE
          </button>
        </div>
      </motion.div>

      <Section title="Data Feed" icon={Database}>
        <div className="flex items-center justify-between">
          <label className="text-sentinel-muted text-sm">Auto-Refresh Interval (minutes)</label>
          <div className="flex items-center gap-2 bg-sentinel-bg rounded-lg border border-white/10 p-1">
             <button 
                onClick={() => setSettings(s => ({...s, refreshInterval: Math.max(1, s.refreshInterval - 1)}))}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded text-white"
             >-</button>
             <span className="w-8 text-center font-mono text-white">{settings.refreshInterval}</span>
             <button 
                onClick={() => setSettings(s => ({...s, refreshInterval: s.refreshInterval + 1}))}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded text-white"
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
           <span className="text-sentinel-muted text-sm">Discord Webhook Status</span>
           <span className="text-xs px-2 py-1 rounded bg-sentinel-green/10 text-sentinel-green border border-sentinel-green/20">CONNECTED</span>
        </div>
      </Section>

      <Section title="API Configuration" icon={Key}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-sentinel-muted uppercase">Auditor Endpoint</label>
            <input type="text" value="https://api.sentinel.ai/v1/audit" disabled className="w-full bg-sentinel-bg/30 border border-white/5 rounded-lg px-4 py-2 text-sentinel-muted font-mono text-sm cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-sentinel-muted uppercase">OpenRouter API Key</label>
             <div className="relative">
              <input type="password" value="sk-or-xxxxxxxxxxxx" disabled className="w-full bg-sentinel-bg border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-sm" />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-sentinel-blue hover:text-white transition-colors">EDIT</button>
             </div>
          </div>
        </div>
      </Section>

       <Section title="Appearance" icon={Monitor}>
          <div className="grid grid-cols-3 gap-4">
            {['cyberpunk', 'matrix', 'neon'].map((theme) => (
              <button
                key={theme}
                onClick={() => setSettings(s => ({...s, theme: theme as any}))}
                className={`
                  relative h-24 rounded-xl border-2 transition-all overflow-hidden group
                  ${settings.theme === theme ? 'border-sentinel-blue' : 'border-white/5 hover:border-white/20'}
                `}
              >
                <div className={`absolute inset-0 opacity-50 ${theme === 'cyberpunk' ? 'bg-slate-900' : theme === 'matrix' ? 'bg-green-950' : 'bg-purple-950'}`} />
                {settings.theme === theme && (
                  <div className="absolute top-2 right-2 bg-sentinel-blue text-white p-1 rounded-full">
                    <Check size={12} />
                  </div>
                )}
                <span className="absolute bottom-3 left-3 text-xs font-bold uppercase text-white tracking-wider">{theme}</span>
              </button>
            ))}
          </div>
       </Section>
    </div>
  );
};

export default Settings;