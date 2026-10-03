'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { adsApi } from '@/lib/api-client';

export function GoogleAdSenseScript() {
  const [adsenseConfig, setAdsenseConfig] = useState<{
    enabled: boolean;
    clientId: string;
    autoAds: boolean;
  } | null>(null);

  useEffect(() => {
    adsApi
      .getPublicConfig()
      .then((cfg) => {
        if (cfg?.globalEnabled && cfg?.googleAdsense?.enabled && cfg?.googleAdsense?.clientId) {
          setAdsenseConfig(cfg.googleAdsense);
        }
      })
      .catch(() => {});
  }, []);

  if (!adsenseConfig || !adsenseConfig.enabled || !adsenseConfig.clientId) {
    return null;
  }

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseConfig.clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
