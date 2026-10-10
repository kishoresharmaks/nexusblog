'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { adsApi } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { X, ExternalLink, Clock } from 'lucide-react';

export function InterstitialAd() {
  const { user, isLoading: authLoading } = useAuth();
  const pathname = usePathname();
  const [config, setConfig] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState<number>(5);
  const [canClose, setCanClose] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    if (authLoading) return () => { isMounted = false; };

    adsApi
      .getPublicConfig()
      .then((cfg) => {
        if (!isMounted || !cfg) return;

        // Check if global ads are enabled and interstitial is active
        if (!cfg.globalEnabled || !cfg.interstitial?.enabled) {
          setIsVisible(false);
          setConfig(null);
          return;
        }

        // If hideForLoggedIn is active and user is logged in, skip
        if (cfg.hideForLoggedIn && user) {
          setIsVisible(false);
          setConfig(null);
          return;
        }

        const hasCreative = cfg.interstitial.network === 'CUSTOM_IMAGE'
          ? Boolean(cfg.interstitial.customImage && cfg.interstitial.customUrl)
          : Boolean(cfg.interstitial.customHtml?.trim());
        if (!hasCreative) {
          setIsVisible(false);
          setConfig(null);
          return;
        }

        // Frequency cap check
        const configuredFrequency = Number(cfg.interstitial.frequencyMinutes);
        const freqMinutes = Number.isFinite(configuredFrequency) && configuredFrequency >= 1
          ? Math.min(configuredFrequency, 1440)
          : 10;
        const storageKey = 'nexus_interstitial_last_shown';
        let lastShownStr: string | null = null;
        try {
          lastShownStr = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);
        } catch {
          lastShownStr = null;
        }

        if (lastShownStr) {
          const lastShown = Number.parseInt(lastShownStr, 10);
          const now = Date.now();
          if (Number.isFinite(lastShown) && now - lastShown < freqMinutes * 60 * 1000) {
            return; // Frequency capped
          }
        }

        // Active! Show interstitial vignette modal
        const configuredTimer = Number(cfg.interstitial.timerSeconds);
        const timerSec = Number.isFinite(configuredTimer) && configuredTimer >= 1
          ? Math.min(configuredTimer, 60)
          : 5;
        setCountdown(timerSec);
        setCanClose(false);
        setConfig({ ...cfg.interstitial, hideForLoggedIn: cfg.hideForLoggedIn });
        setIsVisible(true);

        // Record timestamp in storage
        const nowTs = Date.now().toString();
        try {
          sessionStorage.setItem(storageKey, nowTs);
          localStorage.setItem(storageKey, nowTs);
        } catch {
          // Ignores storage disabled in private browser modes
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [user, authLoading, pathname]);

  useEffect(() => {
    if (authLoading && isVisible) setIsVisible(false);
    if (!authLoading && user && config?.hideForLoggedIn) setIsVisible(false);
  }, [authLoading, user, config?.hideForLoggedIn, isVisible]);

  // Lock body scroll when interstitial modal is active
  useEffect(() => {
    if (!isVisible) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  // Timer Countdown Effect
  useEffect(() => {
    if (!isVisible || canClose) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, canClose]);

  // Effect for custom HTML / Adsterra scripts
  useEffect(() => {
    if (!isVisible || !config || !containerRef.current) return;
    const htmlToRender = config.customHtml;
    if (!htmlToRender) return;

    const container = containerRef.current;
    container.replaceChildren();

    const range = document.createRange();
    range.selectNode(container);
    const fragment = range.createContextualFragment(htmlToRender);

    const scripts: HTMLScriptElement[] = [];
    const nonScripts: Node[] = [];

    Array.from(fragment.childNodes).forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'SCRIPT') {
        scripts.push(node as HTMLScriptElement);
      } else {
        nonScripts.push(node);
      }
    });

    nonScripts.forEach((ns) => {
      if (ns.nodeType === Node.ELEMENT_NODE) {
        const nested = Array.from((ns as HTMLElement).querySelectorAll('script'));
        nested.forEach((s) => {
          scripts.push(s);
          s.remove();
        });
      }
    });

    nonScripts.forEach((node) => container.appendChild(node));

    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      if (oldScript.textContent) {
        newScript.textContent = oldScript.textContent;
      }
      container.appendChild(newScript);
    });

    return () => {
      container.replaceChildren();
    };
  }, [isVisible, config]);

  if (!isVisible || !config) return null;

  const handleClose = () => {
    if (canClose) {
      setIsVisible(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-zinc-950/95 backdrop-blur-2xl p-4 sm:p-6 overflow-y-auto font-sans animate-in fade-in duration-300">
      {/* Top Header Bar with Timer & Skip Button */}
      <div className="w-full max-w-4xl flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-300">
            {config.title || 'Sponsored Vignette Briefing'}
          </span>
        </div>

        {/* Action Button: Disabled during countdown -> Active Skip Button once 0 */}
        <button
          type="button"
          onClick={handleClose}
          disabled={!canClose}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs font-bold transition-all shadow-lg cursor-pointer ${
            canClose
              ? 'bg-primary text-primary-foreground hover:scale-105 ring-2 ring-primary/50'
              : 'bg-zinc-800/90 text-zinc-400 border border-zinc-700/60 cursor-not-allowed opacity-90'
          }`}
        >
          {canClose ? (
            <>
              <span>Skip Ad</span>
              <X className="h-4 w-4" />
            </>
          ) : (
            <>
              <Clock className="h-3.5 w-3.5 text-amber-400 animate-spin" />
              <span>Skip Ad in {countdown}s...</span>
            </>
          )}
        </button>
      </div>

      {/* Main Ad Content Container */}
      <div className="my-auto w-full max-w-3xl flex flex-col items-center justify-center p-4 sm:p-8 rounded-3xl border border-zinc-800/70 bg-zinc-900/60 shadow-2xl space-y-4 text-center">
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Advertisement ∙ Continue reading below
        </div>

        {/* Custom Image Banner */}
        {config.network === 'CUSTOM_IMAGE' && config.customImage && (
          <a
            href={config.customUrl || '#'}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="group block relative w-full overflow-hidden rounded-2xl border border-zinc-700/50 hover:border-primary/50 transition-all"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.customImage}
              alt="Sponsored partner"
              className="w-full max-h-[450px] object-cover rounded-2xl group-hover:scale-[1.01] transition-transform duration-300"
            />
            <div className="absolute top-3 right-3 rounded-full bg-zinc-950/80 backdrop-blur-md px-3 py-1 text-xs font-mono text-zinc-300 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Visit Sponsor</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </a>
        )}

        {/* Custom HTML / Script / Adsterra Unit */}
        {config.network !== 'CUSTOM_IMAGE' && (
          <div
            ref={containerRef}
            className="w-full min-h-[300px] flex items-center justify-center overflow-x-auto text-sm text-zinc-200"
          />
        )}
      </div>

      {/* Footer Info & Immediate Skip when unlocked */}
      <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-zinc-800/80 pt-4 mt-4 text-[11px] font-mono text-zinc-500">
        <div>NexusNation Technical Engineering Publication ∙ Vignette Interstitial Unit</div>
        {canClose && (
          <button
            type="button"
            onClick={handleClose}
            className="text-primary hover:underline font-semibold cursor-pointer"
          >
            Continue directly to article content →
          </button>
        )}
      </div>
    </div>
  );
}
