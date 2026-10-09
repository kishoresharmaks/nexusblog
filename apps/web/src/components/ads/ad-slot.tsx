'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { adsApi } from '@/lib/api-client';
import { loadEthicalAds } from './ad-network-scripts';
import { useAuth } from '@/context/auth-context';
import { ExternalLink, Sparkles, Megaphone } from 'lucide-react';

interface AdSlotProps {
  placementSlug: string;
  className?: string;
  minHeight?: number;
  label?: string;
}

export function AdSlot({
  placementSlug,
  className = '',
  minHeight = 90,
  label = 'Advertisement',
}: AdSlotProps) {
  const { user } = useAuth();
  const [placement, setPlacement] = useState<any>(null);
  const [globalConfig, setGlobalConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const carbonContainerRef = useRef<HTMLDivElement>(null);
  const adsterraContainerRef = useRef<HTMLDivElement>(null);
  const hasTrackedImpression = useRef(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      adsApi.getPublicConfig().catch(() => null),
      adsApi.getPublicPlacements(typeof window !== 'undefined' ? window.location.pathname : undefined).catch(() => []),
    ])
      .then(([config, placements]) => {
        if (!isMounted) return;
        setGlobalConfig(config);
        if (config?.globalEnabled && placements && Array.isArray(placements)) {
          const matched = placements.find((p) => {
            if (p.slug !== placementSlug || p.status !== 'ACTIVE') return false;
            if (p.network === 'GOOGLE_ADSENSE') return config.googleAdsense?.enabled;
            if (p.network === 'CARBON_ADS') return config.carbon?.enabled;
            if (p.network === 'ETHICAL_ADS') return config.ethicalAds?.enabled;
            if (p.network === 'ADSTERRA') return config.adsterra?.enabled;
            return true;
          });
          if (matched) {
            setPlacement(matched);
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [placementSlug]);

  // Track impression once placement is resolved and rendered
  useEffect(() => {
    if (placement && !hasTrackedImpression.current) {
      hasTrackedImpression.current = true;
      adsApi.trackImpression(placement.slug, undefined, typeof window !== 'undefined' ? window.location.pathname : undefined).catch(() => {});
    }
  }, [placement]);

  // Google AdSense push initialization
  useEffect(() => {
    if (placement?.network === 'GOOGLE_ADSENSE' && typeof window !== 'undefined') {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch {
        // Suppress duplicate push warnings in dev
      }
    }
  }, [placement]);

  // Carbon Ads script loader
  useEffect(() => {
    if (placement?.network === 'CARBON_ADS' && carbonContainerRef.current) {
      const serveId = placement.slotId || globalConfig?.carbon?.serveId || 'CEBD42Q';
      const placementName = placement.clientOrPublisherId || globalConfig?.carbon?.placement || 'nexusnationin';

      carbonContainerRef.current.innerHTML = '';
      const script = document.createElement('script');
      script.id = '_carbonads_js';
      script.src = `//cdn.carbonads.com/carbon.js?serve=${serveId}&placement=${placementName}`;
      script.async = true;
      carbonContainerRef.current.appendChild(script);

      return () => carbonContainerRef.current?.replaceChildren();
    }
    return undefined;
  }, [placement, globalConfig]);

  useEffect(() => {
    if (placement?.network === 'ETHICAL_ADS' && globalConfig?.ethicalAds?.enabled) loadEthicalAds();
  }, [placement, globalConfig]);

  useEffect(() => {
    if (placement?.network !== 'ADSTERRA' || !globalConfig?.adsterra?.enabled || !adsterraContainerRef.current) return;

    const scriptUrl = placement.slotId;
    const containerId = placement.clientOrPublisherId;
    if (!scriptUrl || !containerId) return;

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(scriptUrl);
    } catch {
      return;
    }
    if (parsedUrl.protocol !== 'https:' || !parsedUrl.pathname.endsWith('/invoke.js') || !/^container-[a-z0-9_-]+$/i.test(containerId)) return;

    const container = adsterraContainerRef.current;
    container.replaceChildren();
    const unit = document.createElement('div');
    unit.id = containerId;
    const script = document.createElement('script');
    script.async = true;
    script.src = parsedUrl.href;
    script.setAttribute('data-cfasync', 'false');
    container.append(unit, script);

    return () => container.replaceChildren();
  }, [placement, globalConfig]);

  // If user is authenticated and "hide for logged in" is active, hide all ads
  if (globalConfig?.hideForLoggedIn && user) {
    return null;
  }

  // If ads are globally disabled or placement not found/paused, return null
  if (!loading && (!globalConfig?.globalEnabled || !placement)) {
    return null;
  }

  const handleCustomClick = () => {
    if (placement?.slug) {
      adsApi.trackClick(placement.slug, undefined, typeof window !== 'undefined' ? window.location.pathname : undefined).catch(() => {});
    }
  };

  return (
    <div
      className={`relative my-6 mx-auto w-full overflow-hidden rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md p-3 transition-all ${className}`}
      style={{ minHeight: `${minHeight}px` }}
    >
      {/* Subtle Ad Badge Label */}
      <div className="flex items-center justify-between pb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80 border-b border-border/30 mb-2">
        <span className="flex items-center gap-1.5">
          <Megaphone className="h-3 w-3 text-primary/70" />
          <span>{label}</span>
        </span>
        <span className="text-[9px] text-muted-foreground/50">Sponsored Partner</span>
      </div>

      {/* 1. Google AdSense Responsive Unit */}
      {placement?.network === 'GOOGLE_ADSENSE' && (
        <div className="flex items-center justify-center overflow-hidden py-1">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', textAlign: 'center', minHeight: `${minHeight - 30}px`, width: '100%' }}
            data-ad-client={placement.clientOrPublisherId || globalConfig?.googleAdsense?.clientId}
            data-ad-slot={placement.slotId || '1234567890'}
            data-ad-format={placement.format === 'RESPONSIVE' ? 'auto' : 'rectangle'}
            data-full-width-responsive="true"
          />
        </div>
      )}

      {/* 2. Carbon Ads (Developer / Tech Ecosystem) */}
      {placement?.network === 'CARBON_ADS' && (
        <div
          ref={carbonContainerRef}
          className="carbon-container flex items-center justify-center min-h-[120px] text-xs font-mono"
        />
      )}

      {/* 3. EthicalAds (Privacy Developer Network) */}
      {placement?.network === 'ETHICAL_ADS' && (
        <div className="flex items-center justify-center py-2">
          <div
            data-ea-publisher={placement.clientOrPublisherId || globalConfig?.ethicalAds?.publisherId || 'nexus-developer-blog'}
            data-ea-type={placement.format === 'RECTANGLE_300x250' ? 'image' : 'text'}
            data-ea-manual="true"
            className="w-full text-center"
          />
        </div>
      )}

      {/* Adsterra Native Banner only; no Popunder, Social Bar, or floating units. */}
      {placement?.network === 'ADSTERRA' && globalConfig?.adsterra?.enabled && (
        <div className="flex min-h-[250px] min-w-0 items-center justify-center overflow-hidden py-2">
          <div ref={adsterraContainerRef} className="w-full min-w-0 max-w-full overflow-hidden" />
        </div>
      )}

      {/* 4. Direct Custom Image Banner */}
      {placement?.network === 'CUSTOM_IMAGE' && placement.customImage && (
        <div className="flex flex-col items-center justify-center">
          <a
            href={placement.customUrl || '#'}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleCustomClick}
            className="group block relative w-full overflow-hidden rounded-xl border border-border/40 hover:border-primary/40 transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={placement.customImage}
              alt={placement.customAlt || placement.name || 'Sponsored Partner'}
              className="w-full h-auto object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.01]"
            />
            <div className="absolute top-2 right-2 rounded-full bg-background/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono text-muted-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Visit Partner</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </div>
          </a>
        </div>
      )}

      {/* 5. Custom HTML / Affiliate Embed */}
      {placement?.network === 'CUSTOM_HTML' && placement.customHtml && (
        <div
          onClick={handleCustomClick}
          className="w-full overflow-x-auto text-sm"
          dangerouslySetInnerHTML={{ __html: placement.customHtml }}
        />
      )}
    </div>
  );
}
