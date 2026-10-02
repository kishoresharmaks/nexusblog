import Link from 'next/link';
import { siteConfig } from '@nexus/config';
import { Terminal, Shield, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/common/theme-toggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground">
      {/* Top bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-md">
        <Link href="/" className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-mono">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to {siteConfig.name}</span>
        </Link>
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1.5 text-xs font-mono text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            <span>Encrypted Session</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border/20">
        <p>© 2026 {siteConfig.name}. Production-Grade Technical Publishing Platform.</p>
      </footer>
    </div>
  );
}
