'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 1]);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <motion.nav
        className="sticky top-0 z-50 bg-[#00000f]/80 backdrop-blur-md"
        style={{
          borderBottomColor: useTransform(
            borderOpacity,
            (v) => `rgba(30, 58, 138, ${v * 0.3})`
          ),
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tighter uppercase transition-opacity hover:opacity-80">
              <div className="flex items-center justify-center transition-transform hover:scale-105">
                <Image src="/logo.png" alt="RivalScan Logo" width={36} height={36} className="rounded-xl object-contain" />
              </div>
              <span className="text-neutral-50">
                RivalScan
              </span>
              {/* Blue live status indicator */}
              <div className="live-dot ml-0.5" title="System operational" />
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-sm text-neutral-400 hover:text-neutral-100 transition-colors font-medium"
              >
                Home
              </Link>

              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-white/5"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>
      {/* Glowing blue separator line */}
      <div className="glow-line" />
    </>
  );
}
