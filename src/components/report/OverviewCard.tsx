'use client';

import { motion } from 'framer-motion';
import { Building2, MapPin, Users, Layers, TrendingUp, Quote, DollarSign, Cpu, Target, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CompanyOverview } from '@/lib/types';

interface OverviewCardProps {
  overview: CompanyOverview;
}

function ScoreRing({ score }: { score: number }) {
  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-neutral-800"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke="url(#scoreGradient)"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
          className="text-lg font-bold text-neutral-100"
        >
          {score}
        </motion.span>
        <span className="text-[8px] font-semibold uppercase tracking-wider text-neutral-500">Score</span>
      </div>
    </div>
  );
}

function calculateScore(overview: CompanyOverview): number {
  let score = 50;
  if (overview.founded) score += 8;
  if (overview.hq) score += 7;
  if (overview.employees) score += 10;
  if (overview.stage) score += 5;
  if (overview.positioning && overview.positioning.length > 50) score += 10;
  if (overview.tags && overview.tags.length >= 3) score += 10;
  return Math.min(100, score);
}

export function OverviewCard({ overview }: OverviewCardProps) {
  const meta = [
    { icon: Building2, label: 'Founded', value: overview.founded },
    { icon: MapPin, label: 'HQ', value: overview.hq },
    { icon: Users, label: 'Employees', value: overview.employees },
    { icon: Layers, label: 'Stage', value: overview.stage },
  ];

  const intelMatrix = [
    { icon: DollarSign, label: 'Revenue', value: overview.revenue || 'Private' },
    { icon: Briefcase, label: 'Business Model', value: overview.businessModel || 'SaaS' },
    { icon: Target, label: 'Audience', value: overview.targetAudience || 'Enterprise' },
  ];

  const companyScore = calculateScore(overview);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="print-section space-y-12 relative"
    >
      <div className="absolute -top-2 -right-2 sm:top-0 sm:right-0">
        <ScoreRing score={companyScore} />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="pr-24"
      >
        <p className="text-3xl sm:text-4xl font-semibold text-neutral-50 leading-tight tracking-tight uppercase">
          {overview.oneliner}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {meta.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(37, 99, 235, 0.1)' }}
            className="group p-4 sm:p-6 rounded-2xl border border-blue-900/10 bg-neutral-900/50 hover:border-blue-500/30 transition-all duration-300 min-w-0 cursor-default"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 rounded-lg bg-neutral-800 text-neutral-100 shrink-0">
                <item.icon className="w-3.5 h-3.5 sm:w-4 h-4" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.2em] truncate">
                {item.label}
              </span>
            </div>
            <p className="font-semibold text-neutral-50 text-lg sm:text-xl break-words line-clamp-2">
              {item.value || 'Unknown'}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {intelMatrix.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-4 p-5 rounded-2xl bg-neutral-950/50 border border-neutral-800/50 group hover:border-blue-500/20 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/5 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest mb-0.5">{item.label}</p>
              <p className="text-neutral-200 font-medium">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="relative overflow-hidden p-8 rounded-[32px] bg-neutral-950/50 border border-blue-900/20 shadow-2xl"
      >
        <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-gradient-to-b from-blue-600 to-blue-400 rounded-full" />
        
        <div className="absolute top-6 left-6 opacity-10">
          <Quote className="w-12 h-12 text-blue-400" />
        </div>
        
        <div className="relative pl-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
               <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-sm text-neutral-100 uppercase tracking-[0.15em]">
              Market Positioning
            </h3>
          </div>
          <p className="text-neutral-300 text-lg leading-relaxed font-medium italic">
            {overview.positioning}
          </p>
        </div>
      </motion.div>

      {overview.techStack && overview.techStack.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1">
             <Cpu className="w-4 h-4 text-blue-500" />
             <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Technology Stack</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {overview.techStack.map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="rounded-lg px-3 py-1 text-[10px] font-medium border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:text-blue-400 hover:border-blue-500/30 transition-all"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {overview.tags && overview.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center gap-3 pt-4 border-t border-neutral-900"
        >
          {overview.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="rounded-xl px-4 py-1.5 text-xs font-semibold uppercase tracking-widest bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-blue-600/20 hover:text-blue-300 hover:border-blue-500/30 transition-colors duration-300"
            >
              {tag}
            </Badge>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
