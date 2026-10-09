import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@nexus/config';
import { articlesApi } from '@/lib/api-client';
import { BreadcrumbJsonLd, CollectionJsonLd } from '@/components/seo/json-ld';
import {
  INCIDENT_DOMAINS,
  INCIDENT_DOMAIN_LABELS,
  INCIDENT_FAILURE_MODES,
  INCIDENT_FAILURE_LABELS,
  INCIDENT_IMPACTS,
  INCIDENT_IMPACT_LABELS,
  INCIDENT_SEVERITIES,
  INCIDENT_SEVERITY_LABELS,
} from '@nexus/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Production Incident Atlas',
  description: 'Evidence-backed timelines of engineering failures: what broke, how teams detected it, and what changed afterward.',
  alternates: { canonical: '/incidents' },
  openGraph: { type: 'website', url: '/incidents', title: 'Production Incident Atlas — NexusNation', description: 'Evidence-backed timelines of engineering failures.' },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(params: Record<string, string | string[] | undefined>, key: string) {
  return typeof params[key] === 'string' ? params[key] as string : undefined;
}

export default async function IncidentAtlasPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const domain = INCIDENT_DOMAINS.find((item) => item === one(params, 'domain'));
  const failureMode = INCIDENT_FAILURE_MODES.find((item) => item === one(params, 'failureMode'));
  const severity = INCIDENT_SEVERITIES.find((item) => item === one(params, 'severity'));
  const impact = INCIDENT_IMPACTS.find((item) => item === one(params, 'impact'));
  const search = one(params, 'search')?.trim();
  const page = Math.max(1, Number(one(params, 'page')) || 1);

  let result = { items: [] as any[], total: 0, meta: { totalPages: 1 } };
  try {
    result = await articlesApi.getIncidents({ domain, failureMode, severity, impact, search, page, limit: 18 });
  } catch {
    // Keep the atlas shell available during API interruptions.
  }

  const filters = { domain, failureMode, severity, impact, search };
  const hrefFor = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...filters, ...changes })) {
      if (value) next.set(key, value);
    }
    const query = next.toString();
    return `/incidents${query ? `?${query}` : ''}`;
  };
  const filterGroup = (title: string, values: readonly string[], labels: Record<string, string>, selected?: string, key?: string) => (
    <section className="space-y-2" aria-label={title}>
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => <Link key={value} href={hrefFor({ [key!]: selected === value ? undefined : value })} className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${selected === value ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}>{labels[value]}</Link>)}
      </div>
    </section>
  );

  return (
    <main className="container mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <BreadcrumbJsonLd items={[{ name: 'Home', item: siteConfig.url }, { name: 'Production Incident Atlas', item: `${siteConfig.url}/incidents` }]} />
      <CollectionJsonLd name="Production Incident Atlas" description="Evidence-backed timelines of engineering failures." url={`${siteConfig.url}/incidents`} />
      <header className="mb-10 border-b border-border pb-8">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">Engineering postmortems, with sources</p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Production Incident Atlas</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">Follow the timeline of real engineering failures: what broke, how teams detected it, how they recovered, and what they changed afterward. Timeline claims link to their sources.</p>
      </header>

      <div className="mb-9 space-y-5 rounded-2xl border border-border bg-card p-5">
        <form method="get" action="/incidents" className="flex gap-2">
          {Object.entries(filters).filter(([key, value]) => key !== 'search' && value).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
          <label className="sr-only" htmlFor="incident-search">Search incidents</label>
          <input id="incident-search" name="search" defaultValue={search} placeholder="Search organizations or incidents" className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Search</button>
        </form>
        {filterGroup('Engineering domain', INCIDENT_DOMAINS, INCIDENT_DOMAIN_LABELS, domain, 'domain')}
        {filterGroup('Failure mode', INCIDENT_FAILURE_MODES, INCIDENT_FAILURE_LABELS, failureMode, 'failureMode')}
        {filterGroup('Severity', INCIDENT_SEVERITIES, INCIDENT_SEVERITY_LABELS, severity, 'severity')}
        {filterGroup('Impact', INCIDENT_IMPACTS, INCIDENT_IMPACT_LABELS, impact, 'impact')}
        {(domain || failureMode || severity || impact || search) && <Link href="/incidents" className="inline-block text-xs font-semibold text-primary hover:underline">Clear filters</Link>}
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground"><span>{result.total} documented {result.total === 1 ? 'incident' : 'incidents'}</span></div>
      {result.items.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {result.items.map((article) => <article key={article.id} className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
            <div className="mb-3 flex flex-wrap gap-2 text-[11px] font-semibold">
              {article.incident?.domain && <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">{INCIDENT_DOMAIN_LABELS[article.incident.domain as keyof typeof INCIDENT_DOMAIN_LABELS]}</span>}
              {article.incident?.severity && <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-rose-500">{INCIDENT_SEVERITY_LABELS[article.incident.severity as keyof typeof INCIDENT_SEVERITY_LABELS]}</span>}
            </div>
            <h2 className="text-xl font-bold text-foreground"><Link href={`/incidents/${article.slug}`} className="hover:text-primary">{article.title}</Link></h2>
            <p className="mt-2 text-xs text-muted-foreground">{article.incident?.organization || 'Engineering incident'}{article.incident?._count?.events ? ` · ${article.incident._count.events} timeline events` : ''}</p>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{article.excerpt}</p>
            <Link href={`/incidents/${article.slug}`} className="mt-4 inline-block text-sm font-semibold text-primary">Read the timeline →</Link>
          </article>)}
        </div>
      ) : <div className="rounded-2xl border border-dashed border-border p-12 text-center"><h2 className="text-lg font-semibold text-foreground">No incidents match these filters</h2><p className="mt-2 text-sm text-muted-foreground">Try removing a filter or search term.</p><Link href="/incidents" className="mt-4 inline-block text-sm font-semibold text-primary">Show all incidents</Link></div>}

      {result.meta.totalPages > page && <nav aria-label="Incident pages" className="mt-8 flex justify-center"><Link href={hrefFor({ page: String(page + 1) })} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground">More incidents</Link></nav>}
    </main>
  );
}
