'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const queryString = searchParams?.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;

    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      try {
        const payload = {
          path: url,
          referrer: document.referrer || null,
          timestamp: new Date().toISOString(),
          screen: `${window.innerWidth}x${window.innerHeight}`,
        };
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          navigator.sendBeacon('/api/telemetry/pageview', JSON.stringify(payload));
        }
      } catch {
        // Silently ignore telemetry transmission errors
      }
    }
  }, [pathname, searchParams]);

  return null;
}
