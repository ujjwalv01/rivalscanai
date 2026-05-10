'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Search, ArrowRight, Globe, Brain, BarChart3, X, Clock, Zap, Flame, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const EXAMPLE_COMPANIES = ['Stripe', 'Notion', 'Figma', 'Linear', 'Vercel', 'Supabase', 'Loom', 'Retool'];

const HOW_IT_WORKS = [
  {
    icon: Globe,
    step: '01',
    title: 'Scrape',
    description: "We crawl the company's public website — homepage, about, pricing, and blog — to gather raw intelligence.",
    glowClass: 'card-glow-blue',
    gradientTextClass: 'gradient-text-blue',
  },
  {
    icon: Brain,
    step: '02',
    title: 'Analyze',
    description: 'Claude AI digests the content and performs deep competitive analysis grounded in the actual data.',
    glowClass: 'card-glow-blue',
    gradientTextClass: 'gradient-text-blue',
  },
  {
    icon: BarChart3,
    step: '03',
    title: 'Report',
    description: 'Get a structured intelligence report: SWOT, competitors, scoring radar, and recent news — in seconds.',
    glowClass: 'card-glow-blue',
    gradientTextClass: 'gradient-text-blue',
  },
];

const RECENT_KEY = 'rivalscan_recent_searches';

const HERO_WORDS = ['RESEARCH', 'ANY', 'COMPANY', 'IN', 'SECONDS'];

