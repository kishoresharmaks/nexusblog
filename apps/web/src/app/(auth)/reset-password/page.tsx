'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Lock, ArrowRight, Loader2, KeyRound, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { BrandLogo } from '@/components/common/brand-logo';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage('Reset token is missing or invalid.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await authClient.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 rounded-2xl border border-border/80 bg-card/70 p-6 sm:p-8 backdrop-blur-md shadow-xl text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mx-auto">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Password Updated</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your password has been successfully updated. Redirecting to sign in...
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-all shadow-xs w-full cursor-pointer"
          >
            Sign In Now
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
        <h1 className="text-2xl font-bold tracking-tight">Set New Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter and confirm your new account password.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive font-medium flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-xl border border-input bg-background/50 px-3.5 py-2.5 pr-10 text-sm text-foreground shadow-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full rounded-xl border border-input bg-background/50 px-3.5 py-2.5 pr-10 text-sm text-foreground shadow-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Updating Password...
            </>
          ) : (
            <>
              Reset Password <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading reset form...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
