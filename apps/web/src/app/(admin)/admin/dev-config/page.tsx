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
  Share2,
  Link2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { systemSettingsApi, shortenerApi, articlesApi } from '@/lib/api-client';

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

  // URL Shortener Configuration State
  const [shortenerProvider, setShortenerProvider] = useState<'none' | 'dub' | 'bitly' | 'tinyurl' | 'custom' | 'native'>('none');
  const [shortenerApiKey, setShortenerApiKey] = useState('');
  const [shortenerCustomDomain, setShortenerCustomDomain] = useState('');
  const [shortenerWorkspaceId, setShortenerWorkspaceId] = useState('');
  const [shortenerCustomEndpoint, setShortenerCustomEndpoint] = useState('');
  const [shortenerCustomMethod, setShortenerCustomMethod] = useState<'POST' | 'GET'>('POST');
  const [shortenerCustomHeaders, setShortenerCustomHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [shortenerCustomBodyTemplate, setShortenerCustomBodyTemplate] = useState('{\n  "url": "{{url}}",\n  "domain": "{{domain}}"\n}');
  const [shortenerCustomResponsePath, setShortenerCustomResponsePath] = useState('shortUrl');
  const [shortenerAutoValidate, setShortenerAutoValidate] = useState(true);
  const [showShortenerKey, setShowShortenerKey] = useState(false);
  const [isTestingShortener, setIsTestingShortener] = useState(false);
  const [isSyncingShortlinks, setIsSyncingShortlinks] = useState(false);
  const [syncShortlinksResult, setSyncShortlinksResult] = useState<{
    total: number;
    updated: number;
    validated: number;
    failed: number;
    activeProvider?: string;
    message: string;
    errorSummary?: string;
    errors?: Array<{
      articleId: string;
      slug: string;
      title: string;
      reason: string;
    }>;
  } | null>(null);
  const [showSyncErrorDetails, setShowSyncErrorDetails] = useState(true);
  const [shortenerTestResult, setShortenerTestResult] = useState<{
    success: boolean;
    message: string;
    sampleShortUrl?: string;
  } | null>(null);

  // AI Content Summarizer State
  const [aiSummaryEnabled, setAiSummaryEnabled] = useState(true);
  const [aiSummaryProvider, setAiSummaryProvider] = useState<'hybrid' | 'gemini' | 'smart_extractor'>('hybrid');
  const [aiSummaryApiKey, setAiSummaryApiKey] = useState('');
  const [aiSummaryModel, setAiSummaryModel] = useState('gemini-1.5-flash');
  const [aiSummaryMaxBullets, setAiSummaryMaxBullets] = useState(3);
  const [showAiSummaryKey, setShowAiSummaryKey] = useState(false);
  const [isTestingAiSummary, setIsTestingAiSummary] = useState(false);
  const [aiSummaryTestResult, setAiSummaryTestResult] = useState<{
    success: boolean;
    bullets?: string[];
    source?: string;
    message?: string;
  } | null>(null);

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
        const resolvedSiteUrl =
          settingsData.siteUrl?.value && !settingsData.siteUrl.value.includes('localhost') && !settingsData.siteUrl.value.includes('127.0.0.1')
            ? settingsData.siteUrl.value.trim().replace(/\/+$/, '')
            : typeof window !== 'undefined' && window.location?.origin && !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1')
              ? window.location.origin.replace(/\/+$/, '')
              : 'https://nexusnation.in';
        setSiteUrl(resolvedSiteUrl);
        setSiteName(settingsData.siteName?.value || 'NexusBlog');
        setNewsletterAutoWelcome(settingsData.newsletterAutoWelcome?.value !== 'false');
        setMaintenanceMode(settingsData.maintenanceMode?.value === 'true');
        setRobotsIndexingMode((settingsData.robotsIndexingMode?.value as any) || 'allow');
        setRobotsCustomContent(settingsData.robotsCustomContent?.value || '');
        setShortenerProvider((settingsData.shortenerProvider?.value as any) || 'none');
        setShortenerApiKey(settingsData.shortenerApiKey?.value || '');
        setShortenerCustomDomain(settingsData.shortenerCustomDomain?.value || '');
        setShortenerWorkspaceId(settingsData.shortenerWorkspaceId?.value || '');
        setShortenerCustomEndpoint(settingsData.shortenerCustomEndpoint?.value || '');
        setShortenerCustomMethod((settingsData.shortenerCustomMethod?.value as any) || 'POST');
        setShortenerCustomHeaders(settingsData.shortenerCustomHeaders?.value || '{\n  "Content-Type": "application/json"\n}');
        setShortenerCustomBodyTemplate(settingsData.shortenerCustomBodyTemplate?.value || '{\n  "url": "{{url}}",\n  "domain": "{{domain}}"\n}');
        setShortenerCustomResponsePath(settingsData.shortenerCustomResponsePath?.value || 'shortUrl');
        setShortenerAutoValidate(settingsData.shortenerAutoValidate?.value !== 'false');
        setAiSummaryEnabled(settingsData.aiSummaryEnabled?.value !== 'false');
        setAiSummaryProvider((settingsData.aiSummaryProvider?.value as any) || 'hybrid');
        setAiSummaryApiKey(settingsData.aiSummaryApiKey?.value || '');
        setAiSummaryModel(settingsData.aiSummaryModel?.value || 'gemini-1.5-flash');
        setAiSummaryMaxBullets(parseInt(settingsData.aiSummaryMaxBullets?.value || '3', 10) || 3);
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
      const cleanSiteUrl =
        siteUrl && !siteUrl.includes('localhost') && !siteUrl.includes('127.0.0.1')
          ? siteUrl.trim().replace(/\/+$/, '')
          : 'https://nexusnation.in';

      const payload: Record<string, string> = {
        brevoApiKey: brevoApiKey.trim(),
        brevoSenderEmail: brevoSenderEmail.trim(),
        brevoSenderName: brevoSenderName.trim(),
        siteUrl: cleanSiteUrl,
        siteName: siteName.trim(),
        newsletterAutoWelcome: String(newsletterAutoWelcome),
        maintenanceMode: String(maintenanceMode),
        robotsIndexingMode,
        robotsCustomContent: robotsCustomContent.trim(),
        shortenerProvider,
        shortenerApiKey: shortenerApiKey.trim(),
        shortenerCustomDomain: shortenerCustomDomain.trim(),
        shortenerWorkspaceId: shortenerWorkspaceId.trim(),
        shortenerCustomEndpoint: shortenerCustomEndpoint.trim(),
        shortenerCustomMethod,
        shortenerCustomHeaders: shortenerCustomHeaders.trim(),
        shortenerCustomBodyTemplate: shortenerCustomBodyTemplate.trim(),
        shortenerCustomResponsePath: shortenerCustomResponsePath.trim(),
        shortenerAutoValidate: String(shortenerAutoValidate),
        aiSummaryEnabled: String(aiSummaryEnabled),
        aiSummaryProvider,
        aiSummaryApiKey: aiSummaryApiKey.trim(),
        aiSummaryModel,
        aiSummaryMaxBullets: String(aiSummaryMaxBullets),
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

  const handleTestShortener = async () => {
    if (shortenerProvider === 'none') {
      toast.info('Please select a shortener provider (Dub.co, Bitly, TinyURL, Custom API, or Native) to test.');
      return;
    }

    const rawKey = shortenerApiKey.trim();
    const apiKeyToTest = rawKey && !rawKey.includes('...') && rawKey !== '********' ? rawKey : undefined;

    setIsTestingShortener(true);
    setShortenerTestResult(null);
    try {
      const res = await shortenerApi.testConnection({
        provider: shortenerProvider,
        apiKey: apiKeyToTest || shortenerApiKey,
        customDomain: shortenerCustomDomain.trim() || undefined,
        workspaceId: shortenerWorkspaceId.trim() || undefined,
        customEndpoint: shortenerCustomEndpoint.trim() || undefined,
        customMethod: shortenerCustomMethod,
        customHeaders: shortenerCustomHeaders.trim() || undefined,
        customBodyTemplate: shortenerCustomBodyTemplate.trim() || undefined,
        customResponsePath: shortenerCustomResponsePath.trim() || undefined,
      });

      setShortenerTestResult(res);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      setShortenerTestResult({
        success: false,
        message: err.message || 'Failed to connect to shortener provider',
      });
      toast.error(err.message || 'Shortener connection test error');
    } finally {
      setIsTestingShortener(false);
    }
  };

  const handleTestAiSummary = async () => {
    setIsTestingAiSummary(true);
    setAiSummaryTestResult(null);
    try {
      const res = await articlesApi.summarize({
        title: 'High-Throughput Distributed Microservices Architecture',
        excerpt: 'A technical deep dive on CQRS, event-driven streaming, and sub-millisecond database caching.',
        content: '## Microservices Architecture\nDistributed systems require fault isolation and event-driven messaging...\n## Database Caching\nUsing Redis write-through cache reduces latency to sub-millisecond ranges.',
      });
      setAiSummaryTestResult({
        success: true,
        bullets: res.bullets,
        source: res.source,
        message: `AI Summarizer test completed successfully using ${res.source === 'gemini' ? 'Gemini AI' : 'Smart Extractor'} engine!`,
      });
      toast.success('AI Summarizer test completed!');
    } catch (err: any) {
      setAiSummaryTestResult({
        success: false,
        message: err.message || 'AI Summarizer test failed',
      });
      toast.error(err.message || 'AI Summarizer test failed');
    } finally {
      setIsTestingAiSummary(false);
    }
  };

  const handleSyncAllShortlinks = async (forceRegenerate = false) => {
    setIsSyncingShortlinks(true);
    setSyncShortlinksResult(null);
    try {
      const res = await shortenerApi.syncAllArticles({
        forceRegenerate,
        provider: shortenerProvider,
        apiKey: shortenerApiKey.trim() || undefined,
        customDomain: shortenerCustomDomain.trim() || undefined,
        workspaceId: shortenerWorkspaceId.trim() || undefined,
        customEndpoint: shortenerCustomEndpoint.trim() || undefined,
        customMethod: shortenerCustomMethod,
        customHeaders: shortenerCustomHeaders.trim() || undefined,
        customBodyTemplate: shortenerCustomBodyTemplate.trim() || undefined,
        customResponsePath: shortenerCustomResponsePath.trim() || undefined,
        autoValidate: shortenerAutoValidate,
      });
      setSyncShortlinksResult(res);
      if (res.failed > 0 && res.updated === 0 && res.validated === 0) {
        toast.error(res.errorSummary || res.message);
      } else if (res.failed > 0) {
        toast.warning(res.message);
      } else {
        toast.success(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to sync article shortlinks');
    } finally {
      setIsSyncingShortlinks(false);
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

          {/* Card: URL Shortener & Branded Link Sharing */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Share2 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
                    URL Shortener &amp; Branded Link Sharing
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Automatically shorten article share links using Dub.co, Bitly, or TinyURL with custom domain support.
                  </p>
                </div>
              </div>

              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold border ${
                shortenerProvider !== 'none'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-muted/40 text-muted-foreground border-border/60'
              }`}>
                <span className={`h-2 w-2 rounded-full ${shortenerProvider !== 'none' ? 'bg-emerald-400 animate-pulse' : 'bg-muted-foreground'}`} />
                <span>{shortenerProvider !== 'none' ? `${shortenerProvider.toUpperCase()} Active` : 'Disabled (Canonical)'}</span>
              </span>
            </div>

            {/* Provider Selector */}
            <div className="space-y-2">
              <label className="font-mono text-xs font-bold text-foreground">
                Shortener Provider Engine
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { id: 'none', label: 'Disabled', desc: 'Canonical URL' },
                  { id: 'dub', label: 'Dub.co', desc: 'Modern & Fast' },
                  { id: 'bitly', label: 'Bitly API', desc: 'bit.ly links' },
                  { id: 'tinyurl', label: 'TinyURL', desc: 'Simple API' },
                  { id: 'custom', label: 'Custom API', desc: 'Webhook / REST' },
                  { id: 'native', label: 'Native /s/', desc: 'Self-Hosted' },
                ].map((prov) => (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => setShortenerProvider(prov.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      shortenerProvider === prov.id
                        ? 'border-primary bg-primary/10 ring-1 ring-primary'
                        : 'border-border/60 bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <p className="text-xs font-mono font-bold text-foreground">{prov.label}</p>
                    <p className="text-[10px] text-muted-foreground">{prov.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Provider Configuration Forms */}
            {shortenerProvider !== 'none' && (
              <div className="space-y-6 pt-2 border-t border-border/40">
                {/* 1. Dub.co / Bitly / TinyURL Configuration */}
                {(shortenerProvider === 'dub' || shortenerProvider === 'bitly' || shortenerProvider === 'tinyurl') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Key className="h-3.5 w-3.5 text-primary" />
                          <span>{shortenerProvider.toUpperCase()} API Key / Bearer Token *</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowShortenerKey(!showShortenerKey)}
                          className="text-[11px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                        >
                          {showShortenerKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          <span>{showShortenerKey ? 'Hide' : 'Reveal'}</span>
                        </button>
                      </div>
                      <input
                        type={showShortenerKey ? 'text' : 'password'}
                        placeholder={`Enter your ${shortenerProvider.toUpperCase()} API Key`}
                        value={shortenerApiKey}
                        onChange={(e) => setShortenerApiKey(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-primary" />
                        <span>Custom Short Domain (Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. nx.link, nxs.to, or dub.sh"
                        value={shortenerCustomDomain}
                        onChange={(e) => setShortenerCustomDomain(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                      <p className="text-[10px] text-muted-foreground font-mono">
                        Leave blank to use provider default domain.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Sliders className="h-3.5 w-3.5 text-primary" />
                        <span>Workspace / Group ID (Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ws_12345 (Dub.co) or Bk12345 (Bitly)"
                        value={shortenerWorkspaceId}
                        onChange={(e) => setShortenerWorkspaceId(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                      <p className="text-[10px] text-muted-foreground font-mono">
                        Target workspace or group GUID for team accounts.
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Custom REST API / Webhook Configuration */}
                {shortenerProvider === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl border border-sky-500/20 bg-sky-500/5">
                    <div className="space-y-2 md:col-span-2">
                      <label className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Code2 className="h-3.5 w-3.5 text-sky-400" />
                        <span>Custom REST API Endpoint URL *</span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://api.short.io/links or https://kutt.it/api/v2/links"
                        value={shortenerCustomEndpoint}
                        onChange={(e) => setShortenerCustomEndpoint(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-mono text-xs font-bold text-foreground">HTTP Method</label>
                      <select
                        value={shortenerCustomMethod}
                        onChange={(e) => setShortenerCustomMethod(e.target.value as any)}
                        className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                      >
                        <option value="POST">POST (JSON Body Payload)</option>
                        <option value="GET">GET (Query Parameters)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="font-mono text-xs font-bold text-foreground">Response JSON Key Path</label>
                      <input
                        type="text"
                        placeholder="e.g. shortURL, data.short_url, or link"
                        value={shortenerCustomResponsePath}
                        onChange={(e) => setShortenerCustomResponsePath(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                      />
                      <p className="text-[10px] text-muted-foreground font-mono">
                        Dot notation path to extract the shortened URL from response.
                      </p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="font-mono text-xs font-bold text-foreground">Custom HTTP Headers (JSON)</label>
                      <textarea
                        rows={3}
                        value={shortenerCustomHeaders}
                        onChange={(e) => setShortenerCustomHeaders(e.target.value)}
                        placeholder={'{\n  "Authorization": "Bearer YOUR_KEY",\n  "Content-Type": "application/json"\n}'}
                        className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="font-mono text-xs font-bold text-foreground">Request Body Template (JSON)</label>
                      <textarea
                        rows={3}
                        value={shortenerCustomBodyTemplate}
                        onChange={(e) => setShortenerCustomBodyTemplate(e.target.value)}
                        placeholder={'{\n  "originalURL": "{{url}}",\n  "domain": "{{domain}}"\n}'}
                        className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                      />
                      <p className="text-[10px] text-muted-foreground font-mono">
                        Placeholders: <code className="text-primary font-bold">{'{{url}}'}</code>, <code className="text-primary font-bold">{'{{domain}}'}</code>, <code className="text-primary font-bold">{'{{title}}'}</code>, <code className="text-primary font-bold">{'{{slug}}'}</code>
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. Native Internal Shortener Configuration */}
                {shortenerProvider === 'native' && (
                  <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-emerald-400" />
                      <h3 className="text-xs font-bold font-mono text-emerald-400 uppercase">
                        Self-Hosted MongoDB &amp; Next.js Internal Shortener
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Generates collision-resistant short codes (e.g. <code className="text-primary font-mono font-bold">nexusnation.in/s/k9x2ab</code>) permanently saved to MongoDB and redirected with HTTP 308. 100% free, zero external API keys, 0ms latency.
                    </p>

                    <div className="space-y-2">
                      <label className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-primary" />
                        <span>Custom Domain for Shortlinks (Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. nx.to or leave blank to use site URL"
                        value={shortenerCustomDomain}
                        onChange={(e) => setShortenerCustomDomain(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Link Health Verification & Auto-Healing Settings */}
                <div className="p-4 rounded-xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-mono font-bold text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Persistent Storage &amp; Auto-Healing Probe</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Reuses the same database shortlink for each article across all shares. If a stored link becomes unreachable, automatically regenerates a healthy link.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={shortenerAutoValidate}
                      onChange={(e) => setShortenerAutoValidate(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Test Connection & Bulk Sync Actions */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleTestShortener}
                      disabled={isTestingShortener || (shortenerProvider !== 'native' && shortenerProvider !== 'custom' && !shortenerApiKey)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-mono font-bold hover:bg-sky-500/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isTestingShortener ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Testing Provider...</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="h-3.5 w-3.5" />
                          <span>Test Provider &amp; Generate Sample</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSyncAllShortlinks(false)}
                      disabled={isSyncingShortlinks}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-mono font-bold hover:bg-purple-500/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isSyncingShortlinks ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Syncing Articles...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Sync &amp; Validate All Article Shortlinks</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Bulk Sync Result Display */}
                {syncShortlinksResult && (
                  <div
                    className={`p-4 rounded-xl border text-xs font-mono space-y-3 animate-in fade-in duration-200 ${
                      syncShortlinksResult.failed > 0 && syncShortlinksResult.updated === 0 && syncShortlinksResult.validated === 0
                        ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                        : syncShortlinksResult.failed > 0
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                          : 'border-purple-500/30 bg-purple-500/10 text-purple-300'
                    }`}
                  >
                    <div className="flex items-start gap-2 font-bold">
                      {syncShortlinksResult.failed === 0 ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : syncShortlinksResult.updated === 0 && syncShortlinksResult.validated === 0 ? (
                        <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <span className="leading-relaxed text-foreground">{syncShortlinksResult.message}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/40 text-[11px]">
                      <div>Total Articles: <strong className="text-foreground">{syncShortlinksResult.total}</strong></div>
                      <div>Updated / Healed: <strong className="text-emerald-400">{syncShortlinksResult.updated}</strong></div>
                      <div>Healthy Stored: <strong className="text-sky-400">{syncShortlinksResult.validated}</strong></div>
                      <div>Failed / Skipped: <strong className="text-rose-400">{syncShortlinksResult.failed}</strong></div>
                    </div>

                    {/* Root Cause Diagnostic Callout */}
                    {syncShortlinksResult.errorSummary && (
                      <div className="p-2.5 rounded-lg bg-background/60 border border-rose-500/30 text-[11px] font-sans text-rose-200 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold font-mono text-rose-300 text-xs">
                          <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                          <span>Root Cause Diagnostics:</span>
                        </div>
                        <p className="leading-relaxed">{syncShortlinksResult.errorSummary}</p>
                      </div>
                    )}

                    {/* Per-Article Error Breakdown */}
                    {syncShortlinksResult.errors && syncShortlinksResult.errors.length > 0 && (
                      <div className="pt-2 border-t border-border/40 space-y-2">
                        <button
                          type="button"
                          onClick={() => setShowSyncErrorDetails(!showSyncErrorDetails)}
                          className="text-[11px] font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {showSyncErrorDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          <span>{showSyncErrorDetails ? 'Hide' : 'View'} Failure Details ({syncShortlinksResult.errors.length} articles)</span>
                        </button>

                        {showSyncErrorDetails && (
                          <div className="max-h-48 overflow-y-auto rounded-lg border border-border/50 bg-background/80 divide-y divide-border/30 text-[10px]">
                            {syncShortlinksResult.errors.map((err, idx) => (
                              <div key={idx} className="p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-muted/30">
                                <div className="truncate max-w-[280px]">
                                  <span className="font-semibold text-foreground">{err.title}</span>
                                  <span className="text-muted-foreground text-[9px] block">/articles/{err.slug}</span>
                                </div>
                                <span className="text-rose-400 shrink-0 font-mono text-[10px] bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                                  {err.reason}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Test Result Display */}
                {shortenerTestResult && (
                  <div
                    className={`p-4 rounded-xl border text-xs font-mono space-y-2 animate-in fade-in duration-200 ${
                      shortenerTestResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <div className="flex items-start gap-2 font-bold">
                      {shortenerTestResult.success ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <span className="leading-relaxed">{shortenerTestResult.message}</span>
                    </div>

                    {shortenerTestResult.sampleShortUrl && (
                      <div className="pl-6 pt-1 border-t border-emerald-500/20 flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-muted-foreground">Sample Short Link:</span>
                        <a
                          href={shortenerTestResult.sampleShortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-foreground hover:underline inline-flex items-center gap-1 text-primary"
                        >
                          <span>{shortenerTestResult.sampleShortUrl}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card: AI Content Summarizer Engine & Feature Toggle */}
          <div className="rounded-2xl border border-primary/30 bg-card p-6 shadow-xs space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider flex items-center gap-2">
                    <span>AI Article Content Summarizer</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      ENTERPRISE FEATURE
                    </span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Control public article summarization visibility, Gemini AI LLM parameters, and zero-cost fallback strategy.
                  </p>
                </div>
              </div>

              {/* Master Feature Enable/Disable Toggle */}
              <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                <span className={`text-xs font-mono font-bold ${aiSummaryEnabled ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                  {aiSummaryEnabled ? 'FEATURE ENABLED' : 'FEATURE DISABLED'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiSummaryEnabled}
                    onChange={(e) => setAiSummaryEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            {/* Summarizer Settings Controls */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Engine Strategy Provider */}
                <div className="space-y-2">
                  <label className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    <span>Summarizer Engine Strategy</span>
                  </label>
                  <select
                    value={aiSummaryProvider}
                    onChange={(e) => setAiSummaryProvider(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="hybrid">Hybrid (Gemini AI + Smart Extractor Fallback) [Recommended]</option>
                    <option value="gemini">Gemini AI Only (Requires Gemini API Key)</option>
                    <option value="smart_extractor">Smart Extractor Only (Zero-Cost, 0 API Key Needed)</option>
                  </select>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Hybrid strategy automatically uses Gemini LLM if API Key is set, falling back to smart local extraction if absent.
                  </p>
                </div>

                {/* Gemini AI Model Selection */}
                <div className="space-y-2">
                  <label className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-amber-400" />
                    <span>Gemini AI Model Engine</span>
                  </label>
                  <select
                    value={aiSummaryModel}
                    onChange={(e) => setAiSummaryModel(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra-fast, High Accuracy)</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash (Latest Next-Gen Model)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Technical Reasoning)</option>
                  </select>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Target Google Generative AI model endpoint for markdown processing.
                  </p>
                </div>

                {/* Gemini API Key */}
                <div className="space-y-2 md:col-span-2">
                  <label className="font-mono text-xs font-bold text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5 text-amber-400" />
                      <span>Gemini AI API Key (Google AI Studio Key)</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground">Runtime ENV: GEMINI_API_KEY</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showAiSummaryKey ? 'text' : 'password'}
                      placeholder="AIzaSy... (Leave blank to use ENV or Smart Extractor)"
                      value={aiSummaryApiKey}
                      onChange={(e) => setAiSummaryApiKey(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background py-2.5 pl-4 pr-10 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAiSummaryKey(!showAiSummaryKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showAiSummaryKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Max Bullets */}
                <div className="space-y-2">
                  <label className="font-mono text-xs font-bold text-foreground">
                    Max Summary Takeaway Bullets
                  </label>
                  <select
                    value={aiSummaryMaxBullets}
                    onChange={(e) => setAiSummaryMaxBullets(parseInt(e.target.value, 10))}
                    className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value={3}>3 Bullets (Concise Executive Overview)</option>
                    <option value={4}>4 Bullets (Detailed Technical Overview)</option>
                    <option value={5}>5 Bullets (Full Architecture Breakdown)</option>
                  </select>
                </div>
              </div>

              {/* Test Action & Results */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border/40">
                <button
                  type="button"
                  onClick={handleTestAiSummary}
                  disabled={isTestingAiSummary}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold hover:bg-amber-500/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isTestingAiSummary ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Running AI Summarizer Probe...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Test AI Summarizer &amp; Sample Generation</span>
                    </>
                  )}
                </button>
              </div>

              {/* Test Result Display */}
              {aiSummaryTestResult && (
                <div
                  className={`p-4 rounded-xl border text-xs font-mono space-y-2 animate-in fade-in duration-200 ${
                    aiSummaryTestResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-start gap-2 font-bold">
                    {aiSummaryTestResult.success ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <span>{aiSummaryTestResult.message}</span>
                  </div>
                  {aiSummaryTestResult.bullets && (
                    <ul className="pl-6 space-y-1 pt-1 list-disc text-foreground/90">
                      {aiSummaryTestResult.bullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
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
