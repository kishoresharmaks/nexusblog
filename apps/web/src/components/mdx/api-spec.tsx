import React from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { CodeBlock } from './code-block';

interface ApiRequestProps {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  description?: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown> | string;
}

export function ApiRequest({
  method = 'GET',
  endpoint,
  description,
  headers,
  body,
}: ApiRequestProps) {
  const methodColors: Record<string, string> = {
    GET: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    POST: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    PUT: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    PATCH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    DELETE: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="my-6 rounded-lg border border-border/80 bg-card/60 overflow-hidden shadow-sm font-sans">
      <div className="border-b border-border/40 bg-muted/40 p-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Send className="h-4 w-4 text-muted-foreground" />
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
              methodColors[method] || methodColors.GET
            }`}
          >
            {method}
          </span>
          <span className="font-mono text-xs sm:text-sm font-semibold text-foreground">
            {endpoint}
          </span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground uppercase">
          Request
        </span>
      </div>

      {description && (
        <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border/20 bg-muted/10">
          {description}
        </div>
      )}

      {headers && (
        <div className="p-3 border-b border-border/20 text-xs space-y-1">
          <div className="text-[11px] font-mono text-muted-foreground uppercase font-semibold">
            Headers:
          </div>
          <div className="font-mono space-y-0.5 text-zinc-300 bg-muted/20 p-2 rounded">
            {Object.entries(headers).map(([k, v]) => (
              <div key={k}>
                <span className="text-zinc-500">{k}: </span>
                <span className="text-foreground">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {body && (
        <div className="p-3">
          <div className="text-[11px] font-mono text-muted-foreground uppercase font-semibold mb-1">
            Request Body:
          </div>
          <CodeBlock language="json" showLineNumbers={false}>
            {typeof body === 'string' ? body : JSON.stringify(body, null, 2)}
          </CodeBlock>
        </div>
      )}
    </div>
  );
}

interface ApiResponseProps {
  status: number;
  description?: string;
  body?: Record<string, unknown> | string;
}

export function ApiResponse({ status = 200, description, body }: ApiResponseProps) {
  const isSuccess = status >= 200 && status < 300;

  return (
    <div className="my-6 rounded-lg border border-border/80 bg-card/60 overflow-hidden shadow-sm font-sans">
      <div className="border-b border-border/40 bg-muted/40 p-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isSuccess ? (
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-500" />
          )}
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
              isSuccess
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {status}
          </span>
          {description && (
            <span className="text-xs text-muted-foreground font-medium">
              {description}
            </span>
          )}
        </div>
        <span className="text-[11px] font-mono text-muted-foreground uppercase">
          Response
        </span>
      </div>

      {body && (
        <div className="p-3">
          <CodeBlock language="json" showLineNumbers={false}>
            {typeof body === 'string' ? body : JSON.stringify(body, null, 2)}
          </CodeBlock>
        </div>
      )}
    </div>
  );
}
