import { siteConfig } from '@nexus/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  let content = `# Security Vulnerability Disclosure Policy (RFC 9116)
Contact: mailto:security@nexusnation.in
Contact: https://nexusnation.in/contact
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: https://nexusnation.in/.well-known/security.txt
Policy: https://nexusnation.in/security-policy
`;

  try {
    const res = await fetch(`${siteConfig.apiUrl}/system-settings/public`, {
      next: { revalidate: 0 },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      const payload = data?.data || data;
      if (payload?.securityTxtContent && typeof payload.securityTxtContent === 'string' && payload.securityTxtContent.trim().length > 0) {
        content = payload.securityTxtContent.trim() + '\n';
      }
    }
  } catch {
    // Fallback default
  }

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
