"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function TestApiPage() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testProfile = async () => {
    if (!token) {
      setProfile({ error: 'ログインが必要です' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/forgotten-items', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setProfile(data);
      console.log('API Response:', data);
    } catch (error) {
      console.error('Error:', error);
      setProfile({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/forgotten-items/stats');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStats(data);
      console.log('Stats Response:', data);
    } catch (error) {
      console.error('Error:', error);
      setStats({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">忘れ物API テスト</h1>
      
      {/* ログイン状態表示 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-medium mb-2">認証状態</h2>
        {user ? (
          <div>
            <p className="text-green-600">✅ ログイン中: {user.name} ({user.email})</p>
            <p className="text-sm text-gray-500 mt-1">Token: {token?.substring(0, 20)}...</p>
          </div>
        ) : (
          <p className="text-red-600">❌ 未ログイン - まず<a href="/login" className="underline">ログイン</a>してください</p>
        )}
      </div>
      
      <div className="space-y-6">
        <div>
          <button 
            onClick={testProfile}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            忘れ物一覧取得テスト
          </button>
          {profile && (
            <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
              {JSON.stringify(profile, null, 2)}
            </pre>
          )}
        </div>

        <div>
          <button 
            onClick={testStats}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            統計情報取得テスト
          </button>
          {stats && (
            <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
              {JSON.stringify(stats, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
