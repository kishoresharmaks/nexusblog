import { siteConfig } from '@nexus/config';
import { authClient } from './auth-client';

// In-flight request deduplication map (prevents duplicate concurrent network requests)
const inFlightRequests = new Map<string, Promise<any>>();

// Client-side in-memory cache for GET endpoints (TTL in milliseconds)
const clientCache = new Map<string, { data: any; expiry: number }>();

// Cache TTL configuration (in ms)
const CACHE_CONFIG: Record<string, number> = {
  '/ads/public/config': 5 * 60 * 1000, // 5 minutes
  '/ads/public/placements': 5 * 60 * 1000, // 5 minutes
  '/categories': 3 * 60 * 1000, // 3 minutes
  '/article-types': 3 * 60 * 1000, // 3 minutes
  '/technologies': 3 * 60 * 1000, // 3 minutes
  '/tags': 3 * 60 * 1000, // 3 minutes
  '/series': 3 * 60 * 1000, // 3 minutes
};

export function clearApiClientCache(pattern?: string) {
  if (!pattern) {
    clientCache.clear();
    return;
  }
  for (const key of clientCache.keys()) {
    if (key.includes(pattern)) {
      clientCache.delete(key);
    }
  }
}

async function executeRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth = false,
  retryOnAuthFailure = true,
): Promise<T> {
  const isServer = typeof window === 'undefined';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  let token = authClient.getAccessToken();

  // If auth is required on client side but no token in memory, attempt refresh before sending
  if (!token && requireAuth && !isServer && retryOnAuthFailure) {
    try {
      const refreshed = await authClient.refreshToken();
      if (refreshed) {
        token = authClient.getAccessToken();
      }
    } catch {
      // silent
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const apiBase = siteConfig.apiUrl;
  const url = `${apiBase}${endpoint}`;

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  if (isServer && (!options.method || options.method === 'GET')) {
    (fetchOptions as any).next = { revalidate: 60 };
  }

  let res: Response;
  try {
    res = await fetch(url, fetchOptions);
  } catch (err) {
    if (!isServer && url.startsWith('http')) {
      try {
        res = await fetch(`/api${endpoint}`, fetchOptions);
      } catch {
        throw new Error(`Failed to connect to API server at ${url}. Please verify that the NestJS backend is running.`);
      }
    } else {
      throw err;
    }
  }

  // Handle 401 Unauthorized by attempting session refresh and retrying once
  if (res.status === 401 && !isServer && retryOnAuthFailure) {
    try {
      const refreshed = await authClient.refreshToken();
      if (refreshed) {
        return executeRequest<T>(endpoint, options, requireAuth, false);
      }
    } catch {
      // Refresh failed
    }
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Invalid JSON response from ${url} (status: ${res.status})`);
  }

  if (!res.ok || (data && data.success === false)) {
    const details = data?.error?.details || data?.details;
    let message = data?.error?.message || data?.message || `Request failed with status ${res.status}`;
    if (Array.isArray(details) && details.length > 0) {
      message = `${message}: ${details.join(', ')}`;
    } else if (typeof details === 'string') {
      message = `${message}: ${details}`;
    }
    const error = new Error(message);
    (error as any).details = details;
    (error as any).code = data?.error?.code || data?.code;
    throw error;
  }

  // If response has meta (paginated response from TransformInterceptor)
  if (data?.meta && data?.data !== undefined) {
    const items = Array.isArray(data.data) ? data.data : [];
    return {
      items,
      meta: data.meta,
      total: data.meta?.total || items.length,
    } as unknown as T;
  }

  return data?.data !== undefined ? data.data : data;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth = false,
  retryOnAuthFailure = true,
): Promise<T> {
  const isServer = typeof window === 'undefined';
  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET';

  // Client-side cache and deduplication check for GET requests
  if (!isServer && isGet) {
    const token = authClient.getAccessToken();
    const cacheKey = `${endpoint}:${requireAuth ? token || 'auth' : 'pub'}`;

    const cached = clientCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data as T;
    }

    // In-flight deduplication: if the exact same GET request is currently in flight, reuse the promise
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey)! as Promise<T>;
    }

    const fetchPromise = executeRequest<T>(endpoint, options, requireAuth, retryOnAuthFailure)
      .then((data) => {
        // If endpoint is cacheable or is public GET config/metadata
        const baseEndpoint = endpoint.split('?')[0];
        const ttl = CACHE_CONFIG[baseEndpoint] || (endpoint.startsWith('/ads/public') ? 300000 : 0);
        if (ttl > 0) {
          clientCache.set(cacheKey, { data, expiry: Date.now() + ttl });
        }
        return data;
      })
      .finally(() => {
        inFlightRequests.delete(cacheKey);
      });

    inFlightRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  // If non-GET mutation, invalidate relevant cached GET entries
  if (!isServer && !isGet) {
    if (endpoint.includes('/ads')) clearApiClientCache('/ads');
    if (endpoint.includes('/tags')) clearApiClientCache('/tags');
    if (endpoint.includes('/technologies')) clearApiClientCache('/technologies');
    if (endpoint.includes('/categories')) clearApiClientCache('/categories');
    if (endpoint.includes('/articles')) clearApiClientCache('/articles');
    if (endpoint.includes('/bookmarks')) clearApiClientCache('/bookmarks');
  }

  return executeRequest<T>(endpoint, options, requireAuth, retryOnAuthFailure);
}

// Articles API
export const articlesApi = {
  async getPublicFeed(params: {
    page?: number;
    limit?: number;
    search?: string;
    authorId?: string;
    categorySlug?: string;
    technologySlug?: string;
    tagSlug?: string;
    difficulty?: string;
    type?: string;
    filter?: 'featured' | 'popular';
  } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.authorId) query.set('authorId', params.authorId);
    if (params.categorySlug) query.set('categorySlug', params.categorySlug);
    if (params.technologySlug) query.set('technologySlug', params.technologySlug);
    if (params.tagSlug) query.set('tagSlug', params.tagSlug);
    if (params.difficulty) query.set('difficulty', params.difficulty);
    if (params.type) query.set('type', params.type);
    if (params.filter) query.set('filter', params.filter);

    const queryString = query.toString();
    const endpoint = queryString ? `/articles?${queryString}` : '/articles';
    const res = await request<any>(endpoint);
    const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : [];
    const meta = res?.meta || { total: items.length };
    return { items, meta, total: meta.total || items.length };
  },

  async summarize(body: { slug?: string; title?: string; excerpt?: string; content?: string }) {
    return request<{
      success: boolean;
      bullets: string[];
      source: 'gemini' | 'smart_fallback';
      modelUsed?: string;
    }>('/articles/summarize', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async getAdminArticles(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    categorySlug?: string;
  } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.categorySlug) query.set('categorySlug', params.categorySlug);

    const queryString = query.toString();
    const endpoint = queryString ? `/articles/admin/all?${queryString}` : '/articles/admin/all';
    const res = await request<any>(endpoint, {}, true);
    const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : [];
    const meta = res?.meta || { total: items.length };
    return { items, meta, total: meta.total || items.length };
  },

  async getById(id: string) {
    return request<any>(`/articles/admin/detail/${id}`, {}, true);
  },

  async getBySlug(slug: string) {
    return request<any>(`/articles/${slug}`);
  },

  async getIncidents(params: {
    page?: number;
    limit?: number;
    domain?: string;
    failureMode?: string;
    severity?: string;
    impact?: string;
    search?: string;
  } = {}) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) query.set(key, String(value));
    }
    const result = await request<any>(`/incidents${query.size ? `?${query}` : ''}`);
    const items = Array.isArray(result) ? result : Array.isArray(result?.items) ? result.items : [];
    const meta = result?.meta || { total: items.length };
    return { items, meta, total: meta.total || items.length };
  },

  async getIncidentBySlug(slug: string) {
    return request<any>(`/incidents/${encodeURIComponent(slug)}`);
  },

  async create(payload: any) {
    return request<any>('/articles', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true);
  },

  async update(id: string, payload: any) {
    return request<any>(`/articles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, true);
  },

  async delete(id: string) {
    return request<any>(`/articles/${id}`, {
      method: 'DELETE',
    }, true);
  },

  async toggleBookmark(id: string) {
    return request<{ bookmarked: boolean }>(`/articles/${id}/bookmark`, {
      method: 'POST',
    }, true);
  },

  async like(id: string, action?: 'like' | 'unlike') {
    return request<{ likesCount: number }>(`/articles/${id}/like`, {
      method: 'POST',
      body: JSON.stringify({ action: action || 'like' }),
    });
  },
};

// Categories API
export const categoriesApi = {
  async getAll() {
    return request<any[]>('/categories');
  },
  async getBySlug(slug: string) {
    return request<any>(`/categories/${slug}`);
  },
  async create(payload: any) {
    return request<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true);
  },
  async update(id: string, payload: any) {
    return request<any>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, true);
  },
  async delete(id: string) {
    return request<any>(`/categories/${id}`, {
      method: 'DELETE',
    }, true);
  },
};

