'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { readingHistoryApi } from '@/lib/api-client';
import { authClient } from '@/lib/auth-client';
import { BookmarkCheck, ArrowDown, X } from 'lucide-react';

interface ReadingProgressProps {
  articleId?: string;
  slug?: string;
  title?: string;
  category?: string;
  readingTime?: number;
  coverImage?: string;
}

export function ReadingProgress({
  articleId,
  slug,
  title,
  category,
  readingTime = 5,
  coverImage,
}: ReadingProgressProps) {
  const [completion, setCompletion] = useState(0);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [resumeData, setResumeData] = useState<{ position: number; percentage: number } | null>(null);
  
  const lastSavedPercentageRef = useRef(0);
  const lastSavedPositionRef = useRef(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to persist to localStorage
  const persistToLocalStorage = useCallback(
    (pct: number, pos: number) => {
      if (!articleId) return;
      try {
        const stored = localStorage.getItem('nexus_reading_history');
        let historyList: any[] = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(historyList)) historyList = [];

        const existingIdx = historyList.findIndex((h) => h.articleId === articleId || h.slug === slug);
        const historyItem = {
          articleId,
          slug,
          title,
          category,
          readingTime,
          coverImage,
          completionPercentage: Math.max(existingIdx >= 0 ? historyList[existingIdx].completionPercentage || 0 : 0, pct),
          lastPosition: pos,
          lastViewedAt: new Date().toISOString(),
        };

        if (existingIdx >= 0) {
          historyList[existingIdx] = { ...historyList[existingIdx], ...historyItem };
        } else {
          historyList.unshift(historyItem);
        }

        // Limit local history cache to latest 50 items
        if (historyList.length > 50) historyList = historyList.slice(0, 50);

        localStorage.setItem('nexus_reading_history', JSON.stringify(historyList));
      } catch {
        // Storage failover
      }
    },
    [articleId, slug, title, category, readingTime, coverImage]
  );

  // Helper to sync with backend API
  const syncToApi = useCallback(
    async (pct: number, pos: number) => {
      if (!articleId) return;
      if (!authClient.isAuthenticated()) return;

      try {
        await readingHistoryApi.updateProgress({
          articleId,
          completionPercentage: pct,
          lastPosition: pos,
        });
      } catch {
        // Silent catch for background sync
      }
    },
    [articleId]
  );

  // Check for previous reading position to show Resume prompt
  useEffect(() => {
    if (!articleId) return;

    const checkPreviousProgress = async () => {
      try {
        let prevPos = 0;
        let prevPct = 0;

        // Try local storage first
        const stored = localStorage.getItem('nexus_reading_history');
        if (stored) {
          const list = JSON.parse(stored);
          const found = list.find((item: any) => item.articleId === articleId || item.slug === slug);
          if (found && found.lastPosition && found.completionPercentage > 5 && found.completionPercentage < 90) {
            prevPos = found.lastPosition;
            prevPct = found.completionPercentage;
          }
        }

        // If authenticated and no local position, check backend
        if (!prevPos && authClient.isAuthenticated()) {
          const apiRes = await readingHistoryApi.getArticleProgress(articleId).catch(() => null);
          if (apiRes && apiRes.lastPosition > 300 && apiRes.completionPercentage < 90) {
            prevPos = apiRes.lastPosition;
            prevPct = apiRes.completionPercentage;
          }
        }

        if (prevPos > 300 && prevPct >= 10 && prevPct <= 85) {
          setResumeData({ position: prevPos, percentage: prevPct });
          setShowResumeBanner(true);
        }
      } catch {
        // Ignore
      }
    };

    const timer = setTimeout(checkPreviousProgress, 800);
    return () => clearTimeout(timer);
  }, [articleId, slug]);

  // Main scroll listener & progress calculator
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollHeight <= 0) return;

      const rawPct = (currentScroll / scrollHeight) * 100;
      let calculatedPct = Math.min(100, Math.max(0, Math.round(rawPct)));

      // If user reaches 85% or beyond, consider the content effectively 100% completed
      if (calculatedPct >= 85) {
        calculatedPct = 100;
      }

      setCompletion(calculatedPct);

      if (!articleId) return;

      // Track progress changes
      const diff = Math.abs(calculatedPct - lastSavedPercentageRef.current);
      if (diff >= 5 || calculatedPct === 100 || (calculatedPct > 0 && lastSavedPercentageRef.current === 0)) {
        lastSavedPercentageRef.current = calculatedPct;
        lastSavedPositionRef.current = currentScroll;

        // Persist locally immediately
        persistToLocalStorage(calculatedPct, currentScroll);

        // Debounce backend sync
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          syncToApi(calculatedPct, currentScroll);
        }, 2000);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial calculate on mount
    handleScroll();

    // Flush progress on unmount or tab switch
    const handleVisibilityOrUnload = () => {
      if (articleId && lastSavedPercentageRef.current > 0) {
        persistToLocalStorage(lastSavedPercentageRef.current, window.scrollY);
        syncToApi(lastSavedPercentageRef.current, window.scrollY);
      }
    };

    window.addEventListener('beforeunload', handleVisibilityOrUnload);
    document.addEventListener('visibilitychange', handleVisibilityOrUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleVisibilityOrUnload);
      document.removeEventListener('visibilitychange', handleVisibilityOrUnload);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      handleVisibilityOrUnload();
    };
  }, [articleId, persistToLocalStorage, syncToApi]);

  const handleJumpToPosition = () => {
    if (resumeData?.position) {
      window.scrollTo({
        top: resumeData.position,
        behavior: 'smooth',
      });
    }
    setShowResumeBanner(false);
  };

  return (
    <>
      {/* Top Fixed Progress Bar */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-border/20 pointer-events-none"
      >
        <div
          className="h-full bg-gradient-to-r from-primary via-indigo-500 to-sky-400 transition-all duration-100 ease-out shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
          style={{ width: `${Math.min(Math.max(completion, 0), 100)}%` }}
        />
      </div>

      {/* Floating Resume Reading Notification */}
      {showResumeBanner && resumeData && (
        <aside
          role="region"
          aria-label="Resume reading notification"
          className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
        >
          <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-card/95 p-3.5 shadow-xl backdrop-blur-md max-w-sm text-foreground">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <BookmarkCheck className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs font-semibold text-foreground leading-tight truncate">
                Pick up where you left off
              </p>
              <p className="text-[11px] text-muted-foreground font-mono">
                Previous progress: <span className="text-primary font-bold">{resumeData.percentage}%</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleJumpToPosition}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-xs font-semibold font-mono hover:opacity-90 transition-opacity cursor-pointer"
              >
                <span>Jump</span>
                <ArrowDown className="h-3 w-3" />
              </button>
              <button
                onClick={() => setShowResumeBanner(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Dismiss resume prompt"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
