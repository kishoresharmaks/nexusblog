import React from 'react';
import { Database, Key, Link as LinkIcon } from 'lucide-react';

export interface SchemaColumn {
  name: string;
  type: string;
  primaryKey?: boolean;
  foreignKey?: string; // e.g. "users.id"
  nullable?: boolean;
  indexed?: boolean;
  description?: string;
}

interface DatabaseSchemaProps {
  tableName: string;
  description?: string;
  columns: SchemaColumn[];
}

export function DatabaseSchema({
  tableName,
  description,
  columns = [],
}: DatabaseSchemaProps) {
  return (
    <div className="my-6 rounded-lg border border-border/80 bg-card/60 overflow-hidden shadow-sm font-sans">
      {/* Header */}
      <div className="border-b border-border/40 bg-muted/40 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-mono font-bold tracking-tight text-foreground">
            {tableName}
          </h4>
        </div>
        <span className="text-xs font-mono text-muted-foreground uppercase">
          Table Schema
        </span>
      </div>

      {description && (
        <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border/20 bg-muted/10">
          {description}
        </div>
      )}

      {/* Columns Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/40 bg-muted/20 font-mono text-muted-foreground">
              <th className="p-3 font-semibold">Column</th>
              <th className="p-3 font-semibold">Type</th>
              <th className="p-3 font-semibold">Attributes</th>
              <th className="p-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20 font-mono">
            {columns.map((col, idx) => (
              <tr key={idx} className="hover:bg-muted/30 transition-colors">
                <td className="p-3 font-bold text-foreground flex items-center gap-1.5">
                  {col.primaryKey && (
                    <span title="Primary Key">
                      <Key className="h-3 w-3 text-amber-500 shrink-0" />
                    </span>
                  )}
                  {col.foreignKey && (
                    <span title={`Foreign Key -> ${col.foreignKey}`}>
                      <LinkIcon className="h-3 w-3 text-sky-500 shrink-0" />
                    </span>
                  )}
                  <span>{col.name}</span>
                </td>
                <td className="p-3 text-purple-400 font-semibold">{col.type}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {col.primaryKey && (
                      <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.2 rounded text-[10px]">
                        PK
                      </span>
                    )}
                    {col.foreignKey && (
                      <span className="bg-sky-500/10 text-sky-500 border border-sky-500/20 px-1.5 py-0.2 rounded text-[10px]">
                        FK ({col.foreignKey})
                      </span>
                    )}
                    {col.indexed && (
                      <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.2 rounded text-[10px]">
                        INDEX
                      </span>
                    )}
                    {col.nullable ? (
                      <span className="text-zinc-500 text-[10px]">NULL</span>
                    ) : (
                      <span className="text-zinc-400 text-[10px]">NOT NULL</span>
                    )}
                  </div>
                </td>
                <td className="p-3 text-muted-foreground font-sans text-xs">
                  {col.description || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
