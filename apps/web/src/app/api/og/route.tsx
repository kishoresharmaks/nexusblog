import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title') || 'Technical Engineering & Distributed Systems';
    const category = searchParams.get('category') || 'SYSTEM DESIGN';
    const author = searchParams.get('author') || 'NexusBlog Staff';
    const readingTime = searchParams.get('readingTime') || '10';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#09090b',
            color: '#fafafa',
            padding: '60px 80px',
            fontFamily: 'sans-serif',
            backgroundImage:
              'radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #27272a 2%, transparent 0%)',
            backgroundSize: '100px 100px',
          }}
        >
          {/* Top Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: '-0.03em',
              }}
            >
              <div
                style={{
                  height: 36,
                  width: 36,
                  borderRadius: 10,
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: 20,
                }}
              >
                N
              </div>
              <span>NexusBlog.dev</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 16px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 700,
                color: '#60a5fa',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {category}
            </div>
          </div>

          {/* Center H1 Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                fontSize: title.length > 60 ? 44 : 54,
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                color: '#ffffff',
                maxWidth: '960px',
              }}
            >
              {title}
            </div>
          </div>

          {/* Bottom Footer Meta */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #27272a',
              paddingTop: 24,
              fontSize: 18,
              color: '#a1a1aa',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#f4f4f5' }}>{author}</span>
              <span>•</span>
              <span>Architectural Blueprint</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>~{readingTime} min read</span>
              <span>•</span>
              <span style={{ color: '#60a5fa', fontWeight: 600 }}>Nexus Technical Publishing</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (err: any) {
    return new Response(`Failed to generate OG Image: ${err.message}`, {
      status: 500,
    });
  }
}
