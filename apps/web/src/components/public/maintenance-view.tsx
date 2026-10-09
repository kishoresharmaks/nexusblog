'use client';

import React, { useState } from 'react';
import {
  Wrench,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { systemSettingsApi } from '@/lib/api-client';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { BrandLogo } from '@/components/common/brand-logo';
import { MaintenanceGame } from './maintenance-game';

interface MaintenanceViewProps {
  siteName?: string;
  onRefreshStatus?: () => Promise<void> | void;
}

export function MaintenanceView({
  siteName = 'NexusNation',
  onRefreshStatus,
}: MaintenanceViewProps) {
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      if (onRefreshStatus) {
        await onRefreshStatus();
      } else {
        const res = await systemSettingsApi.getPublicSettings();
        if (!res.maintenanceMode) {
          toast.success('Maintenance completed. Restoring portal...');
          window.location.reload();
          return;
        } else {
          toast.info('Maintenance is still in progress. Please check back shortly.');
        }
      }
    } catch {
      toast.error('Unable to reach server. Please try again in a moment.');
    } finally {
      setTimeout(() => setIsChecking(false), 500);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-background text-foreground selection:bg-foreground selection:text-background font-sans">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full border-b border-border bg-background/90 backdrop-blur-sm shrink-0">
        <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-3">
            <BrandLogo variant="navbar" size="sm" subtitle="MAINTENANCE" />
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-mono text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse" />
              <span>MAINTENANCE</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 my-auto flex flex-col items-center justify-center px-4 py-8 sm:py-12 text-center sm:px-6">
        <div className="mx-auto max-w-2xl space-y-6 sm:space-y-8">
          {/* Status Chip */}
          <div className="inline-flex items-center space-x-2 rounded-full border border-border bg-card px-4 py-1 text-xs font-mono font-medium text-foreground shadow-xs">
            <Wrench className="h-3.5 w-3.5" />
            <span>CORE SYSTEM UPGRADE IN PROGRESS</span>
          </div>

          {/* Heading & Notice */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-mono">
              Under Maintenance
            </h1>
            <p className="mx-auto max-w-xl text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
              We are currently performing scheduled platform maintenance, database index optimizations, and core system upgrades.
            </p>
          </div>

          {/* Interactive Feature: Retro Snake Arcade / Dev Trivia / Terminal Console */}
          <div className="pt-1">
            <MaintenanceGame />
          </div>

          {/* Action: Check Status Only (No Login Buttons) */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="inline-flex items-center justify-center space-x-2 rounded-lg bg-foreground text-background px-6 py-2.5 text-xs font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer font-mono shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking Platform...' : 'Check System Status'}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-border bg-background py-4 text-center text-xs text-muted-foreground font-mono shrink-0">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-6 max-w-5xl">
          <div className="flex items-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground inline-block" />
            <span>Engine v2.4 • Maintenance Protocol</span>
          </div>
          <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
