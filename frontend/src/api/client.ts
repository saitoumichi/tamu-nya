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

// Supabase APIクライアント
class ApiClient {
  private baseURL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000/api';
  private anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // 認証ヘッダーを取得
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'apikey': this.anonKey,
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // 忘れ物一覧の取得
  async getForgottenItems() {
    const response = await fetch(`${this.baseURL}/rest/v1/forgotten_items`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // 忘れ物の作成
  async createForgottenItem(item: ForgottenItem) {
    const response = await fetch(`${this.baseURL}/rest/v1/forgotten_items`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(item),
    });
    return response.json();
  }

  // 忘れ物の詳細取得
  async getForgottenItem(id: number) {
    const response = await fetch(`${this.baseURL}/rest/v1/forgotten_items?id=eq.${id}`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // 忘れ物の更新
  async updateForgottenItem(id: number, item: Partial<ForgottenItem>) {
    const response = await fetch(`${this.baseURL}/rest/v1/forgotten_items?id=eq.${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(item),
    });
    return response.json();
  }

  // 忘れ物の削除
  async deleteForgottenItem(id: number) {
    const response = await fetch(`${this.baseURL}/rest/v1/forgotten_items?id=eq.${id}`, {
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
    const response = await fetch(`${this.baseURL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': this.anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  }

  // ログイン
  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': this.anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  // ログアウト
  async logout() {
    const response = await fetch(`${this.baseURL}/auth/v1/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // カスタムカード一覧取得
  async getCustomCards() {
    const response = await fetch(`${this.baseURL}/rest/v1/custom_cards`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  // カスタムカード作成
  async createCustomCard(card: Omit<CustomCard, 'id'>) {
    const response = await fetch(`${this.baseURL}/rest/v1/custom_cards`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(card),
    });
    return response.json();
  }

  // カスタムカード更新
  async updateCustomCard(id: number, card: Partial<CustomCard>) {
    const response = await fetch(`${this.baseURL}/rest/v1/custom_cards?id=eq.${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(card),
    });
    return response.json();
  }

  // カスタムカード削除
  async deleteCustomCard(id: number) {
    const response = await fetch(`${this.baseURL}/rest/v1/custom_cards?id=eq.${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }
}

export const apiClient = new ApiClient();