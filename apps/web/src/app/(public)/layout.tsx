'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/public/navbar';
import { Footer } from '@/components/public/footer';
import { SearchCommand } from '@/components/public/search-command';
import { MaintenanceView } from '@/components/public/maintenance-view';
import { useAuth } from '@/context/auth-context';
import { systemSettingsApi } from '@/lib/api-client';
import { AlertTriangle, Sliders } from 'lucide-react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isEditorPage = pathname?.startsWith('/guest-post/submit');
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, isLoading: authLoading } = useAuth();

  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [siteName, setSiteName] = useState<string>('NexusBlog');
  const [hasCheckedSettings, setHasCheckedSettings] = useState<boolean>(false);

  const isStaff =
    user && ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR'].includes(user.role);

  const fetchPublicSettings = useCallback(async () => {
    try {
      const data = await systemSettingsApi.getPublicSettings();
      if (data) {
        setMaintenanceMode(Boolean(data.maintenanceMode));
        if (data.siteName) setSiteName(data.siteName);
      }
    } catch {
      // Graceful fallback to operational if API is unreachable
    } finally {
      setHasCheckedSettings(true);
    }
  }, []);

  useEffect(() => {
    fetchPublicSettings();
  }, [fetchPublicSettings]);

  // If maintenance mode is active and user is not a staff member, display the maintenance screen
  if (maintenanceMode && !authLoading && !isStaff) {
    return (
      <MaintenanceView
        siteName={siteName}
        onRefreshStatus={fetchPublicSettings}
      />
    );
  }

  if (isEditorPage) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col">
        {maintenanceMode && isStaff && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-1.5 text-xs text-amber-300 flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span>
                <strong>Maintenance Mode Active</strong> — Public visitors currently see the maintenance screen.
              </span>
            </div>
            <Link
              href="/admin/dev-config"
              className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-200 underline font-semibold"
            >
              <Sliders className="h-3 w-3" /> Dev Config
            </Link>
          </div>
        )}
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Staff Maintenance Warning Banner */}
      {maintenanceMode && isStaff && (
        <div className="sticky top-0 z-[60] bg-amber-500/15 backdrop-blur-md border-b border-amber-500/30 px-4 py-2 text-xs text-amber-300 flex flex-wrap items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>MAINTENANCE MODE ACTIVE:</strong> Public traffic is blocked with the system upgrade screen. You have staff bypass access.
            </span>
          </div>
          <Link
            href="/admin/dev-config"
            className="inline-flex items-center gap-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 px-2.5 py-0.5 text-amber-200 border border-amber-500/40 font-semibold transition-colors"
          >
            <Sliders className="h-3 w-3 text-amber-400" />
            <span>Configure in Dev Tools &rarr;</span>
          </Link>
        </div>
      )}

      <Navbar onOpenSearch={() => setSearchOpen(true)} />
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