// Technologies API
export const technologiesApi = {
  async getAll() {
    return request<any[]>('/technologies');
  },
  async getBySlug(slug: string) {
    return request<any>(`/technologies/${slug}`);
  },
  async create(payload: any) {
    return request<any>('/technologies', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true);
  },
  async update(id: string, payload: any) {
    return request<any>(`/technologies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, true);
  },
  async delete(id: string) {
    return request<any>(`/technologies/${id}`, {
      method: 'DELETE',
    }, true);
  },
};

// Article Types API
export const articleTypesApi = {
  async getAll() {
    return request<any[]>('/article-types');
  },
  async getBySlug(slug: string) {
    return request<any>(`/article-types/${slug}`);
  },
  async create(payload: any) {
    return request<any>('/article-types', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true);
  },
  async update(id: string, payload: any) {
    return request<any>(`/article-types/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, true);
  },
  async delete(id: string) {
    return request<any>(`/article-types/${id}`, {
      method: 'DELETE',
    }, true);
  },
};

// Tags API
export const tagsApi = {
  async getAll() {
    return request<any[]>('/tags');
  },
  async getBySlug(slug: string) {
    return request<any>(`/tags/${slug}`);
  },
  async create(payload: any) {
    return request<any>('/tags', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true);
  },
  async update(id: string, payload: any) {
    return request<any>(`/tags/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, true);
  },
  async delete(id: string) {
    return request<any>(`/tags/${id}`, {
      method: 'DELETE',
    }, true);
  },
};

// Series API
export const seriesApi = {
  async getAll(all?: boolean) {
    const endpoint = all ? '/series?all=true' : '/series';
    return request<any[]>(endpoint);
  },
  async getBySlug(slug: string) {
    return request<any>(`/series/${slug}`);
  },
  async create(payload: any) {
    return request<any>('/series', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true);
  },
  async update(id: string, payload: any) {
    return request<any>(`/series/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, true);
  },
  async delete(id: string) {
    return request<any>(`/series/${id}`, {
      method: 'DELETE',
    }, true);
  },
};

