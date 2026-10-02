'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Lock, Mail, ArrowRight, Loader2, KeyRound, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { BrandLogo } from '@/components/common/brand-logo';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const user = await login(email, password);

      // Determine target destination based on redirect param or staff role
      if (redirectUrl && redirectUrl.startsWith('/')) {
        router.push(redirectUrl);
      } else if (
        user &&
        ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR'].includes(user.role)
      ) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setErrorMessage((err as Error).message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRedirected = Boolean(redirectUrl);

  return (
    <div className="space-y-6 rounded-2xl border border-border/80 bg-card/70 p-6 sm:p-8 backdrop-blur-md shadow-xl">
      <div className="space-y-3 text-center">
        <div className="flex justify-center mb-1">
          <BrandLogo variant="auth" size="xl" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to access your bookmarks, reading history, and profile.
        </p>
      </div>

      {isRedirected && (
        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground font-mono">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <span>Please sign in to continue to your destination.</span>
        </div>
      )}

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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-input bg-background/50 px-3.5 py-2.5 pr-10 text-sm text-foreground shadow-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              <Loader2 className="h-4 w-4 animate-spin" /> Signing In...
            </>
          ) : (
            <>
              Sign In <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2">
        Don&apos;t have an account yet?{' '}
        <Link href="/register" className="font-semibold text-foreground hover:underline">
          Create one now
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center font-mono text-xs text-muted-foreground">
          Loading authentication portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
