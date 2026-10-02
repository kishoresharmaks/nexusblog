'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { authClient } from '@/lib/auth-client';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AtSign,
  FileText,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/brand-logo';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Post-registration state
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await register({
        name,
        username,
        email,
        password,
        bio: bio || undefined,
      });

      if (user.emailVerified) {
        router.push('/dashboard');
      } else {
        setRegisteredEmail(user.email);
      }
    } catch (err) {
      setErrorMessage((err as Error).message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) return;
    setResendStatus('sending');
    setResendMsg(null);

    try {
      const res = await authClient.resendVerification(registeredEmail);
      setResendStatus('sent');
      setResendMsg(res.message || 'A fresh verification link has been sent to your email.');
    } catch (err) {
      setResendStatus('error');
      setResendMsg((err as Error).message || 'Failed to resend verification email.');
    }
  };

  if (registeredEmail) {
    return (
      <div className="space-y-6 rounded-2xl border border-border/80 bg-card/70 p-6 sm:p-8 backdrop-blur-md shadow-xl text-center">
        <div className="flex justify-center mb-1">
          <BrandLogo variant="auth" size="xl" />
        </div>
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mx-auto">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Check Your Email</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We&apos;ve sent a verification link to{' '}
            <span className="font-semibold text-foreground">{registeredEmail}</span>. Please click the link to activate your account.
          </p>
        </div>

        {resendMsg && (
          <div
            className={`rounded-xl border p-3 text-xs font-medium ${
              resendStatus === 'sent'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-destructive/30 bg-destructive/10 text-destructive'
            }`}
          >
            {resendMsg}
          </div>
        )}

        <div className="pt-2 space-y-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendStatus === 'sending'}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-all shadow-xs disabled:opacity-50 cursor-pointer"
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

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-all shadow-xs w-full cursor-pointer"
          >
            Continue to Dashboard <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="text-center text-xs text-muted-foreground pt-1">
            Have a verification token?{' '}
            <Link href="/verify-email" className="font-semibold text-foreground hover:underline">
              Enter it manually
            </Link>
          </div>
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
        <h1 className="text-2xl font-bold tracking-tight">Create an Account</h1>
        <p className="text-sm text-muted-foreground">
          Join the community to save bookmarks, follow learning series, and customize your feed.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Rivers"
              className="w-full rounded-xl border border-input bg-background/50 px-3.5 py-2.5 text-sm text-foreground shadow-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <AtSign className="h-3.5 w-3.5 text-muted-foreground" />
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="alex_dev"
              className="w-full rounded-xl border border-input bg-background/50 px-3.5 py-2.5 text-sm text-foreground shadow-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

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
          <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
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

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            Short Bio (Optional)
          </label>
          <textarea
            rows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Systems enthusiast & software engineer"
            className="w-full rounded-xl border border-input bg-background/50 px-3.5 py-2 text-sm text-foreground shadow-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating Account...
            </>
          ) : (
            <>
              Create Account <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-foreground hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
