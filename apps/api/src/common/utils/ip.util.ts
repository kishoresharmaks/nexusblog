import { Request } from 'express';

/**
 * Extracts and cleans the real client IP address from proxy headers (Cloudflare, Nginx, ALB, Traefik)
 * and normalizes IPv6-mapped IPv4 representations (e.g. ::ffff:127.0.0.1 -> 127.0.0.1).
 */
export function extractClientIp(req: Request): string {
  if (!req) return '127.0.0.1';

  // 1. Check Cloudflare / CDN headers (CF-Connecting-IP, True-Client-IP)
  const cfConnectingIp = (req.headers['cf-connecting-ip'] || req.headers['true-client-ip']) as string;
  if (cfConnectingIp && cfConnectingIp.trim().length > 0) {
    return cleanIpString(cfConnectingIp.trim());
  }

  // 2. Check X-Forwarded-For header (first entry in the comma-delimited chain is the original client IP)
  const xForwardedFor = req.headers['x-forwarded-for'] as string;
  if (xForwardedFor && xForwardedFor.trim().length > 0) {
    const clientIp = xForwardedFor.split(',')[0].trim();
    if (clientIp.length > 0) {
      return cleanIpString(clientIp);
    }
  }

  // 3. Check X-Real-IP / Fastly / custom proxy headers
  const xRealIp = (req.headers['x-real-ip'] || req.headers['x-client-ip'] || req.headers['fastly-client-ip']) as string;
  if (xRealIp && xRealIp.trim().length > 0) {
    return cleanIpString(xRealIp.trim());
  }

  // 4. Fallback to Express request IP or socket remoteAddress
  const rawIp = req.ip || req.socket?.remoteAddress || '127.0.0.1';
  return cleanIpString(rawIp);
}

/**
 * Strips ::ffff: prefix from IPv6-mapped IPv4 addresses and normalizes localhost
 */
export function cleanIpString(ip: string): string {
  if (!ip) return '127.0.0.1';
  let cleaned = ip.trim();

  // Strip ::ffff: prefix from IPv6-mapped IPv4 addresses
  if (cleaned.startsWith('::ffff:')) {
    cleaned = cleaned.substring(7);
  }

  // Normalize IPv6 localhost
  if (cleaned === '::1' || cleaned === '::') {
    return '127.0.0.1';
  }

  return cleaned;
}
