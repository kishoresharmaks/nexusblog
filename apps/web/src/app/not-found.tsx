import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 text-center font-sans">
      <div className="max-w-md space-y-6">
        <div className="h-16 w-16 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto text-muted-foreground">
          <FileQuestion className="h-8 w-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            404 - Page Not Found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The technical guide, architecture document, or page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90 transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
