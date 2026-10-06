import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const configuredKey = process.env.INDEXNOW_KEY || 'nexusblog_indexnow_key_8f3a9e2d1c';

  return new NextResponse(configuredKey, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
