// デバッグ用のAPIクライアント
class DebugApiClient {
  private baseURL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  private anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // デバッグ情報を表示
  debugInfo() {
    console.log('=== Supabase Debug Info ===');
    console.log('Base URL:', this.baseURL);
    console.log('Anon Key:', this.anonKey ? 'Set' : 'Not Set');
    console.log('Full URL:', `${this.baseURL}/rest/v1/forgotten_items`);
  }

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

  // 忘れ物一覧の取得（デバッグ版）
  async getForgottenItems() {
    this.debugInfo();
    
    try {
      const url = `${this.baseURL}/rest/v1/forgotten_items`;
      console.log('Requesting URL:', url);
      console.log('Headers:', this.getAuthHeaders());
      
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${responseText}`);
      }
      
      if (!responseText) {
        console.log('Empty response, returning empty array');
        return { success: true, data: [] };
      }
      
      const data = JSON.parse(responseText);
      console.log('Parsed data:', data);
      return { success: true, data: data };
    } catch (error) {
      console.error('API取得エラー:', error);
      return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const debugApiClient = new DebugApiClient();
