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

export default function CategoryCreatePage() {
  const [categories, setCategories] = useState<CategoryCard[]>([]);
  const [editingCard, setEditingCard] = useState<CategoryCard | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // LocalStorageからデータを読み込み
  useEffect(() => {
    const saved = localStorage.getItem('customCards');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
      }
    }
  }, []);

  // カードを追加
  const handleAddCard = (cardData: Omit<CategoryCard, 'id'>) => {
    const newCard: CategoryCard = {
      ...cardData,
      id: Date.now().toString(),
      type: 'category'
    };

    const updatedCategories = [...categories, newCard];
    setCategories(updatedCategories);
    
    // LocalStorageに保存
    saveToLocalStorage(updatedCategories);
    
    setShowAddForm(false);
    setEditingCard(null);
  };

  // カードを編集
  const handleEditCard = (card: CategoryCard) => {
    setEditingCard(card);
    setShowAddForm(true);
  };

  // カードを削除
  const handleDeleteCard = (card: CategoryCard) => {
    if (confirm(`「${card.name}」を削除しますか？`)) {
      const updatedCategories = categories.filter(c => c.id !== card.id);
      setCategories(updatedCategories);
      
      // LocalStorageに保存
      saveToLocalStorage(updatedCategories);
    }
  };

  // カードを更新
  const handleUpdateCard = (cardData: Omit<CategoryCard, 'id'>) => {
    if (!editingCard) return;
    
    const updatedCard: CategoryCard = {
      ...cardData,
      id: editingCard.id,
      type: 'category'
    };

    const updatedCategories = categories.map(c => 
      c.id === updatedCard.id ? updatedCard : c
    );
    setCategories(updatedCategories);
    
    // LocalStorageに保存
    saveToLocalStorage(updatedCategories);
    
    setShowAddForm(false);
    setEditingCard(null);
  };

  // LocalStorageに保存
  const saveToLocalStorage = (updatedCategories: CategoryCard[]) => {
    const saved = localStorage.getItem('customCards');
    const data = saved ? JSON.parse(saved) : {};
    
    const updatedData = {
      ...data,
      categories: updatedCategories,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('customCards', JSON.stringify(updatedData));
    
    // 入力画面と作成ページにデータ更新を通知
    window.dispatchEvent(new CustomEvent('customCardsChanged'));
    
    alert('カテゴリが保存されました！');
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
            <h1 className="text-2xl font-bold text-gray-900 mt-2">カテゴリ作成・管理</h1>
          </div>
          <Button onClick={() => { setShowAddForm(true); setEditingCard(null); }}>
            <Plus className="mr-2 h-4 w-4" />
            新しくカテゴリを作成
          </Button>
        </div>

        {/* 追加・編集フォーム */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">
                {editingCard ? 'カテゴリを編集' : '新しいカテゴリを作成'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryForm
                card={editingCard}
                onSubmit={editingCard ? handleUpdateCard : handleAddCard}
                onCancel={() => {
                  setShowAddForm(false);
                  setEditingCard(null);
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* カテゴリカード一覧 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">
              📂 カテゴリカード一覧
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span>{category.emoji}</span>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    </div>
                    <div className="flex gap-2 text-gray-700">
                      <Button size="sm" variant="ghost" onClick={() => handleEditCard(category)}>
                        編集
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteCard(category)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-sm text-gray-600">{category.description}</p>
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

// カテゴリフォームコンポーネント
interface CategoryFormProps {
  card: CategoryCard | null;
  onSubmit: (card: Omit<CategoryCard, 'id'>) => void;
  onCancel: () => void;
}

function CategoryForm({ card, onSubmit, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: card?.name || '',
    emoji: card?.emoji || '😊',
    description: card?.description || '',
  });

  // 編集時にフォームデータを更新
  React.useEffect(() => {
    if (card) {
      setFormData({
        name: card.name,
        emoji: card.emoji,
        description: card.description || '',
      });
    } else {
      setFormData({
        name: '',
        emoji: '😊',
        description: '',
      });
    }
  }, [card]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('名前を入力してください');
      return;
    }

    const cardData: Omit<CategoryCard, 'id'> = {
      name: formData.name.trim(),
      emoji: formData.emoji,
      description: formData.description.trim() || undefined,
      type: 'category',
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
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-gray-400"
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
          placeholder="カテゴリ名"
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-gray-400"
        />
      </div>

      <div className="flex justify-center gap-3">
        <Button type="submit">
          {card ? '更新' : '追加'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
