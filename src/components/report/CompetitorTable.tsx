'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Competitor } from '@/lib/types';

interface CompetitorTableProps {
  competitors: Competitor[];
  targetCompany: string;
}

// Predefined gradient palette for company badges
const GRADIENT_PALETTE = [
  'from-purple-600 to-blue-600',
  'from-emerald-600 to-teal-600',
  'from-rose-600 to-pink-600',
  'from-amber-600 to-orange-600',
  'from-cyan-600 to-blue-600',
  'from-indigo-600 to-violet-600',
  'from-fuchsia-600 to-pink-600',
  'from-lime-600 to-green-600',
];

// Simple hash function to pick a gradient from the palette
function getGradientForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PALETTE.length;
  return GRADIENT_PALETTE[index];
}

export function CompetitorTable({ competitors, targetCompany }: CompetitorTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="overflow-x-auto rounded-2xl border border-neutral-800 print-section"
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-800 bg-neutral-800/50 sticky top-0 z-10">
            {['Company', 'Positioning', 'Key Strength', 'Pricing', 'Target Market', ''].map((col) => (
              <th
                key={col || 'action'}
                className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {competitors.map((comp, i) => {
            const isTarget = comp.name.toLowerCase().includes(targetCompany.toLowerCase());
            const gradient = getGradientForName(comp.name);
            return (
              <motion.tr
                key={comp.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={`competitor-row-reveal group transition-colors ${
                  isTarget
                    ? 'bg-blue-950/30 hover:bg-blue-950/50'
                    : 'hover:bg-white/[0.03]'
                }`}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm`}
                    >
                      {comp.name.charAt(0).toUpperCase()}
                    </div>
                    <span className={`font-medium ${isTarget ? 'text-blue-300 font-semibold' : 'text-neutral-200'}`}>
                      {comp.name}
                    </span>
                    {isTarget && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                        Target
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-neutral-400 max-w-[200px]">
                  <p className="line-clamp-2 font-medium">{comp.positioning}</p>
                </td>
                <td className="px-5 py-4 text-neutral-400 max-w-[160px]">
                  <p className="line-clamp-2 font-medium">{comp.strengths}</p>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                    {comp.pricing}
                  </span>
                </td>
                <td className="px-5 py-4 text-neutral-400 font-medium">
                  {comp.target}
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/report/${encodeURIComponent(comp.name)}`}
                    className="row-action text-xs font-semibold text-neutral-600 hover:text-blue-400 flex items-center gap-1 whitespace-nowrap transition-colors"
                  >
                    View details <ArrowRight className="w-3 h-3" />
                  </Link>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </motion.div>
  );
}
