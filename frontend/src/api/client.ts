// 型定義
interface ForgottenItem {
  category: string;
  title: string;
  forgotten_item: string;
  details?: string;
  difficulty: number;
  situation?: string[];
  location?: string;
  datetime: string;
}

interface UserData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface CustomCard {
  id?: number;
  type: 'category' | 'thing' | 'situation';
  name: string;
  emoji: string;
  card_id: string;
  category_id?: string;
  description?: string;
}

// APIクライアント（Supabaseまたはローカルバックエンド）
class ApiClient {
  private baseURL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  private anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  private isSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

  constructor() {
    console.log('🔧 API Client初期化');
    console.log('📍 Base URL:', this.baseURL);
    console.log('🔑 Using Supabase:', this.isSupabase);
    console.log('🌍 Environment:', process.env.NODE_ENV);
  }

  // 認証ヘッダーを取得
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Supabaseの場合
    if (this.isSupabase) {
      headers['apikey'] = this.anonKey;
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // 忘れ物一覧の取得
  async getForgottenItems() {
    try {
      const endpoint = this.isSupabase 
        ? `${this.baseURL}/rest/v1/forgotten_items`
        : `${this.baseURL}/forgotten-items`;
      
      const response = await fetch(endpoint, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Laravelの場合は { success: true, data: [...] } 形式で返される
      if (!this.isSupabase && data.success !== undefined) {
        return data;
      }
      
      // Supabaseの場合は直接配列が返される
      return { success: true, data: data };
    } catch (error) {
      console.error('API取得エラー:', error);
      return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // 忘れ物の作成
  async createForgottenItem(item: ForgottenItem) {
    try {
      const endpoint = this.isSupabase 
        ? `${this.baseURL}/rest/v1/forgotten_items`
        : `${this.baseURL}/forgotten-items`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Laravelの場合はそのまま返す
      if (!this.isSupabase && data.success !== undefined) {
        return data;
      }
      
      // Supabaseの場合
      return { success: true, data: data };
    } catch (error) {
      console.error('API保存エラー:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // 忘れ物の詳細取得
  async getForgottenItem(id: number) {
    const endpoint = this.isSupabase 
      ? `${this.baseURL}/rest/v1/forgotten_items?id=eq.${id}`
      : `${this.baseURL}/forgotten-items/${id}`;
    
    const response = await fetch(endpoint, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // 忘れ物の更新
  async updateForgottenItem(id: number, item: Partial<ForgottenItem>) {
    const endpoint = this.isSupabase 
      ? `${this.baseURL}/rest/v1/forgotten_items?id=eq.${id}`
      : `${this.baseURL}/forgotten-items/${id}`;
    
    const method = this.isSupabase ? 'PATCH' : 'PUT';
    
    const response = await fetch(endpoint, {
      method: method,
      headers: this.getAuthHeaders(),
      body: JSON.stringify(item),
    });
    return response.json();
  }

  // 忘れ物の削除
  async deleteForgottenItem(id: number) {
    const endpoint = this.isSupabase 
      ? `${this.baseURL}/rest/v1/forgotten_items?id=eq.${id}`
      : `${this.baseURL}/forgotten-items/${id}`;
    
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // ユーザー別忘れ物取得
  async getUserItems(userId: number) {
    const response = await fetch(`${this.baseURL}/rest/v1/forgotten_items?user_id=eq.${userId}`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // カテゴリ別忘れ物取得
  async getCategoryItems(category: string) {
    const response = await fetch(`${this.baseURL}/rest/v1/forgotten_items?category=eq.${category}`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // 統計情報取得
  async getStats() {
    const response = await fetch(`${this.baseURL}/rest/v1/forgotten_items?select=count`);
    return response.json();
  }

  // ユーザープロフィール取得
  async getProfile() {
    const response = await fetch(`${this.baseURL}/rest/v1/users`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // ユーザー登録
  async signup(userData: UserData) {
    const endpoint = this.isSupabase 
      ? `${this.baseURL}/auth/v1/signup`
      : `${this.baseURL}/auth/signup`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.isSupabase) {
      headers['apikey'] = this.anonKey;
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(userData),
    });
    return response.json();
  }

  // ログイン
  async login(email: string, password: string) {
    try {
      const endpoint = this.isSupabase 
        ? `${this.baseURL}/auth/v1/signin`
        : `${this.baseURL}/auth/login`;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (this.isSupabase) {
        headers['apikey'] = this.anonKey;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Login failed: ${response.status} - ${errorData}`);
      }
      
      const data = await response.json();
      
      // Laravelの場合はそのまま返す
      if (!this.isSupabase && data.success !== undefined) {
        return data;
      }
      
      // Supabaseの場合
      return { success: true, data: data };
    } catch (error) {
      console.error('ログインエラー:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ログアウト
  async logout() {
    const endpoint = this.isSupabase 
      ? `${this.baseURL}/auth/v1/logout`
      : `${this.baseURL}/auth/logout`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // カスタムカード一覧取得
  async getCustomCards() {
    try {
      const endpoint = this.isSupabase 
        ? `${this.baseURL}/rest/v1/custom_cards`
        : `${this.baseURL}/custom-cards`;
      
      const response = await fetch(endpoint, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Laravelの場合はそのまま返す
      if (!this.isSupabase && data.success !== undefined) {
        return data;
      }
      
      // Supabaseの場合
      return { success: true, data: data };
    } catch (error) {
      console.error('カスタムカード取得エラー:', error);
      return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // カスタムカード作成
  async createCustomCard(card: Omit<CustomCard, 'id'>) {
    try {
      const endpoint = this.isSupabase 
        ? `${this.baseURL}/rest/v1/custom_cards`
        : `${this.baseURL}/custom-cards`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(card),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Laravelの場合はそのまま返す
      if (!this.isSupabase && data.success !== undefined) {
        return data;
      }
      
      // Supabaseの場合
      return { success: true, data: data };
    } catch (error) {
      console.error('カスタムカード作成エラー:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // カスタムカード更新
  async updateCustomCard(id: number, card: Partial<CustomCard>) {
    try {
      const endpoint = this.isSupabase 
        ? `${this.baseURL}/rest/v1/custom_cards?id=eq.${id}`
        : `${this.baseURL}/custom-cards/${id}`;
      
      const method = this.isSupabase ? 'PATCH' : 'PUT';
      
      const response = await fetch(endpoint, {
        method: method,
        headers: this.getAuthHeaders(),
        body: JSON.stringify(card),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Laravelの場合はそのまま返す
      if (!this.isSupabase && data.success !== undefined) {
        return data;
      }
      
      // Supabaseの場合
      return { success: true, data: data };
    } catch (error) {
      console.error('カスタムカード更新エラー:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // カスタムカード削除
  async deleteCustomCard(id: number) {
    try {
      const endpoint = this.isSupabase 
        ? `${this.baseURL}/rest/v1/custom_cards?id=eq.${id}`
        : `${this.baseURL}/custom-cards/${id}`;
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Laravelの場合はそのまま返す
      if (!this.isSupabase && data.success !== undefined) {
        return data;
      }
      
      // Supabaseの場合
      return { success: true, data: data };
    } catch (error) {
      console.error('カスタムカード削除エラー:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const apiClient = new ApiClient();