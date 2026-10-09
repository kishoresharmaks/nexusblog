import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { siteConfig, normalizeMediaUrl } from '@nexus/config';
import { articlesApi } from '@/lib/api-client';
import { MdxRenderer } from '@/components/mdx';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld';
import { INCIDENT_DOMAIN_LABELS, INCIDENT_FAILURE_LABELS, INCIDENT_IMPACT_LABELS, INCIDENT_SEVERITY_LABELS } from '@nexus/types';

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

async function loadIncident(slug: string) {
  try {
    return await articlesApi.getIncidentBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await loadIncident(slug);
  if (!article) return { title: 'Incident not found', robots: { index: false, follow: true } };
  const url = `/incidents/${article.slug}`;
  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    alternates: { canonical: url },
    robots: article.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'article',
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt,
      url,
      siteName: siteConfig.name,
      publishedTime: article.publishedAt,
      modifiedTime: article.incident?.updatedAt,
      images: article.coverImage ? [{ url: normalizeMediaUrl(article.coverImage), alt: article.title }] : undefined,
    },
  };
}

function displayDate(event: any) {
  if (event.dateLabel) return event.dateLabel;
  if (!event.occurredAt) return 'Date unknown';
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: event.precision === 'EXACT' ? 'short' : undefined,
    timeZone: event.timezone || 'UTC',
  }).format(new Date(event.occurredAt));
}

function sourceHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Open source';
  }
}

