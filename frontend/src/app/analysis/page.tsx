"use client";

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Chip } from '@/components/ui/chip';
import { Progress } from '@/components/ui/progress';
import { Calendar, TrendingUp, BarChart3, PieChart } from 'lucide-react';

export default function AnalysisPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

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

  const weeklyData = [
    { day: '月', count: 3, category: 'key' },
    { day: '火', count: 1, category: 'umbrella' },
    { day: '水', count: 2, category: 'wallet' },
    { day: '木', count: 0, category: '' },
    { day: '金', count: 4, category: 'smartphone' },
    { day: '土', count: 2, category: 'medicine' },
    { day: '日', count: 1, category: 'key' }
  ];

  const categoryStats = [
    { name: '鍵', emoji: '🔑', count: 8, percentage: 32 },
    { name: '傘', emoji: '☔', count: 5, percentage: 20 },
    { name: '財布', emoji: '👛', count: 4, percentage: 16 },
    { name: 'スマホ', emoji: '📱', count: 4, percentage: 16 },
    { name: '薬', emoji: '💊', count: 3, percentage: 12 },
    { name: 'その他', emoji: '📦', count: 1, percentage: 4 }
  ];

  const totalCount = weeklyData.reduce((sum, day) => sum + day.count, 0);
  const averagePerDay = (totalCount / 7).toFixed(1);

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
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              期間・カテゴリ
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

        {/* 週間トレンド */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              週間トレンド
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* カテゴリ別統計 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              カテゴリ別統計
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
