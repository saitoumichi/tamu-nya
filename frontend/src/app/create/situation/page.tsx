"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Save, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';

interface SituationCard {
  id: string;
  name: string;
  emoji: string;
  description?: string;
  type: 'situation';
  serverId?: number;
}

export default function SituationCreatePage() {
  const { user } = useAuth();
  const [situations, setSituations] = useState<SituationCard[]>([]);
  const [editingCard, setEditingCard] = useState<SituationCard | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // データを読み込み（認証時はAPI、未認証はLocalStorage）
  useEffect(() => {
    const load = async () => {
      if (user) {
        try {
          const res = await apiClient.getCustomCards();
          if (res?.success && res?.data?.situations) {
            const mapped: SituationCard[] = res.data.situations.map((s: any) => ({
              id: s.card_id,
              name: s.name,
              emoji: s.emoji,
              description: s.description || undefined,
              type: 'situation',
              serverId: s.id,
            }));
            setSituations(mapped);
            saveToLocalStorage(mapped);
            return;
          }
        } catch (e) {
          console.error('状況のAPI取得に失敗:', e);
        }
      }
      const saved = localStorage.getItem('customCards');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.situations) setSituations(data.situations);
        } catch (error) {
          console.error('データの読み込みに失敗しました:', error);
        }
      }
    };
    load();
  }, [user]);

  // カードを追加
  const handleAddCard = async (cardData: Omit<SituationCard, 'id'>) => {
    const cardId = `${cardData.name}-${Date.now()}`;
    if (user) {
      try {
        const res = await apiClient.createCustomCard({
          type: 'situation',
          name: cardData.name,
          emoji: cardData.emoji,
          card_id: cardId,
          description: cardData.description,
        });
        if (res?.success && res?.data) {
          const newCard: SituationCard = {
            id: res.data.card_id,
            name: res.data.name,
            emoji: res.data.emoji,
            description: res.data.description || undefined,
            type: 'situation',
            serverId: res.data.id,
          };
          const updated = [...situations, newCard];
          setSituations(updated);
          saveToLocalStorage(updated);
          setShowAddForm(false);
          setEditingCard(null);
          return;
        }
      } catch (e) {
        console.error('状況のAPI作成に失敗:', e);
      }
    }
    const newCard: SituationCard = {
      ...cardData,
      id: cardId,
      type: 'situation',
    };
    const updatedSituations = [...situations, newCard];
    setSituations(updatedSituations);
    saveToLocalStorage(updatedSituations);
    setShowAddForm(false);
    setEditingCard(null);
  };

  // カードを編集
  const handleEditCard = (card: SituationCard) => {
    setEditingCard(card);
    setShowAddForm(true);
  };

  // カードを削除
  const handleDeleteCard = async (card: SituationCard) => {
    if (!confirm(`「${card.name}」を削除しますか？`)) return;
    const prev = situations;
    const updatedSituations = situations.filter(s => s.id !== card.id);
    setSituations(updatedSituations);
    saveToLocalStorage(updatedSituations);
    if (user && card.serverId) {
      try {
        const res = await apiClient.deleteCustomCard(card.serverId);
        if (!res?.success) throw new Error('削除失敗');
      } catch (e) {
        console.error('状況のAPI削除に失敗:', e);
        setSituations(prev);
        saveToLocalStorage(prev);
        alert('サーバー削除に失敗しました');
      }
    }
  };

  // カードを更新
  const handleUpdateCard = async (cardData: Omit<SituationCard, 'id'>) => {
    if (!editingCard) return;
    if (user && editingCard.serverId) {
      try {
        const res = await apiClient.updateCustomCard(editingCard.serverId, {
          name: cardData.name,
          emoji: cardData.emoji,
          description: cardData.description,
        });
        if (res?.success && res?.data) {
          const updatedCard: SituationCard = {
            id: res.data.card_id,
            name: res.data.name,
            emoji: res.data.emoji,
            description: res.data.description || undefined,
            type: 'situation',
            serverId: res.data.id,
          };
          const updatedSituations = situations.map(s => s.id === editingCard.id ? updatedCard : s);
          setSituations(updatedSituations);
          saveToLocalStorage(updatedSituations);
          setShowAddForm(false);
          setEditingCard(null);
          return;
        }
      } catch (e) {
        console.error('状況のAPI更新に失敗:', e);
      }
    }
    const updatedCard: SituationCard = {
      ...cardData,
      id: editingCard.id,
      type: 'situation',
      serverId: editingCard.serverId,
    };
    const updatedSituations = situations.map(s => s.id === updatedCard.id ? updatedCard : s);
    setSituations(updatedSituations);
    saveToLocalStorage(updatedSituations);
    setShowAddForm(false);
    setEditingCard(null);
  };

  // LocalStorageに保存
  const saveToLocalStorage = (updatedSituations: SituationCard[]) => {
    const saved = localStorage.getItem('customCards');
    const data = saved ? JSON.parse(saved) : {};
    
    const updatedData = {
      ...data,
      situations: updatedSituations.map((s: SituationCard) => ({ id: s.id, name: s.name, emoji: s.emoji, description: s.description, type: 'situation' })),
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('customCards', JSON.stringify(updatedData));
    
    // 入力画面と作成ページにデータ更新を通知
    window.dispatchEvent(new CustomEvent('customCardsChanged'));
    
    alert('状況が保存されました！');
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
            新しく状況を作成
          </Button>
        </div>

        {/* 追加・編集フォーム */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">
                {editingCard ? '状況を編集' : '新しい状況を作成'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SituationForm
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

        {/* 状況カード一覧 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">
              🌟 作成したカード一覧
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {situations.map((situation) => (
                <div key={situation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span>{situation.emoji}</span>
                      <h3 className="font-semibold text-gray-900">{situation.name}</h3>
                    </div>
                    <div className="flex gap-2 text-gray-700">
                      <Button size="sm" variant="ghost" onClick={() => handleEditCard(situation)}>
                        編集
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteCard(situation)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

// 状況フォームコンポーネント
interface SituationFormProps {
  card: SituationCard | null;
  onSubmit: (card: Omit<SituationCard, 'id'>) => void;
  onCancel: () => void;
}

function SituationForm({ card, onSubmit, onCancel }: SituationFormProps) {
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

    const cardData: Omit<SituationCard, 'id'> = {
      name: formData.name.trim(),
      emoji: formData.emoji,
      description: formData.description.trim() || undefined,
      type: 'situation',
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
          placeholder="状況名"
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
