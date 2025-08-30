"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Save, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';

interface CategoryCard {
  id: string;
  name: string;
  emoji: string;
  description?: string;
  type: 'category';
  serverId?: number;
}

export default function CategoryCreatePage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryCard[]>([]);
  const [editingCard, setEditingCard] = useState<CategoryCard | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // データを読み込み（認証時はAPI、未認証はLocalStorage）
  useEffect(() => {
    const load = async () => {
      if (user) {
        try {
          const res = await apiClient.getCustomCards();
          if (res?.success && res?.data?.categories) {
            const mapped: CategoryCard[] = res.data.categories.map((c: any) => ({
              id: c.card_id,
              name: c.name,
              emoji: c.emoji,
              description: c.description || undefined,
              type: 'category',
              serverId: c.id,
            }));
            setCategories(mapped);
            // キャッシュ
            saveToLocalStorage(mapped);
            return;
          }
        } catch (e) {
          console.error('カテゴリのAPI取得に失敗:', e);
        }
      }
      // Fallback: LocalStorage
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
    };
    load();
  }, [user]);

  // カードを追加
  const handleAddCard = async (cardData: Omit<CategoryCard, 'id'>) => {
    // 一意な card_id を生成（名前ベース + タイムスタンプ）
    const cardId = `${cardData.name}-${Date.now()}`;

    if (user) {
      try {
        const res = await apiClient.createCustomCard({
          type: 'category',
          name: cardData.name,
          emoji: cardData.emoji,
          card_id: cardId,
          description: cardData.description,
        });
        if (res?.success && res?.data) {
          const newCard: CategoryCard = {
            id: res.data.card_id,
            name: res.data.name,
            emoji: res.data.emoji,
            description: res.data.description || undefined,
            type: 'category',
            serverId: res.data.id,
          };
          const updated = [...categories, newCard];
          setCategories(updated);
          saveToLocalStorage(updated);
          setShowAddForm(false);
          setEditingCard(null);
          return;
        }
      } catch (e) {
        console.error('カテゴリのAPI作成に失敗:', e);
      }
    }

    // 未認証/失敗時はLocalStorageに保存
    const newCard: CategoryCard = {
      ...cardData,
      id: cardId,
      type: 'category',
    };
    const updatedCategories = [...categories, newCard];
    setCategories(updatedCategories);
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
  const handleDeleteCard = async (card: CategoryCard) => {
    if (!confirm(`「${card.name}」を削除しますか？`)) return;
    // 楽観的更新
    const prev = categories;
    const updatedCategories = categories.filter(c => c.id !== card.id);
    setCategories(updatedCategories);
    saveToLocalStorage(updatedCategories);

    if (user && card.serverId) {
      try {
        const res = await apiClient.deleteCustomCard(card.serverId);
        if (!res?.success) {
          throw new Error('削除失敗');
        }
      } catch (e) {
        console.error('カテゴリのAPI削除に失敗:', e);
        // ロールバック
        setCategories(prev);
        saveToLocalStorage(prev);
        alert('サーバー削除に失敗しました');
      }
    }
  };

  // カードを更新
  const handleUpdateCard = async (cardData: Omit<CategoryCard, 'id'>) => {
    if (!editingCard) return;

    if (user && editingCard.serverId) {
      try {
        const res = await apiClient.updateCustomCard(editingCard.serverId, {
          name: cardData.name,
          emoji: cardData.emoji,
          description: cardData.description,
        });
        if (res?.success && res?.data) {
          const updatedCard: CategoryCard = {
            id: res.data.card_id,
            name: res.data.name,
            emoji: res.data.emoji,
            description: res.data.description || undefined,
            type: 'category',
            serverId: res.data.id,
          };
          const updatedCategories = categories.map(c => c.id === editingCard.id ? updatedCard : c);
          setCategories(updatedCategories);
          saveToLocalStorage(updatedCategories);
          setShowAddForm(false);
          setEditingCard(null);
          return;
        }
      } catch (e) {
        console.error('カテゴリのAPI更新に失敗:', e);
      }
    }

    // 未認証/失敗時はLocalStorage更新
    const updatedCard: CategoryCard = {
      ...cardData,
      id: editingCard.id,
      type: 'category',
      serverId: editingCard.serverId,
    };
    const updatedCategories = categories.map(c => 
      c.id === updatedCard.id ? updatedCard : c
    );
    setCategories(updatedCategories);
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
      categories: updatedCategories.map((c: CategoryCard) => ({ id: c.id, name: c.name, emoji: c.emoji, description: c.description, type: 'category' })),
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
            <h1 className="text-2xl font-bold text-gray-900 mt-2">カードの管理</h1>
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
              📂 作成したカード一覧
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
