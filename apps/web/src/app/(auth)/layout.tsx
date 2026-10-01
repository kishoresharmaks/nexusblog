import Link from 'next/link';
import { siteConfig } from '@nexus/config';
import { Terminal, Shield, ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground">
      {/* Top bar */}
      <header className="px-6 py-6 flex items-center justify-between border-b border-border/20">
        <Link href="/" className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to {siteConfig.name}</span>
        </Link>
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-mono text-muted-foreground">Argon2id Encrypted Session</span>
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
