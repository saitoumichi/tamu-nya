"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Chip } from '@/components/ui/chip';
import { Progress } from '@/components/ui/progress';
import { Calendar, TrendingUp, BarChart3, PieChart } from 'lucide-react';

interface ThingsRecord {
  id: string;
  category: string;
  thingType: string;
  thingId: string;
  title: string;
  content: string;
  details: string;
  difficulty: number;
  location: string;
  datetime: string;
  createdAt: string;
}

export default function AnalysisPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [thingsRecords, setThingsRecords] = useState<ThingsRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ThingsRecord[]>([]);

  // LocalStorageからデータを読み込み
  useEffect(() => {
    const loadRecords = () => {
      const records = JSON.parse(localStorage.getItem('thingsRecords') || '[]');
      setThingsRecords(records);
      setFilteredRecords(records);
    };

    // 初回読み込み
    loadRecords();

    // LocalStorageの変更を監視
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'thingsRecords') {
        loadRecords();
      }
    };

    // 同じウィンドウ内での変更を監視
    const handleCustomStorageChange = () => {
      loadRecords();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('thingsRecordsChanged', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('thingsRecordsChanged', handleCustomStorageChange);
    };
  }, []);

  // カテゴリフィルター適用
  useEffect(() => {
    if (selectedCategory === '') {
      setFilteredRecords(thingsRecords);
    } else {
      const filtered = thingsRecords.filter((record: ThingsRecord) => record.thingId === selectedCategory);
      setFilteredRecords(filtered);
    }
  }, [selectedCategory, thingsRecords]);

  // 期間フィルター適用
  const getFilteredRecordsByTime = () => {
    const now = new Date();
    const filtered = filteredRecords.filter((record: ThingsRecord) => {
      const recordDate = new Date(record.createdAt);
      if (timeRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return recordDate >= weekAgo;
      } else {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return recordDate >= monthAgo;
      }
    });
    return filtered;
  };

  const timeFilteredRecords = getFilteredRecordsByTime();

  // サンプルデータ（実際のAPIから取得）
  const timeRanges = [
    { id: 'week', name: '週間', emoji: '📅' },
    { id: 'month', name: '月間', emoji: '📆' }
  ];

  const categories = [
    { id: '', name: 'すべて', emoji: '🌟' },
    { id: 'key', name: '鍵', emoji: '🔑' },
    { id: 'medicine', name: '薬', emoji: '💊' },
    { id: 'umbrella', name: '傘', emoji: '☔' },
    { id: 'wallet', name: '財布', emoji: '👛' },
    { id: 'smartphone', name: 'スマホ', emoji: '📱' },
    { id: 'forget', name: '物忘れ', emoji: '🧠' },
    { id: 'schedule', name: '予定忘れ', emoji: '🗓️' },
    { id: 'late', name: '寝坊・遅刻', emoji: '⏰' }
  ];

  // 週間データを実際のデータから生成
  const generateWeeklyData = () => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const weeklyData = days.map(day => ({ day, count: 0, category: '' }));
    
    timeFilteredRecords.forEach(record => {
      const recordDate = new Date(record.createdAt);
      const dayIndex = recordDate.getDay();
      weeklyData[dayIndex].count++;
      weeklyData[dayIndex].category = record.thingId;
    });
    
    return weeklyData;
  };

  const weeklyData = generateWeeklyData();

  // カテゴリ別統計を実際のデータから生成
  const generateCategoryStats = () => {
    const categoryMap = new Map<string, number>();
    
    timeFilteredRecords.forEach(record => {
      const count = categoryMap.get(record.thingId) || 0;
      categoryMap.set(record.thingId, count + 1);
    });
    
    const total = timeFilteredRecords.length;
    const stats = Array.from(categoryMap.entries()).map(([thingId, count]) => {
      const category = categories.find(cat => cat.id === thingId);
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return {
        name: category?.name || 'その他',
        emoji: category?.emoji || '📦',
        count,
        percentage
      };
    });
    
    return stats.sort((a, b) => b.count - a.count);
  };

  const categoryStats = generateCategoryStats();

  // 実際のデータから統計を計算
  const totalCount = timeFilteredRecords.length;
  const averagePerDay = timeRange === 'week' 
    ? (totalCount / 7).toFixed(1) 
    : (totalCount / 30).toFixed(1);

  // 月間カレンダーの日付を生成
  const generateMonthlyCalendar = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 6 for Saturday

    const calendar = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      calendar.push(null); // 先月の日付
    }
    for (let i = 1; i <= daysInMonth; i++) {
      calendar.push(new Date(year, month, i).toISOString().slice(0, 10));
    }
    return calendar;
  };

  // 日付ごとの記録数を取得
  const getDateRecordCount = (date: string) => {
    return timeFilteredRecords.filter(record => new Date(record.createdAt).toISOString().slice(0, 10) === date).length;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">分析</h1>
            <p className="text-gray-600">忘れ物の傾向と統計</p>
          </div>
        </div>

        {/* フィルター */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Calendar className="h-5 w-5 text-primary" />
              {timeRange === 'week' ? '週間カテゴリー' : '月間カテゴリー'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 期間選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                期間
              </label>
              <div className="flex gap-2">
                {timeRanges.map((range) => (
                  <Chip
                    key={range.id}
                    label={range.name}
                    emoji={range.emoji}
                    selected={timeRange === range.id}
                    onClick={() => setTimeRange(range.id as 'week' | 'month')}
                  />
                ))}
              </div>
            </div>

            {/* カテゴリフィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Chip
                    key={category.id}
                    label={category.name}
                    emoji={category.emoji}
                    selected={selectedCategory === category.id}
                    onClick={() => setSelectedCategory(category.id)}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* サマリー統計 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">総記録数</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">1日平均</p>
                  <p className="text-2xl font-bold text-gray-900">{averagePerDay}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <PieChart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">カテゴリ数</p>
                  <p className="text-2xl font-bold text-gray-900">{categoryStats.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 期間別トレンド */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <TrendingUp className="h-5 w-5 text-primary" />
              {timeRange === 'week' ? '週間トレンド' : '月間トレンド'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeRange === 'week' ? (
              // 週間トレンド
              <div className="space-y-4">
                {weeklyData.map((day) => (
                  <div key={day.day} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium text-gray-600">
                      {day.day}
                    </div>
                    <div className="flex-1">
                      <Progress
                        value={day.count}
                        max={Math.max(...weeklyData.map(d => d.count))}
                        showPercentage={false}
                      />
                    </div>
                    <div className="w-16 text-right text-sm font-medium text-gray-900">
                      {day.count}件
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // 月間トレンド（カレンダー形式）
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                    <div key={day} className="text-sm font-medium text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {generateMonthlyCalendar().map((date, index) => (
                    <div
                      key={index}
                      className={`
                        aspect-square border rounded-lg p-1 text-xs
                        ${date ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'}
                        ${date && getDateRecordCount(date) > 0 ? 'border-blue-300 bg-blue-50' : ''}
                      `}
                    >
                      {date && (
                        <>
                          <div className="text-gray-900 font-medium">
                            {new Date(date).getDate()}
                          </div>
                          {getDateRecordCount(date) > 0 && (
                            <div className="text-blue-600 font-bold text-center">
                              {getDateRecordCount(date)}件
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* カテゴリ別統計 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <PieChart className="h-5 w-5 text-primary" />
              {timeRange === 'week' ? '週間カテゴリー' : '月間カテゴリー'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((category) => (
                <div key={category.name} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-24">
                    <span className="text-lg">{category.emoji}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex-1">
                    <Progress
                      value={category.percentage}
                      max={100}
                      showPercentage={false}
                    />
                  </div>
                  <div className="w-20 text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {category.count}件
                    </div>
                    <div className="text-xs text-gray-500">
                      {category.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
