"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.passwordConfirmation) {
      setError('パスワードが一致しません');
      setLoading(false);
      return;
    }

    try {
      await register(formData.name, formData.email, formData.password, formData.passwordConfirmation);
      router.push('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ユーザー登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 flex items-center justify-center p-4">
      <div className="forest-card w-full max-w-md p-8 rounded-xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-forest-primary mb-2">
            <UserPlus className="h-6 w-6 text-forest-accent" />
            新規登録
          </div>
          <p className="text-forest-secondary">忘れ物図鑑のアカウントを作成</p>
        </div>
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/30 border-2 border-red-400/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium forest-label mb-2">
                お名前
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-emerald-900/30 border-2 border-emerald-400/30 rounded-lg text-forest-primary placeholder-forest-secondary/50 focus:outline-none focus:ring-2 focus:ring-forest-accent focus:border-forest-accent"
                placeholder="山田太郎"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium forest-label mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-emerald-900/30 border-2 border-emerald-400/30 rounded-lg text-forest-primary placeholder-forest-secondary/50 focus:outline-none focus:ring-2 focus:ring-forest-accent focus:border-forest-accent"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium forest-label mb-2">
                パスワード
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 bg-emerald-900/30 border-2 border-emerald-400/30 rounded-lg text-forest-primary placeholder-forest-secondary/50 focus:outline-none focus:ring-2 focus:ring-forest-accent focus:border-forest-accent pr-10"
                  placeholder="8文字以上のパスワード"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-forest-secondary hover:text-forest-primary"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="passwordConfirmation" className="block text-sm font-medium forest-label mb-2">
                パスワード確認
              </label>
              <div className="relative">
                <input
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  id="passwordConfirmation"
                  name="passwordConfirmation"
                  value={formData.passwordConfirmation}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 bg-emerald-900/30 border-2 border-emerald-400/30 rounded-lg text-forest-primary placeholder-forest-secondary/50 focus:outline-none focus:ring-2 focus:ring-forest-accent focus:border-forest-accent pr-10"
                  placeholder="パスワードを再入力"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-forest-secondary hover:text-forest-primary"
                >
                  {showPasswordConfirmation ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full forest-button py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登録中...' : 'アカウント作成'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-forest-secondary">
              既にアカウントをお持ちですか？{' '}
              <Link href="/login" className="text-forest-accent hover:underline font-medium">
                ログイン
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}