"use client";

import React, { useState } from 'react';

export default function TestApiPage() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/users/profile');
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/users/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">UserController API テスト</h1>
      
      <div className="space-y-6">
        <div>
          <button 
            onClick={testProfile}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            プロフィール取得テスト
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
