import React from 'react';
import Link from 'next/link';
import {
  PenTool,
  CheckCircle,
  FileCode2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  BarChart3,
  GitPullRequest,
  BookOpen,
} from 'lucide-react';

export default function WriteForUsPage() {
  const topics = [
    {
      title: 'System Design & Architecture',
      description: 'Distributed consensus, sharding strategies, rate limiters, multi-region failover architectures, and high-availability patterns.',
    },
    {
      title: 'Backend Internals & Protocols',
      description: 'Deep dives into V8 event loops, JVM garbage collectors, gRPC wire formats, WebSocket scaling, and custom protocol parsers.',
    },
    {
      title: 'Database Engineering',
      description: 'B-tree vs LSM-tree storage engines, Write-Ahead Logging (WAL), query planners, distributed transactions (2PC/Saga), and Timescale/ClickHouse analytics.',
    },
    {
      title: 'Cloud Infrastructure & DevOps',
      description: 'Kubernetes operators, eBPF network observability, zero-downtime database migrations, service mesh internals, and Terraform at scale.',
    },
    {
      title: 'Performance & Benchmarking',
      description: 'Rigorous benchmark methodologies, flamegraphs, memory allocation profiling, concurrency bottlenecks, and p99 latency optimization.',
    },
  ];

  const expectations = [
    {
      title: 'Rigorous Technical Depth',
      desc: 'We publish actionable, engineering-first content. Skip basic boilerplate introductions and dive directly into real problems, trade-offs, and solutions.',
    },
    {
      title: 'Runnable Code & Architecture Diagrams',
      desc: 'Include reproducible code blocks and clear system diagrams (Mermaid, React Flow, or SVGs) to visualize distributed topologies and sequence flows.',
    },
    {
      title: 'Honest Trade-off Analysis',
      desc: 'No technology is a silver bullet. Explain where your chosen architecture breaks, performance limitations, operational overhead, and what alternatives were evaluated.',
    },
    {
      title: '100% Original Work',
      desc: 'Submissions must be unique, non-plagiarized, and not published elsewhere. Authors retain full attribution, backlinks, and author bio showcase.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Submit Proposal or Draft',
      desc: 'Draft your post in our live MDX editor with interactive diagrams, code tabs, and database schemas.',
    },
    {
      step: '02',
      title: 'Staff Peer Review',
      desc: 'Our editorial engineering team conducts technical peer reviews, checking code correctness, diagram fidelity, and clarity.',
    },
    {
      step: '03',
      title: 'Revisions & Collaboration',
      desc: 'Collaborate directly with editors via inline feedback markers to refine the draft.',
    },
    {
      step: '04',
      title: 'Publication & Distribution',
      desc: 'Your article is published on the portal, featured on our newsletter, and indexed with full canonical author attribution.',
    },
  ];

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16 space-y-16 font-sans">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3.5 py-1 text-xs font-mono text-muted-foreground">
          <PenTool className="h-3.5 w-3.5 text-primary" />
          <span>Contributor Program</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
          Write for NexusBlog
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Share your real-world engineering experiences, architecture case studies, and performance breakthroughs with tens of thousands of staff engineers and system architects.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/guest-post/submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-md"
          >
            <span>Submit a Guest Post</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/articles"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition-all"
          >
            <span>Explore Published Guides</span>
          </Link>
        </div>
      </div>

      {/* Topics accepted */}
      <div className="space-y-6">
        <div className="space-y-1 border-b border-border/60 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
            Topics We Welcome
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            We focus exclusively on high-signal software engineering and distributed infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {topics.map((t, i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-border/70 bg-card/60 space-y-2.5 hover:border-border transition-colors"
            >
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                <span>{t.title}</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Editorial Standards */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-primary font-semibold">
            <ShieldCheck className="h-4 w-4" /> Quality Standards
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            What Makes an Outstanding Submission
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {expectations.map((exp, i) => (
            <div key={i} className="space-y-1.5">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {exp.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-4">
                {exp.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Editorial Process */}
      <div className="space-y-6">
        <div className="space-y-1 border-b border-border/60 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
            Editorial & Review Process
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Transparent review stages from submission to publication.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <div
              key={s.step}
              className="p-5 rounded-xl border border-border/70 bg-card/50 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10 inline-block">
                  {s.step}
                </span>
                <h3 className="font-bold text-sm text-foreground">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8 sm:p-10 text-center space-y-5">
        <h2 className="text-2xl font-bold text-foreground">Ready to share your engineering story?</h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Start writing in our interactive MDX draft editor. Save drafts, preview diagrams in real-time, and submit whenever you are ready.
        </p>
        <Link
          href="/guest-post/submit"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-sm"
        >
          <span>Open Guest Post Editor</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
