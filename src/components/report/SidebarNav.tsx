'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, TrendingUp, Users, Newspaper } from 'lucide-react';

interface SidebarNavProps {
  activeSection: string;
}

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, activeColor: 'text-blue-400' },
  { id: 'swot', label: 'SWOT Analysis', icon: TrendingUp, activeColor: 'text-blue-500' },
  { id: 'competitors', label: 'Market Context', icon: Users, activeColor: 'text-cyan-400' },
  { id: 'news', label: 'Intelligence', icon: Newspaper, activeColor: 'text-indigo-400' },
];

export function SidebarNav({ activeSection }: SidebarNavProps) {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
      const navOffset = 100;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="hidden lg:block sticky top-28 h-fit space-y-8">
      <div className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`w-full group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative ${
                isActive 
                  ? 'bg-blue-600/10 text-white font-bold' 
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${isActive ? item.activeColor : 'group-hover:text-neutral-300'}`} />
              <span className="text-sm tracking-tight">{item.label}</span>
              
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_12px_rgba(37,99,235,0.8)]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Progress bar container */}
      <div className="px-4 py-6 border-t border-blue-900/10 space-y-4">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">
          <span>Report Progress</span>
          <span className="text-blue-500">
            {Math.round(((NAV_ITEMS.findIndex(n => n.id === activeSection) + 1) / NAV_ITEMS.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((NAV_ITEMS.findIndex(n => n.id === activeSection) + 1) / NAV_ITEMS.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
          />
        </div>
      </div>
    </div>
  );
}

export function MobileSectionNav({ activeSection }: { activeSection: string }) {
  return (
    <div className="lg:hidden sticky top-16 z-30 bg-[#00000f]/90 backdrop-blur-md border-b border-blue-900/20 -mx-4 px-4 mb-8 overflow-x-auto no-scrollbar">
      <div className="flex gap-2 py-3">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
              }`}
              onClick={() => {
                const el = document.getElementById(`section-${item.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
