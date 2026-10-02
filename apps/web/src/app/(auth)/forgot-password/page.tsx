'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { Mail, ArrowRight, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '@/components/common/brand-logo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await authClient.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to send reset link');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6 rounded-2xl border border-border/80 bg-card/70 p-6 sm:p-8 backdrop-blur-md shadow-xl text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mx-auto">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Check Your Inbox</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If an account exists with <span className="font-semibold text-foreground">{email}</span>, we have sent instructions to reset your password.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-all shadow-xs w-full cursor-pointer"
          >
            Return to Sign In
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
        <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your account email and we&apos;ll send you a secure password reset link.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            Email Address
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
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending Reset Link...
            </>
          ) : (
            <>
              Send Reset Link <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2">
        Remember your password?{' '}
        <Link href="/login" className="font-semibold text-foreground hover:underline">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
