import React from 'react';
import { Gauge, Zap } from 'lucide-react';

export interface BenchmarkRow {
  name: string;
  metric: string; // e.g. "1.2 ms" or "85,000 req/sec"
  percentage?: number; // 0 to 100
  status?: 'optimal' | 'acceptable' | 'slow';
  note?: string;
}

interface BenchmarkProps {
  title?: string;
  description?: string;
  rows: BenchmarkRow[];
}

export function Benchmark({
  title = 'Performance Benchmark',
  description,
  rows = [],
}: BenchmarkProps) {
  return (
    <div className="my-6 rounded-lg border border-border/80 bg-card/60 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="border-b border-border/40 bg-muted/40 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Gauge className="h-4 w-4 text-emerald-500" />
          <h4 className="text-sm font-semibold tracking-tight text-foreground">{title}</h4>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span>Benchmarked Live</span>
        </div>
      </div>

      {description && (
        <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border/20">
          {description}
        </div>
      )}

      {/* Rows */}
      <div className="divide-y divide-border/30">
        {rows.map((row, idx) => {
          const percentage = row.percentage ?? 50;
          const statusColors = {
            optimal: 'bg-emerald-500 text-emerald-500',
            acceptable: 'bg-amber-500 text-amber-500',
            slow: 'bg-rose-500 text-rose-500',
          }[row.status || 'optimal'];

          return (
            <div key={idx} className="p-4 space-y-2 hover:bg-muted/20 transition-colors">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="font-medium text-foreground flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{idx + 1}.</span>
                  <span>{row.name}</span>
                </div>
                <div className="font-mono font-semibold text-foreground bg-muted/60 px-2 py-0.5 rounded">
                  {row.metric}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-muted/40 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${statusColors.split(' ')[0]}`}
                  style={{ width: `${Math.min(Math.max(percentage, 5), 100)}%` }}
                />
              </div>

              {row.note && (
                <div className="text-[11px] text-muted-foreground font-mono">
                  {row.note}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
