'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { siteConfig } from '@nexus/config';
import { detectClientLocation } from '@/lib/geo-utils';

function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let vid = localStorage.getItem('nexus_vid');
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      localStorage.setItem('nexus_vid', vid);
    }
    return vid;
  } catch {
    return 'v_' + Math.random().toString(36).substring(2, 10);
  }
}

function sendTelemetry(payload: Record<string, any>) {
  if (typeof window === 'undefined') return;
  try {
    const geo = detectClientLocation();
    const data = JSON.stringify({
      visitorId: getOrCreateVisitorId(),
      referrer: document.referrer || undefined,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      country: geo.country,
      countryName: geo.countryName,
      ...payload,
    });

    const apiUrl = `${siteConfig.apiUrl}/analytics/collect`;
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([data], { type: 'application/json' });
      navigator.sendBeacon(apiUrl, blob);
    } else {
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Non-blocking silent catch
  }
}

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

    sendTelemetry({
      eventType: 'PAGEVIEW',
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
            sendTelemetry({
              eventType: 'SCROLL_DEPTH',
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

  // 3. Code Copy Interaction Listener
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.closest('pre') || target.closest('code') || target.closest('[data-code-block]'))) {
        sendTelemetry({
          eventType: 'CODE_COPY',
          path: pathname || '/',
        });
      }
    };

    document.addEventListener('copy', handleCopy);
    return () => document.removeEventListener('copy', handleCopy);
  }, [pathname]);

  return null;
}
