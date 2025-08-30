"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Clock, CheckCircle, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Mission {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface ForgottenItem {
  id: number;
  title: string;
  forgotten_item: string;
  datetime: string;
  category: string;
  details?: string;
}

export default function HomePage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [recentItems, setRecentItems] = useState<ForgottenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMission, setShowAddMission] = useState(false);
  const [newMission, setNewMission] = useState({ title: '', description: '' });
  const [editingMission, setEditingMission] = useState<Mission | null>(null);

  // 今日のミッション情報
  const todayMission = {
    title: '今日のミッション',
    description: '今日やるべきことを確認しましょう',
    total: missions.length,
    completed: missions.filter(m => m.completed).length
  };

  // 最近の忘れ物をAPIから取得
  useEffect(() => {
    const fetchRecentItems = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/forgotten-items');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // 最新の5件を取得し、日時でソート
            const sortedItems = data.data
              .sort((a: ForgottenItem, b: ForgottenItem) => 
                new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
              )
              .slice(0, 5);
            setRecentItems(sortedItems);
          }
        }
      } catch (error) {
        console.error('忘れ物の取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentItems();
  }, []);

  // ローカルストレージからミッションを読み込み
  useEffect(() => {
    const savedMissions = localStorage.getItem('dailyMissions');
    if (savedMissions) {
      setMissions(JSON.parse(savedMissions));
    }
  }, []);

  // ミッションをローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('dailyMissions', JSON.stringify(missions));
  }, [missions]);

  // 日時をフォーマットする関数
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '今日 ' + date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 2) {
      return '昨日 ' + date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }) + 
             ' ' + date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    }
  };

  // カテゴリに応じた絵文字を取得する関数
  const getCategoryEmoji = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      'forget_things': '🔑',
      'electronics': '📱',
      'documents': '📄',
      'clothing': '👕',
      'other': '📦'
    };
    return emojiMap[category] || '📦';
  };

  const handleMissionToggle = (missionId: number) => {
    setMissions(prev => 
      prev.map(mission => 
        mission.id === missionId 
          ? { ...mission, completed: !mission.completed }
          : mission
      )
    );
  };

  const handleAddMission = () => {
    if (newMission.title.trim()) {
      const mission: Mission = {
        id: Date.now(),
        title: newMission.title.trim(),
        description: newMission.description.trim(),
        completed: false
      };
      setMissions(prev => [...prev, mission]);
      setNewMission({ title: '', description: '' });
      setShowAddMission(false);
    }
  };

  const handleEditMission = (mission: Mission) => {
    setEditingMission(mission);
    setNewMission({ title: mission.title, description: mission.description });
    setShowAddMission(true);
  };

  const handleUpdateMission = () => {
    if (editingMission && newMission.title.trim()) {
      setMissions(prev => 
        prev.map(mission => 
          mission.id === editingMission.id
            ? { ...mission, title: newMission.title.trim(), description: newMission.description.trim() }
            : mission
        )
      );
      setNewMission({ title: '', description: '' });
      setEditingMission(null);
      setShowAddMission(false);
    }
  };

  const handleDeleteMission = (missionId: number) => {
    setMissions(prev => prev.filter(mission => mission.id !== missionId));
  };

  const handleCancelEdit = () => {
    setNewMission({ title: '', description: '' });
    setEditingMission(null);
    setShowAddMission(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 今日のミッション */}
        <Card>
                      <CardHeader>
              <CardTitle className="flex items-center justify-between text-black">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5  text-primary" />
                  {todayMission.title}
                </div>

                {/* ミッション追加ボタン */}
                {!showAddMission && (
                  <Button
                    onClick={() => setShowAddMission(true)}
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    ミッションを追加
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">{todayMission.description}</p>
            
            {/* ミッションリスト */}
            <div className="space-y-3 mb-4">
              {missions.map((mission) => (
                <div
                  key={mission.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50"
                >
                  <div 
                    className="flex-shrink-0 cursor-pointer"
                    onClick={() => handleMissionToggle(mission.id)}
                  >
                    {mission.completed ? (
                      <CheckCircle className="h-6 w-6 text-primary" />
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{mission.title}</h4>
                    <p className="text-sm text-gray-500">{mission.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditMission(mission)}
                      className="p-1 text-gray-500 hover:text-primary"
                      title="編集"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMission(mission.id)}
                      className="p-1 text-gray-500 hover:text-red-500"
                      title="削除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ミッション追加・編集フォーム */}
            {showAddMission && (
              <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-3">
                  {editingMission ? 'ミッションを編集' : '新しいミッションを追加'}
                </h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="ミッションのタイトル"
                    value={newMission.title}
                    onChange={(e) => setNewMission(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="詳細説明（オプション）"
                    value={newMission.description}
                    onChange={(e) => setNewMission(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={editingMission ? handleUpdateMission : handleAddMission}
                      className="flex-1"
                    >
                      {editingMission ? '更新' : '追加'}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      className="flex-1"
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 進捗バー */}
            <Progress 
              value={todayMission.completed} 
              max={todayMission.total}
              label="進捗"
              showPercentage
            />

          </CardContent>
        </Card>

        {/* 最近の忘れ物 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Clock className="h-5 w-5 text-primary" />
              最近の忘れ物
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                最近の忘れ物を読み込み中...
              </div>
            ) : recentItems.length > 0 ? (
              <div className="space-y-3">
                {recentItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50"
                  >
                    <span className="text-2xl">{getCategoryEmoji(item.category)}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500">{formatDateTime(item.datetime)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                まずは忘れ物を1件登録しよう
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
