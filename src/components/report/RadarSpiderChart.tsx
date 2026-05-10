'use client';

import { motion } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { CompanyScores } from '@/lib/types';

interface RadarSpiderChartProps {
  scores: CompanyScores;
  company: string;
}

const AXIS_LABELS: Record<keyof CompanyScores, string> = {
  product: 'Product',
  pricing: 'Pricing',
  market_presence: 'Market Presence',
  brand: 'Brand',
  tech: 'Technology',
  community: 'Community',
};

// Industry average baseline scores
const INDUSTRY_AVERAGES: CompanyScores = {
  product: 6.2,
  pricing: 5.8,
  market_presence: 5.5,
  brand: 5.9,
  tech: 6.0,
  community: 5.4,
};

export function RadarSpiderChart({ scores, company }: RadarSpiderChartProps) {
  const data = (Object.keys(AXIS_LABELS) as (keyof CompanyScores)[]).map((key) => ({
    axis: AXIS_LABELS[key],
    [company]: scores[key] ?? 5,
    'Industry Avg': INDUSTRY_AVERAGES[key],
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="print-section relative h-full"
    >
      {/* Background glow for premium feel */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 blur-[80px] pointer-events-none rounded-full hidden lg:block" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center h-full">
        {/* Chart */}
        <div className="h-full w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <PolarGrid
                stroke="currentColor"
                className="text-neutral-800"
                strokeDasharray="3 3"
              />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fontSize: 10, fill: 'currentColor', className: 'hidden sm:block text-neutral-500 font-semibold uppercase tracking-widest' }}
                className="hidden sm:block"
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 10]}
                tick={{ fontSize: 10, fill: '#404040' }}
                tickCount={6}
              />
              <Radar
                name={company}
                dataKey={company}
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Radar
                name="Industry Avg"
                dataKey="Industry Avg"
                stroke="#1d4ed8"
                fill="#1d4ed8"
                fillOpacity={0.05}
                strokeWidth={1.5}
                strokeDasharray="5 3"
              />
              <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '20px', color: '#737373' }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '16px',
                  border: '1px solid #1e3a8a40',
                  background: '#00000f',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  fontSize: '12px',
                  color: '#e5e5e5',
                }}
                itemStyle={{ fontWeight: 'bold' }}
                formatter={(value) => [typeof value === 'number' ? value.toFixed(1) : value, '']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Score breakdown */}
        <div className="space-y-4">
          {(Object.keys(AXIS_LABELS) as (keyof CompanyScores)[]).map((key, i) => {
            const score = scores[key] ?? 5;
            const pct = (score / 10) * 100;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-4"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 w-28 flex-shrink-0">
                  {AXIS_LABELS[key]}
                </span>
                <div className="flex-1 h-2 bg-neutral-900 border border-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 + 0.2, duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                  />
                </div>
                <span className="text-sm font-black text-neutral-100 w-8 text-right italic">
                  {score.toFixed(1)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
