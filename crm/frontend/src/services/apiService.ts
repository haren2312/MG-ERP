/**
 * API Service for CRM System with Authentication
 * Handles communication with the CRM backend and manages JWT tokens
 */

const API_BASE_URL = (window as any).APP_CONFIG?.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/api/v1';
const AUTH_BASE_URL = (window as any).APP_CONFIG?.VITE_AUTH_BASE_URL || import.meta.env.VITE_AUTH_BASE_URL || '/auth/api/v1/auth';

export interface User {
  id: string;
  email: string;
  username?: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

class APIService {
  private baseURL: string;
  private authURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL, authURL: string = AUTH_BASE_URL) {
    this.baseURL = baseURL;
    this.authURL = authURL;
    this.loadTokenFromStorage();
    
    console.log('CRM APIService initialized:', {
      baseURL: this.baseURL,
      authURL: this.authURL,
      hasToken: !!this.token
    });
  }

  private loadTokenFromStorage(): void {
    this.token = localStorage.getItem('crm_auth_token');
  }

  reloadToken(): void {
    this.loadTokenFromStorage();
  }

  private saveTokenToStorage(token: string): void {
    this.token = token;
    localStorage.setItem('crm_auth_token', token);
  }

  private clearTokenFromStorage(): void {
    this.token = null;
    localStorage.removeItem('crm_auth_token');
    localStorage.removeItem('crm_current_user');
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.authURL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data: LoginResponse = await response.json();
    this.saveTokenToStorage(data.access_token);
    return data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${this.authURL}/profile`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }

    const user: User = await response.json();
    localStorage.setItem('crm_current_user', JSON.stringify(user));
    return user;
  }

  getCurrentUserFromStorage(): User | null {
    const stored = localStorage.getItem('crm_current_user');
    return stored ? JSON.parse(stored) : null;
  }

  logout(): void {
    this.clearTokenFromStorage();
  }

  // CRM API endpoints
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async delete(endpoint: string): Promise<void> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
  }
}

const apiService = new APIService();
export default apiService;
