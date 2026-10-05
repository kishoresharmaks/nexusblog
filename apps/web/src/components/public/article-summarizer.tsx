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
}

export function ArticleSummarizer({
  slug,
  title,
  excerpt,
  content,
  enabled,
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

  // Check if AI Summarizer feature is enabled in system settings if enabled prop is undefined
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

  // If feature is disabled by admin in Dev Config, do not render anything
  if (!isEnabled) {
    return null;
  }

  return (
    <div className="relative inline-block text-left w-full sm:w-auto">
      {/* 1. Main Action Trigger Button */}
      <button
        type="button"
        onClick={handleToggleSummary}
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-300 border cursor-pointer ${
          isOpen
            ? 'bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/20'
            : 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/60 hover:shadow-xs'
        }`}
        title="Summarize article into key takeaways"
      >
        <Sparkles className={`h-3.5 w-3.5 ${isOpen ? 'animate-spin text-primary-foreground' : 'text-amber-400 animate-pulse'}`} />
        <span className="font-semibold">{isOpen ? 'Hide Summary' : 'Summarize'}</span>
        {isOpen ? (
          <ChevronUp className="h-3 w-3 opacity-80" />
        ) : (
          <ChevronDown className="h-3 w-3 opacity-80" />
        )}
      </button>

      {/* 2. Expandable AI Executive Summary Card */}
      {isOpen && (
        <div className="mt-4 w-full rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-xl p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 relative overflow-hidden group">
          {/* Subtle Ambient Glow */}
          <div className="absolute -right-12 -top-12 w-44 h-44 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Bar */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/50">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-2.5 py-1 text-[11px] font-mono font-bold text-primary">
                <BrainCircuit className="h-3.5 w-3.5 text-amber-400" />
                <span>AI Executive Summary</span>
              </span>
              {source === 'gemini' && (
                <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 font-bold">
                  <Bot className="h-3 w-3" />
                  <span>{modelUsed ? modelUsed.toUpperCase() : 'GEMINI AI'}</span>
                </span>
              )}
              {source === 'smart_fallback' && (
                <span className="inline-flex items-center gap-1 rounded border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-mono text-sky-400 font-bold">
                  <Zap className="h-3 w-3" />
                  <span>SMART SUMMARY</span>
                </span>
              )}
            </div>

            {/* Action Bar (Copy & Voice) */}
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
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 border border-primary/20 text-primary font-mono text-[10px] font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="flex-1">{bullet}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
