'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  RefreshCw,
  ArrowLeft,
  Globe,
  Brain,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OverviewCard } from '@/components/report/OverviewCard';
import { SwotAnalysis } from '@/components/report/SwotAnalysis';
import { CompetitorTable } from '@/components/report/CompetitorTable';
import { RadarSpiderChart } from '@/components/report/RadarSpiderChart';
import { NewsFeed } from '@/components/report/NewsFeed';
import { ResearchReport, ResearchStatus } from '@/lib/types';

import { SidebarNav, MobileSectionNav } from '@/components/report/SidebarNav';

const STATUS_STEPS: { status: ResearchStatus; label: string; icon: typeof Globe }[] = [
  { status: 'scraping', label: 'Scraping', icon: Globe },
  { status: 'reading', label: 'Reading', icon: Brain },
  { status: 'generating', label: 'Generating', icon: FileText },
];

function StatusBar({ status, message }: { status: ResearchStatus; message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 px-6 bg-neutral-900/50 backdrop-blur-xl rounded-[40px] border border-blue-900/20 shadow-2xl relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-400/10 blur-[100px] rounded-full" />

      <div className="relative w-24 h-24 mb-10">
        <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping" />
        <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-[spin_2s_linear_infinite]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Brain className="w-10 h-10 text-blue-500" />
          </motion.div>
        </div>
      </div>

      <div className="text-center space-y-2 mb-10">
        <h2 className="text-3xl font-black text-neutral-50 tracking-tight uppercase italic">
          {message}
        </h2>
        <p className="text-sm text-neutral-500 font-bold uppercase tracking-[0.3em]">
          Synthesizing Intelligence
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        {STATUS_STEPS.map((step, i) => {
          const stepIndex = STATUS_STEPS.findIndex((s) => s.status === status);
          const isDone = i < stepIndex;
          const isActive = step.status === status;
          return (
            <div key={step.status} className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 border ${
                    isDone
                      ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                      : isActive
                      ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)]'
                      : 'bg-neutral-800/50 border-neutral-700 text-neutral-600'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-blue-400' : isDone ? 'text-blue-500' : 'text-neutral-600'}`}>
                  {step.label}
                </span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className="w-12 h-[2px] bg-neutral-800 mb-6 relative">
                  {isDone && <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="absolute inset-0 bg-blue-500/50" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// Typewriter effect for company name
function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowCursor(false), 800);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      {showCursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
          className="inline-block w-[3px] h-[0.85em] bg-blue-500 ml-0.5 align-text-bottom"
        />
      )}
    </span>
  );
}

const SECTION_IDS = ['overview', 'swot', 'competitors', 'news'];

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const company = decodeURIComponent(params.company as string);

  const [status, setStatus] = useState<ResearchStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // IntersectionObserver scroll spy
  useEffect(() => {
    if (!report || !report.isValid) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        
        if (visible.length > 0) {
          const id = visible[0].target.id.replace('section-', '');
          setActiveSection(id);
        }
      },
      {
        rootMargin: '-100px 0px -40% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    const timer = setTimeout(() => {
      SECTION_IDS.forEach((id) => {
        const el = document.getElementById(`section-${id}`);
        if (el) observer.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [report]);

  const fetchReport = async () => {
    setStatus('scraping');
    setStatusMessage('Initiating scan...');
    setReport(null);
    setError(null);
    setIsRefreshing(false);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const raw = line.slice(6).trim();
            if (!raw) continue;
            try {
              const msg = JSON.parse(raw);
              
              if (msg.status && msg.status !== status) setStatus(msg.status);
              if (msg.message && msg.message !== statusMessage) setStatusMessage(msg.message);

              if (msg.data) {
                setReport(msg.data);
                setStatus('done');
              }
              if (msg.status === 'error') {
                setError(msg.error || msg.message);
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setStatus('error');
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  useEffect(() => {
    fetchReport();
    return () => abortRef.current?.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchReport();
  };

  const handleExportPDF = () => {
    window.print();
  };

  const logoUrl = `https://logo.clearbit.com/${company.toLowerCase().replace(/\s+/g, '')}.com`;

  // Blue gradient pill colors
  const TAG_GRADIENTS = [
    'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300',
    'from-blue-600/20 to-indigo-600/20 border-blue-600/30 text-blue-200',
    'from-cyan-500/20 to-teal-500/20 border-cyan-500/30 text-cyan-300',
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] report-bg transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 no-print">
          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/')}
              className="rounded-xl border-blue-900/30 bg-neutral-900 transition-transform active:scale-90 text-neutral-400 hover:text-blue-400 hover:bg-neutral-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                whileHover={{ scale: 1.05 }}
                className="relative p-0.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400"
              >
                <div className="bg-neutral-900 p-1.5 rounded-[14px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt={`${company} logo`}
                    className="w-11 h-11 rounded-xl object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </motion.div>
              <div>
                <h1 className="text-3xl font-black tracking-tight leading-none uppercase text-neutral-50">
                  <TypewriterText text={company} />
                </h1>
                {report && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {report.overview.tags?.slice(0, 3).map((tag, i) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r border ${TAG_GRADIENTS[i % TAG_GRADIENTS.length]}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={status !== 'done' && status !== 'error'}
              className="gap-2.5 rounded-xl border-blue-900/30 h-11 px-5 font-bold bg-neutral-900 text-neutral-300 hover:text-blue-400 hover:bg-neutral-800"
            >
              <RefreshCw className={`w-4 h-4 transition-transform ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleExportPDF}
              disabled={!report}
              className="download-bounce gap-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white h-11 px-6 font-bold shadow-lg shadow-blue-500/20"
            >
              <Download className="w-4 h-4 download-icon" />
              Export Result
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {status === 'error' && !report && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10 text-rose-500" />
              </div>
              <h2 className="text-3xl font-black mb-3 italic uppercase text-neutral-50">Error Encountered</h2>
              <p className="text-neutral-500 mb-8 max-w-sm mx-auto font-medium">{error}</p>
              <Button onClick={fetchReport} className="gap-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl h-12 px-8 font-black uppercase tracking-widest shadow-xl">
                <RefreshCw className="w-5 h-5" />
                Try Re-scanning
              </Button>
            </motion.div>
          )}

          {(status === 'scraping' || status === 'reading' || status === 'generating') && !report && (
            <StatusBar status={status} message={statusMessage} />
          )}

          {report && !report.isValid && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-3xl bg-neutral-900 flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-neutral-500" />
              </div>
              <h2 className="text-3xl font-black mb-3 italic uppercase text-neutral-50">Company Not Found</h2>
              <p className="text-neutral-500 mb-8 max-w-sm mx-auto font-medium">
                We couldn&apos;t find verifiable data for &quot;{company}&quot;. Please check the spelling or try another company name.
              </p>
              <Button onClick={() => router.push('/')} className="gap-3 bg-neutral-50 text-black rounded-2xl h-12 px-8 font-black uppercase tracking-widest shadow-xl hover:bg-neutral-200">
                Try Another Search
              </Button>
            </motion.div>
          )}

          {report && report.isValid && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 items-start"
            >
              <SidebarNav activeSection={activeSection} />
              <MobileSectionNav activeSection={activeSection} />
              
              <main className="min-w-0 space-y-12">
                <section id="section-overview">
                  <div className="bg-neutral-900/50 backdrop-blur-xl rounded-[32px] border border-blue-900/10 p-8 sm:p-12 shadow-2xl transition-all">
                    <OverviewCard overview={report.overview} />
                  </div>
                </section>

                <section id="section-swot">
                  <SwotAnalysis swot={report.swot} />
                </section>

                <section id="section-competitors" className="space-y-10">
                  <div className="bg-neutral-900/90 backdrop-blur-xl rounded-[32px] border border-blue-900/20 p-4 sm:p-6 shadow-xl">
                    <CompetitorTable competitors={report.competitors} targetCompany={company} />
                  </div>

                  <div className="bg-neutral-900/90 backdrop-blur-xl rounded-[32px] border border-blue-900/20 p-8 sm:p-12 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                    <h3 className="font-black text-2xl mb-10 tracking-tight leading-none uppercase flex items-center gap-3 text-neutral-50">
                      <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full" />
                      Market Score Radar
                    </h3>
                    <div className="h-[450px]">
                      <RadarSpiderChart scores={report.scores} company={company} />
                    </div>
                  </div>
                </section>

                <section id="section-news">
                  <NewsFeed news={report.news} />
                </section>
              </main>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
