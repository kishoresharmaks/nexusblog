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
    <main className="container mx-auto max-w-5xl px-4 py-10 sm:px-6">
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

      <Link href="/incidents" className="text-sm font-semibold text-primary hover:underline">← All incidents</Link>
      <header className="mt-6 border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Production Incident Atlas</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">{article.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-7 text-muted-foreground">{article.excerpt}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          {incident.organization && <span className="rounded-full border border-border px-3 py-1.5">{incident.organization}</span>}
          {incident.domain && <span className="rounded-full border border-border px-3 py-1.5">{INCIDENT_DOMAIN_LABELS[incident.domain as keyof typeof INCIDENT_DOMAIN_LABELS]}</span>}
          {incident.failureMode && <span className="rounded-full border border-border px-3 py-1.5">{INCIDENT_FAILURE_LABELS[incident.failureMode as keyof typeof INCIDENT_FAILURE_LABELS]}</span>}
          {incident.severity && <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-rose-500">{INCIDENT_SEVERITY_LABELS[incident.severity as keyof typeof INCIDENT_SEVERITY_LABELS]} severity</span>}
          {(incident.impacts || []).map((impact: string) => <span key={impact} className="rounded-full bg-muted px-3 py-1.5">{INCIDENT_IMPACT_LABELS[impact as keyof typeof INCIDENT_IMPACT_LABELS]}</span>)}
        </div>
      </header>

      <section aria-labelledby="timeline-heading" className="py-9">
        <h2 id="timeline-heading" className="mb-6 text-2xl font-bold text-foreground">Incident timeline</h2>
        <ol className="space-y-0 border-l border-primary/30 pl-5 sm:pl-7">
          {(incident.events || []).map((event: any, index: number) => (
            <li key={event.id || index} className="relative pb-8 last:pb-0">
              <span className="absolute -left-[1.65rem] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background sm:-left-[2.15rem]" />
              <time className="font-mono text-xs font-semibold text-primary">{displayDate(event)}</time>
              <p className="mt-2 text-base leading-7 text-foreground">{event.summary}</p>
              {event.sources?.length > 0 && <ul className="mt-3 space-y-2">
                {event.sources.map(({ source, sourceType, exceptionReason }: any) => <li key={source.id} className="rounded-lg border border-border bg-card px-3 py-2 text-xs">
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">{source.publisher}: {source.url}</a>
                  {sourceType === 'APPROVED_EXCEPTION' && <span className="ml-2 rounded bg-amber-500/10 px-2 py-0.5 text-amber-600">Historical source exception</span>}
                  {exceptionReason && <p className="mt-1 text-muted-foreground">Editorial exception: {exceptionReason}</p>}
                  {source.archiveUrl && <p className="mt-1"><a href={source.archiveUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground hover:underline">Archived snapshot</a></p>}
                  {source.linkStatus === 'BROKEN' && <p className="mt-1 text-amber-600">Original source was unavailable during the latest check{source.linkCheckedAt ? ` on ${new Date(source.linkCheckedAt).toLocaleDateString('en')}` : ''}.</p>}
                  {source.publishedAt && <p className="mt-1 text-muted-foreground">Source published {new Date(source.publishedAt).toLocaleDateString('en')}</p>}
                </li>)}
              </ul>}
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 border-y border-border py-8 md:grid-cols-3">
        {[
          ['Detection', incident.detection],
          ['Recovery', incident.recovery],
          ['Lessons afterward', incident.lessons],
        ].map(([heading, value]) => value && <article key={heading} className="rounded-xl bg-muted/30 p-4">
          <h2 className="font-semibold text-foreground">{heading}</h2><p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">{value}</p>
        </article>)}
      </section>

      <section aria-labelledby="analysis-heading" className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
        <h2 id="analysis-heading">Editorial analysis</h2>
        <MdxRenderer source={article.content} />
      </section>

      <section className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
        <p>Last reviewed {incident.updatedAt ? new Date(incident.updatedAt).toLocaleDateString('en') : 'on publication'} by {authorName}.</p>
        <h2 className="mt-5 font-semibold text-foreground">Change notes</h2>
        {incident.changes?.length ? <ul className="mt-2 list-disc space-y-1 pl-5">{incident.changes.map((change: any) => <li key={change.id}>{new Date(change.createdAt).toLocaleDateString('en')}: {change.note}</li>)}</ul> : <p className="mt-2">Initial publication.</p>}
        <p className="mt-5">Corrections or additional primary evidence? <a className="font-semibold text-primary hover:underline" href={`mailto:editorial@nexusnation.in?subject=${encodeURIComponent(`Incident correction: ${article.title}`)}`}>Contact the editorial team</a>.</p>
      </section>
    </main>
  );
}
