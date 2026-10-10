'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { adsApi } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { usePathname } from 'next/navigation';

export function patchDuplicateContainerGetElementById() {
  if (typeof window === 'undefined' || (window as any).__nexus_ad_id_patched) return;
  (window as any).__nexus_ad_id_patched = true;

  const nativeGetElementById = Document.prototype.getElementById;

  Document.prototype.getElementById = function (id: string) {
    if (!id) return nativeGetElementById.call(this, id);

    // 1. If document.currentScript exists, search within its parent element first
    if (document.currentScript && document.currentScript.parentElement) {
      try {
        const localMatch = document.currentScript.parentElement.querySelector(`#${CSS.escape(id)}`);
        if (localMatch) return localMatch as HTMLElement;
      } catch {
        // Fallback
      }
    }

    // 2. If multiple elements in DOM share the same container ID (reused ad unit snippets)
    try {
      const matches = document.querySelectorAll(`#${CSS.escape(id)}`);
      if (matches.length > 1) {
        for (let i = 0; i < matches.length; i++) {
          const el = matches[i] as HTMLElement;
          if (el.children.length === 0 && !el.dataset.adPopulated) {
            el.dataset.adPopulated = 'true';
            return el;
          }
        }
      }
    } catch {
      // Fallback to native
    }

    return nativeGetElementById.call(this, id);
  };
}

export function loadEthicalAds() {
  if (typeof window === 'undefined' || !(window as any).ethicalads) return;
  const pending = Array.from(document.querySelectorAll<HTMLElement>('[data-ea-manual="true"]'))
    .filter((placement) => !placement.dataset.eaLoaded);
  if (!pending.length) return;
  pending.forEach((placement) => { placement.dataset.eaLoaded = 'true'; });
  (window as any).ethicalads.load();
}

export function AdNetworkScripts() {
  const { user, isLoading: authLoading } = useAuth();
  const pathname = usePathname();
  const [config, setConfig] = useState<Awaited<ReturnType<typeof adsApi.getPublicConfig>> | null>(null);

  useEffect(() => {
    let isMounted = true;
    patchDuplicateContainerGetElementById();
    if (authLoading) return () => { isMounted = false; };
    adsApi.getPublicConfig().then((nextConfig) => {
      if (isMounted) setConfig(nextConfig);
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [authLoading, pathname]);

  if (authLoading || !config?.globalEnabled || (config.hideForLoggedIn && user)) return null;

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
