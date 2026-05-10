'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Lightbulb, AlertTriangle } from 'lucide-react';
import { SwotAnalysis as SwotType } from '@/lib/types';

interface SwotAnalysisProps {
  swot: SwotType;
}

const QUADRANTS = [
  {
    key: 'strengths' as const,
    label: 'Strengths',
    icon: TrendingUp,
    direction: { x: -40, y: 0 },
    border: 'border-blue-900/20 border-l-blue-500 border-l-4',
    iconColor: 'text-blue-400',
    dotColor: 'bg-blue-500',
    hoverDotColor: 'bg-blue-400',
  },
  {
    key: 'weaknesses' as const,
    label: 'Weaknesses',
    icon: TrendingDown,
    direction: { x: 40, y: 0 },
    border: 'border-blue-900/20 border-l-indigo-500 border-l-4',
    iconColor: 'text-indigo-400',
    dotColor: 'bg-indigo-500',
    hoverDotColor: 'bg-indigo-400',
  },
  {
    key: 'opportunities' as const,
    label: 'Opportunities',
    icon: Lightbulb,
    direction: { x: -40, y: 0 },
    border: 'border-blue-900/20 border-l-cyan-500 border-l-4',
    iconColor: 'text-cyan-400',
    dotColor: 'bg-cyan-500',
    hoverDotColor: 'bg-cyan-400',
  },
  {
    key: 'threats' as const,
    label: 'Threats',
    icon: AlertTriangle,
    direction: { x: 40, y: 0 },
    border: 'border-blue-900/20 border-l-blue-700 border-l-4',
    iconColor: 'text-blue-600',
    dotColor: 'bg-blue-700',
    hoverDotColor: 'bg-blue-600',
  },
];

export function SwotAnalysis({ swot }: SwotAnalysisProps) {
  const data = QUADRANTS.map((q) => ({
    ...q,
    items: swot[q.key] || [],
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      {data.map((item, i) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, x: item.direction.x, y: item.direction.y }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: i * 0.1, duration: 0.6, type: 'spring', bounce: 0.2 }}
          className={`relative overflow-hidden p-8 rounded-[32px] border ${item.border} bg-neutral-900/60 backdrop-blur-sm h-full shadow-2xl transition-all duration-500 hover:scale-[1.01] group`}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className={`p-3 rounded-2xl ${item.iconColor} bg-neutral-800 shadow-sm transition-transform group-hover:rotate-12`}>
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-widest leading-none text-neutral-100">
              {item.label}
            </h3>
          </div>

          <ul className="space-y-4 relative">
            {item.items.map((point: string, idx: number) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + idx * 0.05 }}
                className="swot-bullet-hover flex items-start gap-4 text-neutral-400 group/item cursor-default"
              >
                <div className={`swot-dot mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.dotColor} ring-4 ring-neutral-800/50 transition-all`} />
                <span className="font-medium leading-relaxed tracking-tight group-hover:text-neutral-200 transition-colors">{point}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}
