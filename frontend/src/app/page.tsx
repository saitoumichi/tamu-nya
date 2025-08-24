"use client";

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [completedMissions, setCompletedMissions] = useState<number[]>([]);

  // サンプルデータ（実際のAPIから取得）
  const todayMission = {
    title: '今日のミッション',
    description: '今日やるべきことを確認しましょう',
    total: 2,
    completed: completedMissions.length
  };

  const missions = [
    {
      id: 1,
      title: 'カギの確認',
      description: '鍵の確認',
      completed: completedMissions.includes(1)
    },
    {
      id: 2,
      title: '薬の服用',
      description: '薬の服用',
      completed: completedMissions.includes(2)
    }
  ];

  const recentItems = [
    {
      id: 1,
      time: '今日 9:81',
      title: '鍵を忘れた',
      category: '🔑'
    },
    {
      id: 2,
      time: '昨日 9:10',
      title: 'スマホを忘れた',
      category: '📱'
    }
  ];

  const handleMissionToggle = (missionId: number) => {
    setCompletedMissions(prev => 
      prev.includes(missionId)
        ? prev.filter(id => id !== missionId)
        : [...prev, missionId]
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 今日のミッション */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {todayMission.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">{todayMission.description}</p>
            
            {/* ミッションリスト */}
            <div className="space-y-3 mb-4">
              {missions.map((mission) => (
                <div
                  key={mission.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleMissionToggle(mission.id)}
                >
                  <div className="flex-shrink-0">
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
                </div>
              ))}
            </div>

            {/* 進捗バー */}
            <Progress 
              value={todayMission.completed} 
              max={todayMission.total}
              label="進捗"
              showPercentage
            />
            
            <div className="mt-4">
              <Link href="/input">
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  +忘れ物
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 最近の忘れ物 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              最近の忘れ物
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentItems.length > 0 ? (
              <div className="space-y-3">
                {recentItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50"
                  >
                    <span className="text-2xl">{item.category}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.time}</p>
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
