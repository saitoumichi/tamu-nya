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

// APIクライアント
class ApiClient {
  private baseURL = 'http://localhost:8000/api';

  // 忘れ物一覧の取得
  async getForgottenItems() {
    const response = await fetch(`${this.baseURL}/forgotten-items`);
    return response.json();
  }

  // 忘れ物の作成
  async createForgottenItem(item: ForgottenItem) {
    const response = await fetch(`${this.baseURL}/forgotten-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    return response.json();
  }

  // ユーザー登録
  async signup(userData: UserData) {
    const response = await fetch(`${this.baseURL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  }
}

export const apiClient = new ApiClient();