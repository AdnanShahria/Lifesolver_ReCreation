/**
 * Global API Client with Bearer token injection & 402 interceptor
 */
export class UpgradeRequiredError extends Error {
  constructor(public details: any) {
    super('Upgrade required to access this feature');
    this.name = 'UpgradeRequiredError';
  }
}

export const api = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('ls_token');
    const headers = new Headers(options.headers || {});
    
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    if (response.status === 402) {
      const errorData = await response.json().catch(() => ({}));
      window.dispatchEvent(new CustomEvent('lifesolver:upgrade_required', { detail: errorData }));
      throw new UpgradeRequiredError(errorData);
    }

    if (response.status === 401 && !endpoint.includes('/api/auth/login')) {
      // Only trigger session termination if an existing token was rejected
      if (token) {
        localStorage.removeItem('ls_token');
        window.dispatchEvent(new CustomEvent('lifesolver:unauthorized'));
      }
    }

    const data = await response.json();
    if (!response.ok || (data && data.ok === false)) {
      throw new Error(data?.message || `Request failed with status ${response.status}`);
    }

    return (data?.data !== undefined ? data.data : data) as T;
  },

  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  },

  put<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  },

  patch<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  },

  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
};