// Guest Posts API
export const guestPostsApi = {
  async getModerationQueue(params: { status?: string } = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    const queryString = query.toString();
    const endpoint = queryString ? `/guest-posts/admin/queue?${queryString}` : '/guest-posts/admin/queue';
    return request<any[]>(endpoint, {}, true);
  },
  async moderateSubmission(id: string, action: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT', feedback?: string) {
    return request<any>(`/guest-posts/admin/${id}/moderate`, {
      method: 'PATCH',
      body: JSON.stringify({ action, feedback }),
    }, true);
  },
  async getUserSubmissions(params: { status?: string } = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    const queryString = query.toString();
    const endpoint = queryString ? `/guest-posts/me?${queryString}` : '/guest-posts/me';
    return request<any[]>(endpoint, {}, true);
  },
  async getById(id: string, token?: string) {
    const endpoint = token
      ? `/guest-posts/${id}?token=${encodeURIComponent(token)}`
      : `/guest-posts/${id}`;
    return request<any>(endpoint, {});
  },
  async submit(payload: any) {
    return request<any>('/guest-posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async update(id: string, payload: any, token?: string) {
    const endpoint = token
      ? `/guest-posts/${id}?token=${encodeURIComponent(token)}`
      : `/guest-posts/${id}`;
    return request<any>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify({ ...payload, ...(token ? { editToken: token } : {}) }),
    });
  },
  async delete(id: string, token?: string) {
    const endpoint = token
      ? `/guest-posts/${id}?token=${encodeURIComponent(token)}`
      : `/guest-posts/${id}`;
    return request<any>(endpoint, {
      method: 'DELETE',
    });
  },
};

