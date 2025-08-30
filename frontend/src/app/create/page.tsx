"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/api/client';

interface CardData {
  id: string;
  name: string;
  emoji: string;
  description?: string;
}

interface CategoryCard extends CardData {
  type: 'category';
}

interface ThingCard extends CardData {
  type: 'thing';
  categoryId: string;
}

interface SituationCard extends CardData {
  type: 'situation';
}

type CardType = CategoryCard | ThingCard | SituationCard;

export default function CreatePage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryCard[]>([]);
  const [things, setThings] = useState<ThingCard[]>([]);
  const [situations, setSituations] = useState<SituationCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初期データロード
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setDefaultData();
      setLoading(false);
    }
  }, [user]);

  // データ更新イベントを監視
  useEffect(() => {
    const handleCustomCardsChanged = () => {
      if (user) {
        loadData();
      } else {
        loadFromLocalStorage();
      }
    };

    window.addEventListener('customCardsChanged', handleCustomCardsChanged);
    window.addEventListener('storage', handleCustomCardsChanged);

    return () => {
      window.removeEventListener('customCardsChanged', handleCustomCardsChanged);
      window.removeEventListener('storage', handleCustomCardsChanged);
    };
  }, [user]);

  // APIとLocalStorageからデータを読み込み
  const loadData = async () => {
    if (!user) {
      loadFromLocalStorage();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // APIからカスタムカードを取得
      const response = await apiClient.getCustomCards();
      
      if (response.success) {
        const apiData = response.data;
        
        // デフォルトデータ
        const defaultCategories = [
          { id: 'forget_things', name: '物忘れ', emoji: '🔍', type: 'category' as const },
          { id: 'forget_schedule', name: '予定忘れ', emoji: '📅', type: 'category' as const },
          { id: 'oversleep_late', name: '寝坊・遅刻', emoji: '⏰', type: 'category' as const },
          { id: 'another', name: 'その他', emoji: '😊', type: 'category' as const },
        ];
        
        const defaultThings = [
          { id: 'key', name: '鍵', emoji: '🔑', type: 'thing' as const, categoryId: 'forget_things' },
          { id: 'medicine', name: '薬', emoji: '💊', type: 'thing' as const, categoryId: 'forget_things' },
          { id: 'umbrella', name: '傘', emoji: '☔', type: 'thing' as const, categoryId: 'forget_things' },
          { id: 'wallet', name: '財布', emoji: '👛', type: 'thing' as const, categoryId: 'forget_things' },
          { id: 'smartphone', name: 'スマホ', emoji: '📱', type: 'thing' as const, categoryId: 'forget_things' },
          { id: 'schedule', name: '予定', emoji: '📅', type: 'thing' as const, categoryId: 'forget_schedule' },
          { id: 'time', name: '遅刻', emoji: '⏰', type: 'thing' as const, categoryId: 'oversleep_late' },
          { id: 'homework', name: '宿題', emoji: '📄', type: 'thing' as const, categoryId: 'forget_things' },
          { id: 'another', name: 'その他', emoji: '😊', type: 'thing' as const, categoryId: 'another' },
        ];
        
        const defaultSituations = [
          { id: 'morning', name: '朝', emoji: '🌅', type: 'situation' as const },
          { id: 'home', name: '家', emoji: '🏠', type: 'situation' as const },
          { id: 'before_going_out', name: '外出前', emoji: '🚪', type: 'situation' as const },
          { id: 'in_a_hurry', name: '急いでた', emoji: '⏰', type: 'situation' as const },
          { id: 'rain', name: '雨', emoji: '🌧️', type: 'situation' as const },
          { id: 'work', name: '仕事', emoji: '💼', type: 'situation' as const },
          { id: 'school', name: '学校', emoji: '🎒', type: 'situation' as const },
          { id: 'another', name: 'その他', emoji: '😊', type: 'situation' as const },
        ];

        // APIデータをフォーマット変換
        const customCategories = apiData.categories?.map((item: any) => ({
          id: item.card_id,
          name: item.name,
          emoji: item.emoji,
          type: 'category' as const,
          description: item.description
        })) || [];

        const customThings = apiData.things?.map((item: any) => ({
          id: item.card_id,
          name: item.name,
          emoji: item.emoji,
          type: 'thing' as const,
          categoryId: item.category_id,
          description: item.description
        })) || [];

        const customSituations = apiData.situations?.map((item: any) => ({
          id: item.card_id,
          name: item.name,
          emoji: item.emoji,
          type: 'situation' as const,
          description: item.description
        })) || [];

        // デフォルトとカスタムを統合
        setCategories([...defaultCategories, ...customCategories]);
        setThings([...defaultThings, ...customThings]);
        setSituations([...defaultSituations, ...customSituations]);

        // LocalStorageにも保存（フォールバック用）
        const localData = {
          categories: customCategories,
          things: customThings,
          situations: customSituations
        };
        localStorage.setItem('customCards', JSON.stringify(localData));
      } else {
        console.error('カスタムカードの取得に失敗:', response.message);
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('カスタムカード取得エラー:', error);
      setError('カスタムカードの取得に失敗しました');
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  // LocalStorageからデータを読み込み
  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('customCards');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        
        // カテゴリカード：デフォルトとカスタムを統合
        const defaultCategories = [
          { id: 'forget_things', name: '物忘れ', emoji: '🔍', type: 'category' as const },
          { id: 'forget_schedule', name: '予定忘れ', emoji: '📅', type: 'category' as const },
          { id: 'oversleep_late', name: '寝坊・遅刻', emoji: '⏰', type: 'category' as const },
          { id: 'another', name: 'その他', emoji: '😊', type: 'category' as const },
        ];
        
        const customCategories = data.categories && data.categories.length > 0 ? data.categories : [];
        const allCategories = [...defaultCategories, ...customCategories];
        setCategories(allCategories);
        
        // 忘れたものカード：デフォルトとカスタムを統合
        const defaultThings = [
          { id: 'key', name: '鍵', emoji: '🔑', type: 'thing' as const, categoryId: 'forget_things' },
          { id: 'medicine', name: '薬', emoji: '💊', type: 'thing' as const, categoryId: 'forget_things' },
          { id: 'umbrella', name: '傘', emoji: '☔', type: 'thing' as const, categoryId: 'forget_things' },
          { id: 'wallet', name: '財布', emoji: '👛', type: 'thing' as const, categoryId: 'forget_things' },
          { id: 'smartphone', name: 'スマホ', emoji: '📱', type: 'thing' as const, categoryId: 'forget_things' },
          { id: 'schedule', name: '予定', emoji: '📅', type: 'thing' as const, categoryId: 'forget_schedule' },
          { id: 'time', name: '遅刻', emoji: '⏰', type: 'thing' as const, categoryId: 'oversleep_late' },
          { id: 'homework', name: '宿題', emoji: '📄', type: 'thing' as const, categoryId: 'forget_things' },
          { id: 'another', name: 'その他', emoji: '😊', type: 'thing' as const, categoryId: 'another' },
        ];
        
        const customThings = data.things && data.things.length > 0 ? data.things : [];
        const allThings = [...defaultThings, ...customThings];
        setThings(allThings);
        
        // 状況カード：デフォルトとカスタムを統合
        const defaultSituations = [
          { id: 'morning', name: '朝', emoji: '🌅', type: 'situation' as const },
          { id: 'home', name: '家', emoji: '🏠', type: 'situation' as const },
          { id: 'before_going_out', name: '外出前', emoji: '🚪', type: 'situation' as const },
          { id: 'in_a_hurry', name: '急いでた', emoji: '⏰', type: 'situation' as const },
          { id: 'rain', name: '雨', emoji: '🌧️', type: 'situation' as const },
          { id: 'work', name: '仕事', emoji: '💼', type: 'situation' as const },
          { id: 'school', name: '学校', emoji: '🎒', type: 'situation' as const },
          { id: 'another', name: 'その他', emoji: '😊', type: 'situation' as const },
        ];
        
        const customSituations = data.situations && data.situations.length > 0 ? data.situations : [];
        const allSituations = [...defaultSituations, ...customSituations];
        setSituations(allSituations);
        
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
        setDefaultData();
      }
    } else {
      setDefaultData();
    }
  };

  // デフォルトデータを設定
  const setDefaultData = () => {
    const defaultCategories = [
      { id: 'forget_things', name: '物忘れ', emoji: '🔍', type: 'category' as const },
      { id: 'forget_schedule', name: '予定忘れ', emoji: '📅', type: 'category' as const },
      { id: 'oversleep_late', name: '寝坊・遅刻', emoji: '⏰', type: 'category' as const },
      { id: 'another', name: 'その他', emoji: '😊', type: 'category' as const },
    ];
    setCategories(defaultCategories);

    const defaultThings = [
      { id: 'key', name: '鍵', emoji: '🔑', type: 'thing' as const, categoryId: 'forget_things' },
      { id: 'medicine', name: '薬', emoji: '💊', type: 'thing' as const, categoryId: 'forget_things' },
      { id: 'umbrella', name: '傘', emoji: '☔', type: 'thing' as const, categoryId: 'forget_things' },
      { id: 'wallet', name: '財布', emoji: '👛', type: 'thing' as const, categoryId: 'forget_things' },
      { id: 'smartphone', name: 'スマホ', emoji: '📱', type: 'thing' as const, categoryId: 'forget_things' },
      { id: 'schedule', name: '予定', emoji: '📅', type: 'thing' as const, categoryId: 'forget_schedule' },
      { id: 'time', name: '遅刻', emoji: '⏰', type: 'thing' as const, categoryId: 'oversleep_late' },
      { id: 'homework', name: '宿題', emoji: '📄', type: 'thing' as const, categoryId: 'forget_things' },
      { id: 'another', name: 'その他', emoji: '😊', type: 'thing' as const, categoryId: 'another' },
    ];
    setThings(defaultThings);

    const defaultSituations = [
      { id: 'morning', name: '朝', emoji: '🌅', type: 'situation' as const },
      { id: 'home', name: '家', emoji: '🏠', type: 'situation' as const },
      { id: 'before_going_out', name: '外出前', emoji: '🚪', type: 'situation' as const },
      { id: 'in_a_hurry', name: '急いでた', emoji: '⏰', type: 'situation' as const },
      { id: 'rain', name: '雨', emoji: '🌧️', type: 'situation' as const },
      { id: 'work', name: '仕事', emoji: '💼', type: 'situation' as const },
      { id: 'school', name: '学校', emoji: '🎒', type: 'situation' as const },
      { id: 'another', name: 'その他', emoji: '😊', type: 'situation' as const },
    ];
    setSituations(defaultSituations);
  };







  // ローディング中
  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="forest-card p-8 rounded-xl text-center">
            <div className="text-6xl mb-4">🌲</div>
            <h2 className="text-2xl font-bold text-forest-primary mb-4">
              読み込み中...
            </h2>
          </div>
        </div>
      </MainLayout>
    );
  }

  // エラー表示
  if (error) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="forest-card p-8 rounded-xl text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              エラーが発生しました
            </h2>
            <p className="text-forest-secondary mb-6">{error}</p>
            <button className="forest-button px-6 py-2 rounded-lg" onClick={() => window.location.reload()}>
              再読み込み
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // 未認証の場合
  if (!user) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="forest-card p-8 rounded-xl text-center">
            <div className="text-6xl mb-4">🃏</div>
            <h2 className="text-2xl font-bold text-forest-primary mb-4">
              カード作成機能を使うにはログインが必要です
            </h2>
            <p className="text-forest-secondary mb-6">
              カスタムカードを作成して忘れ物記録をカスタマイズしましょう。
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/login">
                <button className="forest-button px-6 py-2 rounded-lg">ログイン</button>
              </Link>
              <Link href="/register">
                <button className="forest-button px-6 py-2 rounded-lg">新規登録</button>
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="forest-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-forest-primary flex items-center gap-2">
                🃏 カード作成・管理
              </h1>
            </div>
          </div>
        </div>

        {/* カテゴリカード */}
        <div className="forest-card p-6 rounded-xl">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-forest-primary">
                📂 カテゴリカード
              </h2>
              <Link href="/create/category">
                <button className="forest-button px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  カテゴリ管理
                </button>
              </Link>
            </div>
          </div>
          <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div key={category.id} className="border-2 border-emerald-400/30 bg-emerald-900/20 rounded-lg p-4 hover:bg-emerald-900/30 transition-all">
                      <div className="flex items-center gap-2">
                        <span>{category.emoji}</span>
                        <h3 className="font-semibold text-forest-primary">{category.name}</h3>
                      </div>
                      {category.description && (
                        <p className="text-sm text-forest-secondary">{category.description}</p>
                      )}
                    </div>
                  ))}
                </div>
          </div>
        </div>

        {/* 忘れたものカード */}
        <div className="forest-card p-6 rounded-xl">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-forest-primary">
                🎯 忘れたものカード
              </h2>
              <Link href="/create/thing">
                <button className="forest-button px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  忘れたもの管理
                </button>
              </Link>
            </div>
          </div>
          <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {things.map((thing) => {
                    const category = categories.find(c => c.id === thing.categoryId);
                    return (
                      <div key={thing.id} className="border-2 border-emerald-400/30 bg-emerald-900/20 rounded-lg p-4 hover:bg-emerald-900/30 transition-all">
                        <div className="flex items-center gap-2">
                          <span>{thing.emoji}</span>
                          <h3 className="font-semibold text-forest-primary">{thing.name}</h3>
                        </div>
                        {thing.description && (
                          <p className="text-sm text-forest-secondary">{thing.description}</p>
                        )}
                    </div>
                  );
                })}
              </div>
          </div>
        </div>

        {/* 状況カード */}
        <div className="forest-card p-6 rounded-xl">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-forest-primary">
                🌟 状況カード
              </h2>
              <Link href="/create/situation">
                <button className="forest-button px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  状況管理
                </button>
              </Link>
            </div>
          </div>
          <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {situations.map((situation) => (
                    <div key={situation.id} className="border-2 border-emerald-400/30 bg-emerald-900/20 rounded-lg p-4 hover:bg-emerald-900/30 transition-all">
                      <div className="flex items-center gap-2">
                        <span>{situation.emoji}</span>
                        <h3 className="font-semibold text-forest-primary">{situation.name}</h3>
                      </div>
                      {situation.description && (
                        <p className="text-sm text-forest-secondary">{situation.description}</p>
                      )}
                    </div>
                  ))}
                </div>
          </div>
        </div>


      </div>
    </MainLayout>
  );
}


