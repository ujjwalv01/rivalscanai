'use client';

import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Calendar } from 'lucide-react';
import { NewsItem } from '@/lib/types';

interface NewsFeedProps {
  news: NewsItem[];
}

export function NewsFeed({ news }: NewsFeedProps) {
  if (!news || news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-neutral-900/30 rounded-[32px] border border-dashed border-neutral-800">
        <Newspaper className="w-12 h-12 text-neutral-800 mb-4" />
        <p className="text-neutral-500 font-medium italic">No intelligence signals detected yet...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="space-y-10"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20">
          <Newspaper className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold uppercase tracking-tight leading-none text-neutral-50">Intelligence Feed</h3>
          <p className="text-sm text-neutral-500 mt-1 font-semibold tracking-tight uppercase tracking-[0.1em]">Latest market movements and press coverage</p>
        </div>
      </div>

      <div className="grid gap-6">
        {news.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
            className="group relative overflow-hidden bg-neutral-900/40 backdrop-blur-sm rounded-[32px] border border-neutral-800 hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5"
          >
            <div className="flex flex-col md:flex-row">
              {/* Sidebar Source Name */}
              <div className="md:w-20 shrink-0 flex md:flex-col items-center justify-center py-6 px-3 bg-neutral-800/20 border-b md:border-b-0 md:border-r border-neutral-800 transition-colors group-hover:bg-blue-500/10">
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-600 md:[writing-mode:vertical-lr] md:rotate-180 whitespace-nowrap group-hover:text-blue-400">
                  {item.source}
                </span>
              </div>

              <div className="flex-1 p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-neutral-500 uppercase tracking-widest">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.date}
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-semibold uppercase tracking-widest ${
                        item.sentiment === 'positive' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : item.sentiment === 'negative'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${
                          item.sentiment === 'positive' ? 'bg-emerald-500' : item.sentiment === 'negative' ? 'bg-rose-500' : 'bg-neutral-500'
                        }`} />
                        {item.sentiment}
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-semibold text-neutral-100 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-neutral-400 transition-all duration-500">
                      {item.headline}
                    </h4>
                    
                    <p className="text-neutral-400 leading-relaxed font-medium line-clamp-3">
                      {item.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-end md:self-end">
                    <a 
                      href={`https://www.google.com/search?q=${encodeURIComponent(item.headline + " " + item.source)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group/link rounded-xl flex items-center gap-2 px-4 py-2 font-semibold text-[10px] uppercase tracking-widest text-neutral-500 hover:text-white hover:bg-blue-600 transition-all duration-300 border border-neutral-800 hover:border-blue-500"
                    >
                      Read Source
                      <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Subtle bottom glow accent */}
            <div className={`absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
              item.sentiment === 'positive' ? 'bg-emerald-500/50' : item.sentiment === 'negative' ? 'bg-rose-500/50' : 'bg-blue-500/50'
            }`} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