// Animated counter component
function AnimatedCounter({ target, duration = 2 }: { target: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.floor(v).toLocaleString());
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const controls = animate(count, target, {
      duration,
      ease: 'easeOut',
    });
    const unsubscribe = rounded.on('change', (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [count, target, duration, rounded]);

  return <span>{display}</span>;
}

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cycle placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeout(() => {
        setPlaceholderIndex((i) => (i + 1) % EXAMPLE_COMPANIES.length);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {}
  }, []);

  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (company: string) => {
    if (!company.trim()) return;
    const trimmed = company.trim();
    setIsSearching(true);

    // Save to recent searches
    const updated = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(0, 8);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch {}

    router.push(`/report/${encodeURIComponent(trimmed)}`);
  };

  const removeRecent = (search: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== search);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch {}
  };

  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleFeedbackSubmit = () => {
    if (!feedbackMessage.trim()) return;
    const body = `Name: ${feedbackName || 'Anonymous'}\n\nMessage: ${feedbackMessage}`;
    
    // Using the official Gmail web compose URL
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=ujjwalverma010305@gmail.com&su=RivalScan%20Feedback&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col bg-[#00000f]">
      {/* Hero Redesign */}
      <section className="hero-bg min-h-screen flex flex-col items-center justify-center relative px-4 overflow-hidden">
        {/* Perspective Grid Background Elements */}
        <div className="perspective-grid" />
        <div className="hero-glow" />
        
        {/* Dot grid overlay */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

        <div className="text-center max-w-4xl mx-auto relative z-10">
          {/* Staggered word reveal headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] mb-8 uppercase">
            <span className="flex flex-wrap justify-center gap-x-[0.3em]">
              {HERO_WORDS.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    delay: i * 0.1,
                    duration: 0.6,
                    ease: [0.25, 0.4, 0.25, 1],
                  }}
                  className={`inline-block ${
                    word === 'SECONDS'
                      ? 'gradient-text underline decoration-blue-500/30 underline-offset-[12px] decoration-4'
                      : 'text-neutral-50'
                  }`}
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, filter: 'blur(5px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl text-neutral-400 mb-8 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            RivalScan scrapes public data, runs deep AI analysis, and generates a full competitive intelligence report complete with SWOT, competitors, and market scores.
          </motion.p>

          {/* Animated counter stats row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 mb-10 text-sm font-semibold text-neutral-500"
          >
            <span className="flex items-center gap-1.5">
              <span className="text-blue-400 font-black"><AnimatedCounter target={10000} /></span>+ companies analyzed
            </span>
            <span className="w-1 h-1 rounded-full bg-blue-900/40" />
            <span className="flex items-center gap-1.5">
              <span className="text-blue-400 font-black"><AnimatedCounter target={4} duration={1} /></span> industries
            </span>
            <span className="w-1 h-1 rounded-full bg-blue-900/40" />
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Real-time data
            </span>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <div
              className={`relative flex items-center transition-all duration-500 rounded-[32px] search-glow ${
                focused
                  ? 'ring-1 ring-blue-500/40 outline outline-[12px] outline-blue-500/5 bg-neutral-950/80'
                  : 'shadow-2xl shadow-blue-950/20 bg-neutral-950/50'
              }`}
            >
              <Search className="absolute left-5 sm:left-6 w-5 h-5 text-neutral-500 pointer-events-none z-10" />
              <AnimatePresence mode="wait">
                <Input
                  ref={inputRef}
                  id="company-search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                  placeholder={`Try ${EXAMPLE_COMPANIES[placeholderIndex]}...`}
                  className="h-14 sm:h-20 pl-12 sm:pl-16 pr-16 sm:pr-44 text-base sm:text-xl rounded-[32px] border-neutral-800 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 font-medium text-neutral-100 placeholder:text-neutral-600 backdrop-blur-sm"
                />
              </AnimatePresence>
              <button
                id="analyze-button"
                onClick={() => handleSearch(query)}
                disabled={!query.trim() || isSearching}
                className="absolute right-1.5 sm:right-2.5 h-11 sm:h-16 px-4 sm:px-8 rounded-[24px] btn-shimmer text-white font-bold uppercase tracking-widest gap-2 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center border border-blue-400/20 shadow-lg shadow-blue-500/10 min-w-[120px]"
              >
                {isSearching ? (
                  <>
                    <Zap className="w-4 h-4 animate-pulse text-blue-400" />
                    <span className="hidden sm:inline relative z-10">Scanning</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline relative z-10">Analyze</span>
                    <ArrowRight className="w-5 h-5 sm:w-4 sm:h-4 relative z-10" />
                  </>
                )}
              </button>
            </div>

            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap items-center gap-2 mt-4 justify-center"
              >
                <span className="flex items-center gap-1 text-xs text-neutral-600 font-bold uppercase tracking-wider">
                  <Clock className="w-3 h-3" /> Recent:
                </span>
                {recentSearches.slice(0, 3).map((search) => (
                  <motion.button
                    key={search}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleSearch(search)}
                    className="group inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-neutral-900 text-neutral-400 hover:bg-blue-600/20 hover:text-blue-300 transition-all border border-neutral-800 hover:border-blue-500/30"
                  >
                    {search}
                    <span
                      onClick={(e) => removeRecent(search, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex items-center justify-center gap-6 mt-16 text-neutral-600"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Powered by</span>
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-blue-400 transition-colors">
                <Zap className="w-3.5 h-3.5 opacity-50" />
                Groq
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-blue-400 transition-colors">
                <Flame className="w-3.5 h-3.5 opacity-50" />
                Firecrawl
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-blue-400 transition-colors">
                <Sparkles className="w-3.5 h-3.5 opacity-50" />
                Claude AI
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-24 bg-[#010612] relative overflow-hidden">
        <div className="perspective-grid opacity-[0.03]" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-4 text-neutral-50">How it works</h2>
            <p className="text-neutral-500 text-lg font-medium">Three steps from company name to competitive insight</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
                className={`group p-8 rounded-[32px] border border-blue-900/20 bg-neutral-950/50 backdrop-blur-sm relative overflow-hidden transition-all hover:shadow-2xl hover:border-blue-500/30 ${item.glowClass}`}
              >
                <div className={`absolute top-6 right-8 text-8xl font-black select-none ${item.gradientTextClass} opacity-10`}>
                  {item.step}
                </div>
                <div className="inline-flex p-4 rounded-2xl bg-neutral-900 border border-neutral-800 mb-6 group-hover:rotate-6 transition-transform">
                  <item.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-black text-xl mb-3 uppercase tracking-tight text-neutral-50">{item.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed font-semibold relative z-10">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Feedback */}
      <section className="px-4 py-24 border-t border-blue-950 shadow-[0_-1px_20px_#1d4ed820] bg-[#00000a]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-neutral-600 mb-6">Contact Us</h2>
              <p className="text-xl text-neutral-100 font-bold mb-4">
                Have questions or need custom intelligence?
              </p>
              <div className="flex flex-col gap-4">
                <a 
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=ujjwalverma010305@gmail.com&su=RivalScan%20Inquiry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-neutral-400 hover:text-blue-400 transition-colors border-b-2 border-neutral-800 hover:border-blue-500 pb-1 font-semibold w-fit"
                >
                  ujjwalverma010305@gmail.com
                  <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('ujjwalverma010305@gmail.com');
                    alert('Email copied to clipboard!');
                  }}
                  className="text-[10px] uppercase font-black tracking-widest text-neutral-600 hover:text-neutral-100 transition-all text-left"
                >
                  Click to copy email
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-6"
            >
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-neutral-600 mb-6">Feedback</h2>
                <p className="text-xl text-neutral-100 font-bold mb-2">
                  Help us improve RivalScan
                </p>
                <p className="text-sm text-neutral-600 font-medium mb-6">
                  Your feedback drives our analysis. Tell us what you think.
                </p>
              </div>

              <div className="space-y-4">
                <Input 
                  placeholder="Your Name (Optional)"
                  value={feedbackName}
                  onChange={(e) => setFeedbackName(e.target.value)}
                  className="h-12 rounded-xl border-neutral-800 bg-neutral-900 focus:ring-1 focus:ring-blue-500/40 transition-all font-medium text-neutral-100 placeholder:text-neutral-700"
                />
                <textarea 
                  placeholder="Enter your message..."
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  className="w-full min-h-[120px] p-4 rounded-xl border border-neutral-800 bg-neutral-900 focus:ring-1 focus:ring-blue-500/40 transition-all font-medium text-sm resize-none text-neutral-100 placeholder:text-neutral-700"
                />
                <Button
                  onClick={handleFeedbackSubmit}
                  disabled={!feedbackMessage.trim()}
                  className="w-full rounded-xl h-12 btn-shimmer text-white font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 border-0"
                >
                  <span className="relative z-10">Submit Feedback</span>
                </Button>
              </div>
            </motion.div>
          </div>
          
          <div className="mt-24 pt-8 border-t border-neutral-900 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600">
            <span>© 2026 RivalScan</span>
            <span>Built for intelligence</span>
          </div>
        </div>
      </section>
    </div>
  );
}
