'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { BrandLogo } from '@/components/common/brand-logo';
import {
  CheckCircle2,
  XCircle,
  Mail,
  Loader2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  KeyRound,
} from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const initialToken = searchParams.get('token') || '';

  const [token, setToken] = useState(initialToken);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>(
    initialToken ? 'verifying' : 'idle',
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const performVerification = useCallback(async (tokenToVerify: string) => {
    if (!tokenToVerify.trim()) return;

    setStatus('verifying');
    setStatusMessage(null);

    try {
      const res = await authClient.verifyEmail(tokenToVerify.trim());
      setStatus('success');
      setStatusMessage(res.message || 'Your email has been successfully verified.');
    } catch (err) {
      setStatus('error');
      setStatusMessage((err as Error).message || 'Invalid or expired verification link.');
    }
  }, []);

  useEffect(() => {
    if (initialToken) {
      performVerification(initialToken);
    }
  }, [initialToken, performVerification]);

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    await performVerification(token);
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setResendStatus('sending');
    setResendMessage(null);

    try {
      const res = await authClient.resendVerification(email.trim());
      setResendStatus('sent');
      setResendMessage(res.message || 'A new verification link has been dispatched if your account exists.');
    } catch (err) {
      setResendStatus('error');
      setResendMessage((err as Error).message || 'Failed to resend verification email.');
    }
  };

  if (status === 'verifying') {
    return (
      <div className="space-y-6 rounded-2xl border border-border/80 bg-card/70 p-6 sm:p-8 backdrop-blur-md shadow-xl text-center">
        <div className="flex justify-center mb-1">
          <BrandLogo variant="auth" size="xl" />
        </div>
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
          <Loader2 className="h-7 w-7 animate-spin text-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Verifying Your Email</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Please wait while we confirm your email address and activate your account...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="space-y-6 rounded-2xl border border-border/80 bg-card/70 p-6 sm:p-8 backdrop-blur-md shadow-xl text-center">
        <div className="flex justify-center mb-1">
          <BrandLogo variant="auth" size="xl" />
        </div>
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mx-auto">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Email Verified!</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {statusMessage || 'Your email address has been verified. You now have full access to NexusNation.'}
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-all shadow-xs w-full cursor-pointer"
          >
            Sign In to Your Account <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-all shadow-xs w-full cursor-pointer"
          >
            Explore Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border/80 bg-card/70 p-6 sm:p-8 backdrop-blur-md shadow-xl">
      <div className="space-y-3 text-center">
        <div className="flex justify-center mb-1">
          <BrandLogo variant="auth" size="xl" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Email Verification</h1>
        <p className="text-sm text-muted-foreground">
          Confirm your email address to unlock publishing, bookmarks, and account notifications.
        </p>
      </div>

      {status === 'error' && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive font-medium flex items-start gap-2.5">
          <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{statusMessage}</span>
        </div>
      )}

      {resendStatus === 'sent' && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{resendMessage}</span>
        </div>
      )}

      {resendStatus === 'error' && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive font-medium flex items-start gap-2.5">
          <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{resendMessage}</span>
        </div>
      )}

      {/* Manual verification code entry */}
      <form onSubmit={handleManualVerify} className="space-y-3 pt-1">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
            Verification Token
          </label>
          <input
            type="text"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your verification token here"
            className="w-full rounded-xl border border-input bg-background/50 px-3.5 py-2.5 text-sm text-foreground shadow-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring font-mono text-xs"
          />
        </div>

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-all shadow-xs cursor-pointer"
        >
          <ShieldCheck className="h-4 w-4" /> Verify Token
        </button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Need a new link?</span>
        </div>
      </div>

      {/* Resend verification email form */}
      <form onSubmit={handleResend} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            Your Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@example.com"
            className="w-full rounded-xl border border-input bg-background/50 px-3.5 py-2.5 text-sm text-foreground shadow-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <button
          type="submit"
          disabled={resendStatus === 'sending'}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {resendStatus === 'sending' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending Link...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" /> Resend Verification Email
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2">
        Already verified?{' '}
        <Link href="/login" className="font-semibold text-foreground hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading verification portal...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
