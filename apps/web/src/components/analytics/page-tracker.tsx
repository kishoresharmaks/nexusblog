'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent } from '@/lib/telemetry';

export function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sentScrollMilestones = useRef<Set<number>>(new Set());

  // 1. Pageview Tracking
  useEffect(() => {
    if (!pathname) return;
    const queryString = searchParams?.toString();
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname;
    sentScrollMilestones.current.clear();

    trackEvent('PAGEVIEW', {
      path: fullPath,
    });
  }, [pathname, searchParams]);

  // 2. Reading Scroll Depth Milestones (25%, 50%, 75%, 100%)
  useEffect(() => {
    if (!pathname || !pathname.startsWith('/articles/')) return;

    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight <= 0) return;

        const scrollPercent = Math.min(100, Math.round((scrollTop / scrollHeight) * 100));

        [25, 50, 75, 100].forEach((milestone) => {
          if (scrollPercent >= milestone && !sentScrollMilestones.current.has(milestone)) {
            sentScrollMilestones.current.add(milestone);
            trackEvent('SCROLL_DEPTH', {
              path: pathname,
              scrollDepth: milestone,
            });
          }
        });
      }, 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [pathname]);

  // 3. Code Copy Interaction Listener (Keyboard / Selection copy)
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.closest('pre') || target.closest('code') || target.closest('[data-code-block]'))) {
        trackEvent('CODE_COPY', {
          path: pathname || '/',
        });
      }
    };

    document.addEventListener('copy', handleCopy);
    return () => document.removeEventListener('copy', handleCopy);
  }, [pathname]);

  return null;
}
