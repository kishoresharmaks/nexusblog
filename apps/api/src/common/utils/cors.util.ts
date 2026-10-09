export function getAllowedCorsOrigins(env: NodeJS.ProcessEnv = process.env): Set<string> {
  const configuredOrigins = [
    env.CLIENT_URL,
    env.NEXT_PUBLIC_SITE_URL,
    ...(env.CORS_ALLOWED_ORIGINS || '').split(','),
  ].filter((origin): origin is string => Boolean(origin?.trim()));

  if (env.NODE_ENV !== 'production') {
    configuredOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000');
  }

  return new Set(configuredOrigins.map((origin) => new URL(origin.trim()).origin));
}

export function isCorsOriginAllowed(origin: string | undefined, allowedOrigins: Set<string>): boolean {
  return !origin || allowedOrigins.has(origin);
}
