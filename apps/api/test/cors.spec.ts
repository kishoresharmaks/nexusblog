import { describe, expect, it } from 'vitest';
import { getAllowedCorsOrigins, isCorsOriginAllowed } from '../src/common/utils/cors.util';

describe('CORS origin allowlist', () => {
  it('allows configured production origins and rejects unlisted origins', () => {
    const allowed = getAllowedCorsOrigins({
      NODE_ENV: 'production',
      CLIENT_URL: 'https://nexusnation.in',
      CORS_ALLOWED_ORIGINS: 'https://admin.nexusnation.in, https://preview.nexusnation.in/path',
    });

    expect(isCorsOriginAllowed('https://nexusnation.in', allowed)).toBe(true);
    expect(isCorsOriginAllowed('https://preview.nexusnation.in', allowed)).toBe(true);
    expect(isCorsOriginAllowed('https://attacker.example', allowed)).toBe(false);
    expect(isCorsOriginAllowed(undefined, allowed)).toBe(true);
  });

  it('allows local web origins only outside production', () => {
    const production = getAllowedCorsOrigins({ NODE_ENV: 'production' });
    const development = getAllowedCorsOrigins({ NODE_ENV: 'development' });

    expect(isCorsOriginAllowed('http://localhost:3000', production)).toBe(false);
    expect(isCorsOriginAllowed('http://localhost:3000', development)).toBe(true);
  });
});
