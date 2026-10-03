'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { analyticsApi } from '@/lib/api-client';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Clock,
  Code2,
  Bookmark,
  Search,
  AlertCircle,
  RefreshCw,
  Layers,
  Cpu,
  Monitor,
  Globe2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

const CATEGORY_COLORS = ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa'];

export default function AdminAnalyticsPage() {
  const [timeWindow, setTimeWindow] = useState<'24h' | '7d' | '30d' | '90d' | 'all'>('7d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [overview, setOverview] = useState<any>(null);
  const [blueprints, setBlueprints] = useState<any[]>([]);
  const [techGeo, setTechGeo] = useState<any>(null);
  const [searchIntel, setSearchIntel] = useState<any>(null);
  const [realtime, setRealtime] = useState<any>(null);

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const [overviewRes, blueprintsRes, techGeoRes, searchRes, realtimeRes] = await Promise.all([
        analyticsApi.getOverview(timeWindow).catch(() => null),
        analyticsApi.getTopBlueprints(timeWindow, 8).catch(() => []),
        analyticsApi.getTechAndGeo(timeWindow).catch(() => null),
        analyticsApi.getSearchIntelligence(timeWindow).catch(() => null),
        analyticsApi.getRealtimePulse().catch(() => null),
      ]);

      if (overviewRes) setOverview(overviewRes);
      if (blueprintsRes) setBlueprints(blueprintsRes);
      if (techGeoRes) setTechGeo(techGeoRes);
      if (searchRes) setSearchIntel(searchRes);
      if (realtimeRes) setRealtime(realtimeRes);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeWindow]);

  // Periodic Realtime Pulse Update (every 30 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      analyticsApi
        .getRealtimePulse()
        .then((res) => {
          if (res) setRealtime(res);
        })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const summary = overview?.summary || {
    totalPageviews: 0,
    pageviewsDelta: 0,
    uniqueVisitors: 0,
    visitorsDelta: 0,
    avgReadTimeMinutes: 0,
    avgScrollDepthPercent: 0,
    codeCopies: 0,
    bookmarksCount: 0,
    bookmarkConversionRate: 0,
  };

  const timeSeries = overview?.timeSeries || [];

  const renderDelta = (delta: number) => {
    if (delta > 0) {
      return (
        <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-400">
          <ArrowUpRight className="h-3 w-3" />
          <span>+{delta}% vs prev</span>
        </div>
      );
    }
    if (delta < 0) {
      return (
        <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-rose-400">
          <ArrowDownRight className="h-3 w-3" />
          <span>{delta}% vs prev</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
        <Minus className="h-3 w-3" />
        <span>0% vs prev</span>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header & Time-Window Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary font-bold">
            <BarChart3 className="h-4 w-4" />
            <span>Telemetry &amp; Readership Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Analytics &amp; Platform Insights
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Production readership telemetry, blueprint performance, tech stack shares, and developer environments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Readers Pulse Indicator */}
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-mono font-semibold text-emerald-400 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>{realtime?.activeReaders || 0} Live Readers</span>
          </div>

          {/* Time Window Segmented Control */}
          <div className="inline-flex rounded-xl border border-border/80 bg-muted/40 p-1 text-xs font-mono">
            {[
              { id: '24h', label: '24h' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: 'all', label: 'All Time' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeWindow(t.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                  timeWindow === t.id
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Manual Refresh Button */}
          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-2 rounded-xl border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-2xs"
            title="Refresh analytics data"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Top KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {/* Metric 1: Unique Visitors */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 space-y-2 shadow-2xs hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-mono font-medium">Unique Readers</span>
            <Users className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-foreground font-mono">
            {summary.uniqueVisitors.toLocaleString()}
          </div>
          {renderDelta(summary.visitorsDelta)}
        </div>

        {/* Metric 2: Total Pageviews */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 space-y-2 shadow-2xs hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-mono font-medium">Total Pageviews</span>
            <Eye className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-foreground font-mono">
            {summary.totalPageviews.toLocaleString()}
          </div>
          {renderDelta(summary.pageviewsDelta)}
        </div>

        {/* Metric 3: Avg Read Duration */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 space-y-2 shadow-2xs hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-mono font-medium">Avg Read Time</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-foreground font-mono">
            {summary.avgReadTimeMinutes}m
          </div>
          <div className="text-[11px] font-mono text-muted-foreground">
            Deep dive engagement
          </div>
        </div>

        {/* Metric 4: Scroll Completion % */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 space-y-2 shadow-2xs hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-mono font-medium">Scroll Depth</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-foreground font-mono">
            {summary.avgScrollDepthPercent}%
          </div>
          <div className="text-[11px] font-mono text-muted-foreground">
            Average completion
          </div>
        </div>

        {/* Metric 5: Code Snippet Copies */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 space-y-2 shadow-2xs hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-mono font-medium">Code Copies</span>
            <Code2 className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-foreground font-mono">
            {summary.codeCopies.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono text-muted-foreground">
            Snippet utilization
          </div>
        </div>

        {/* Metric 6: Bookmark Retention */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 space-y-2 shadow-2xs hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-mono font-medium">Bookmark Rate</span>
            <Bookmark className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-foreground font-mono">
            {summary.bookmarkConversionRate}%
          </div>
          <div className="text-[11px] font-mono text-muted-foreground">
            {summary.bookmarksCount} saved blueprints
          </div>
        </div>
      </div>

      {/* 3. Main Traffic & Readership Time-Series Chart */}
      <div className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Readership Traffic &amp; Unique Visitor Velocity
            </h2>
            <p className="text-xs text-muted-foreground">
              Time-series distribution comparing blueprint pageviews and unique developer visits.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
              <span className="text-muted-foreground">Pageviews</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
              <span className="text-muted-foreground">Unique Visitors</span>
            </div>
          </div>
        </div>

        <div className="h-[280px] sm:h-[320px] w-full pt-2">
          {timeSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pageviewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#333333' }}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#333333' }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-border/80 bg-card/95 backdrop-blur-xl p-3 shadow-2xl font-mono text-xs space-y-1">
                          <p className="font-bold text-foreground">{label}</p>
                          <p className="text-sky-400 flex items-center justify-between gap-4">
                            <span>Pageviews:</span>
                            <span className="font-bold">{payload[0]?.value}</span>
                          </p>
                          <p className="text-purple-400 flex items-center justify-between gap-4">
                            <span>Unique Readers:</span>
                            <span className="font-bold">{payload[1]?.value}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pageviews"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#pageviewsGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#visitorsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center font-mono text-xs text-muted-foreground">
              {loading ? 'Aggregating telemetry data...' : 'No telemetry data recorded in this timeframe.'}
            </div>
          )}
        </div>
      </div>

      {/* 4. Top Blueprints Leaderboard */}
      <div className="rounded-3xl border border-border/80 bg-card/90 p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Top Performing Engineering Blueprints
            </h2>
            <p className="text-xs text-muted-foreground">
              Articles ranked by reader viewership, average scroll completion, and developer utility.
            </p>
          </div>
          <Link
            href="/admin/articles"
            className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>Manage All Articles</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px]">
                <th className="py-2.5 px-3 font-semibold">Rank</th>
                <th className="py-2.5 px-3 font-semibold">Blueprint Title</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold text-right">Views</th>
                <th className="py-2.5 px-3 font-semibold text-right">Unique</th>
                <th className="py-2.5 px-3 font-semibold text-right">Scroll %</th>
                <th className="py-2.5 px-3 font-semibold text-right">Code Copies</th>
                <th className="py-2.5 px-3 font-semibold text-right">Bookmarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-sans">
              {blueprints.length > 0 ? (
                blueprints.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/40 transition-colors group">
                    <td className="py-3 px-3 font-mono font-bold text-muted-foreground group-hover:text-primary">
                      #{item.rank}
                    </td>
                    <td className="py-3 px-3 font-medium text-foreground max-w-sm">
                      <Link
                        href={`/articles/${item.slug}`}
                        target="_blank"
                        className="hover:text-primary transition-colors flex items-center gap-1.5 group-hover:underline line-clamp-1"
                      >
                        <span>{item.title}</span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </Link>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <span className="rounded bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 whitespace-nowrap">
                        {item.categoryName}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                      {item.viewsCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                      {item.uniqueReaders.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(100, item.scrollCompletionPercent)}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-muted-foreground">{item.scrollCompletionPercent}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-cyan-400 font-semibold">
                      {item.codeCopiesCount}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-rose-400 font-semibold">
                      {item.bookmarksCount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground font-mono text-xs">
                    {loading ? 'Loading blueprint telemetry...' : 'No blueprint telemetry recorded yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Domain Taxonomy & Tech Stacks Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Share Donut */}
        <div className="rounded-3xl border border-border/80 bg-card/90 p-5 sm:p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="text-base font-bold text-foreground">Domain Category Share</h3>
            </div>
            <span className="text-xs font-mono text-muted-foreground">Published Articles</span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {techGeo?.categories && techGeo.categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={techGeo.categories}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {techGeo.categories.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-border bg-card p-2 text-xs font-mono shadow-md">
                            <p className="font-bold text-foreground">{payload[0].name}</p>
                            <p className="text-primary">{payload[0].value} articles</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs font-mono text-muted-foreground">
                {loading ? 'Gathering category telemetry...' : 'No domain categories with articles.'}
              </div>
            )}
          </div>

          {/* Category Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs font-mono">
            {techGeo?.categories?.map((cat: any, idx: number) => (
              <div key={cat.slug} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                />
                <span className="text-foreground truncate">{cat.name}</span>
                <span className="text-muted-foreground ml-auto">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stacks Popularity */}
        <div className="rounded-3xl border border-border/80 bg-card/90 p-5 sm:p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-emerald-400" />
              <h3 className="text-base font-bold text-foreground">Technology Stacks Tagged</h3>
            </div>
            <span className="text-xs font-mono text-muted-foreground">Blueprint Indexing</span>
          </div>

          <div className="h-56 w-full pt-2">
            {techGeo?.technologies && techGeo.technologies.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={techGeo.technologies} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" stroke="#888888" fontSize={10} hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={85}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-border bg-card p-2 text-xs font-mono shadow-md">
                            <p className="font-bold text-foreground">{payload[0].payload.name}</p>
                            <p className="text-emerald-400">{payload[0].value} articles</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs font-mono text-muted-foreground text-center pt-20">
                {loading ? 'Loading technology telemetry...' : 'No technologies tagged in articles.'}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-border/40 text-[11px] font-mono text-muted-foreground flex items-center justify-between">
            <span>Framework and tool indexing</span>
            <Link href="/admin/technologies" className="text-primary hover:underline">
              View Hubs &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* 6. Developer Environments & Geo Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operating Systems */}
        <div className="rounded-3xl border border-border/80 bg-card/90 p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2.5">
            <Monitor className="h-4 w-4 text-sky-400" />
            <h3 className="text-sm font-bold text-foreground">Developer Operating Systems</h3>
          </div>
          <div className="space-y-3 font-mono text-xs">
            {techGeo?.operatingSystems && techGeo.operatingSystems.length > 0 ? (
              techGeo.operatingSystems.map((os: any) => (
                <div key={os.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-semibold">{os.name}</span>
                    <span className="text-muted-foreground">{os.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${os.percentage}%`, backgroundColor: os.color || '#38bdf8' }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground font-mono text-xs">
                {loading ? 'Gathering OS metrics...' : 'No OS telemetry recorded yet.'}
              </div>
            )}
          </div>
        </div>

        {/* Browser Engines */}
        <div className="rounded-3xl border border-border/80 bg-card/90 p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2.5">
            <Globe2 className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-bold text-foreground">Browser Engines</h3>
          </div>
          <div className="space-y-3 font-mono text-xs">
            {techGeo?.browsers && techGeo.browsers.length > 0 ? (
              techGeo.browsers.map((br: any) => (
                <div key={br.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-semibold">{br.name}</span>
                    <span className="text-muted-foreground">{br.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${br.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground font-mono text-xs">
                {loading ? 'Gathering browser metrics...' : 'No browser telemetry recorded yet.'}
              </div>
            )}
          </div>
        </div>

        {/* Top Reader Countries */}
        <div className="rounded-3xl border border-border/80 bg-card/90 p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2.5">
            <Globe2 className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-foreground">Global Reader Geo</h3>
          </div>
          <div className="space-y-2.5 font-mono text-xs max-h-56 overflow-y-auto no-scrollbar">
            {techGeo?.countries && techGeo.countries.length > 0 ? (
              techGeo.countries.map((c: any) => (
                <div key={c.code} className="flex items-center justify-between p-2 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold text-primary">{c.code}</span>
                    <span className="text-foreground truncate">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-foreground">{c.percentage}%</span>
                    <span className="text-[10px] text-muted-foreground">({c.readers})</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground font-mono text-xs">
                {loading ? 'Gathering geographical telemetry...' : 'No geographical telemetry recorded yet.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 7. Search Intelligence & Zero-Result Gap Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Searched Keywords */}
        <div className="rounded-3xl border border-border/80 bg-card/90 p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-sky-400" />
              <h3 className="text-base font-bold text-foreground">Top On-Site Search Queries</h3>
            </div>
            <span className="text-xs font-mono text-muted-foreground">{searchIntel?.totalSearches || 0} Total Searches</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {searchIntel?.topQueries && searchIntel.topQueries.length > 0 ? (
              searchIntel.topQueries.map((sq: any) => (
                <div
                  key={sq.query}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-foreground font-semibold flex items-center gap-2">
                    <span className="text-muted-foreground">🔍</span>
                    <span>{sq.query}</span>
                  </span>
                  <span className="rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 text-[10px] font-bold">
                    {sq.searchesCount} queries
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground font-mono text-xs">
                {loading ? 'Loading search telemetry...' : 'No search queries recorded yet.'}
              </div>
            )}
          </div>
        </div>

        {/* Content Gap / Zero-Result Misses */}
        <div className="rounded-3xl border border-border/80 bg-card/90 p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <h3 className="text-base font-bold text-foreground">Zero-Result Content Gaps</h3>
            </div>
            <span className="text-xs font-mono text-amber-400 font-semibold">Editorial Opportunities</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {searchIntel?.contentGaps && searchIntel.contentGaps.length > 0 ? (
              searchIntel.contentGaps.map((gap: any) => (
                <div
                  key={gap.query}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
                >
                  <div className="truncate space-y-0.5">
                    <span className="text-foreground font-semibold block truncate">
                      {gap.query}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {gap.missedSearchesCount} engineers searched for this topic
                    </span>
                  </div>
                  <Link
                    href="/admin/articles/new"
                    className="rounded-lg bg-primary text-primary-foreground font-bold px-2.5 py-1 text-[10px] hover:opacity-90 shrink-0 ml-2 shadow-2xs"
                  >
                    Write &rarr;
                  </Link>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground font-mono text-xs">
                {loading ? 'Checking content gaps...' : 'No zero-result search gaps detected.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