// Comments API
export const commentsApi = {
  async getForArticle(articleId: string) {
    return request<any[]>(`/comments/article/${articleId}`);
  },
  async getAdminComments(params: { status?: string; search?: string } = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    const queryString = query.toString();
    const endpoint = queryString ? `/comments/admin/all?${queryString}` : '/comments/admin/all';
    return request<any[]>(endpoint, {}, true);
  },
  async updateStatus(id: string, status: string) {
    return request<any>(`/comments/admin/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, true);
  },
  async getUserComments() {
    return request<any[]>('/comments/me', {}, true);
  },
  async create(articleId: string, content: string, parentId?: string) {
    return request<any>('/comments', {
      method: 'POST',
      body: JSON.stringify({ articleId, content, parentId }),
    }, true);
  },
  async update(id: string, content: string) {
    return request<any>(`/comments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    }, true);
  },
  async delete(id: string) {
    return request<any>(`/comments/${id}`, {
      method: 'DELETE',
    }, true);
  },
};

// Media API
export const mediaApi = {
  async getAll(params: { search?: string; limit?: number; page?: number } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.page) query.set('page', params.page.toString());
    const queryString = query.toString();
    const endpoint = queryString ? `/media?${queryString}` : '/media';
    return request<{ items: any[]; total: number; page: number; totalPages: number }>(endpoint, {}, true);
  },
  async upload(file: File, alt?: string, caption?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (alt) formData.append('alt', alt);
    if (caption) formData.append('caption', caption);

    let token = authClient.getAccessToken();
    if (!token && typeof window !== 'undefined') {
      await authClient.refreshToken();
      token = authClient.getAccessToken();
    }

    let res = await fetch(`${siteConfig.apiUrl}/media/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: formData,
    });

    if (res.status === 401 && typeof window !== 'undefined') {
      const refreshed = await authClient.refreshToken();
      if (refreshed) {
        const freshToken = authClient.getAccessToken();
        res = await fetch(`${siteConfig.apiUrl}/media/upload`, {
          method: 'POST',
          headers: {
            ...(freshToken ? { Authorization: `Bearer ${freshToken}` } : {}),
          },
          credentials: 'include',
          body: formData,
        });
      }
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to upload media');
    }
    return data?.data !== undefined ? data.data : data;
  },
  async delete(id: string) {
    return request<any>(`/media/${id}`, {
      method: 'DELETE',
    }, true);
  },
};

// Newsletter API
export const newsletterApi = {
  async subscribe(email: string) {
    return request<{ message: string }>('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  async unsubscribe(email: string) {
    return request<{ message: string }>('/newsletter/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  async getSubscribers(limit = 100, skip = 0) {
    return request<any>(`/newsletter/subscribers?limit=${limit}&skip=${skip}`, {}, true);
  },
  async getStats() {
    return request<{
      total: number;
      active: number;
      inactive: number;
      totalCampaigns?: number;
      lifetimeDelivered?: number;
      deliveryRate?: number;
      estimatedOpenRate: number;
      estimatedCtr: number;
    }>('/newsletter/stats', {}, true);
  },
  async generateTemplate(payload: {
    preset: 'weekly_digest' | 'spotlight' | 'trending_roundup' | 'custom';
    articleIds?: string[];
    spotlightSlug?: string;
    customIntro?: string;
    customSubject?: string;
    siteUrl?: string;
  }) {
    return request<{
      preset: string;
      subject: string;
      previewText: string;
      markdownContent: string;
      htmlContent: string;
      articleIds: string[];
      articles: Array<{
        id: string;
        title: string;
        slug: string;
        excerpt: string;
        category?: string;
        viewsCount: number;
        readingTime: number;
        coverImage?: string;
      }>;
    }>('/newsletter/generate-template', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true);
  },
  async broadcast(payload: {
    subject: string;
    content: string;
    previewText?: string;
    htmlContent?: string;
    articleIds?: string[];
    type?: string;
    testEmail?: string;
  }) {
    return request<{
      success: boolean;
      provider?: string;
      subject: string;
      previewText?: string;
      totalRecipients?: number;
      sentCount?: number;
      failedCount?: number;
      campaignId?: string;
      dispatchedAt?: string;
      message: string;
      isTest?: boolean;
      recipient?: string;
    }>('/newsletter/broadcast', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true);
  },
  async getCampaigns(limit = 50, skip = 0) {
    return request<{
      items: Array<{
        id: string;
        subject: string;
        previewText?: string;
        type: string;
        status: string;
        content: string;
        htmlContent?: string;
        totalRecipients: number;
        sentCount: number;
        failedCount: number;
        provider: string;
        dispatchedAt: string;
        createdAt: string;
      }>;
      total: number;
      limit: number;
      skip: number;
    }>(`/newsletter/campaigns?limit=${limit}&skip=${skip}`, {}, true);
  },
  async getCampaignById(id: string) {
    return request<any>(`/newsletter/campaigns/${id}`, {}, true);
  },
  async deleteSubscriber(id: string) {
    return request<any>(`/newsletter/subscribers/${id}`, {
      method: 'DELETE',
    }, true);
  },
};

// System & Developer Configuration API
export const systemSettingsApi = {
  async getPublicSettings() {
    return request<{
      maintenanceMode: boolean;
      siteName: string;
      siteUrl: string;
      robotsIndexingMode?: 'allow' | 'disallow_all' | 'custom';
      robotsCustomContent?: string;
      aiTxtContent?: string;
      llmsTxtContent?: string;
      securityTxtContent?: string;
      humansTxtContent?: string;
      aiSummaryEnabled?: boolean;
      aiSummaryProvider?: string;
    }>('/system-settings/public');
  },
  async getAll() {
    return request<Record<string, { value: string; isSecret: boolean; isSet: boolean; description?: string }>>(
      '/system-settings/admin/all',
      {},
      true,
    );
  },
  async updateBatch(updates: Record<string, any>) {
    return request<{ success: boolean; message: string }>('/system-settings/admin/batch', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }, true);
  },
  async verifyBrevo(apiKey?: string) {
    return request<{
      valid: boolean;
      email?: string;
      companyName?: string;
      plan?: any;
      credits?: any;
      message: string;
    }>('/system-settings/admin/verify-brevo', {
      method: 'POST',
      body: JSON.stringify({ apiKey }),
    }, true);
  },
  async testMail(recipientEmail: string) {
    return request<{ success: boolean; messageId?: string; error?: string }>('/system-settings/admin/test-mail', {
      method: 'POST',
      body: JSON.stringify({ recipientEmail }),
    }, true);
  },
  async getDiagnostics() {
    return request<{
      database: {
        engine: string;
        status: string;
        latencyMs: number;
        articlesCount: number;
        subscribersCount: number;
        seriesCount: number;
      };
      emailService: {
        provider: string;
        senderEmail: string;
        senderName: string;
        isApiKeySet: boolean;
      };
      runtime: {
        nodeVersion: string;
        environment: string;
        uptimeSeconds: number;
        memoryUsageMb: number;
      };
    }>('/system-settings/admin/diagnostics', {}, true);
  },
  async resetDefaults() {
    return request<{ success: boolean; message: string }>('/system-settings/admin/reset-defaults', {
      method: 'POST',
    }, true);
  },
};

// Bookmarks API
export const bookmarksApi = {
  async getUserBookmarks() {
    return request<any[]>('/bookmarks', {}, true);
  },
  async isBookmarked(articleId: string) {
    return request<{ isBookmarked: boolean }>(`/bookmarks/check/${articleId}`, {}, true);
  },
  async toggleBookmark(articleId: string) {
    return request<{ isBookmarked: boolean }>(`/bookmarks/${articleId}`, {
      method: 'POST',
    }, true);
  },
  async removeBookmark(articleId: string) {
    return request<any>(`/bookmarks/${articleId}`, {
      method: 'DELETE',
    }, true);
  },
};

// Reading History API
export const readingHistoryApi = {
  async getUserHistory() {
    return request<any[]>('/reading-history', {}, true);
  },
  async getArticleProgress(articleId: string) {
    return request<{ completionPercentage: number; lastPosition: number }>(`/reading-history/${articleId}`, {}, true);
  },
  async updateProgress(payload: { articleId: string; completionPercentage: number; lastPosition?: number }) {
    return request<any>('/reading-history', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true);
  },
  async removeFromHistory(articleId: string) {
    return request<any>(`/reading-history/${articleId}`, {
      method: 'DELETE',
    }, true);
  },
  async clearHistory() {
    return request<any>('/reading-history', {
      method: 'DELETE',
    }, true);
  },
};

// Audit Logs API
export const auditLogsApi = {
  async getAll(
    paramsOrLimit: number | { limit?: number; cursor?: string; action?: string; search?: string } = 50,
    skip?: number,
  ) {
    const params = typeof paramsOrLimit === 'object' ? paramsOrLimit : { limit: paramsOrLimit };
    const query = new URLSearchParams();
    if (params.limit) query.set('limit', String(params.limit));
    if (params.cursor) query.set('cursor', params.cursor);
    if (params.action && params.action !== 'ALL') query.set('action', params.action);
    if (params.search) query.set('search', params.search);
    if (typeof skip === 'number') query.set('skip', String(skip));

    const qs = query.toString();
    const endpoint = qs ? `/audit-logs?${qs}` : '/audit-logs';
    const res = await request<any>(endpoint, {}, true);

    const items = Array.isArray(res)
      ? res
      : Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.data)
          ? res.data
          : [];
    const meta = res?.meta || {
      total: typeof res?.total === 'number' ? res.total : items.length,
      limit: params.limit || 50,
      hasNextPage: false,
      nextCursor: null,
      retentionDays: 7,
    };
    return {
      items,
      total: meta.total ?? items.length,
      meta,
    };
  },
};

// Users API
export const usersApi = {
  async getProfile() {
    return request<any>('/users/me', {}, true);
  },
  async getPublicAuthor(username: string) {
    return request<any>(`/users/author/${username}`);
  },
  async updateProfile(payload: any) {
    return request<any>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, true);
  },
  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    return request<any>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true);
  },
  async getActiveSessions() {
    return request<any[]>('/users/sessions', {}, true);
  },
  async revokeSession(sessionId: string) {
    return request<any>(`/users/sessions/${sessionId}`, {
      method: 'DELETE',
    }, true);
  },
  async revokeAllOtherSessions() {
    return request<any>('/users/sessions', {
      method: 'DELETE',
    }, true);
  },
  async getAdminUsers(params: { search?: string; role?: string; limit?: number; offset?: number } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.role && params.role !== 'ALL') query.set('role', params.role);
    if (params.limit) query.set('limit', String(params.limit));
    if (params.offset) query.set('offset', String(params.offset));
    const qs = query.toString();
    return request<{ items: any[]; total: number; limit: number; offset: number }>(
      qs ? `/users/admin/list?${qs}` : '/users/admin/list',
      {},
      true,
    );
  },
  async updateUserRole(id: string, role: string) {
    return request<any>(`/users/admin/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }, true);
  },
  async updateUserStatus(id: string, status: string) {
    return request<any>(`/users/admin/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, true);
  },
  async deleteUser(id: string, reassignToUserId?: string) {
    const qs = reassignToUserId ? `?reassignTo=${encodeURIComponent(reassignToUserId)}` : '';
    return request<any>(`/users/admin/${id}${qs}`, {
      method: 'DELETE',
    }, true);
  },
  async reassignArticles(sourceUserId: string, targetUserId: string) {
    return request<any>(`/users/admin/${sourceUserId}/reassign-articles`, {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    }, true);
  },
};

// Pages API (Dynamic Legal, CMS, and Institutional Pages)
export const pagesApi = {
  async getAll(all?: boolean) {
    const endpoint = all ? '/pages?all=true' : '/pages';
    return request<any[]>(endpoint);
  },
  async getBySlug(slug: string) {
    return request<any>(`/pages/${slug}`);
  },
  async getAdminDetail(id: string) {
    return request<any>(`/pages/admin/detail/${id}`, {}, true);
  },
  async create(payload: any) {
    return request<any>('/pages', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true);
  },
  async update(id: string, payload: any) {
    return request<any>(`/pages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, true);
  },
  async delete(id: string) {
    return request<any>(`/pages/${id}`, {
      method: 'DELETE',
    }, true);
  },
};

