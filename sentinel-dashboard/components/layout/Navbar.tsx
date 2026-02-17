"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, LayoutDashboard, Radio, FileText, Settings, Activity } from "lucide-react";
import { motion } from "framer-motion";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "DASHBOARD", path: "/dashboard", icon: LayoutDashboard },
    { name: "AUDITOR", path: "/auditor", icon: FileText },
    { name: "AGENT", path: "/agent", icon: Activity },
    { name: "SETTINGS", path: "/settings", icon: Settings },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-sentinel-bg/80 backdrop-blur-xl h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-sentinel-blue/20 blur-lg rounded-full animate-pulse"></div>
            <ShieldAlert className="w-8 h-8 text-sentinel-blue relative z-10 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-widest text-white leading-none">
              SENTINEL
            </span>
            <span className="text-[10px] text-sentinel-blue/80 tracking-[0.2em] leading-none mt-1">
              COMMAND CENTER
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  relative px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-300
                  ${isActive 
                    ? 'text-sentinel-blue bg-sentinel-blue/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <Icon size={16} />
                {item.name}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-sentinel-blue shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* System Status - Decorative */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-gray-400 border-l border-white/10 pl-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sentinel-green animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span>SYSTEM ONLINE</span>
          </div>
          <div className="flex items-center gap-2 text-sentinel-blue">
            <Activity size={14} />
            <span>NET: 42ms</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
