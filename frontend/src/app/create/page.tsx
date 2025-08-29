"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { ArrowLeft, Plus, Save } from 'lucide-react';
import Link from 'next/link';

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
  const [categories, setCategories] = useState<CategoryCard[]>([]);
  const [things, setThings] = useState<ThingCard[]>([]);
  const [situations, setSituations] = useState<SituationCard[]>([]);

  // LocalStorageからデータを読み込み
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // データ更新イベントを監視
  useEffect(() => {
    const handleCustomCardsChanged = () => {
      loadFromLocalStorage();
    };

    window.addEventListener('customCardsChanged', handleCustomCardsChanged);
    window.addEventListener('storage', handleCustomCardsChanged);

    return () => {
      window.removeEventListener('customCardsChanged', handleCustomCardsChanged);
      window.removeEventListener('storage', handleCustomCardsChanged);
    };
  }, []);

  // LocalStorageからデータを読み込み
  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('customCards');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        } else {
          setDefaultCategories();
        }
        if (data.things && data.things.length > 0) {
          setThings(data.things);
        } else {
          setDefaultThings();
        }
        if (data.situations && data.situations.length > 0) {
          setSituations(data.situations);
        } else {
          setDefaultSituations();
        }
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
    setDefaultCategories();
    setDefaultThings();
    setDefaultSituations();
  };

  const setDefaultCategories = () => {
    setCategories([
      { id: 'forget_things', name: '物忘れ', emoji: '🔍', type: 'category' },
      { id: 'forget_schedule', name: '予定忘れ', emoji: '📅', type: 'category' },
      { id: 'oversleep_late', name: '寝坊・遅刻', emoji: '⏰', type: 'category' },
      { id: 'another', name: 'その他', emoji: '😊', type: 'category' },
    ]);
  };

  const setDefaultThings = () => {
    setThings([
      { id: 'key', name: '鍵', emoji: '🔑', type: 'thing', categoryId: 'forget_things' },
      { id: 'medicine', name: '薬', emoji: '💊', type: 'thing', categoryId: 'forget_things' },
      { id: 'umbrella', name: '傘', emoji: '☔', type: 'thing', categoryId: 'forget_things' },
      { id: 'wallet', name: '財布', emoji: '👛', type: 'thing', categoryId: 'forget_things' },
      { id: 'smartphone', name: 'スマホ', emoji: '📱', type: 'thing', categoryId: 'forget_things' },
      { id: 'schedule', name: '予定', emoji: '📅', type: 'thing', categoryId: 'forget_schedule' },
      { id: 'time', name: '遅刻', emoji: '⏰', type: 'thing', categoryId: 'oversleep_late' },
      { id: 'homework', name: '宿題', emoji: '📄', type: 'thing', categoryId: 'forget_things' },
      { id: 'another', name: 'その他', emoji: '😊', type: 'thing', categoryId: 'another' },
    ]);
  };

  const setDefaultSituations = () => {
    setSituations([
      { id: 'morning', name: '朝', emoji: '🌅', type: 'situation' },
      { id: 'home', name: '家', emoji: '🏠', type: 'situation' },
      { id: 'before_going_out', name: '外出前', emoji: '🚪', type: 'situation' },
      { id: 'in_a_hurry', name: '急いでた', emoji: '⏰', type: 'situation' },
      { id: 'rain', name: '雨', emoji: '🌧️', type: 'situation' },
      { id: 'work', name: '仕事', emoji: '💼', type: 'situation' },
      { id: 'school', name: '学校', emoji: '🎒', type: 'situation' },
      { id: 'another', name: 'その他', emoji: '😊', type: 'situation' },
    ]);
  };





  // データをLocalStorageに保存
  const handleSaveToLocalStorage = () => {
    const data = {
      categories,
      things,
      situations,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('customCards', JSON.stringify(data));
    
    // 入力画面にデータ更新を通知
    window.dispatchEvent(new CustomEvent('customCardsChanged'));
    
    alert('カードデータが保存されました！入力画面で新しいカードが使用できます。');
  };

  // LocalStorageからデータを読み込み
  const handleLoadFromLocalStorage = () => {
    const saved = localStorage.getItem('customCards');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.categories) setCategories(data.categories);
        if (data.things) setThings(data.things);
        if (data.situations) setSituations(data.situations);
        alert('カードデータを読み込みました！');
      } catch (error) {
        alert('データの読み込みに失敗しました');
      }
    } else {
      alert('保存されたデータがありません');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between text-black">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">カード作成・管理</h1>
          </div>
        </div>

        {/* カテゴリカード */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900">
              <span>📂 カテゴリカード</span>
              <div className="text-sm">
              <Link href="/create/category">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  カテゴリ管理
                </Button>
              </Link>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div key={category.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2">
                        <span>{category.emoji}</span>
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-600">{category.description}</p>
                      )}
                    </div>
                  ))}
                </div>
          </CardContent>
        </Card>

        {/* 忘れたものカード */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900">
              <span>🎯 忘れたものカード</span>
              <div className="text-sm">
              <Link href="/create/thing">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  忘れたもの管理
                </Button>
              </Link>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {things.map((thing) => {
                    const category = categories.find(c => c.id === thing.categoryId);
                    return (
                      <div key={thing.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-2">
                        <span>{thing.emoji}</span>
                        <h3 className="font-semibold text-gray-900">{thing.name}</h3>
                      </div>
                      {thing.description && (
                        <p className="text-sm text-gray-600">{thing.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
          </CardContent>
        </Card>

        {/* 状況カード */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900">
              <span>🌟 状況カード</span>
              <div className="text-sm">
              <Link href="/create/situation">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  状況管理
                </Button>
              </Link>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {situations.map((situation) => (
                    <div key={situation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                          <div className="flex items-center gap-2">
                      <span>{situation.emoji}</span>
                      <h3 className="font-semibold text-gray-900">{situation.name}</h3>
                    </div>
                      {situation.description && (
                        <p className="text-sm text-gray-600">{situation.description}</p>
                      )}
                    </div>
                  ))}
                </div>
          </CardContent>
        </Card>


      </div>
    </MainLayout>
  );
}


