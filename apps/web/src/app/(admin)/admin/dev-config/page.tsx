'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Mail,
  Key,
  Globe,
  Save,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
  Activity,
  Database,
  Cpu,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  FileCode2,
  Code2,
  Terminal,
} from 'lucide-react';
import { toast } from 'sonner';
import { systemSettingsApi } from '@/lib/api-client';

interface Diagnostics {
  database: {
    engine: string;
    status: string;
    latencyMs: number;
    articlesCount: number;
    subscribersCount: number;
    seriesCount: number;
  };
  emailService: {
    provider: string;
    senderEmail: string;
    senderName: string;
    isApiKeySet: boolean;
  };
  runtime: {
    nodeVersion: string;
    environment: string;
    uptimeSeconds: number;
    memoryUsageMb: number;
  };
}

export default function AdminDevConfigPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  // Configuration Form State
  const [brevoApiKey, setBrevoApiKey] = useState('');
  const [brevoSenderEmail, setBrevoSenderEmail] = useState('');
  const [brevoSenderName, setBrevoSenderName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  const [newsletterAutoWelcome, setNewsletterAutoWelcome] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [robotsIndexingMode, setRobotsIndexingMode] = useState<'allow' | 'disallow_all' | 'custom'>('allow');
  const [robotsCustomContent, setRobotsCustomContent] = useState('');

  // Diagnostics State
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);

  // Connection & Test Mail State
  const [isVerifyingBrevo, setIsVerifyingBrevo] = useState(false);
  const [brevoStatus, setBrevoStatus] = useState<{
    verified: boolean;
    checked: boolean;
    message: string;
    details?: any;
  }>({
    verified: false,
    checked: false,
    message: '',
  });

  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{
    success: boolean;
    simulated?: boolean;
    message: string;
    recipient?: string;
    messageId?: string;
    timestamp?: string;
  } | null>(null);

  const loadSettingsAndDiagnostics = useCallback(async () => {
    try {
      setLoading(true);
      const [settingsData, diagData] = await Promise.all([
        systemSettingsApi.getAll().catch(() => null),
        systemSettingsApi.getDiagnostics().catch(() => null),
      ]);

      if (settingsData) {
        setBrevoApiKey(settingsData.brevoApiKey?.value || '');
        setBrevoSenderEmail(settingsData.brevoSenderEmail?.value || 'newsletter@nexusnation.in');
        setBrevoSenderName(settingsData.brevoSenderName?.value || 'NexusBlog Engineering Dispatch');
        setSiteUrl(settingsData.siteUrl?.value || 'https://nexusnation.in');
        setSiteName(settingsData.siteName?.value || 'NexusBlog');
        setNewsletterAutoWelcome(settingsData.newsletterAutoWelcome?.value !== 'false');
        setMaintenanceMode(settingsData.maintenanceMode?.value === 'true');
        setRobotsIndexingMode((settingsData.robotsIndexingMode?.value as any) || 'allow');
        setRobotsCustomContent(settingsData.robotsCustomContent?.value || '');
      }

      if (diagData) {
        setDiagnostics(diagData);
      }
    } catch (err: any) {
      toast.error('Failed to load system configuration: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettingsAndDiagnostics();
  }, [loadSettingsAndDiagnostics]);

  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const payload: Record<string, string> = {
        brevoApiKey: brevoApiKey.trim(),
        brevoSenderEmail: brevoSenderEmail.trim(),
        brevoSenderName: brevoSenderName.trim(),
        siteUrl: siteUrl.trim(),
        siteName: siteName.trim(),
        newsletterAutoWelcome: String(newsletterAutoWelcome),
        maintenanceMode: String(maintenanceMode),
        robotsIndexingMode,
        robotsCustomContent: robotsCustomContent.trim(),
      };

      await systemSettingsApi.updateBatch(payload);
      toast.success('System developer configuration saved successfully!');
      await loadSettingsAndDiagnostics();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update system configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyBrevo = async () => {
    setIsVerifyingBrevo(true);
    try {
      const rawKey = brevoApiKey.trim();
      const apiKeyToTest = rawKey && !rawKey.includes('...') && rawKey !== '********' ? rawKey : undefined;

      const res = await systemSettingsApi.verifyBrevo(apiKeyToTest);
      setBrevoStatus({
        verified: res.valid,
        checked: true,
        message: res.message,
        details: res,
      });

      if (res.valid) {
        toast.success('Brevo API key validated successfully!');
      } else {
        toast.error(res.message || 'Brevo API connection failed');
      }
    } catch (err: any) {
      setBrevoStatus({
        verified: false,
        checked: true,
        message: err.message || 'Failed to verify Brevo API credentials',
      });
      toast.error(err.message || 'Brevo connection verification error');
    } finally {
      setIsVerifyingBrevo(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress.trim() || !testEmailAddress.includes('@')) {
      toast.error('Please enter a valid recipient email address');
      return;
    }

    setIsSendingTestEmail(true);
    setTestEmailResult(null);
    try {
      const res = await systemSettingsApi.testMail(testEmailAddress.trim());
      const isSimulated = Boolean(res.error && res.error.toLowerCase().includes('simulated'));

      if (res.success) {
        setTestEmailResult({
          success: true,
          simulated: isSimulated,
          recipient: testEmailAddress.trim(),
          messageId: res.messageId,
          message: isSimulated
            ? `[Simulated Mode] Email pipeline executed successfully. (Set a live Brevo API Key in the field above for real inbox delivery).`
            : `Test email successfully dispatched via Brevo REST API to ${testEmailAddress.trim()}. Message ID: ${res.messageId || 'OK'}`,
          timestamp: new Date().toLocaleTimeString(),
        });
        toast.success(isSimulated ? 'Simulated email dispatched!' : `Live test email delivered to ${testEmailAddress.trim()}`);
      } else {
        setTestEmailResult({
          success: false,
          recipient: testEmailAddress.trim(),
          message: res.error || 'Failed to deliver test email',
          timestamp: new Date().toLocaleTimeString(),
        });
        toast.error(res.error || 'Test email delivery failed');
      }
    } catch (err: any) {
      setTestEmailResult({
        success: false,
        recipient: testEmailAddress.trim(),
        message: err.message || 'Network request failed',
        timestamp: new Date().toLocaleTimeString(),
      });
      toast.error(err.message || 'Failed to dispatch test email');
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm('Are you sure you want to reset runtime configuration to default parameters?')) return;
    try {
      await systemSettingsApi.resetDefaults();
      toast.success('Configuration parameters reset to defaults');
      await loadSettingsAndDiagnostics();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset configuration');
    }
  };

  const handleCopyEnvSnippet = () => {
    const snippet = `# NexusBlog Production Runtime Configuration
BREVO_API_KEY=${brevoApiKey && !brevoApiKey.includes('...') ? brevoApiKey : 'xkeysib-YOUR_API_KEY_HERE'}
BREVO_SENDER_EMAIL=${brevoSenderEmail}
BREVO_SENDER_NAME=${brevoSenderName}
NEXT_PUBLIC_APP_URL=${siteUrl}
PORTAL_BRAND_NAME=${siteName}
NEWSLETTER_AUTO_WELCOME=${newsletterAutoWelcome}
MAINTENANCE_MODE=${maintenanceMode}
ROBOTS_INDEXING_MODE=${robotsIndexingMode}
`;
    navigator.clipboard.writeText(snippet);
    setCopiedEnv(true);
    toast.success('Configuration copied to clipboard as .env snippet');
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  const isKeyConfigured = Boolean(brevoApiKey && brevoApiKey.length > 5);

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Developer Configuration
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground pt-1">
            Manage runtime platform parameters, Brevo email services, and production credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSettingsAndDiagnostics}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-mono font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveConfig()}
            disabled={isSaving || loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 transition-opacity shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs font-mono">Loading developer settings &amp; diagnostics...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveConfig} className="space-y-8">
          {/* Card 1: Brevo Email Service Configuration */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
                    Brevo Mail &amp; Engineering Dispatch
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Connect Brevo (formerly Sendinblue) REST API for automated newsletter dispatches.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHelpGuide(!showHelpGuide)}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground px-2 py-1 rounded-md border border-border/50 hover:bg-muted transition-colors cursor-pointer"
                >
                  <HelpCircle className="h-3 w-3 text-primary" />
                  <span>Setup Guide</span>
                </button>

                {isKeyConfigured ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" /> Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <AlertTriangle className="h-3 w-3" /> Key Missing
                  </span>
                )}
              </div>
            </div>

            {/* Help Guide Banner (Collapsible) */}
            {showHelpGuide && (
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 text-xs font-sans space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between font-bold text-sky-400 font-mono text-xs">
                  <span>How to connect Brevo Free Tier (300 emails/day):</span>
                  <a
                    href="https://app.brevo.com/settings/keys/api"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] underline flex items-center gap-1 hover:text-sky-300"
                  >
                    Open Brevo Dashboard <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground leading-relaxed text-[11px]">
                  <li>Sign up for a free Brevo account at <strong className="text-foreground">brevo.com</strong>.</li>
                  <li>Go to <strong className="text-foreground">SMTP &amp; API &rarr; API Keys</strong> and click <strong className="text-foreground">&quot;Generate a new API key&quot;</strong> (v3).</li>
                  <li>Copy the key (starts with <code className="text-primary font-mono font-bold">xkeysib-...</code>) and paste it into the field below.</li>
                  <li>Add your authenticated sender email address (e.g. your domain or verified email) in Brevo under Senders.</li>
                  <li>Click <strong className="text-foreground">&quot;Test Brevo Connection&quot;</strong> below to confirm live connectivity.</li>
                </ol>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brevo API Key */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-primary" />
                    <span>Brevo API Key (v3) *</span>
                  </label>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Starts with <code className="text-primary font-bold">xkeysib-...</code>
                  </span>
                </div>

                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={brevoApiKey}
                    onChange={(e) => setBrevoApiKey(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background py-2.5 pl-4 pr-10 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
                    title={showApiKey ? 'Hide API key' : 'Show API key'}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Your API Key from your Brevo Dashboard &rarr; SMTP &amp; API &rarr; API Keys.
                </p>
              </div>

              {/* Sender Email */}
              <div className="space-y-2">
                <label className="font-mono text-xs font-bold text-foreground">
                  Sender Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. newsletter@nexusnation.in"
                  value={brevoSenderEmail}
                  onChange={(e) => setBrevoSenderEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground">
                  Must be an authenticated sender email verified in your Brevo account.
                </p>
              </div>

              {/* Sender Name */}
              <div className="space-y-2">
                <label className="font-mono text-xs font-bold text-foreground">
                  Sender Display Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NexusBlog Engineering Dispatch"
                  value={brevoSenderName}
                  onChange={(e) => setBrevoSenderName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground">
                  The name displayed in the subscriber&apos;s email client.
                </p>
              </div>
            </div>

            {/* Test Connection Button & Status */}
            <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">Verify Brevo Account Status</p>
                <p className="text-[11px] text-muted-foreground">
                  Pings Brevo REST API endpoints to confirm credentials, plan tier, and credit balances.
                </p>
              </div>

              <button
                type="button"
                onClick={handleVerifyBrevo}
                disabled={isVerifyingBrevo}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-mono font-semibold text-foreground transition-colors cursor-pointer disabled:opacity-50"
              >
                {isVerifyingBrevo ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span>Testing Connection...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    <span>Test Brevo Connection</span>
                  </>
                )}
              </button>
            </div>

            {brevoStatus.checked && (
              <div
                className={`p-4 rounded-xl border text-xs font-mono space-y-2 animate-in fade-in duration-200 ${
                  brevoStatus.verified
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-start gap-2 font-bold">
                  {brevoStatus.verified ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{brevoStatus.message}</span>
                </div>
                {brevoStatus.verified && brevoStatus.details?.email && (
                  <div className="text-[11px] text-muted-foreground pl-6 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-emerald-500/20">
                    <p>Account: <strong className="text-foreground">{brevoStatus.details.email}</strong></p>
                    <p>Company: <strong className="text-foreground">{brevoStatus.details.companyName || 'Registered'}</strong></p>
                    <p>Plan: <strong className="text-foreground">{brevoStatus.details.plan || 'Free Tier'}</strong></p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 2: Live Test Email Dispatcher */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-border/40 pb-4">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Send className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
                  Live Test Email Dispatcher
                </h2>
                <p className="text-xs text-muted-foreground">
                  Dispatch a real-time verification email to verify inbox delivery, DKIM, and SPF headers.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="email"
                  placeholder="Enter recipient email (e.g. dev@example.com)"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSendingTestEmail}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 transition-opacity shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSendingTestEmail ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Dispatching Test...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Test Email</span>
                  </>
                )}
              </button>
            </div>

            {testEmailResult && (
              <div
                className={`p-4 rounded-xl border text-xs font-mono space-y-1.5 animate-in fade-in duration-200 ${
                  testEmailResult.success
                    ? testEmailResult.simulated
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    {testEmailResult.success ? (
                      <CheckCircle2 className={`h-4 w-4 ${testEmailResult.simulated ? 'text-amber-400' : 'text-emerald-400'}`} />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                    )}
                    {testEmailResult.success
                      ? testEmailResult.simulated
                        ? 'Email Pipeline Simulated'
                        : 'Live Test Email Delivered'
                      : 'Delivery Failed'}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{testEmailResult.timestamp}</span>
                </div>
                <p className="text-[11px] pl-5.5 text-muted-foreground leading-relaxed">
                  {testEmailResult.message}
                </p>
              </div>
            )}
          </div>

          {/* Card 3: Platform & Portal Runtime */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 border-b border-border/40 pb-4">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
                  Platform &amp; Portal Runtime
                </h2>
                <p className="text-xs text-muted-foreground">
                  Global canonical URLs, branding defaults, and lifecycle automation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Site URL */}
              <div className="space-y-2">
                <label className="font-mono text-xs font-bold text-foreground">
                  Public Site URL (Canonical) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://nexusnation.in"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Site Name */}
              <div className="space-y-2">
                <label className="font-mono text-xs font-bold text-foreground">
                  Portal Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="NexusBlog"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Toggles */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/20">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground">Auto-Welcome Email</p>
                    <p className="text-[11px] text-muted-foreground">
                      Send welcome email when user joins mailing list.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={newsletterAutoWelcome}
                    onChange={(e) => setNewsletterAutoWelcome(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                  />
                </div>

                <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${maintenanceMode ? 'border-amber-500/50 bg-amber-500/10' : 'border-border/60 bg-muted/20'}`}>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-foreground">Maintenance Mode</p>
                      {maintenanceMode && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 animate-pulse">
                          ACTIVE (Public Blocked)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Restrict public portal access with upgrade screen. Staff members retain bypass access.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-amber-500 focus:ring-amber-500 cursor-pointer accent-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Search Engine Crawlers & Robots.txt Policy */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileCode2 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
                    Search Engine Crawlers &amp; Robots.txt Policy
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Control how search bots (Google, Bing) index your application during development and production.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/admin/seo"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-md border border-border/50 hover:bg-muted transition-colors cursor-pointer"
                >
                  <Globe className="h-3 w-3 text-primary" />
                  <span>Full SEO Dashboard</span>
                </Link>

                <Link
                  href="/robots.txt"
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-md border border-border/50 hover:bg-muted transition-colors cursor-pointer"
                >
                  <span>View /robots.txt</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Mode selection radio cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div
                onClick={() => setRobotsIndexingMode('allow')}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  robotsIndexingMode === 'allow'
                    ? 'border-emerald-500/70 bg-emerald-500/10 ring-1 ring-emerald-500/50'
                    : 'border-border/60 bg-muted/20 hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Production
                  </span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full border ${
                      robotsIndexingMode === 'allow' ? 'bg-emerald-500 border-emerald-400' : 'border-border'
                    }`}
                  />
                </div>
                <p className="text-xs font-bold text-foreground">Allow Public Crawling</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Indexes public articles, blocks /admin and /api, embeds dynamic sitemap.
                </p>
              </div>

              <div
                onClick={() => setRobotsIndexingMode('disallow_all')}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  robotsIndexingMode === 'disallow_all'
                    ? 'border-amber-500/70 bg-amber-500/10 ring-1 ring-amber-500/50'
                    : 'border-border/60 bg-muted/20 hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5" /> Dev / Testing
                  </span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full border ${
                      robotsIndexingMode === 'disallow_all' ? 'bg-amber-500 border-amber-400' : 'border-border'
                    }`}
                  />
                </div>
                <p className="text-xs font-bold text-foreground">Block All Search Bots</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Disallow: / on entire site. Prevents indexing during testing and QA.
                </p>
              </div>

              <div
                onClick={() => setRobotsIndexingMode('custom')}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  robotsIndexingMode === 'custom'
                    ? 'border-primary/70 bg-primary/10 ring-1 ring-primary/50'
                    : 'border-border/60 bg-muted/20 hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-primary flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5" /> Custom Rules
                  </span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full border ${
                      robotsIndexingMode === 'custom' ? 'bg-primary border-primary' : 'border-border'
                    }`}
                  />
                </div>
                <p className="text-xs font-bold text-foreground">Custom Directives</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Custom robots.txt rules, crawl delays, and specific bots.
                </p>
              </div>
            </div>

            {robotsIndexingMode === 'custom' && (
              <div className="space-y-2 pt-2">
                <label className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-primary" />
                  <span>Custom Robots Directives</span>
                </label>
                <textarea
                  rows={6}
                  value={robotsCustomContent}
                  onChange={(e) => setRobotsCustomContent(e.target.value)}
                  placeholder="User-Agent: *&#10;Disallow: /admin&#10;..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs font-mono text-foreground focus:border-primary focus:outline-none leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* Card 4: Live Diagnostics & Environment Inspector */}
          {diagnostics && (
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
                      System Diagnostics &amp; Runtime Metrics
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Real-time database connectivity, process memory, and deployment parameters.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyEnvSnippet}
                    className="inline-flex items-center gap-1 text-xs font-mono px-3 py-1.5 rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground transition-colors cursor-pointer"
                  >
                    {copiedEnv ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedEnv ? 'Copied!' : 'Copy .env'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="inline-flex items-center gap-1 text-xs font-mono px-3 py-1.5 rounded-lg border border-border bg-muted/30 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-colors cursor-pointer"
                    title="Reset runtime parameters to factory defaults"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Defaults</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1 */}
                <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">Database Engine</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-base font-bold font-mono text-foreground">{diagnostics.database.engine}</p>
                  <p className="text-[11px] font-mono text-emerald-400">
                    {diagnostics.database.latencyMs}ms ping &bull; {diagnostics.database.status}
                  </p>
                </div>

                {/* Metric 2 */}
                <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
                  <span className="text-xs font-mono text-muted-foreground">Subscribers / Audience</span>
                  <p className="text-base font-bold font-mono text-primary">{diagnostics.database.subscribersCount}</p>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    {diagnostics.database.articlesCount} articles &bull; {diagnostics.database.seriesCount} tracks
                  </p>
                </div>

                {/* Metric 3 */}
                <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
                  <span className="text-xs font-mono text-muted-foreground">Mail Dispatch Provider</span>
                  <p className="text-base font-bold font-mono text-foreground truncate">
                    {diagnostics.emailService.isApiKeySet ? 'Brevo v3 (Live)' : 'Simulated (Dev)'}
                  </p>
                  <p className="text-[11px] font-mono text-muted-foreground truncate">
                    {diagnostics.emailService.senderEmail}
                  </p>
                </div>

                {/* Metric 4 */}
                <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
                  <span className="text-xs font-mono text-muted-foreground">Process Runtime</span>
                  <p className="text-base font-bold font-mono text-foreground">Node {diagnostics.runtime.nodeVersion}</p>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    {diagnostics.runtime.memoryUsageMb}MB heap &bull; {Math.floor(diagnostics.runtime.uptimeSeconds / 60)}m uptime
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Save Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 transition-opacity shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save All Configurations</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
