"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Clock, CheckCircle, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';

// 忘れ物一覧を取得
// const fetchForgottenItems = async () => {
//   try {
//     const result = await apiClient.getForgottenItems();
//     if (result.success) {
//       // データを表示
//       console.log(result.data);
//     }
//   } catch (error) {
//     console.error('エラー:', error);
//   }
// };

interface Mission {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  weeklyDay?: string; // 毎週設定する曜日
}

interface ForgottenItem {
  id: number | string;
  title: string;
  forgotten_item: string;
  datetime: string;
  category: string;
  details?: string;
  difficulty?: number; // 困った度 (1-5)
  situation?: string[]; // 状況
  location?: string; // 場所
}

interface LocalStorageRecord {
  id: string;
  thingType: string;
  didForget: boolean;
  createdAt?: string;
  category?: string;
  difficulty?: number;
  situation?: string[];
  location?: string;
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [recentItems, setRecentItems] = useState<ForgottenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMission, setShowAddMission] = useState(false);
  const [newMission, setNewMission] = useState({ title: '', description: '', weeklyDay: '' });
  const [editingMission, setEditingMission] = useState<Mission | null>(null);

  // 曜日の配列
  const weekDays = [
    { value: 'none', label: 'なし' },
    { value: '', label: '毎日' },
    { value: 'monday', label: '毎週月曜日' },
    { value: 'tuesday', label: '毎週火曜日' },
    { value: 'wednesday', label: '毎週水曜日' },
    { value: 'thursday', label: '毎週木曜日' },
    { value: 'friday', label: '毎週金曜日' },
    { value: 'saturday', label: '毎週土曜日' },
    { value: 'sunday', label: '毎週日曜日' }
  ];

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
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await apiClient.getForgottenItems();
        if (result.success && result.data) {
          console.log('取得した忘れ物データ:', result.data);
          
          // LocalStorageからも忘れ物データを取得
          const localStorageItems = JSON.parse(localStorage.getItem('thingsRecords') || '[]');
          const forgetRecords = localStorageItems.filter((record: LocalStorageRecord) => record.didForget === true);
          console.log('LocalStorageの忘れ物データ:', forgetRecords);
          
          // APIデータとLocalStorageデータを統合
          const allItems = [
            ...result.data,
            ...forgetRecords.map((record: LocalStorageRecord) => ({
              id: `local_${record.id}`,
              title: record.thingType || '忘れ物',
              forgotten_item: record.thingType || '忘れ物',
              datetime: record.createdAt || new Date().toISOString(),
              category: record.category || 'forget_things',
              difficulty: record.difficulty || 3,
              situation: record.situation || [],
              location: record.location || ''
            }))
          ];
          
          const sortedItems = allItems
            .sort((a: ForgottenItem, b: ForgottenItem) => 
              new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
            )
            .slice(0, 2);
          console.log('最近の忘れ物（上位2件）:', sortedItems);
          setRecentItems(sortedItems);
        } else {
          console.log('APIからデータが取得できませんでした:', result);
        }
      } catch (error) {
        console.error('忘れ物の取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchRecentItems();
    }
  }, [user, authLoading]);

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
        completed: false,
        weeklyDay: newMission.weeklyDay
      };
      setMissions(prev => [...prev, mission]);
      setNewMission({ title: '', description: '', weeklyDay: '' });
      setShowAddMission(false);
    }
  };

  const handleEditMission = (mission: Mission) => {
    setEditingMission(mission);
    setNewMission({ title: mission.title, description: mission.description, weeklyDay: mission.weeklyDay || '' });
    setShowAddMission(true);
  };

  const handleUpdateMission = () => {
    if (editingMission && newMission.title.trim()) {
      setMissions(prev => 
        prev.map(mission => 
          mission.id === editingMission.id
            ? { ...mission, title: newMission.title.trim(), description: newMission.description.trim(), weeklyDay: newMission.weeklyDay }
            : mission
        )
      );
      setNewMission({ title: '', description: '', weeklyDay: '' });
      setEditingMission(null);
      setShowAddMission(false);
    }
  };

  const handleDeleteMission = (missionId: number) => {
    setMissions(prev => prev.filter(mission => mission.id !== missionId));
  };

  const handleCancelEdit = () => {
    setNewMission({ title: '', description: '', weeklyDay: '' });
    setEditingMission(null);
    setShowAddMission(false);
  };

  // 認証ローディング中
  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  // 未認証の場合
  if (!user) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="glass-card p-8 rounded-xl">
            <div className="text-center">
              <div className="text-6xl mb-4">🌲</div>
              <h2 className="text-2xl font-bold text-forest-primary mb-4">
                忘れ物図鑑へようこそ！
              </h2>
              <p className="text-forest-secondary mb-6">
                忘れ物を記録してモンスターを育てましょう。<br />
                まずはアカウントを作成してください。
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/register">
                  <button className="forest-button px-6 py-3 text-lg rounded-lg">
                    新規登録
                  </button>
                </Link>
                <Link href="/login">
                  <button className="forest-button px-6 py-3 text-lg rounded-lg">
                    ログイン
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 今日のミッション */}
        <div className="forest-card p-6 rounded-xl">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-forest-accent" />
                <h2 className="text-xl font-bold text-forest-primary">{todayMission.title}</h2>
              </div>

              {/* ミッション追加ボタン */}
              {!showAddMission && (
                <button
                  onClick={() => setShowAddMission(true)}
                  className="forest-button px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  ミッションを追加
                </button>
              )}
            </div>
          </div>
          <div>
            <p className="mb-4 text-forest-secondary">{todayMission.description}</p>
            
            {/* ミッションリスト */}
            <div className="space-y-3 mb-4">
              {missions.map((mission) => (
                <div
                  key={mission.id}
                  className="flex items-center gap-3 p-3 rounded-lg border-2 border-emerald-400/30 bg-emerald-900/20 hover:bg-emerald-900/30 transition-colors backdrop-filter backdrop-blur-sm"
                >
                  <div 
                    className="flex-shrink-0 cursor-pointer"
                    onClick={() => handleMissionToggle(mission.id)}
                  >
                    {mission.completed ? (
                      <CheckCircle className="h-6 w-6 text-forest-accent" />
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-emerald-400/50" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-forest-primary">{mission.title}</h4>
                    <p className="text-sm text-forest-secondary">{mission.description}</p>
                    {mission.weeklyDay && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-900/40 text-forest-accent border border-emerald-400/30">
                          {weekDays.find(day => day.value === mission.weeklyDay)?.label || mission.weeklyDay}
                        </span>
                      </div>
                    )}
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
              <div className="mb-4 p-4 rounded-lg bg-emerald-900/20 border-2 border-emerald-400/30 backdrop-filter backdrop-blur-sm">
                <h4 className="font-medium mb-3 text-forest-primary">
                  {editingMission ? 'ミッションを編集' : '新しいミッションを追加'}
                </h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="ミッションのタイトル"
                    value={newMission.title}
                    onChange={(e) => setNewMission(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full forest-input p-2"
                  />
                  <input
                    type="text"
                    placeholder="詳細説明（オプション）"
                    value={newMission.description}
                    onChange={(e) => setNewMission(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full forest-input p-2"
                  />
                  
                  {/* 曜日選択 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium forest-label">
                      繰り返し設定
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {weekDays.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => setNewMission(prev => ({ ...prev, weeklyDay: day.value }))}
                          className={`forest-chip p-2 text-sm rounded-md transition-colors ${
                            newMission.weeklyDay === day.value ? 'selected' : ''
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={editingMission ? handleUpdateMission : handleAddMission}
                      className="forest-button flex-1 px-4 py-2 rounded-lg"
                    >
                      {editingMission ? '更新' : '追加'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="forest-button flex-1 px-4 py-2 rounded-lg"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 進捗バー */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-forest-primary">進捗</span>
                <span className="text-sm text-forest-secondary">
                  {todayMission.completed}/{todayMission.total} ({Math.round((todayMission.completed / todayMission.total) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-emerald-900/30 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(todayMission.completed / todayMission.total) * 100}%` }}
                ></div>
              </div>
            </div>

          </div>
        </div>

        {/* 最近の忘れ物 */}
        <div className="forest-card p-6 rounded-xl">
          <div className="mb-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-forest-primary">
              <Clock className="h-5 w-5 text-forest-accent" />
              最近の忘れ物
            </h2>
          </div>
          <div>
            {loading ? (
              <div className="text-center py-8 text-forest-secondary">
                最近の忘れ物を読み込み中...
              </div>
            ) : recentItems.length > 0 ? (
              <div className="space-y-3">
                {recentItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg border-2 border-emerald-400/30 bg-emerald-900/20 hover:bg-emerald-900/30 transition-colors backdrop-filter backdrop-blur-sm"
                  >
                    <span className="text-2xl">{getCategoryEmoji(item.category)}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-forest-primary">{item.title}</h4>
                      <p className="text-sm text-forest-secondary">{formatDateTime(item.datetime)}</p>
                      {item.difficulty && (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-forest-secondary">困った度:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`w-2 h-2 rounded-full ${
                                  level <= item.difficulty! ? 'bg-red-400' : 'bg-emerald-900/40'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {item.situation && item.situation.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.situation.map((situation, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-900/40 text-forest-accent border border-emerald-400/30"
                            >
                              {situation}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.location && (
                        <p className="text-xs text-forest-secondary mt-1">
                          📍 {item.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-forest-secondary">
                まずは忘れ物を1件登録しよう
              </div>
            )}
          </div>
        </div>

        {/* えさあげボタン */}
        <div className="flex justify-center">
          <Link href="/feed">
            <button className="forest-button px-8 py-3 text-lg rounded-lg">
              🍽️ モンスターにえさをあげに行く
            </button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
