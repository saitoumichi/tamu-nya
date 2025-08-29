"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Save, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CategoryCard {
  id: string;
  name: string;
  emoji: string;
  description?: string;
  type: 'category';
}

interface ThingCard {
  id: string;
  name: string;
  emoji: string;
  description?: string;
  categoryId: string;
  type: 'thing';
}

export default function ThingCreatePage() {
  const [things, setThings] = useState<ThingCard[]>([]);
  const [categories, setCategories] = useState<CategoryCard[]>([]);
  const [editingCard, setEditingCard] = useState<ThingCard | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // LocalStorageからデータを読み込み
  useEffect(() => {
    const saved = localStorage.getItem('customCards');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.things) {
          setThings(data.things);
        }
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
      }
    }
  }, []);

  // カードを追加
  const handleAddCard = (cardData: Omit<ThingCard, 'id'>) => {
    const newCard: ThingCard = {
      ...cardData,
      id: Date.now().toString(),
      type: 'thing'
    };

    const updatedThings = [...things, newCard];
    setThings(updatedThings);
    
    // LocalStorageに保存
    saveToLocalStorage(updatedThings);
    
    setShowAddForm(false);
    setEditingCard(null);
  };

  // カードを編集
  const handleEditCard = (card: ThingCard) => {
    setEditingCard(card);
    setShowAddForm(true);
  };

  // カードを削除
  const handleDeleteCard = (card: ThingCard) => {
    if (confirm(`「${card.name}」を削除しますか？`)) {
      const updatedThings = things.filter(t => t.id !== card.id);
      setThings(updatedThings);
      
      // LocalStorageに保存
      saveToLocalStorage(updatedThings);
    }
  };

  // カードを更新
  const handleUpdateCard = (cardData: Omit<ThingCard, 'id'>) => {
    if (!editingCard) return;
    
    const updatedCard: ThingCard = {
      ...cardData,
      id: editingCard.id,
      type: 'thing'
    };

    const updatedThings = things.map(t => 
      t.id === updatedCard.id ? updatedCard : t
    );
    setThings(updatedThings);
    
    // LocalStorageに保存
    saveToLocalStorage(updatedThings);
    
    setShowAddForm(false);
    setEditingCard(null);
  };

  // LocalStorageに保存
  const saveToLocalStorage = (updatedThings: ThingCard[]) => {
    const saved = localStorage.getItem('customCards');
    const data = saved ? JSON.parse(saved) : {};
    
    const updatedData = {
      ...data,
      things: updatedThings,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('customCards', JSON.stringify(updatedData));
    
    // 入力画面と作成ページにデータ更新を通知
    window.dispatchEvent(new CustomEvent('customCardsChanged'));
    
    alert('忘れたものが保存されました！');
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between text-black">
          <div>
            <Link href="/create">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">忘れたもの作成・管理</h1>
          </div>
          <Button onClick={() => { setShowAddForm(true); setEditingCard(null); }}>
            <Plus className="mr-2 h-4 w-4" />
            新しく忘れたものを作成
          </Button>
        </div>

        {/* 追加・編集フォーム */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">
                {editingCard ? '忘れたものを編集' : '新しい忘れたものを作成'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ThingForm
                card={editingCard}
                categories={categories}
                onSubmit={editingCard ? handleUpdateCard : handleAddCard}
                onCancel={() => {
                  setShowAddForm(false);
                  setEditingCard(null);
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* 忘れたものカード一覧 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">
              🎯 忘れたものカード一覧
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {things.map((thing) => {
                const category = categories.find(c => c.id === thing.categoryId);
                return (
                  <div key={thing.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{thing.emoji}</span>
                        <h3 className="font-semibold text-gray-900 text-lg">{thing.name}</h3>
                      </div>
                      <div className="flex gap-2 text-gray-700">
                        <Button size="sm" variant="ghost" onClick={() => handleEditCard(thing)}>
                          編集
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteCard(thing)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
      </div>
    </MainLayout>
  );
}

// 忘れたものフォームコンポーネント
interface ThingFormProps {
  card: ThingCard | null;
  categories: CategoryCard[];
  onSubmit: (card: Omit<ThingCard, 'id'>) => void;
  onCancel: () => void;
}

function ThingForm({ card, categories, onSubmit, onCancel }: ThingFormProps) {
  const [formData, setFormData] = useState({
    name: card?.name || '',
    emoji: card?.emoji || '😊',
    description: card?.description || '',
    categoryId: card?.categoryId || categories[0]?.id || '',
  });

  // 編集時にフォームデータを更新
  React.useEffect(() => {
    if (card) {
      setFormData({
        name: card.name,
        emoji: card.emoji,
        description: card.description || '',
        categoryId: card.categoryId,
      });
    } else {
      setFormData({
        name: '',
        emoji: '😊',
        description: '',
        categoryId: categories[0]?.id || '',
      });
    }
  }, [card, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('名前を入力してください');
      return;
    }

    if (!formData.categoryId) {
      alert('カテゴリを選択してください');
      return;
    }

    const cardData: Omit<ThingCard, 'id'> = {
      name: formData.name.trim(),
      emoji: formData.emoji,
      description: formData.description.trim() || undefined,
      categoryId: formData.categoryId,
      type: 'thing',
    };

    onSubmit(cardData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          絵文字
        </label>
        <input
          type="text"
          value={formData.emoji}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
          placeholder="😊"
          maxLength={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          名前
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="忘れたものの名前"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-gray-400"
        />
      </div>

      <div className="flex gap-3 text-gray-700 justify-center">
        <Button type="submit">
          {card ? '更新' : '追加'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
