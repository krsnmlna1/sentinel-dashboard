import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import Scout from './pages/Scout';
import Auditor from './pages/Auditor';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-sentinel-bg text-sentinel-text font-mono relative overflow-x-hidden selection:bg-sentinel-blue/30 selection:text-white">
        
        {/* Global Background Grid/Effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-sentinel-bg/80"></div>
          {/* Ambient Glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-sentinel-blue/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]"></div>
        </div>

        <Navbar />

        <main className="relative z-10 pt-24 px-4 md:px-8 max-w-7xl mx-auto pb-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scout" element={<Scout />} />
            <Route path="/auditor" element={<Auditor />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

      </div>
    </HashRouter>
  );
};

export default App;