import { NextRequest, NextResponse } from 'next/server';
import { siteConfig } from '@nexus/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  if (!code) {
    return NextResponse.redirect(new URL('/', request.url), 308);
  }

  try {
    const apiBase = siteConfig.apiUrl;
    const res = await fetch(`${apiBase}/shortener/s/${encodeURIComponent(code)}`, {
      method: 'GET',
      redirect: 'manual',
    });

    if (res.status === 308 || res.status === 301 || res.status === 302 || res.status === 307) {
      const location = res.headers.get('location');
      if (location) {
        return NextResponse.redirect(new URL(location, request.url), 308);
      }
    }

    if (res.ok) {
      const data = await res.json();
      if (data?.destinationUrl) {
        return NextResponse.redirect(new URL(data.destinationUrl, request.url), 308);
      }
    }
  } catch {
    // Silent fallback
  }

  // Fallback to homepage
  return NextResponse.redirect(new URL('/', request.url), 308);
}