// Analytics & Telemetry API
export const analyticsApi = {
  async collect(payload: any) {
    return request<any>('/analytics/collect', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async logSearchQuery(query: string, resultsCount: number = 0) {
    return request<any>('/analytics/search-query', {
      method: 'POST',
      body: JSON.stringify({ query, resultsCount }),
    });
  },
  async getOverview(timeWindow: string = '7d') {
    return request<{
      summary: {
        totalPageviews: number;
        pageviewsDelta: number;
        uniqueVisitors: number;
        visitorsDelta: number;
        avgReadTimeMinutes: number;
        avgScrollDepthPercent: number;
        codeCopies: number;
        bookmarksCount: number;
        bookmarkConversionRate: number;
      };
      timeSeries: Array<{
        date: string;
        fullDate: string;
        pageviews: number;
        visitors: number;
      }>;
    }>(`/analytics/overview?timeWindow=${timeWindow}`, {}, false);
  },
  async getTopBlueprints(timeWindow: string = '7d', limit: number = 10) {
    return request<any[]>(`/analytics/blueprints?timeWindow=${timeWindow}&limit=${limit}`, {}, false);
  },
  async getTechAndGeo(timeWindow: string = '7d') {
    return request<{
      categories: Array<{ name: string; slug: string; count: number }>;
      technologies: Array<{ name: string; slug: string; count: number }>;
      operatingSystems: Array<{ name: string; percentage: number; color?: string }>;
      browsers: Array<{ name: string; percentage: number }>;
      devices: Array<{ name: string; percentage: number }>;
      countries: Array<{ code: string; name: string; percentage: number; readers: number }>;
    }>(`/analytics/tech-and-geo?timeWindow=${timeWindow}`, {}, false);
  },
  async getSearchIntelligence(timeWindow: string = '7d') {
    return request<{
      totalSearches: number;
      topQueries: Array<{ query: string; searchesCount: number }>;
      contentGaps: Array<{ query: string; missedSearchesCount: number }>;
    }>(`/analytics/search-intelligence?timeWindow=${timeWindow}`, {}, false);
  },
  async getRealtimePulse() {
    return request<{
      activeReaders: number;
      lastUpdated: string;
      activePages: Array<{ title: string; path: string; category: string; readers: number }>;
    }>('/analytics/realtime', {}, false);
  },
};

// Ad Monetization & Network Management API
export const adsApi = {
  // Public
  async getPublicConfig() {
    return request<{
      globalEnabled: boolean;
      hideForLoggedIn: boolean;
      googleAdsense: {
        enabled: boolean;
        clientId: string;
        autoAds: boolean;
      };
      carbon: {
        enabled: boolean;
        serveId: string;
        placement: string;
      };
      ethicalAds: {
        enabled: boolean;
        publisherId: string;
      };
      adsterra: {
        enabled: boolean;
      };
      interstitial?: {
        enabled: boolean;
        timerSeconds: number;
        frequencyMinutes: number;
        network: string;
        customHtml: string;
        customImage: string;
        customUrl: string;
        title: string;
      };
    }>('/ads/public/config', {}, false);
  },
  async getPublicPlacements(path?: string) {
    const query = path ? `?path=${encodeURIComponent(path)}` : '';
    return request<any[]>(`/ads/public/placements${query}`, {}, false);
  },
  async trackImpression(placementSlug: string, visitorId?: string, path?: string) {
    return request<any>('/ads/public/track-impression', {
      method: 'POST',
      body: JSON.stringify({ placementSlug, visitorId, path }),
    }, false);
  },
  async trackClick(placementSlug: string, visitorId?: string, path?: string) {
    return request<any>('/ads/public/track-click', {
      method: 'POST',
      body: JSON.stringify({ placementSlug, visitorId, path }),
    }, false);
  },

  // Admin
  async getAdminPlacements() {
    return request<any[]>('/ads/admin/placements', {}, true);
  },
  async createPlacement(payload: any) {
    clearApiClientCache('/ads');
    return request<any>('/ads/admin/placements', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true);
  },
  async updatePlacement(id: string, payload: any) {
    clearApiClientCache('/ads');
    return request<any>(`/ads/admin/placements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }, true);
  },
  async deletePlacement(id: string) {
    clearApiClientCache('/ads');
    return request<any>(`/ads/admin/placements/${id}`, {
      method: 'DELETE',
    }, true);
  },
  async getAdminConfig() {
    return request<Record<string, any>>('/ads/admin/config', {}, true);
  },
  async updateAdminConfig(payload: Record<string, any>) {
    clearApiClientCache('/ads');
    return request<any>('/ads/admin/config', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }, true);
  },
  async updateAdsTxt(ads_txt_content: string) {
    clearApiClientCache('/ads');
    return request<any>('/ads/admin/ads-txt', {
      method: 'PUT',
      body: JSON.stringify({ ads_txt_content }),
    }, true);
  },
};

// URL Shortener & Link Sharing API
export const shortenerApi = {
  async generateShortUrl(payload: {
    url: string;
    articleId?: string;
    title?: string;
    platform?: 'twitter' | 'linkedin' | 'reddit' | 'whatsapp' | 'generic' | string;
    forceRegenerate?: boolean;
  }) {
    return request<{
      shortUrl: string;
      isShortened: boolean;
      provider: string;
      originalUrl: string;
      fromDb?: boolean;
      healed?: boolean;
    }>('/shortener/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, false);
  },

  async testConnection(payload: {
    provider: string;
    apiKey?: string;
    customDomain?: string;
    workspaceId?: string;
    customEndpoint?: string;
    customMethod?: string;
    customHeaders?: string;
    customBodyTemplate?: string;
    customResponsePath?: string;
  }) {
    return request<{
      success: boolean;
      message: string;
      sampleShortUrl?: string;
    }>('/shortener/test-connection', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true);
  },

  async syncAllArticles(payload: {
    forceRegenerate?: boolean;
    provider?: string;
    apiKey?: string;
    customDomain?: string;
    workspaceId?: string;
    customEndpoint?: string;
    customMethod?: string;
    customHeaders?: string;
    customBodyTemplate?: string;
    customResponsePath?: string;
    autoValidate?: boolean;
  } = {}) {
    return request<{
      total: number;
      updated: number;
      validated: number;
      failed: number;
      activeProvider: string;
      message: string;
      errorSummary?: string;
      errors?: Array<{
        articleId: string;
        slug: string;
        title: string;
        reason: string;
      }>;
    }>('/shortener/admin/sync-all', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true);
  },
};



