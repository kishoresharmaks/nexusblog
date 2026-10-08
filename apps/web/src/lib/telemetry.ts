'use client';

import { siteConfig } from '@nexus/config';
import { detectClientLocation } from './geo-utils';

export function getOrCreateVisitorId(): string {
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

export function trackEvent(eventType: string, payload: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;
  try {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', eventType.toLowerCase(), payload);
    }
    const geo = detectClientLocation();
    const currentPath = window.location.pathname + window.location.search;

    const data = JSON.stringify({
      eventType,
      path: payload.path || currentPath,
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
    // Non-blocking silent telemetry
  }
}

export function trackCodeCopy(options: {
  path?: string;
  language?: string;
  filename?: string;
  snippet?: string;
} = {}) {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  trackEvent('CODE_COPY', {
    path: options.path || currentPath,
    metadata: {
      language: options.language || 'code',
      filename: options.filename,
      length: options.snippet?.length,
    },
  });
}
