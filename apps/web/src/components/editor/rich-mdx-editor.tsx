'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Sparkles,
  Layers,
  Terminal as TerminalIcon,
  Activity,
  Code2,
  Undo2,
  Redo2,
  HelpCircle,
  X,
  ChevronDown,
  FileCode,
  Lightbulb,
  Megaphone,
} from 'lucide-react';
import { MediaPickerModal } from '@/components/media/media-picker-modal';
import { normalizeMediaUrl } from '@nexus/config';
import { toast } from 'sonner';

interface RichMdxEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

type ModalType =
  | 'callout'
  | 'diagram'
  | 'benchmark'
  | 'terminal'
  | 'table'
  | 'link'
  | 'cheat'
  | null;

export function RichMdxEditor({
  value,
  onChange,
  placeholder = 'Write your technical article with Markdown & MDX components...',
  className = '',
  minHeight = 'min-h-[460px]',
}: RichMdxEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Undo / Redo history state
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoAction = useRef(false);

  // Modals state
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [showComponentMenu, setShowComponentMenu] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);

  // Builder form states
  const [calloutForm, setCalloutForm] = useState({
    type: 'tip' as 'tip' | 'warning' | 'info' | 'danger',
    title: 'Core Architecture Takeaway',
    content: 'Always deploy consensus state machines across at least 3 distinct availability zones.',
  });

  const [diagramForm, setDiagramForm] = useState({
    type: 'flowchart' as 'flowchart' | 'sequence',
    preset: 'gateway',
    customCode: `graph TD
    Client[Web & Mobile Clients] -->|HTTPS / gRPC| Gateway[Envoy API Gateway]
    Gateway -->|JWT Auth & Rate Limit| AuthEngine[Auth Engine]
    Gateway -->|Internal RPC| Broker[Kafka Event Log]
    Broker -->|CDC Outbox| DB[(TimescaleDB Cluster)]`,
  });

  const [benchmarkForm, setBenchmarkForm] = useState({
    title: 'Distributed Rate Limiter Throughput (1M ops/sec)',
    description: 'Measured p99 latency under simulated 20ms network jitter.',
    metrics: [
      { label: 'Sliding Window (Lua)', value: '0.84ms', change: '-42% latency', trend: 'up' as const },
      { label: 'Token Bucket (Redis)', value: '1.12ms', change: '-28% latency', trend: 'up' as const },
      { label: 'Memory Footprint', value: '64MB', change: 'O(1) memory', trend: 'neutral' as const },
    ],
  });

  const [terminalForm, setTerminalForm] = useState({
    title: 'benchmarks/run-load.sh',
    command: './run-load.sh --concurrency=50 --duration=30s',
    output: `Running 100k requests over 50 parallel gRPC streams...
All requests finished in 842ms (118,764 req/sec)
p50: 0.42ms | p90: 0.78ms | p99: 1.12ms | p99.9: 2.84ms
Status: 0 packet loss, 100% idempotency verified.`,
  });

  const [tableForm, setTableForm] = useState({
    rows: 3,
    cols: 3,
    headers: ['Pattern', 'Throughput', 'Fault Tolerance'],
  });

  const [linkForm, setLinkForm] = useState({
    text: '',
    url: 'https://',
  });

  // Track history changes
  const updateContentWithHistory = useCallback(
    (newVal: string) => {
      if (isUndoRedoAction.current) {
        isUndoRedoAction.current = false;
        onChange(newVal);
        return;
      }
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        next.push(newVal);
        if (next.length > 50) next.shift();
        return next;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));
      onChange(newVal);
    },
    [historyIndex, onChange]
  );

  const handleUndo = () => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const prevVal = history[historyIndex - 1];
      setHistoryIndex((prev) => prev - 1);
      onChange(prevVal);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const nextVal = history[historyIndex + 1];
      setHistoryIndex((prev) => prev + 1);
      onChange(nextVal);
    }
  };

  // Helper to insert or wrap markdown at cursor position
  const insertText = (
    before: string,
    after: string = '',
    defaultPlaceholder: string = ''
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      updateContentWithHistory(value + '\n\n' + before + defaultPlaceholder + after);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prevText = textarea.value;
    const rawSelected = prevText.substring(start, end);

    let selectedText = rawSelected || defaultPlaceholder;
    let leadingSpace = '';
    let trailingSpace = '';

    // Handle whitespace trimming inside delimiters (e.g. bold/italic/code)
    if (rawSelected && (before === '**' || before === '*' || before === '~~' || before === '`')) {
      const trimmed = rawSelected.trim();
      if (trimmed) {
        const leadingMatch = rawSelected.match(/^\s+/);
        const trailingMatch = rawSelected.match(/\s+$/);
        leadingSpace = leadingMatch ? leadingMatch[0] : '';
        trailingSpace = trailingMatch ? trailingMatch[0] : '';
        selectedText = trimmed;
      }
    }

    const replacement = leadingSpace + before + selectedText + after + trailingSpace;
    const newContent = prevText.substring(0, start) + replacement + prevText.substring(end);

    updateContentWithHistory(newContent);

    setTimeout(() => {
      textarea.focus();
      const selectionStart = start + leadingSpace.length + before.length;
      const selectionEnd = selectionStart + selectedText.length;
      textarea.setSelectionRange(selectionStart, selectionEnd);
    }, 10);
  };

  // Handle Tab key indentation & shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      insertText('  ', '', '');
    } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
      if (e.shiftKey) {
        e.preventDefault();
        handleRedo();
      } else {
        e.preventDefault();
        handleUndo();
      }
    } else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleRedo();
    } else if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      insertText('**', '**', 'bold text');
    } else if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      insertText('*', '*', 'italic text');
    } else if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      openLinkModal();
    }
  };

  const openLinkModal = () => {
    const textarea = textareaRef.current;
    const selected = textarea
      ? textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
      : '';
    setLinkForm({
      text: selected || 'Link Text',
      url: 'https://',
    });
    setActiveModal('link');
  };

  // Preset Handlers for Component Builders
  const handleInsertCallout = () => {
    const snippet = `\n<Callout type="${calloutForm.type}" title="${calloutForm.title}">\n${calloutForm.content}\n</Callout>\n`;
    insertText(snippet, '', '');
    setActiveModal(null);
    toast.success('Callout box inserted');
  };

  const handleInsertDiagram = () => {
    const snippet = `\n\`\`\`mermaid\n${diagramForm.customCode}\n\`\`\`\n`;
    insertText(snippet, '', '');
    setActiveModal(null);
    toast.success('Architecture diagram inserted');
  };

  const handleInsertBenchmark = () => {
    const metricsStr = JSON.stringify(benchmarkForm.metrics);
    const snippet = `\n<Benchmark title="${benchmarkForm.title}" description="${benchmarkForm.description}" metrics='${metricsStr}' />\n`;
    insertText(snippet, '', '');
    setActiveModal(null);
    toast.success('Benchmark card inserted');
  };

  const handleInsertTerminal = () => {
    const snippet = `\n<Terminal title="${terminalForm.title}" command="${terminalForm.command}">\n${terminalForm.output}\n</Terminal>\n`;
    insertText(snippet, '', '');
    setActiveModal(null);
    toast.success('Terminal console inserted');
  };

  const handleInsertTable = () => {
    const headerRow = `| ${tableForm.headers.slice(0, tableForm.cols).join(' | ')} |`;
    const separatorRow = `| ${tableForm.headers.slice(0, tableForm.cols).map(() => '---').join(' | ')} |`;
    const sampleRows = Array.from({ length: tableForm.rows })
      .map(
        (_, r) =>
          `| ${Array.from({ length: tableForm.cols })
            .map((_, c) => `Item ${r + 1}.${c + 1}`)
            .join(' | ')} |`
      )
      .join('\n');

    const tableSnippet = `\n${headerRow}\n${separatorRow}\n${sampleRows}\n`;
    insertText(tableSnippet, '', '');
    setActiveModal(null);
    toast.success('Table inserted');
  };

  const handleInsertLink = () => {
    const snippet = `[${linkForm.text || 'Link'}](${linkForm.url || 'https://'})`;
    insertText(snippet, '', '');
    setActiveModal(null);
    toast.success('Link inserted');
  };

  // Stats calculation
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className={`rounded-2xl border border-border bg-card shadow-xs flex flex-col overflow-hidden font-sans ${className}`}>
      {/* Visual Formatting Toolbar */}
      <div className="border-b border-border/70 bg-muted/30 p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-1.5 select-none">
        {/* Left Toolbar Actions */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowHeadingMenu(!showHeadingMenu);
                setShowComponentMenu(false);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-border/80 bg-background text-xs font-mono font-medium hover:border-primary hover:text-primary transition-all flex items-center gap-1 shadow-xs"
              title="Select Heading Style"
            >
              <span>Headings</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>

            {showHeadingMenu && (
              <div
                className="absolute left-0 top-full mt-1.5 w-44 rounded-xl border border-border bg-card p-1.5 shadow-xl z-30 space-y-1 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setShowHeadingMenu(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    insertText('# ', '', 'Major Heading');
                    setShowHeadingMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-muted text-foreground flex items-center gap-2"
                >
                  <Heading1 className="h-3.5 w-3.5 text-primary" />
                  <span>Heading 1 (#)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    insertText('## ', '', 'Section Title');
                    setShowHeadingMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-muted text-foreground flex items-center gap-2"
                >
                  <Heading2 className="h-3.5 w-3.5 text-primary" />
                  <span>Heading 2 (##)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    insertText('### ', '', 'Subsection Title');
                    setShowHeadingMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-muted text-foreground flex items-center gap-2"
                >
                  <Heading3 className="h-3.5 w-3.5 text-primary" />
                  <span>Heading 3 (###)</span>
                </button>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-border/80 mx-1 hidden sm:block" />

          {/* Inline Formats */}
          <button
            type="button"
            onClick={() => insertText('**', '**', 'bold text')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => insertText('*', '*', 'italic text')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => insertText('~~', '~~', 'strikethrough')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => insertText('`', '`', 'code')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => insertText('\n> ', '', 'Key architectural principle note')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Quote Block"
          >
            <Quote className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-border/80 mx-1 hidden sm:block" />

          {/* Lists & Dividers */}
          <button
            type="button"
            onClick={() => insertText('\n- ', '', 'List item')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => insertText('\n1. ', '', 'Numbered step')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => insertText('\n- [ ] ', '', 'Task checklist item')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Checklist Item"
          >
            <ListTodo className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => insertText('\n---\n', '', '')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Horizontal Divider"
          >
            <Minus className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-border/80 mx-1 hidden sm:block" />

          {/* Media & Link Modals */}
          <button
            type="button"
            onClick={openLinkModal}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Insert Link (Ctrl+K)"
          >
            <LinkIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsMediaPickerOpen(true)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Insert Image (Upload or Media Library)"
          >
            <ImageIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('table')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Insert Comparison Table"
          >
            <TableIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => insertText('\n```typescript\n', '\n```\n', '// Write code here')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Fenced Code Block"
          >
            <FileCode className="h-4 w-4" />
          </button>
        </div>

        {/* Right Toolbar Actions: Component Builder & History */}
        <div className="flex items-center gap-1.5">
          {/* Undo / Redo */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors disabled:opacity-30"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-border/80 mx-1" />

          {/* Interactive Component Inserter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowComponentMenu(!showComponentMenu);
                setShowHeadingMenu(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90 transition-all shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>+ Insert Block</span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>

            {showComponentMenu && (
              <div
                className="absolute right-0 top-full mt-1.5 w-64 rounded-2xl border border-border bg-card p-2 shadow-2xl z-30 space-y-1 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setShowComponentMenu(false)}
              >
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                  Visual Engineering Blocks
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('callout');
                    setShowComponentMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-muted/70 text-foreground flex items-center gap-2.5 transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Lightbulb className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Callout Box</p>
                    <p className="text-[10px] text-muted-foreground">Tips, warnings, and notice notes</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('diagram');
                    setShowComponentMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-muted/70 text-foreground flex items-center gap-2.5 transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Architecture Diagram</p>
                    <p className="text-[10px] text-muted-foreground">Mermaid flowcharts & sequence flows</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('benchmark');
                    setShowComponentMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-muted/70 text-foreground flex items-center gap-2.5 transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Benchmark Card</p>
                    <p className="text-[10px] text-muted-foreground">Latency, throughput & metric stats</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('terminal');
                    setShowComponentMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-muted/70 text-foreground flex items-center gap-2.5 transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-500">
                    <TerminalIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Terminal Console</p>
                    <p className="text-[10px] text-muted-foreground">Command execution & server output</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    insertText(
                      '\n<CodeTabs>\n  <CodeTab label="TypeScript" language="typescript">\nconst x = 42;\n  </CodeTab>\n  <CodeTab label="Python" language="python">\nx = 42\n  </CodeTab>\n</CodeTabs>\n',
                      '',
                      ''
                    );
                    setShowComponentMenu(false);
                    toast.success('CodeTabs component inserted');
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-muted/70 text-foreground flex items-center gap-2.5 transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                    <Code2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Multi-Language Code Tabs</p>
                    <p className="text-[10px] text-muted-foreground">Tabs for TS, Python, Go, Rust</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    insertText('\n<InArticleAd slotIndex={1} />\n', '', '');
                    setShowComponentMenu(false);
                    toast.success('In-Article Ad Break inserted');
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-muted/70 text-foreground flex items-center gap-2.5 transition-colors"
                >
                  <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">In-Article Ad Placement</p>
                    <p className="text-[10px] text-muted-foreground">Sponsored in-content ad break slot</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Component Quick Inserter Badges Row */}
      <div className="px-3.5 py-2 bg-muted/10 border-b border-border/50 flex items-center justify-between gap-2 overflow-x-auto text-[11px] font-mono">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-muted-foreground font-semibold flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" /> Visual Inserters:
          </span>

          <button
            type="button"
            onClick={() => setActiveModal('callout')}
            className="px-2 py-0.5 rounded-md border border-border/80 bg-background hover:border-emerald-500/50 hover:bg-emerald-500/5 text-foreground transition-all flex items-center gap-1"
          >
            <Lightbulb className="h-2.5 w-2.5 text-emerald-500" />
            <span>Callout Note</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('diagram')}
            className="px-2 py-0.5 rounded-md border border-border/80 bg-background hover:border-sky-500/50 hover:bg-sky-500/5 text-foreground transition-all flex items-center gap-1"
          >
            <Layers className="h-2.5 w-2.5 text-sky-500" />
            <span>Architecture Diagram</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('benchmark')}
            className="px-2 py-0.5 rounded-md border border-border/80 bg-background hover:border-amber-500/50 hover:bg-amber-500/5 text-foreground transition-all flex items-center gap-1"
          >
            <Activity className="h-2.5 w-2.5 text-amber-500" />
            <span>Benchmark Card</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('terminal')}
            className="px-2 py-0.5 rounded-md border border-border/80 bg-background hover:border-violet-500/50 hover:bg-violet-500/5 text-foreground transition-all flex items-center gap-1"
          >
            <TerminalIcon className="h-2.5 w-2.5 text-violet-500" />
            <span>Terminal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              insertText('\n<InArticleAd slotIndex={1} />\n', '', '');
              toast.success('In-Article Ad Break inserted');
            }}
            className="px-2 py-0.5 rounded-md border border-border/80 bg-background hover:border-pink-500/50 hover:bg-pink-500/5 text-foreground transition-all flex items-center gap-1 cursor-pointer"
          >
            <Megaphone className="h-2.5 w-2.5 text-pink-500" />
            <span>Ad Break</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setActiveModal('cheat')}
          className="text-xs font-mono text-primary hover:underline flex items-center gap-1 shrink-0 ml-auto"
        >
          <HelpCircle className="h-3 w-3" />
          <span>MDX Cheat Sheet</span>
        </button>
      </div>

      {/* Editor Body Textarea */}
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => updateContentWithHistory(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full p-4 sm:p-5 bg-background text-foreground font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-y border-none ${minHeight}`}
          spellCheck={false}
        />
      </div>

      {/* Bottom Status Bar */}
      <div className="px-4 py-2 border-t border-border/60 bg-muted/20 flex flex-wrap items-center justify-between text-[11px] font-mono text-muted-foreground gap-2">
        <div className="flex items-center gap-3">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} characters</span>
          <span>•</span>
          <span>~{readTime} min read</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span>Tip: Highlight text and press toolbar buttons to format easily</span>
        </div>
      </div>

      {/* MODAL 1: Visual Callout Builder */}
      {activeModal === 'callout' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto font-sans"
          onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-card-foreground">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-emerald-500" />
                <h4 className="font-bold text-sm text-foreground font-mono">Insert Callout Box</h4>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1.5">Callout Style</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { type: 'tip', label: 'Tip 💡', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-500' },
                    { type: 'warning', label: 'Warning ⚠️', color: 'border-amber-500 bg-amber-500/10 text-amber-500' },
                    { type: 'info', label: 'Info ℹ️', color: 'border-sky-500 bg-sky-500/10 text-sky-500' },
                    { type: 'danger', label: 'Danger 🚨', color: 'border-rose-500 bg-rose-500/10 text-rose-500' },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setCalloutForm({ ...calloutForm, type: item.type as any })}
                      className={`p-2 rounded-xl text-xs font-mono font-medium border text-center transition-all ${
                        calloutForm.type === item.type
                          ? `${item.color} font-bold ring-2 ring-primary/40`
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">Callout Title</label>
                <input
                  type="text"
                  value={calloutForm.title}
                  onChange={(e) => setCalloutForm({ ...calloutForm, title: e.target.value })}
                  placeholder="e.g. Production Architecture Tip"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">Callout Message</label>
                <textarea
                  value={calloutForm.content}
                  onChange={(e) => setCalloutForm({ ...calloutForm, content: e.target.value })}
                  rows={3}
                  placeholder="Write the takeaway advice or explanation..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 rounded-xl border border-border text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertCallout}
                className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90"
              >
                Insert Callout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Visual Architecture Diagram Builder */}
      {activeModal === 'diagram' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto font-sans"
          onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}
        >
          <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-card-foreground">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-sky-500" />
                <h4 className="font-bold text-sm text-foreground font-mono">Insert Architecture Diagram (Mermaid)</h4>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1.5">Preset Templates</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setDiagramForm({
                        type: 'flowchart',
                        preset: 'gateway',
                        customCode: `graph TD
    Client[Web & Mobile Clients] -->|HTTPS / gRPC| Gateway[Envoy API Gateway]
    Gateway -->|JWT Auth & Rate Limit| AuthEngine[Auth Engine]
    Gateway -->|Internal RPC| Broker[Kafka Event Log]
    Broker -->|CDC Outbox| DB[(TimescaleDB Cluster)]`,
                      })
                    }
                    className="p-2 rounded-xl text-xs font-mono border text-center hover:border-primary bg-background"
                  >
                    API Gateway Flow
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setDiagramForm({
                        type: 'sequence',
                        preset: 'sequence',
                        customCode: `sequenceDiagram
    autonumber
    Client->>Gateway: HTTP GET /api/v1/resource
    Gateway->>Redis: EVALSHA sliding_window.lua (Key, Limit, Window)
    Redis-->>Gateway: [Allowed: 1, Remaining: 42, Reset: 15000]
    Gateway->>Backend: Forward Request
    Backend-->>Client: HTTP 200 OK`,
                      })
                    }
                    className="p-2 rounded-xl text-xs font-mono border text-center hover:border-primary bg-background"
                  >
                    Sequence Diagram
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setDiagramForm({
                        type: 'flowchart',
                        preset: 'cache',
                        customCode: `graph LR
    App[NestJS Service] -->|1. Check Cache| Cache[(Redis Cluster)]
    App -->|2. Miss: Query Primary| DB[(PostgreSQL Master)]
    App -->|3. Populate Key| Cache`,
                      })
                    }
                    className="p-2 rounded-xl text-xs font-mono border text-center hover:border-primary bg-background"
                  >
                    Cache-Aside Flow
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">Mermaid Syntax Code</label>
                <textarea
                  value={diagramForm.customCode}
                  onChange={(e) => setDiagramForm({ ...diagramForm, customCode: e.target.value })}
                  rows={6}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 rounded-xl border border-border text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertDiagram}
                className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90"
              >
                Insert Diagram
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Visual Benchmark Card Builder */}
      {activeModal === 'benchmark' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto font-sans"
          onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}
        >
          <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-card-foreground">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-500" />
                <h4 className="font-bold text-sm text-foreground font-mono">Insert Benchmark Card</h4>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">Study Title</label>
                <input
                  type="text"
                  value={benchmarkForm.title}
                  onChange={(e) => setBenchmarkForm({ ...benchmarkForm, title: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">Description / Conditions</label>
                <input
                  type="text"
                  value={benchmarkForm.description}
                  onChange={(e) => setBenchmarkForm({ ...benchmarkForm, description: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-muted-foreground">Performance Metrics</label>
                  <button
                    type="button"
                    onClick={() =>
                      setBenchmarkForm({
                        ...benchmarkForm,
                        metrics: [
                          ...benchmarkForm.metrics,
                          { label: 'New Metric', value: '1.0ms', change: '-20%', trend: 'up' },
                        ],
                      })
                    }
                    className="text-[11px] font-mono text-primary hover:underline font-semibold"
                  >
                    + Add Metric Row
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {benchmarkForm.metrics.map((m, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-1.5 items-center bg-muted/20 p-2 rounded-xl border border-border/50">
                      <input
                        type="text"
                        value={m.label}
                        onChange={(e) => {
                          const updated = [...benchmarkForm.metrics];
                          updated[idx].label = e.target.value;
                          setBenchmarkForm({ ...benchmarkForm, metrics: updated });
                        }}
                        placeholder="Label"
                        className="col-span-4 rounded-lg border border-border bg-background px-2 py-1 text-xs"
                      />
                      <input
                        type="text"
                        value={m.value}
                        onChange={(e) => {
                          const updated = [...benchmarkForm.metrics];
                          updated[idx].value = e.target.value;
                          setBenchmarkForm({ ...benchmarkForm, metrics: updated });
                        }}
                        placeholder="Value (e.g. 0.8ms)"
                        className="col-span-3 rounded-lg border border-border bg-background px-2 py-1 text-xs font-mono"
                      />
                      <input
                        type="text"
                        value={m.change}
                        onChange={(e) => {
                          const updated = [...benchmarkForm.metrics];
                          updated[idx].change = e.target.value;
                          setBenchmarkForm({ ...benchmarkForm, metrics: updated });
                        }}
                        placeholder="Change (e.g. -42%)"
                        className="col-span-3 rounded-lg border border-border bg-background px-2 py-1 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = benchmarkForm.metrics.filter((_, i) => i !== idx);
                          setBenchmarkForm({ ...benchmarkForm, metrics: updated });
                        }}
                        className="col-span-2 text-rose-500 hover:text-rose-600 text-xs font-mono text-center"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 rounded-xl border border-border text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertBenchmark}
                className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90"
              >
                Insert Benchmark
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Visual Terminal Console Builder */}
      {activeModal === 'terminal' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto font-sans"
          onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-card-foreground">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <TerminalIcon className="h-4 w-4 text-violet-500" />
                <h4 className="font-bold text-sm text-foreground font-mono">Insert Terminal Console</h4>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">Terminal Window Title</label>
                <input
                  type="text"
                  value={terminalForm.title}
                  onChange={(e) => setTerminalForm({ ...terminalForm, title: e.target.value })}
                  placeholder="e.g. bash or test/run-load.sh"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">Command to Execute</label>
                <input
                  type="text"
                  value={terminalForm.command}
                  onChange={(e) => setTerminalForm({ ...terminalForm, command: e.target.value })}
                  placeholder="e.g. npm run test:load -- --concurrency=50"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">Terminal Output Logs</label>
                <textarea
                  value={terminalForm.output}
                  onChange={(e) => setTerminalForm({ ...terminalForm, output: e.target.value })}
                  rows={4}
                  placeholder="Terminal response output..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 rounded-xl border border-border text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertTerminal}
                className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90"
              >
                Insert Terminal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Table Builder */}
      {activeModal === 'table' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto font-sans"
          onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-card-foreground">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <TableIcon className="h-4 w-4 text-primary" />
                <h4 className="font-bold text-sm text-foreground font-mono">Insert Comparison Table</h4>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-muted-foreground block mb-1">Columns</label>
                  <input
                    type="number"
                    min={2}
                    max={6}
                    value={tableForm.cols}
                    onChange={(e) => {
                      const c = Math.max(2, Math.min(6, parseInt(e.target.value) || 2));
                      setTableForm({ ...tableForm, cols: c });
                    }}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground block mb-1">Rows</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={tableForm.rows}
                    onChange={(e) => {
                      const r = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
                      setTableForm({ ...tableForm, rows: r });
                    }}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-muted-foreground block">Column Header Labels</label>
                {Array.from({ length: tableForm.cols }).map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    value={tableForm.headers[i] || `Column ${i + 1}`}
                    onChange={(e) => {
                      const updated = [...tableForm.headers];
                      updated[i] = e.target.value;
                      setTableForm({ ...tableForm, headers: updated });
                    }}
                    placeholder={`Header ${i + 1}`}
                    className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground mb-1 font-mono"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 rounded-xl border border-border text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertTable}
                className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90"
              >
                Insert Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Link Builder */}
      {activeModal === 'link' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto font-sans"
          onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-card-foreground">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-primary" />
                <h4 className="font-bold text-sm text-foreground font-mono">Insert Hyperlink</h4>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">Display Text</label>
                <input
                  type="text"
                  value={linkForm.text}
                  onChange={(e) => setLinkForm({ ...linkForm, text: e.target.value })}
                  placeholder="e.g. Redis Documentation"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">Target URL</label>
                <input
                  type="text"
                  value={linkForm.url}
                  onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 rounded-xl border border-border text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: MDX Cheat Sheet */}
      {activeModal === 'cheat' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto font-sans"
          onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}
        >
          <div className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xl overflow-y-auto animate-in fade-in zoom-in-95 text-card-foreground">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                <h4 className="font-bold text-sm text-foreground font-mono">MDX & Visual Component Cheat Sheet</h4>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1">
                <p className="font-bold text-foreground">💡 How Non-Markdown Authors Can Write Easily:</p>
                <p className="text-muted-foreground">
                  You do not need to memorize any syntax! Use the toolbar buttons above for Bold, Italic, Lists, and Headings, and click <strong>&quot;+ Insert Block&quot;</strong> to visually configure Callouts, Diagrams, and Benchmarks without typing any code.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="p-3 rounded-xl border border-border bg-background space-y-1.5">
                  <span className="font-bold text-primary">Headings</span>
                  <p className="text-muted-foreground"># Heading 1</p>
                  <p className="text-muted-foreground">## Heading 2</p>
                  <p className="text-muted-foreground">### Heading 3</p>
                </div>

                <div className="p-3 rounded-xl border border-border bg-background space-y-1.5">
                  <span className="font-bold text-primary">Text Styling</span>
                  <p className="text-muted-foreground">**Bold Text**</p>
                  <p className="text-muted-foreground">*Italic Text*</p>
                  <p className="text-muted-foreground">`inline code`</p>
                </div>

                <div className="p-3 rounded-xl border border-border bg-background space-y-1.5">
                  <span className="font-bold text-primary">Lists & Quotes</span>
                  <p className="text-muted-foreground">- Bullet list item</p>
                  <p className="text-muted-foreground">1. Numbered step</p>
                  <p className="text-muted-foreground">&gt; Blockquote note</p>
                </div>

                <div className="p-3 rounded-xl border border-border bg-background space-y-1.5">
                  <span className="font-bold text-primary">Code & Diagrams</span>
                  <p className="text-muted-foreground">```typescript ... ```</p>
                  <p className="text-muted-foreground">```mermaid ... ```</p>
                  <p className="text-muted-foreground">&lt;Callout type=&quot;tip&quot;&gt; ... &lt;/Callout&gt;</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-mono font-semibold"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(imgUrl, alt) => {
          const cleanImgUrl = normalizeMediaUrl(imgUrl);
          const imgMarkdown = `\n![${alt || 'Article image'}](${cleanImgUrl})\n`;
          insertText(imgMarkdown, '', '');
          toast.success('Image inserted into article body');
        }}
        title="Insert Image into Article Body"
        actionLabel="Insert into Article"
      />
    </div>
  );
}