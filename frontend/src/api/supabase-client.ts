// Supabase用のAPIクライアント
class SupabaseClient {
  private baseURL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
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
  async createForgottenItem(item: any) {
    const response = await fetch(`${this.baseURL}/rest/v1/forgotten_items`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(item),
    });
    return response.json();
  }

  // ユーザー登録
  async signup(userData: any) {
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
}

export const supabaseClient = new SupabaseClient();
