'use client';

import React, { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Handle,
  Position,
} from '@xyflow/react';
import {
  Database,
  Server,
  Cpu,
  Layers,
  Globe,
  Radio,
  Maximize2,
} from 'lucide-react';

// Custom Architecture Service Nodes
const ServiceNode = ({ data }: { data: { label: string; sub?: string } }) => (
  <div className="px-4 py-2.5 rounded-lg border border-border bg-card/90 text-card-foreground shadow-md font-sans text-xs min-w-[140px]">
    <Handle type="target" position={Position.Top} className="w-2 h-2 bg-primary" />
    <div className="flex items-center space-x-2 mb-1">
      <Server className="h-3.5 w-3.5 text-primary" />
      <span className="font-semibold text-foreground">{data.label}</span>
    </div>
    {data.sub && <div className="text-[10px] text-muted-foreground font-mono">{data.sub}</div>}
    <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-primary" />
  </div>
);

const DatabaseNode = ({ data }: { data: { label: string; sub?: string } }) => (
  <div className="px-4 py-2.5 rounded-lg border border-purple-500/40 bg-purple-500/10 text-card-foreground shadow-md font-sans text-xs min-w-[140px]">
    <Handle type="target" position={Position.Top} className="w-2 h-2 bg-purple-500" />
    <div className="flex items-center space-x-2 mb-1">
      <Database className="h-3.5 w-3.5 text-purple-400" />
      <span className="font-semibold text-foreground">{data.label}</span>
    </div>
    {data.sub && <div className="text-[10px] text-muted-foreground font-mono">{data.sub}</div>}
    <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-purple-500" />
  </div>
);

const CacheNode = ({ data }: { data: { label: string; sub?: string } }) => (
  <div className="px-4 py-2.5 rounded-lg border border-rose-500/40 bg-rose-500/10 text-card-foreground shadow-md font-sans text-xs min-w-[140px]">
    <Handle type="target" position={Position.Top} className="w-2 h-2 bg-rose-500" />
    <div className="flex items-center space-x-2 mb-1">
      <Cpu className="h-3.5 w-3.5 text-rose-400" />
      <span className="font-semibold text-foreground">{data.label}</span>
    </div>
    {data.sub && <div className="text-[10px] text-muted-foreground font-mono">{data.sub}</div>}
    <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-rose-500" />
  </div>
);

const GatewayNode = ({ data }: { data: { label: string; sub?: string } }) => (
  <div className="px-4 py-2.5 rounded-lg border border-sky-500/40 bg-sky-500/10 text-card-foreground shadow-md font-sans text-xs min-w-[140px]">
    <Handle type="target" position={Position.Top} className="w-2 h-2 bg-sky-500" />
    <div className="flex items-center space-x-2 mb-1">
      <Globe className="h-3.5 w-3.5 text-sky-400" />
      <span className="font-semibold text-foreground">{data.label}</span>
    </div>
    {data.sub && <div className="text-[10px] text-muted-foreground font-mono">{data.sub}</div>}
    <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-sky-500" />
  </div>
);

const QueueNode = ({ data }: { data: { label: string; sub?: string } }) => (
  <div className="px-4 py-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-card-foreground shadow-md font-sans text-xs min-w-[140px]">
    <Handle type="target" position={Position.Top} className="w-2 h-2 bg-amber-500" />
    <div className="flex items-center space-x-2 mb-1">
      <Radio className="h-3.5 w-3.5 text-amber-400" />
      <span className="font-semibold text-foreground">{data.label}</span>
    </div>
    {data.sub && <div className="text-[10px] text-muted-foreground font-mono">{data.sub}</div>}
    <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-amber-500" />
  </div>
);

const nodeTypes = {
  serviceNode: ServiceNode,
  databaseNode: DatabaseNode,
  cacheNode: CacheNode,
  gatewayNode: GatewayNode,
  queueNode: QueueNode,
};

const DEFAULT_NODES: Node[] = [
  {
    id: '1',
    type: 'gatewayNode',
    data: { label: 'API Gateway', sub: 'Reverse Proxy & Auth' },
    position: { x: 250, y: 30 },
  },
  {
    id: '2',
    type: 'serviceNode',
    data: { label: 'Article Service', sub: 'NestJS REST API' },
    position: { x: 100, y: 160 },
  },
  {
    id: '3',
    type: 'cacheNode',
    data: { label: 'Redis Cluster', sub: 'In-Memory Cache' },
    position: { x: 400, y: 160 },
  },
  {
    id: '4',
    type: 'databaseNode',
    data: { label: 'MongoDB Replica', sub: 'Document Database' },
    position: { x: 250, y: 290 },
  },
];

const DEFAULT_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3', animated: true },
  { id: 'e2-4', source: '2', target: '4', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: false },
];

interface InteractiveDiagramProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  title?: string;
  caption?: string;
  height?: string;
}

export function InteractiveDiagram({
  initialNodes = DEFAULT_NODES,
  initialEdges = DEFAULT_EDGES,
  title = 'Interactive System Architecture',
  caption,
  height = '420px',
}: InteractiveDiagramProps) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="my-8 rounded-lg border border-border/80 bg-zinc-950 text-foreground shadow-lg overflow-hidden">
      {/* Title bar */}
      <div className="border-b border-border/40 bg-zinc-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold tracking-tight text-zinc-200">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <Maximize2 className="h-3.5 w-3.5" />
          <span>Interactive Canvas (Pan / Zoom)</span>
        </div>
      </div>

      {/* Canvas container */}
      <div style={{ height }} className="w-full relative bg-zinc-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          colorMode="dark"
        >
          <Controls className="bg-zinc-900 border-zinc-800 text-zinc-100 fill-zinc-100" />
          <MiniMap
            className="bg-zinc-900/90 border border-zinc-800 rounded-lg overflow-hidden"
            nodeStrokeColor="#71717a"
            nodeColor="#27272a"
          />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#3f3f46" />
        </ReactFlow>
      </div>

      {caption && (
        <div className="border-t border-border/30 bg-zinc-900/60 px-4 py-2 text-xs text-zinc-400 italic">
          Figure: {caption}
        </div>
      )}
    </div>
  );
}
