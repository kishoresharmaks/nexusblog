import { NextRequest, NextResponse } from 'next/server';
import { siteConfig } from '@nexus/config';

export async function middleware(request: NextRequest) {
  const slug = request.nextUrl.pathname.split('/').filter(Boolean).at(-1);
  if (!slug) return NextResponse.next();

  try {
    const response = await fetch(`${siteConfig.apiUrl}/articles/${encodeURIComponent(slug)}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(1500),
    });
    if (!response.ok) return NextResponse.next();
    const body = await response.json();
    const article = body?.data?.data || body?.data || body;
    const isIncident = article?.type === 'INCIDENT';
    const path = request.nextUrl.pathname;
    if ((path.startsWith('/articles/') && isIncident) || (path.startsWith('/incidents/') && !isIncident)) {
      const target = path.startsWith('/articles/') ? `/incidents/${slug}` : `/articles/${slug}`;
      const redirect = NextResponse.redirect(new URL(target, request.url), 301);
      redirect.headers.set('Cache-Control', 'no-store');
      return redirect;
    }
  } catch {
    // The page remains available if the API is temporarily unreachable.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/articles/:slug', '/incidents/:slug'],
};
