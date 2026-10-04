/**
 * Link Health Probe Utility
 * Verifies if a shortened URL is reachable and resolves properly without hanging.
 */
export async function checkLinkHealth(url: string, timeoutMs = 2500): Promise<boolean> {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return false;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Try HEAD request first for minimal bandwidth
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual', // Do not follow full redirect chains, just check if target responds with 2xx or 3xx
      signal: controller.signal,
      headers: {
        'User-Agent': 'NexusNation-HealthProbe/1.0',
      },
    });

    clearTimeout(timeout);

    // Any 2xx OK or 3xx Redirect indicates a functioning shortlink
    if (res.status >= 200 && res.status < 400) {
      return true;
    }

    // Some shorteners block HEAD or return 405 Method Not Allowed; fallback to fast GET
    if (res.status === 405) {
      const getController = new AbortController();
      const getTimeout = setTimeout(() => getController.abort(), timeoutMs);
      try {
        const getRes = await fetch(url, {
          method: 'GET',
          redirect: 'manual',
          signal: getController.signal,
          headers: {
            'User-Agent': 'NexusNation-HealthProbe/1.0',
            Range: 'bytes=0-0',
          },
        });
        clearTimeout(getTimeout);
        return getRes.status >= 200 && getRes.status < 400;
      } catch {
        return false;
      }
    }

    return false;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
