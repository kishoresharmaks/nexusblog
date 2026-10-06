'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  AlertCircle,
  BrainCircuit,
  Bot,
} from 'lucide-react';
import { toast } from 'sonner';
import { articlesApi, systemSettingsApi } from '@/lib/api-client';

interface ArticleSummarizerProps {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  enabled?: boolean;
  actionsSlot?: React.ReactNode;
  shareSlot?: React.ReactNode;
}

export function ArticleSummarizer({
  slug,
  title,
  excerpt,
  content,
  enabled,
  actionsSlot,
  shareSlot,
}: ArticleSummarizerProps) {
  const [isEnabled, setIsEnabled] = useState<boolean>(enabled ?? true);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bullets, setBullets] = useState<string[]>([]);
  const [source, setSource] = useState<'gemini' | 'smart_fallback' | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Check system settings for enabled prop if not explicitly defined
  useEffect(() => {
    if (enabled !== undefined) {
      setIsEnabled(enabled);
      return;
    }

    let isMounted = true;
    systemSettingsApi
      .getPublicSettings()
      .then((settings) => {
        if (isMounted && settings.aiSummaryEnabled !== undefined) {
          setIsEnabled(settings.aiSummaryEnabled);
        }
      })
      .catch(() => {
        if (isMounted) setIsEnabled(true);
      });

    return () => {
      isMounted = false;
    };
  }, [enabled]);

  // Clean up speech synthesis when unmounted
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Fetch summary from API
  const handleToggleSummary = async () => {
    if (isOpen) {
      setIsOpen(false);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return;
    }

    setIsOpen(true);

    if (bullets.length > 0) return;

    setLoading(true);
    setError(null);

    try {
      const res = await articlesApi.summarize({ slug, title, excerpt, content });
      if (res && res.bullets && Array.isArray(res.bullets) && res.bullets.length > 0) {
        setBullets(res.bullets);
        setSource(res.source);
        setModelUsed(res.modelUsed || null);
      } else {
        throw new Error('Could not parse summary output.');
      }
    } catch (err: any) {
      const errMsg = err.message || 'Failed to generate article summary.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (bullets.length === 0) return;
    const textToCopy = `📌 Executive Summary: ${title}\n\n${bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}\n\nSource: NexusBlog AI Summary`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Summary copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.error('Speech synthesis is not supported in your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `${title}. Key takeaways: ${bullets.join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const renderTriggerButton = () => (
    <button
      type="button"
      onClick={handleToggleSummary}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 border cursor-pointer ${
        isOpen
          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
          : 'border-border/80 bg-muted/40 text-foreground hover:bg-muted hover:border-foreground/30'
      }`}
      title="View key architectural takeaways"
    >
      <BrainCircuit className="h-3.5 w-3.5 text-primary" />
      <span className="font-semibold">{isOpen ? 'Hide Takeaways' : 'Key Takeaways'}</span>
      {isOpen ? (
        <ChevronUp className="h-3 w-3 opacity-70" />
      ) : (
        <ChevronDown className="h-3 w-3 opacity-70" />
      )}
    </button>
  );

  const renderExpandedCard = () => (
    <div className="w-full rounded-2xl border border-border/80 bg-card p-5 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 border border-primary/20 px-2.5 py-1 text-[11px] font-mono font-semibold text-primary">
            <BrainCircuit className="h-3.5 w-3.5 text-primary" />
            <span>Architecture Brief</span>
          </span>
          {source === 'gemini' && (
            <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 font-semibold tabular-nums">
              <Bot className="h-3 w-3" />
              <span>{modelUsed ? modelUsed.toUpperCase() : 'GEMINI AI'}</span>
            </span>
          )}
          {source === 'smart_fallback' && (
            <span className="inline-flex items-center gap-1 rounded border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-mono text-sky-400 font-semibold">
              <Zap className="h-3 w-3" />
              <span>EXECUTIVE SUMMARY</span>
            </span>
          )}
        </div>

        {/* Action Bar (Copy & Voice & Close) */}
        <div className="flex items-center gap-1.5">
          {bullets.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleToggleSpeech}
                className="h-7 w-7 rounded-lg border border-border/60 bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title={isSpeaking ? 'Stop reading' : 'Read summary aloud'}
              >
                {isSpeaking ? (
                  <VolumeX className="h-3.5 w-3.5 text-primary animate-pulse" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={handleCopySummary}
                className="h-7 w-7 rounded-lg border border-border/60 bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Copy summary bullets"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="h-7 w-7 rounded-lg border border-border/60 bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Close summary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="py-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Synthesizing article content into architectural takeaways...</span>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-4 bg-muted/60 rounded-md w-11/12 animate-pulse" />
            <div className="h-4 bg-muted/60 rounded-md w-3/4 animate-pulse" />
            <div className="h-4 bg-muted/60 rounded-md w-5/6 animate-pulse" />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Render Summary Bullets */}
      {!loading && !error && bullets.length > 0 && (
        <ul className="space-y-2.5 pt-1">
          {bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 border border-primary/20 text-primary font-mono text-[10px] font-bold mt-0.5">
                {idx + 1}
              </span>
              <span className="flex-1">{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // If slots are provided, render as a full-width layout section
  if (actionsSlot || shareSlot) {
    return (
      <div className="w-full space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {actionsSlot}
            {isEnabled && renderTriggerButton()}
          </div>

          {shareSlot}
        </div>

        {isEnabled && isOpen && renderExpandedCard()}
      </div>
    );
  }

  // Fallback standalone render
  if (!isEnabled) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      <div className="inline-block">{renderTriggerButton()}</div>
      {isOpen && renderExpandedCard()}
    </div>
  );
}
