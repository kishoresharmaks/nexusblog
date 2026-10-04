import { analyticsApi } from './api-client';

let searchTimer: ReturnType<typeof setTimeout> | null = null;
let lastLoggedQuery = '';
let lastLoggedTime = 0;

/**
 * Intelligent, low-cost search telemetry tracker.
 * - Filters out short fragments (< 3 characters).
 * - Debounces idle searches by 2000ms (only logs when the user actually stops typing).
 * - Deduplicates identical queries within 15 seconds.
 * - Supports immediate logging on explicit user actions (Enter key, search button click, article click).
 */
export function logSearchTelemetry(
  rawQuery: string,
  resultsCount: number = 0,
  immediate: boolean = false,
) {
  if (typeof window === 'undefined') return;

  const cleaned = rawQuery.replace(/^#+/, '').trim().toLowerCase();

  // 1. Ignore short keystroke fragments (< 3 chars)
  if (!cleaned || cleaned.length < 3) {
    if (searchTimer) {
      clearTimeout(searchTimer);
      searchTimer = null;
    }
    return;
  }

  // 2. Ignore repeated consecutive identical queries within 15s
  const now = Date.now();
  if (cleaned === lastLoggedQuery && now - lastLoggedTime < 15000) {
    return;
  }

  const sendLog = () => {
    lastLoggedQuery = cleaned;
    lastLoggedTime = Date.now();
    analyticsApi.logSearchQuery(cleaned, resultsCount).catch(() => {});
  };

  // Clear any existing pending debounce timer
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }

  if (immediate) {
    sendLog();
  } else {
    // Wait 2000ms of user inactivity before logging the settled search term
    searchTimer = setTimeout(() => {
      sendLog();
      searchTimer = null;
    }, 2000);
  }
}
