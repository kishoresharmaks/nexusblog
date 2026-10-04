'use client';

import React, { useEffect, useState } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    // Log error to console for monitoring
    console.error('[GlobalError Boundary Captured]:', error);

    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      error?.message?.toLowerCase().includes('chunk') ||
      error?.message?.toLowerCase().includes('failed to fetch dynamically imported module') ||
      error?.message?.toLowerCase().includes('loading css chunk');

    if (isChunkError && typeof window !== 'undefined') {
      const lastReload = sessionStorage.getItem('nexus_last_chunk_reload');
      const now = Date.now();

      // If we haven't reloaded in the last 15 seconds, auto-refresh to pull new production build assets
      if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
        sessionStorage.setItem('nexus_last_chunk_reload', now.toString());
        window.location.reload();
        return;
      }
    }
  }, [error]);

  const handleManualRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    } else {
      reset();
    }
  };

  const isUpdating =
    error?.name === 'ChunkLoadError' ||
    error?.message?.toLowerCase().includes('chunk') ||
    error?.message?.toLowerCase().includes('fetch') ||
    error?.message?.toLowerCase().includes('network');

  return (
    <html lang="en" className="dark">
      <head>
        <title>NexusNation — System Refresh</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background-color: #09090b;
            color: #f4f4f5;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
          }
          .container {
            max-width: 520px;
            width: 100%;
            background: #121215;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1.25rem;
            padding: 2.5rem 2rem;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          .icon-wrap {
            width: 4rem;
            height: 4rem;
            border-radius: 1rem;
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            color: #60a5fa;
          }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            font-size: 0.6875rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            background: rgba(59, 130, 246, 0.15);
            color: #93c5fd;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            margin-bottom: 1rem;
            border: 1px solid rgba(59, 130, 246, 0.3);
          }
          h1 {
            font-size: 1.5rem;
            font-weight: 800;
            letter-spacing: -0.025em;
            color: #ffffff;
            margin-bottom: 0.75rem;
          }
          p.lead {
            font-size: 0.875rem;
            line-height: 1.6;
            color: #a1a1aa;
            margin-bottom: 1.75rem;
          }
          .button-group {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            flex-wrap: wrap;
          }
          .btn-primary {
            background: #2563eb;
            color: #ffffff;
            border: none;
            padding: 0.7rem 1.5rem;
            border-radius: 0.75rem;
            font-size: 0.8125rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
          }
          .btn-primary:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
          }
          .btn-secondary {
            background: rgba(255, 255, 255, 0.06);
            color: #e4e4e7;
            border: 1px solid rgba(255, 255, 255, 0.12);
            padding: 0.7rem 1.5rem;
            border-radius: 0.75rem;
            font-size: 0.8125rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
          }
          .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
          }
          .dev-toggle {
            margin-top: 2rem;
            padding-top: 1.25rem;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
          }
          .dev-btn {
            background: none;
            border: none;
            color: #71717a;
            font-size: 0.6875rem;
            cursor: pointer;
            text-decoration: underline;
            font-family: monospace;
          }
          .dev-btn:hover {
            color: #a1a1aa;
          }
          .dev-box {
            margin-top: 0.75rem;
            padding: 0.75rem;
            background: #09090b;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            text-align: left;
            font-family: monospace;
            font-size: 0.6875rem;
            color: #f87171;
            overflow-x: auto;
            word-break: break-all;
          }
          .pulse-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #60a5fa;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.85); }
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="badge">
            <span className="pulse-dot"></span>
            <span>{isUpdating ? 'System Updating' : 'Temporary Connection Hiccup'}</span>
          </div>

          <div className="icon-wrap">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </div>

          <h1>{isUpdating ? 'We’re Updating NexusNation' : 'Something Went Wrong'}</h1>

          <p className="lead">
            {isUpdating
              ? 'Our platform is currently receiving a live update or refreshing its application assets. Please click below to load the latest version.'
              : 'An unexpected issue occurred while rendering this page. You can refresh or return to the main portal.'}
          </p>

          <div className="button-group">
            <button onClick={handleManualRefresh} className="btn-primary">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>Refresh Page</span>
            </button>

            <a href="/" className="btn-secondary">
              <span>Back to Homepage</span>
            </a>
          </div>

          <div className="dev-toggle">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="dev-btn"
              type="button"
            >
              {showDetails ? 'Hide technical diagnostics' : 'Show technical diagnostics'}
            </button>

            {showDetails && (
              <div className="dev-box">
                <div><strong>Error:</strong> {error?.name || 'Error'}: {error?.message || 'Unknown exception'}</div>
                {error?.digest && <div style={{ marginTop: '4px', color: '#94a3b8' }}><strong>Digest:</strong> {error.digest}</div>}
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
