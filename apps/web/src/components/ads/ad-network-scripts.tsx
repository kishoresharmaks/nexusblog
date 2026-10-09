'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { adsApi } from '@/lib/api-client';

export function loadEthicalAds() {
  if (typeof window === 'undefined' || !(window as any).ethicalads) return;
  const pending = Array.from(document.querySelectorAll<HTMLElement>('[data-ea-manual="true"]'))
    .filter((placement) => !placement.dataset.eaLoaded);
  if (!pending.length) return;
  pending.forEach((placement) => { placement.dataset.eaLoaded = 'true'; });
  (window as any).ethicalads.load();
}

export function AdNetworkScripts() {
  const [config, setConfig] = useState<Awaited<ReturnType<typeof adsApi.getPublicConfig>> | null>(null);

  useEffect(() => {
    adsApi.getPublicConfig().then(setConfig).catch(() => {});
  }, []);

  if (!config?.globalEnabled) return null;

  return (
    <>
      {config.googleAdsense.enabled && config.googleAdsense.clientId && (
        <Script
          id="google-adsense"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(config.googleAdsense.clientId)}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
      {config.ethicalAds.enabled && config.ethicalAds.publisherId && (
        <Script
          id="ethicalads-client"
          async
          src="https://media.ethicalads.io/media/client/ethicalads.min.js"
          onLoad={loadEthicalAds}
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
