'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { adsApi } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  DollarSign,
  Megaphone,
  Globe2,
  Settings,
  Layers,
  BarChart3,
  FileCode,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Eye,
  MousePointerClick,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';

export default function AdminAdsPage() {
  const [activeTab, setActiveTab] = useState<'networks' | 'placements' | 'adstxt' | 'analytics'>('networks');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [savingAdsTxt, setSavingAdsTxt] = useState(false);

  // Data states
  const [globalConfig, setGlobalConfig] = useState<Record<string, any>>({
    ads_global_enabled: true,
    ads_google_adsense_enabled: true,
    ads_google_adsense_client_id: '',
    ads_google_adsense_auto_ads: false,
    ads_carbon_enabled: false,
    ads_carbon_serve_id: '',
    ads_carbon_placement: '',
    ads_ethical_ads_enabled: false,
    ads_ethical_ads_publisher_id: '',
    ads_adsterra_enabled: false,
    ads_hide_for_logged_in: false,
    ads_interstitial_enabled: false,
    ads_interstitial_timer_seconds: 5,
    ads_interstitial_frequency_minutes: 10,
    ads_interstitial_network: 'CUSTOM_HTML',
    ads_interstitial_custom_html: '',
    ads_interstitial_custom_image: '',
    ads_interstitial_custom_url: '',
    ads_interstitial_title: 'Sponsored Architecture Briefing',
  });

  const [placements, setPlacements] = useState<any[]>([]);
  const [adsTxtContent, setAdsTxtContent] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlacement, setEditingPlacement] = useState<any>(null);
  const [previewPlacement, setPreviewPlacement] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    network: 'GOOGLE_ADSENSE',
    status: 'ACTIVE',
    format: 'RESPONSIVE',
    slotId: '',
    clientOrPublisherId: '',
    customHtml: '',
    customImage: '',
    customUrl: '',
    customAlt: '',
    order: 0,
  });

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [configRes, placementsRes, adsTxtRes] = await Promise.all([
        adsApi.getAdminConfig().catch(() => null),
        adsApi.getAdminPlacements().catch(() => []),
        adsApi.getPublicConfig().then(async () => {
          try {
            const res = await fetch('/ads.txt');
            return await res.text();
          } catch {
            return '';
          }
        }).catch(() => ''),
      ]);

      if (configRes) setGlobalConfig(configRes);
      if (placementsRes) setPlacements(placementsRes);
      if (adsTxtRes) setAdsTxtContent(adsTxtRes);
    } catch (err) {
      console.error('Failed to load ad data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Global Config Save
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const payload = {
        ads_global_enabled: Boolean(globalConfig.ads_global_enabled),
        ads_google_adsense_enabled: Boolean(globalConfig.ads_google_adsense_enabled),
        ads_google_adsense_client_id: String(globalConfig.ads_google_adsense_client_id || ''),
        ads_google_adsense_auto_ads: Boolean(globalConfig.ads_google_adsense_auto_ads),
        ads_carbon_enabled: Boolean(globalConfig.ads_carbon_enabled),
        ads_carbon_serve_id: String(globalConfig.ads_carbon_serve_id || ''),
        ads_carbon_placement: String(globalConfig.ads_carbon_placement || ''),
        ads_ethical_ads_enabled: Boolean(globalConfig.ads_ethical_ads_enabled),
        ads_ethical_ads_publisher_id: String(globalConfig.ads_ethical_ads_publisher_id || ''),
        ads_adsterra_enabled: Boolean(globalConfig.ads_adsterra_enabled),
        ads_hide_for_logged_in: Boolean(globalConfig.ads_hide_for_logged_in),
        ads_interstitial_enabled: Boolean(globalConfig.ads_interstitial_enabled),
        ads_interstitial_timer_seconds: Number(globalConfig.ads_interstitial_timer_seconds || 5),
        ads_interstitial_frequency_minutes: Number(globalConfig.ads_interstitial_frequency_minutes || 10),
        ads_interstitial_network: String(globalConfig.ads_interstitial_network || 'CUSTOM_HTML'),
        ads_interstitial_custom_html: String(globalConfig.ads_interstitial_custom_html || ''),
        ads_interstitial_custom_image: String(globalConfig.ads_interstitial_custom_image || ''),
        ads_interstitial_custom_url: String(globalConfig.ads_interstitial_custom_url || ''),
        ads_interstitial_title: String(globalConfig.ads_interstitial_title || 'Sponsored Architecture Briefing'),
      };
      const updated = await adsApi.updateAdminConfig(payload);
      if (updated) setGlobalConfig(updated);
      toast.success('Ad network settings saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update ad settings');
    } finally {
      setSavingConfig(false);
    }
  };

  // Handle ads.txt Save
  const handleSaveAdsTxt = async () => {
    setSavingAdsTxt(true);
    try {
      await adsApi.updateAdsTxt(adsTxtContent);
      toast.success('ads.txt updated and live immediately');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update ads.txt');
    } finally {
      setSavingAdsTxt(false);
    }
  };

  // Open Create/Edit Modal
  const handleOpenModal = (placement?: any) => {
    if (placement) {
      setEditingPlacement(placement);
      setFormData({
        name: placement.name || '',
        slug: placement.slug || '',
        network: placement.network || 'GOOGLE_ADSENSE',
        status: placement.status || 'ACTIVE',
        format: placement.format || 'RESPONSIVE',
        slotId: placement.slotId || '',
        clientOrPublisherId: placement.clientOrPublisherId || '',
        customHtml: placement.customHtml || '',
        customImage: placement.customImage || '',
        customUrl: placement.customUrl || '',
        customAlt: placement.customAlt || '',
        order: placement.order || 0,
      });
    } else {
      setEditingPlacement(null);
      setFormData({
        name: '',
        slug: '',
        network: 'GOOGLE_ADSENSE',
        status: 'ACTIVE',
        format: 'RESPONSIVE',
        slotId: '',
        clientOrPublisherId: '',
        customHtml: '',
        customImage: '',
        customUrl: '',
        customAlt: '',
        order: (placements.length || 0) + 1,
      });
    }
    setIsModalOpen(true);
  };

  // Submit Placement Form
  const handleSubmitPlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlacement) {
        await adsApi.updatePlacement(editingPlacement.id, formData);
        toast.success('Placement updated successfully');
      } else {
        await adsApi.createPlacement(formData);
        toast.success('New ad placement created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save ad placement');
    }
  };

  // Quick Toggle Placement Status
  const handleToggleStatus = async (placement: any) => {
    const newStatus = placement.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await adsApi.updatePlacement(placement.id, { status: newStatus });
      setPlacements((prev) =>
        prev.map((p) => (p.id === placement.id ? { ...p, status: newStatus } : p))
      );
      toast.success(`Placement ${newStatus === 'ACTIVE' ? 'activated' : 'paused'}`);
    } catch {
      toast.error('Failed to toggle placement status');
    }
  };

  // Delete Placement
  const handleDeletePlacement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad placement?')) return;
    try {
      await adsApi.deletePlacement(id);
      setPlacements((prev) => prev.filter((p) => p.id !== id));
      toast.success('Ad placement deleted');
    } catch {
      toast.error('Failed to delete ad placement');
    }
  };

  // Summary Metrics
  const totalImpressions = placements.reduce((acc, p) => acc + (p.impressionsCount || 0), 0);
  const totalClicks = placements.reduce((acc, p) => acc + (p.clicksCount || 0), 0);
  const avgCtr =
    totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;
  const activePlacementsCount = placements.filter((p) => p.status === 'ACTIVE').length;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
            <DollarSign className="h-4 w-4" />
            <span>Monetization &amp; Ad Network Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Ad Networks &amp; Placement Engine
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage Google AdSense, Carbon Ads, EthicalAds, Adsterra, direct sponsorships, ad slots, and ads.txt verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Master Ad Status Badge */}
          <div
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-mono font-semibold border ${
              globalConfig.ads_global_enabled
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {globalConfig.ads_global_enabled && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  globalConfig.ads_global_enabled ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <span>{globalConfig.ads_global_enabled ? 'Ads Engine Active' : 'Ads Globally Paused'}</span>
          </div>

          {/* View ads.txt Link */}
          <a
            href="/ads.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-background hover:bg-muted text-foreground text-xs font-mono font-medium transition-colors shadow-2xs"
          >
            <FileCode className="h-3.5 w-3.5 text-primary" />
            <span>/ads.txt</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </a>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-2 rounded-xl border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-2xs"
            title="Refresh Ad Data"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Top KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-mono font-medium">Active Placements</span>
            <Layers className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black font-mono text-foreground">
            {activePlacementsCount} <span className="text-xs font-normal text-muted-foreground">/ {placements.length}</span>
          </div>
          <div className="text-[11px] font-mono text-muted-foreground">Live display slots</div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-mono font-medium">Total Impressions</span>
            <Eye className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-foreground">
            {totalImpressions.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono text-muted-foreground">Verified views recorded</div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-mono font-medium">Total Clicks</span>
            <MousePointerClick className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-foreground">
            {totalClicks.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono text-muted-foreground">Sponsor click-throughs</div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-mono font-medium">Avg CTR %</span>
            <BarChart3 className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-foreground">{avgCtr}%</div>
          <div className="text-[11px] font-mono text-muted-foreground">Conversion effectiveness</div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3 overflow-x-auto no-scrollbar font-mono text-xs">
        {[
          { id: 'networks', label: '1. Ad Networks & Providers', icon: Globe2 },
          { id: 'placements', label: '2. Placement Slots Manager', icon: Layers },
          { id: 'adstxt', label: '3. ads.txt File Editor', icon: FileCode },
          { id: 'analytics', label: '4. Telemetry & CTR Analytics', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer font-medium whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: NETWORKS & GLOBAL CONFIGURATION */}
      {/* ========================================================= */}
      {activeTab === 'networks' && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          {/* Master Kill Switches Card */}
          <div className="rounded-3xl border border-border/80 bg-card/90 p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  <span>Master Engine Controls</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Global controls that apply sitewide across all platforms and devices.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Global Master Switch */}
              <div className="p-4 rounded-2xl border border-border/60 bg-muted/20 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-foreground">Global Advertising Switch</span>
                  <p className="text-xs text-muted-foreground">
                    When disabled, turns off all banners, AdSense scripts, and network widgets instantly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setGlobalConfig((prev) => ({
                      ...prev,
                      ads_global_enabled: !prev.ads_global_enabled,
                    }))
                  }
                  className="cursor-pointer text-2xl"
                >
                  {globalConfig.ads_global_enabled ? (
                    <ToggleRight className="h-8 w-8 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                  )}
                </button>
              </div>

              {/* Hide for Logged-In Members */}
              <div className="p-4 rounded-2xl border border-border/60 bg-muted/20 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-foreground">Ad-Free For Signed-In Members</span>
                  <p className="text-xs text-muted-foreground">
                    Automatically suppresses all advertisements for logged-in readers and subscribers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setGlobalConfig((prev) => ({
                      ...prev,
                      ads_hide_for_logged_in: !prev.ads_hide_for_logged_in,
                    }))
                  }
                  className="cursor-pointer text-2xl"
                >
                  {globalConfig.ads_hide_for_logged_in ? (
                    <ToggleRight className="h-8 w-8 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Ad Providers Cards Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-4">
            {/* Provider 1: Google AdSense */}
            <div className="rounded-3xl border border-border/80 bg-card/90 p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-xs">
                      G
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Google AdSense</h4>
                      <p className="text-[10px] font-mono text-muted-foreground">Universal display ads</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setGlobalConfig((prev) => ({
                        ...prev,
                        ads_google_adsense_enabled: !prev.ads_google_adsense_enabled,
                      }))
                    }
                    className="cursor-pointer"
                  >
                    {globalConfig.ads_google_adsense_enabled ? (
                      <ToggleRight className="h-7 w-7 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-muted-foreground" />
                    )}
                  </button>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-muted-foreground">AdSense Publisher ID</label>
                    <input
                      type="text"
                      placeholder="ca-pub-9847291823746501"
                      value={globalConfig.ads_google_adsense_client_id || ''}
                      onChange={(e) =>
                        setGlobalConfig((prev) => ({
                          ...prev,
                          ads_google_adsense_client_id: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/50 bg-muted/20">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-foreground">Google Auto Ads</span>
                      <p className="text-[10px] text-muted-foreground">Automated in-page machine placement</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setGlobalConfig((prev) => ({
                          ...prev,
                          ads_google_adsense_auto_ads: !prev.ads_google_adsense_auto_ads,
                        }))
                      }
                      className="cursor-pointer"
                    >
                      {globalConfig.ads_google_adsense_auto_ads ? (
                        <ToggleRight className="h-6 w-6 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/40 text-[10px] text-muted-foreground">
                Requires approval on <a href="https://adsense.google.com" target="_blank" className="text-primary hover:underline">adsense.google.com</a>
              </div>
            </div>

            {/* Provider 2: Carbon Ads (BuySellAds) */}
            <div className="rounded-3xl border border-border/80 bg-card/90 p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-bold text-xs">
                      C
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Carbon Ads (BuySellAds)</h4>
                      <p className="text-[10px] font-mono text-muted-foreground">Developer tech sponsor units</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setGlobalConfig((prev) => ({
                        ...prev,
                        ads_carbon_enabled: !prev.ads_carbon_enabled,
                      }))
                    }
                    className="cursor-pointer"
                  >
                    {globalConfig.ads_carbon_enabled ? (
                      <ToggleRight className="h-7 w-7 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-muted-foreground" />
                    )}
                  </button>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-muted-foreground">Carbon Serve ID</label>
                    <input
                      type="text"
                      placeholder="CEBD42Q"
                      value={globalConfig.ads_carbon_serve_id || ''}
                      onChange={(e) =>
                        setGlobalConfig((prev) => ({
                          ...prev,
                          ads_carbon_serve_id: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-muted-foreground">Carbon Placement Slug</label>
                    <input
                      type="text"
                      placeholder="nexusnationin"
                      value={globalConfig.ads_carbon_placement || ''}
                      onChange={(e) =>
                        setGlobalConfig((prev) => ({
                          ...prev,
                          ads_carbon_placement: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/40 text-[10px] text-muted-foreground">
                High CPM developer network from <a href="https://carbonads.net" target="_blank" className="text-primary hover:underline">carbonads.net</a>
              </div>
            </div>

            {/* Provider 3: EthicalAds */}
            <div className="rounded-3xl border border-border/80 bg-card/90 p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                      E
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">EthicalAds</h4>
                      <p className="text-[10px] font-mono text-muted-foreground">Privacy-first developer ads</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setGlobalConfig((prev) => ({
                        ...prev,
                        ads_ethical_ads_enabled: !prev.ads_ethical_ads_enabled,
                      }))
                    }
                    className="cursor-pointer"
                  >
                    {globalConfig.ads_ethical_ads_enabled ? (
                      <ToggleRight className="h-7 w-7 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-muted-foreground" />
                    )}
                  </button>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-muted-foreground">EthicalAds Publisher ID</label>
                    <input
                      type="text"
                      placeholder="nexus-developer-blog"
                      value={globalConfig.ads_ethical_ads_publisher_id || ''}
                      onChange={(e) =>
                        setGlobalConfig((prev) => ({
                          ...prev,
                          ads_ethical_ads_publisher_id: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/40 text-[10px] text-muted-foreground">
                One EthicalAds unit must be the only third-party ad on that page. <a href="https://www.ethicalads.io/publisher-policy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Publisher policy ↗</a>
              </div>
            </div>

            {/* Provider 4: Adsterra inline native placements */}
            <div className="rounded-3xl border border-border/80 bg-card/90 p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-xs font-bold text-violet-400">A</div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Adsterra</h4>
                      <p className="text-[10px] font-mono text-muted-foreground">Inline native banner units</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`${globalConfig.ads_adsterra_enabled ? 'Disable' : 'Enable'} Adsterra`}
                    aria-pressed={Boolean(globalConfig.ads_adsterra_enabled)}
                    onClick={() => setGlobalConfig((prev) => ({ ...prev, ads_adsterra_enabled: !prev.ads_adsterra_enabled }))}
                    className="cursor-pointer"
                  >
                    {globalConfig.ads_adsterra_enabled ? <ToggleRight className="h-7 w-7 text-emerald-400" /> : <ToggleLeft className="h-7 w-7 text-muted-foreground" />}
                  </button>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  Enable this network, then add a Native Banner placement using its HTTPS invoke.js URL and container ID. Popunder and Social Bar formats are intentionally excluded to prevent interruptions and overlays.
                </p>
              </div>
              <div className="border-t border-border/40 pt-3 text-[10px] text-muted-foreground">
                <a href="https://help-publishers.adsterra.com/en/collections/2274770-ad-units-and-code-snippets" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Adsterra publisher setup guide ↗</a>
              </div>
            </div>

            {/* Provider 5: Interstitial / Vignette Full-Page Ads */}
            <div className="rounded-3xl border border-border/80 bg-card/90 p-6 space-y-4 shadow-sm flex flex-col justify-between col-span-1 md:col-span-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-xs font-bold text-amber-400">
                      V
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Full-Page Interstitial / Vignette Ads</h4>
                      <p className="text-[10px] font-mono text-muted-foreground">Full-screen overlay ad with countdown timer &amp; close skip button before reading</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setGlobalConfig((prev) => ({
                        ...prev,
                        ads_interstitial_enabled: !prev.ads_interstitial_enabled,
                      }))
                    }
                    className="cursor-pointer"
                  >
                    {globalConfig.ads_interstitial_enabled ? (
                      <ToggleRight className="h-7 w-7 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-muted-foreground" />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-muted-foreground font-bold">Timer Seconds (Countdown)</label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={globalConfig.ads_interstitial_timer_seconds ?? 5}
                      onChange={(e) =>
                        setGlobalConfig((prev) => ({
                          ...prev,
                          ads_interstitial_timer_seconds: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                      className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                    />
                    <span className="text-[10px] text-muted-foreground">Seconds before Skip button activates</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-muted-foreground font-bold">Frequency Cap (Minutes)</label>
                    <input
                      type="number"
                      min={0}
                      max={1440}
                      value={globalConfig.ads_interstitial_frequency_minutes ?? 10}
                      onChange={(e) =>
                        setGlobalConfig((prev) => ({
                          ...prev,
                          ads_interstitial_frequency_minutes: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                      className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                    />
                    <span className="text-[10px] text-muted-foreground">Min gap between interstitials per user</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-muted-foreground font-bold">Ad Format Mode</label>
                    <select
                      value={globalConfig.ads_interstitial_network || 'CUSTOM_HTML'}
                      onChange={(e) =>
                        setGlobalConfig((prev) => ({
                          ...prev,
                          ads_interstitial_network: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs cursor-pointer"
                    >
                      <option value="CUSTOM_HTML">Custom HTML / Script / Adsterra</option>
                      <option value="CUSTOM_IMAGE">Custom Sponsor Image Banner</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 font-mono text-xs pt-2 border-t border-border/40">
                  <div className="space-y-1">
                    <label className="text-muted-foreground font-bold">Vignette Header Title</label>
                    <input
                      type="text"
                      placeholder="Sponsored Architecture Briefing"
                      value={globalConfig.ads_interstitial_title || ''}
                      onChange={(e) =>
                        setGlobalConfig((prev) => ({
                          ...prev,
                          ads_interstitial_title: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                    />
                  </div>

                  {globalConfig.ads_interstitial_network !== 'CUSTOM_IMAGE' ? (
                    <div className="space-y-1">
                      <label className="text-muted-foreground font-bold">Interstitial Script / HTML Embed Code</label>
                      <textarea
                        rows={3}
                        placeholder="<script src='https://bendspecimen.com/.../invoke.js'></script><div id='container-...'></div>"
                        value={globalConfig.ads_interstitial_custom_html || ''}
                        onChange={(e) =>
                          setGlobalConfig((prev) => ({
                            ...prev,
                            ads_interstitial_custom_html: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-border bg-zinc-950 p-3 text-emerald-400 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-muted-foreground font-bold">Sponsor Image URL</label>
                        <input
                          type="text"
                          placeholder="https://images.unsplash.com/..."
                          value={globalConfig.ads_interstitial_custom_image || ''}
                          onChange={(e) =>
                            setGlobalConfig((prev) => ({
                              ...prev,
                              ads_interstitial_custom_image: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-foreground text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-muted-foreground font-bold">Destination Target URL</label>
                        <input
                          type="text"
                          placeholder="https://partner.com"
                          value={globalConfig.ads_interstitial_custom_url || ''}
                          onChange={(e) =>
                            setGlobalConfig((prev) => ({
                              ...prev,
                              ads_interstitial_custom_url: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-foreground text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={savingConfig}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold font-mono text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-md disabled:opacity-50"
            >
              {savingConfig ? 'Saving Settings...' : 'Save Ad Networks Configuration'}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PLACEMENT SLOTS MANAGER */}
      {/* ========================================================= */}
      {activeTab === 'placements' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-foreground">Registered Display Placements</h3>
              <p className="text-xs text-muted-foreground font-mono">
                Manage layout slots, assigned ad networks, and live rendering statuses.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Create Ad Placement</span>
            </button>
          </div>

          {/* Placements Table */}
          <div className="rounded-3xl border border-border/80 bg-card/90 overflow-hidden shadow-sm">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] bg-muted/20">
                    <th className="py-3 px-4 font-semibold">Slot Name &amp; Slug</th>
                    <th className="py-3 px-4 font-semibold">Network</th>
                    <th className="py-3 px-4 font-semibold">Format</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Impressions</th>
                    <th className="py-3 px-4 font-semibold text-right">Clicks</th>
                    <th className="py-3 px-4 font-semibold text-right">CTR %</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-sans">
                  {placements.length > 0 ? (
                    placements.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-foreground block text-sm">{p.name}</span>
                            <span className="font-mono text-[11px] text-muted-foreground">{p.slug}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              p.network === 'GOOGLE_ADSENSE'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : p.network === 'CARBON_ADS'
                                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                                : p.network === 'ETHICAL_ADS'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            }`}
                          >
                            {p.network.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-muted-foreground text-[11px]">
                          {p.format}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(p)}
                            className="cursor-pointer"
                            title="Click to toggle Active / Paused"
                          >
                            {p.status === 'ACTIVE' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-bold">
                                Paused
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                          {p.impressionsCount?.toLocaleString() || 0}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                          {p.clicksCount?.toLocaleString() || 0}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                          {p.ctr || 0}%
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenModal(p)}
                              className="p-1.5 rounded-lg border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              title="Edit Placement"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePlacement(p.id)}
                              className="p-1.5 rounded-lg border border-border/60 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-colors cursor-pointer"
                              title="Delete Placement"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground font-mono text-xs">
                        No ad placements created yet. Click above to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: ADS.TXT LIVE EDITOR */}
      {/* ========================================================= */}
      {activeTab === 'adstxt' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground font-mono">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Domain Ownership &amp; IAB ads.txt Verification</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The <code className="bg-primary/10 text-primary px-1 rounded font-mono">/ads.txt</code> standard allows publishers to publicly declare who is authorized to sell their ad inventory. Google AdSense and publisher exchanges verify this record automatically to prevent unauthorized domain spoofing.
            </p>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card/90 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-foreground font-mono">ads.txt Record Editor</h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/ads.txt`);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-border/80 bg-muted/30 hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copiedLink ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy /ads.txt URL'}</span>
                </button>

                <a
                  href="/ads.txt"
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg border border-border/80 bg-muted/30 hover:bg-muted text-xs font-mono text-primary flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Live Endpoint</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <textarea
                rows={12}
                value={adsTxtContent}
                onChange={(e) => setAdsTxtContent(e.target.value)}
                placeholder="google.com, pub-9847291823746501, DIRECT, f08c47fec0942fa0"
                className="w-full rounded-2xl border border-border/80 bg-zinc-950 p-4 text-emerald-400 font-mono text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
              />
              <p className="text-[11px] text-muted-foreground">
                Format: <code className="text-foreground">domain, publisher-id, relationship, certification-id</code>
              </p>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-border/40">
              <button
                type="button"
                onClick={handleSaveAdsTxt}
                disabled={savingAdsTxt}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold font-mono text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-md disabled:opacity-50"
              >
                {savingAdsTxt ? 'Publishing...' : 'Save & Publish ads.txt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: TELEMETRY & CTR ANALYTICS */}
      {/* ========================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/80 bg-card/90 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span>Placement Performance Leaderboard</span>
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  Ranked by reader impressions, engagement clicks, and click-through efficiency.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] bg-muted/20">
                    <th className="py-3 px-4 font-semibold">Rank</th>
                    <th className="py-3 px-4 font-semibold">Slot Name</th>
                    <th className="py-3 px-4 font-semibold">Network</th>
                    <th className="py-3 px-4 font-semibold text-right">Impressions</th>
                    <th className="py-3 px-4 font-semibold text-right">Clicks</th>
                    <th className="py-3 px-4 font-semibold text-right">CTR %</th>
                    <th className="py-3 px-4 font-semibold">Conversion Velocity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-sans">
                  {placements.length > 0 ? (
                    [...placements]
                      .sort((a, b) => (b.clicksCount || 0) - (a.clicksCount || 0))
                      .map((p, idx) => (
                        <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-muted-foreground">
                            #{idx + 1}
                          </td>
                          <td className="py-3 px-4 font-bold text-foreground">{p.name}</td>
                          <td className="py-3 px-4 font-mono text-xs">{p.network}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                            {p.impressionsCount?.toLocaleString() || 0}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                            {p.clicksCount?.toLocaleString() || 0}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                            {p.ctr || 0}%
                          </td>
                          <td className="py-3 px-4">
                            <div className="w-32 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${Math.min(100, (p.ctr || 0) * 10)}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground font-mono text-xs">
                        No telemetry impressions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE / EDIT AD PLACEMENT */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="text-lg font-bold text-foreground">
                {editingPlacement ? 'Edit Ad Placement' : 'Create New Ad Placement'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitPlacement} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-bold">Placement Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Article Top Leaderboard"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-bold">Unique Slug</label>
                  <input
                    type="text"
                    required
                    placeholder="article-header"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-bold">Ad Network</label>
                  <select
                    value={formData.network}
                    onChange={(e) => setFormData({ ...formData, network: e.target.value, ...(e.target.value === 'ADSTERRA' ? { format: 'IN_FEED' } : {}) })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs cursor-pointer"
                  >
                    <option value="GOOGLE_ADSENSE">Google AdSense</option>
                    <option value="CARBON_ADS">Carbon Ads</option>
                    <option value="ETHICAL_ADS">EthicalAds</option>
                    <option value="ADSTERRA">Adsterra Native Banner</option>
                    <option value="CUSTOM_IMAGE">Custom Sponsor Image</option>
                    <option value="CUSTOM_HTML">Custom HTML / Script</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-bold">Format</label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs cursor-pointer"
                  >
                    <option value="RESPONSIVE">Responsive</option>
                    <option value="BANNER_728x90">Leaderboard 728x90</option>
                    <option value="RECTANGLE_300x250">Medium Rectangle 300x250</option>
                    <option value="SKYSCRAPER_160x600">Skyscraper 160x600</option>
                    <option value="IN_ARTICLE">In-Article Native</option>
                    {formData.network === 'ADSTERRA' && <option value="IN_FEED">Native Banner</option>}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-bold">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs cursor-pointer"
                  >
                    <option value="ACTIVE">Active (Rendering)</option>
                    <option value="PAUSED">Paused</option>
                    <option value="DISABLED">Disabled</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Inputs Based on Network */}
              {formData.network === 'GOOGLE_ADSENSE' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
                  <div className="space-y-1">
                    <label className="text-muted-foreground">Ad Slot ID (data-ad-slot)</label>
                    <input
                      type="text"
                      placeholder="1092837465"
                      value={formData.slotId}
                      onChange={(e) => setFormData({ ...formData, slotId: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground">Client ID (optional override)</label>
                    <input
                      type="text"
                      placeholder="ca-pub-9847291823746501"
                      value={formData.clientOrPublisherId}
                      onChange={(e) => setFormData({ ...formData, clientOrPublisherId: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground text-xs"
                    />
                  </div>
                </div>
              )}

              {formData.network === 'ADSTERRA' && (
                <div className="space-y-3 border-t border-border/40 pt-3">
                  <p className="text-xs leading-5 text-muted-foreground">From your Adsterra publisher dashboard, create a Native Banner unit and copy its script URL and container ID. Use a different unit for each placement.</p>
                  <div className="space-y-1">
                    <label className="text-muted-foreground">Native banner invoke.js URL</label>
                    <input
                      type="url"
                      required
                      placeholder="https://pl…/invoke.js"
                      value={formData.slotId}
                      onChange={(e) => setFormData({ ...formData, slotId: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground">Native banner container ID</label>
                    <input
                      type="text"
                      required
                      placeholder="container-…"
                      value={formData.clientOrPublisherId}
                      onChange={(e) => setFormData({ ...formData, clientOrPublisherId: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground text-xs"
                    />
                  </div>
                </div>
              )}

              {formData.network === 'CUSTOM_IMAGE' && (
                <div className="space-y-3 pt-2 border-t border-border/40">
                  <div className="space-y-1">
                    <label className="text-muted-foreground">Banner Image URL</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.customImage}
                      onChange={(e) => setFormData({ ...formData, customImage: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-muted-foreground">Destination Target URL</label>
                      <input
                        type="text"
                        placeholder="https://partner.com/?ref=nexus"
                        value={formData.customUrl}
                        onChange={(e) => setFormData({ ...formData, customUrl: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-muted-foreground">Alt Description</label>
                      <input
                        type="text"
                        placeholder="Sponsored by Neon Database"
                        value={formData.customAlt}
                        onChange={(e) => setFormData({ ...formData, customAlt: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.network === 'CUSTOM_HTML' && (
                <div className="space-y-1 pt-2 border-t border-border/40">
                  <label className="text-muted-foreground">Custom HTML / Affiliate Embed Code</label>
                  <textarea
                    rows={4}
                    placeholder="<div class='sponsor'>...</div>"
                    value={formData.customHtml}
                    onChange={(e) => setFormData({ ...formData, customHtml: e.target.value })}
                    className="w-full rounded-xl border border-border bg-zinc-950 p-3 text-emerald-400 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold font-mono text-xs hover:opacity-90 cursor-pointer shadow-sm"
                >
                  {editingPlacement ? 'Save Changes' : 'Create Placement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
