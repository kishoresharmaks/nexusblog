'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  MailX,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { newsletterApi } from '@/lib/api-client';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [isResubscribing, setIsResubscribing] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam.trim());
    }
  }, [emailParam]);

  const handleUnsubscribe = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please provide a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await newsletterApi.unsubscribe(email.trim());
      setIsUnsubscribed(true);
      toast.success('You have been successfully unsubscribed from the newsletter.');
    } catch (err: any) {
      console.error('Failed to unsubscribe:', err);
      toast.error(err.message || 'Failed to process unsubscribe request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResubscribe = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Email address is missing.');
      return;
    }

    setIsResubscribing(true);
    try {
      await newsletterApi.subscribe(email.trim());
      setIsUnsubscribed(false);
      toast.success('Welcome back! You have been resubscribed to the newsletter.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resubscribe.');
    } finally {
      setIsResubscribing(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-2xl font-extrabold tracking-widest text-foreground font-mono"
          >
            <span className="text-cyan-500">N</span>EXUS
          </Link>
          <p className="text-xs text-muted-foreground font-mono">
            Engineering Dispatch • Subscription Preferences
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl space-y-6">
          {!isUnsubscribed ? (
            <>
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
                  <MailX className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    Unsubscribe from Newsletter
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    We’re sorry to see you go. Confirm your email address below to stop receiving the weekly technical engineering dispatches.
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleUnsubscribe} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                  />
                </div>

                {/* Optional Feedback */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Reason for leaving <span className="text-[10px]">(Optional)</span>
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-cyan-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">Select a reason...</option>
                    <option value="too_frequent">Emails are sent too frequently</option>
                    <option value="content_not_relevant">Content is no longer relevant to me</option>
                    <option value="temporary_break">Taking a temporary break</option>
                    <option value="never_subscribed">I never signed up for this</option>
                    <option value="other">Other reason</option>
                  </select>
                </div>

                {/* Unsubscribe Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Unsubscribing...</span>
                    </>
                  ) : (
                    <span>Unsubscribe from All Dispatches</span>
                  )}
                </button>
              </form>

              {/* What you'll miss */}
              <div className="pt-2 border-t border-border/60">
                <div className="rounded-xl bg-muted/40 p-3.5 border border-border/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
                    <span>What you will no longer receive:</span>
                  </div>
                  <ul className="text-[11px] text-muted-foreground space-y-1 pl-5 list-disc">
                    <li>Weekly architecture deep-dives and system design blueprints</li>
                    <li>Curated performance benchmarks and distributed systems guides</li>
                    <li>Early access to technical whitepapers and tutorials</li>
                  </ul>
                </div>
              </div>
            </>
          ) : (
            /* Success Confirmation State */
            <div className="text-center space-y-5 py-4">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-foreground">
                  You have been unsubscribed
                </h2>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  <strong className="text-foreground">{email}</strong> has been removed from our active subscriber list. You will not receive any further emails.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={handleResubscribe}
                  disabled={isResubscribing}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-xs font-medium text-foreground transition-colors disabled:opacity-50"
                >
                  <RotateCcw className={`h-3.5 w-3.5 ${isResubscribing ? 'animate-spin' : ''}`} />
                  <span>Resubscribe (Mistake?)</span>
                </button>

                <Link
                  href="/articles"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Browse Articles</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="text-center space-y-1">
          <p className="text-[11px] text-muted-foreground font-mono">
            NexusNation • High-Performance Technical Publishing
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-cyan-500 hover:underline font-medium"
          >
            <span>Return to Portal Homepage</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />
            <span>Loading preferences...</span>
          </div>
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