export default async function IncidentDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await loadIncident(slug);
  if (!article) notFound();
  if (article.type !== 'INCIDENT') permanentRedirect(`/articles/${article.slug}`);
  const incident = article.incident;
  if (!incident) notFound();
  const canonical = `/incidents/${article.slug}`;
  const baseUrl = (siteConfig.url || 'https://nexusnation.in').replace(/\/+$/, '');
  const authorName = article.guestAuthorName || article.author?.name || 'NexusNation Editorial Team';

  return (
    <main className="mx-auto w-full max-w-5xl min-w-0 px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <ArticleJsonLd
        title={article.title}
        description={article.excerpt}
        slug={article.slug}
        pathPrefix="/incidents"
        datePublished={article.publishedAt || new Date().toISOString()}
        dateModified={incident.updatedAt || article.publishedAt || undefined}
        authorName={authorName}
        category="Production Incident"
        keywords={[incident.organization, incident.domain, incident.failureMode, ...(incident.impacts || [])].filter(Boolean)}
      />
      <BreadcrumbJsonLd items={[
        { name: 'Home', item: baseUrl },
        { name: 'Production Incident Atlas', item: `${baseUrl}/incidents` },
        { name: article.title, item: `${baseUrl}${canonical}` },
      ]} />

      <Link href="/incidents" className="inline-flex min-h-10 items-center text-sm font-semibold text-primary hover:underline">← All incidents</Link>
      <header className="relative mt-3 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-primary" />
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Production Incident Atlas</p>
        <h1 className="mt-3 max-w-4xl text-[clamp(1.9rem,6vw,3.25rem)] font-bold leading-[1.08] tracking-tight text-foreground">{article.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">{article.excerpt}</p>
        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          {incident.organization && <span className="max-w-full rounded-full border border-border bg-background/70 px-3 py-1.5 font-medium">{incident.organization}</span>}
          {incident.domain && <span className="rounded-full border border-border bg-background/70 px-3 py-1.5">{INCIDENT_DOMAIN_LABELS[incident.domain as keyof typeof INCIDENT_DOMAIN_LABELS]}</span>}
          {incident.failureMode && <span className="rounded-full border border-border bg-background/70 px-3 py-1.5">{INCIDENT_FAILURE_LABELS[incident.failureMode as keyof typeof INCIDENT_FAILURE_LABELS]}</span>}
          {incident.severity && <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 font-semibold text-rose-600 dark:text-rose-400">{INCIDENT_SEVERITY_LABELS[incident.severity as keyof typeof INCIDENT_SEVERITY_LABELS]} severity</span>}
          {(incident.impacts || []).map((impact: string) => <span key={impact} className="rounded-full bg-muted px-3 py-1.5">{INCIDENT_IMPACT_LABELS[impact as keyof typeof INCIDENT_IMPACT_LABELS]}</span>)}
        </div>
      </header>

      <section aria-labelledby="timeline-heading" className="py-8 sm:py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">What happened</p>
            <h2 id="timeline-heading" className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Incident timeline</h2>
          </div>
          <span className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">{incident.events?.length || 0} documented events</span>
        </div>
        <ol className="ml-1 space-y-0 border-l-2 border-primary/20 pl-5 sm:ml-2 sm:pl-8">
          {(incident.events || []).map((event: any, index: number) => (
            <li key={event.id || index} className="relative min-w-0 pb-6 last:pb-0 sm:pb-8">
              <span aria-hidden="true" className="absolute -left-[1.68rem] top-1 h-3 w-3 rounded-full border-[3px] border-primary bg-background ring-4 ring-background sm:-left-[2.18rem]" />
              <article className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
                <time className="inline-flex max-w-full rounded-md bg-primary/5 px-2.5 py-1 font-mono text-xs font-semibold leading-5 text-primary">{displayDate(event)}</time>
                <p className="mt-3 text-[15px] leading-7 text-foreground sm:text-base">{event.summary}</p>
                {event.sources?.length > 0 && <ul className="mt-4 grid min-w-0 gap-2 sm:grid-cols-2">
                {event.sources.map(({ source, sourceType, exceptionReason }: any) => <li key={source.id} className="min-w-0 rounded-lg border border-border/80 bg-muted/30 p-3">
                  <p className="truncate text-sm font-semibold text-foreground">{source.publisher || sourceHost(source.url)}</p>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{sourceHost(source.url)}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center font-semibold text-primary hover:underline">Open original source ↗</a>
                    {source.archiveUrl && <a href={source.archiveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center text-muted-foreground hover:text-foreground hover:underline">Archived copy ↗</a>}
                  </div>
                  {sourceType === 'APPROVED_EXCEPTION' && <span className="mt-2 inline-block rounded bg-amber-500/10 px-2 py-1 text-[11px] text-amber-600">Historical source exception</span>}
                  {exceptionReason && <p className="mt-2 break-words text-xs leading-5 text-muted-foreground">Editorial exception: {exceptionReason}</p>}
                  {source.linkStatus === 'BROKEN' && <p className="mt-2 break-words text-xs leading-5 text-amber-600">Original source was unavailable during the latest check{source.linkCheckedAt ? ` on ${new Date(source.linkCheckedAt).toLocaleDateString('en')}` : ''}.</p>}
                  {source.publishedAt && <p className="mt-2 text-xs text-muted-foreground">Source published {new Date(source.publishedAt).toLocaleDateString('en')}</p>}
                </li>)}
              </ul>}
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid min-w-0 gap-3 border-y border-border py-7 sm:gap-4 sm:py-8 md:grid-cols-3">
        {[
          ['Detection', incident.detection],
          ['Recovery', incident.recovery],
          ['Lessons afterward', incident.lessons],
        ].map(([heading, value]) => value && <article key={heading} className="min-w-0 rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
          <h2 className="font-semibold text-foreground">{heading}</h2><p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">{value}</p>
        </article>)}
      </section>

      <section aria-labelledby="analysis-heading" className="prose prose-neutral dark:prose-invert mt-8 max-w-none break-words sm:mt-10">
        <h2 id="analysis-heading">Editorial analysis</h2>
        <MdxRenderer source={article.content} />
      </section>

      <section className="mt-10 border-t border-border pt-6 text-sm leading-6 text-muted-foreground sm:mt-12">
        <p>Last reviewed {incident.updatedAt ? new Date(incident.updatedAt).toLocaleDateString('en') : 'on publication'} by {authorName}.</p>
        <h2 className="mt-5 font-semibold text-foreground">Change notes</h2>
        {incident.changes?.length ? <ul className="mt-2 list-disc space-y-1 pl-5">{incident.changes.map((change: any) => <li key={change.id}>{new Date(change.createdAt).toLocaleDateString('en')}: {change.note}</li>)}</ul> : <p className="mt-2">Initial publication.</p>}
        <p className="mt-5">Corrections or additional primary evidence? <a className="font-semibold text-primary hover:underline" href={`mailto:editorial@nexusnation.in?subject=${encodeURIComponent(`Incident correction: ${article.title}`)}`}>Contact the editorial team</a>.</p>
      </section>
    </main>
  );
}
