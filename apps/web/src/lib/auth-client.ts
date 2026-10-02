import { User, AuthResponse, ApiResponse } from '@nexus/types';
import { siteConfig } from '@nexus/config';

class AuthClient {
  private accessToken: string | null = null;
  private readonly baseUrl = `${siteConfig.apiUrl}/auth`;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.accessToken = localStorage.getItem('nexus_access_token');
      } catch {}
    }
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      try {
        if (token) {
          localStorage.setItem('nexus_access_token', token);
        } else {
          localStorage.removeItem('nexus_access_token');
        }
      } catch {}
    }
  }

  getAccessToken(): string | null {
    if (!this.accessToken && typeof window !== 'undefined') {
      try {
        this.accessToken = localStorage.getItem('nexus_access_token');
      } catch {}
    }
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return Boolean(this.getAccessToken());
  }

  private async fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnAuthFailure = true,
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, fetchOptions);
    } catch {
      try {
        response = await fetch(`/api/auth${endpoint}`, fetchOptions);
      } catch {
        throw new Error('Failed to connect to authentication server. Please ensure the backend is running.');
      }
    }

    if (response.status === 401 && retryOnAuthFailure) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        return this.fetchWithAuth<T>(endpoint, options, false);
      }
    }

    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      const errorMessage =
        (data as any)?.error?.message || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data.data;
  }

  async register(payload: {
    name: string;
    username: string;
    email: string;
    password: string;
    bio?: string;
  }): Promise<AuthResponse> {
    const data = await this.fetchWithAuth<AuthResponse>(
      '/register',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      false,
    );
    this.setAccessToken(data.accessToken);
    return data;
  }

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const data = await this.fetchWithAuth<AuthResponse>(
      '/login',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      false,
    );
    this.setAccessToken(data.accessToken);
    return data;
  }

  private refreshPromise: Promise<boolean> | null = null;

  async refreshToken(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        let response: Response;
        try {
          response = await fetch(`${this.baseUrl}/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
        } catch {
          response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
        }

        if (!response.ok) {
          // Only clear token if session is genuinely invalid
          const data: any = await response.json().catch(() => ({}));
          if (response.status === 401 && !this.getAccessToken()) {
            this.setAccessToken(null);
          }
          return false;
        }

        const data: ApiResponse<AuthResponse> = await response.json();
        if (data.success && data.data?.accessToken) {
          this.setAccessToken(data.data.accessToken);
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async logout(): Promise<void> {
    try {
      try {
        await fetch(`${this.baseUrl}/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
      } catch {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
      }
    } finally {
      this.setAccessToken(null);
    }
  }

  async logoutAll(): Promise<void> {
    await this.fetchWithAuth('/logout-all', { method: 'POST' });
    this.setAccessToken(null);
  }

  async getMe(): Promise<User> {
    return this.fetchWithAuth<User>('/me');
  }

  async updateProfile(payload: Partial<User>): Promise<User> {
    return this.fetchWithAuth<User>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.fetchWithAuth<{ message: string }>(
      '/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      },
      false,
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.fetchWithAuth<{ message: string }>(
      '/reset-password',
      {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      },
      false,
    );
  }
}

export const authClient = new AuthClient();
