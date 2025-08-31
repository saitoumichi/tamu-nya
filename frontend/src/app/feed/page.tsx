"use client";

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

// 型定義
interface ApiForgottenItem {
  id?: string | number;
  forgotten_item?: string;
  title?: string;
  category?: string;
  difficulty?: number;
  situation?: string[];
  datetime?: string;
  created_at?: string;
}

interface ThingsRecord {
  thingId: string;
  thingType: string;
  didForget: boolean;
  category?: string;
  difficulty?: number;
  createdAt?: string;
}

// 絵文字フォールバック用マップ
const THING_EMOJI_MAP: { [key: string]: string } = {
  key: '🔑',
  medicine: '💊',
  umbrella: '☔',
  wallet: '👛',
  smartphone: '📱',
  schedule: '📅',
  time: '⏰',
  homework: '📄',
  another: '😊'
};

export default function FeedPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [feedInventory, setFeedInventory] = useState(0);
  const [monsterFeed, setMonsterFeed] = useState<{ [thingId: string]: { fed: number } }>({});
  const [monsters, setMonsters] = useState<Array<{
    thingId: string;
    thingType: string;
    encounterCount: number;
    stage: number;
  }>>([]);
  const [screenWidth, setScreenWidth] = useState(1024);
  const [fireflies, setFireflies] = useState<Array<{id: number; left: number; top: number; delay: number; duration: number}>>([]);
  const [selectedFairy, setSelectedFairy] = useState<{
    thingId: string;
    thingType: string;
    stage: number;
    fedCount: number;
  } | null>(null);
  const [apiData, setApiData] = useState<ApiForgottenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasClaimedToday, setHasClaimedToday] = useState<boolean | null>(null);

  // APIからデータを取得
  const fetchAPIData = async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await apiClient.getForgottenItems();
      if (result.success && result.data) {
        setApiData(result.data);
        console.log('フィード画面API取得データ:', result.data);
      }
    } catch (error) {
      console.error('フィード画面API取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // ユーティリティ関数
  const readFeedInventory = (): number => {
    return parseInt(localStorage.getItem('feedInventory') || '0');
  };

  const writeFeedInventory = (n: number): void => {
    localStorage.setItem('feedInventory', n.toString());
  };

  const readMonsterFeed = (): { [thingId: string]: { fed: number } } => {
    return JSON.parse(localStorage.getItem('monsterFeed') || '{}');
  };

  const writeMonsterFeed = (obj: { [thingId: string]: { fed: number } }): void => {
    localStorage.setItem('monsterFeed', JSON.stringify(obj));
  };

  const aggregateMonstersFromThingsRecords = () => {
    const existingRecords = JSON.parse(localStorage.getItem('thingsRecords') || '[]');
    const forgetRecords = existingRecords.filter((record: ThingsRecord) => record.didForget === true);
    
    // APIデータをthingsRecords形式に変換
    const apiRecords = apiData.map((item: ApiForgottenItem, index: number) => {
      const itemName = item.forgotten_item || item.title || '忘れ物';
      // thingIdの正規化（api_プレフィックスを除去し、標準的なthingIdにマッピング）
      const normalizedThingId = itemName.toLowerCase().replace(/\s+/g, '_');
      const mapping: { [key: string]: string } = {
        '鍵': 'key',
        '傘': 'umbrella', 
        '財布': 'wallet',
        '薬': 'medicine',
        'スマホ': 'smartphone',
        '宿題': 'homework',
        '予定': 'schedule',
        '遅刻': 'time',
        '時間': 'time'
      };
      const thingId = mapping[itemName] || normalizedThingId;
      
      return {
        thingId: thingId,
        thingType: itemName,
        didForget: true
      };
    });

    // LocalStorageとAPIデータを統合
    const allRecords = [...forgetRecords, ...apiRecords];
    
    const monsterMap = new Map();
    allRecords.forEach((record: ThingsRecord) => {
      if (record.thingId && record.thingId !== 'none') {
        if (!monsterMap.has(record.thingId)) {
          monsterMap.set(record.thingId, {
            thingId: record.thingId,
            thingType: record.thingType,
            encounterCount: 0,
            stage: 0
          });
        }
        monsterMap.get(record.thingId).encounterCount++;
      }
    });
    
    console.log('フィード画面生成モンスター:', Array.from(monsterMap.values()));
    console.log('生成されたモンスターのthingId一覧:', Array.from(monsterMap.values()).map(m => ({ thingId: m.thingId, thingType: m.thingType })));
    return Array.from(monsterMap.values());
  };

  const refreshInventory = () => {
    const inventory = readFeedInventory();
    setFeedInventory(inventory);
  };

  const refreshMonsterFeed = () => {
    const feed = readMonsterFeed();
    setMonsterFeed(feed);
  };

  const refreshMonsters = () => {
    const monsterList = aggregateMonstersFromThingsRecords();
    const feed = readMonsterFeed();
    
         // 各モンスターの成長段階を計算（上限100レベル）
     const monstersWithStage = monsterList.map(monster => ({
       ...monster,
       stage: Math.min(Math.floor((feed[monster.thingId]?.fed || 0) / 5), 100)
     }));
    
    setMonsters(monstersWithStage);
  };

  const handleShowFairyStatus = (monster: typeof monsters[0]) => {
    const fedCount = monsterFeed[monster.thingId]?.fed || 0;
    setSelectedFairy({
      thingId: monster.thingId,
      thingType: monster.thingType,
      stage: monster.stage,
      fedCount: fedCount
    });
  };

  const handleFeedMonster = (thingId: string) => {
    if (feedInventory <= 0) return;
    
    const newInventory = feedInventory - 1;
    const newMonsterFeed = { ...monsterFeed };
    
    if (!newMonsterFeed[thingId]) {
      newMonsterFeed[thingId] = { fed: 0 };
    }
    newMonsterFeed[thingId].fed++;
    
    // 保存
    writeFeedInventory(newInventory);
    writeMonsterFeed(newMonsterFeed);
    
    // 状態更新
    setFeedInventory(newInventory);
    setMonsterFeed(newMonsterFeed);
    
    // モンスター一覧を再計算
    refreshMonsters();
    
    // イベント発火
    window.dispatchEvent(new CustomEvent('feed:inventoryChanged'));
    
         // 成長演出（5個ごと）
     if (newMonsterFeed[thingId].fed % 5 === 0) {
       // 軽い演出（アラート）
       alert('成長！');
     }
  };

  // APIデータを取得
  useEffect(() => {
    fetchAPIData();
  }, [user, token]);

  // APIデータが取得されたら初期化
  useEffect(() => {
    if (!loading) {
      refreshInventory();
      refreshMonsterFeed();
      refreshMonsters();
    }
  }, [apiData, loading]);

  // 初期化とイベント購読
  useEffect(() => {
    // 画面サイズを設定
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth);
    };
    
    updateScreenWidth();
    window.addEventListener('resize', updateScreenWidth);

    // 蛍を生成（クライアントサイドでのみ）
    const generateFireflies = () => {
      const newFireflies = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 4
      }));
      setFireflies(newFireflies);
    };
    
    generateFireflies();

    // feed:claimed イベントを購読
    const handleFeedClaimed = () => {
      refreshInventory();
    };

    window.addEventListener('feed:claimed', handleFeedClaimed);

    return () => {
      window.removeEventListener('resize', updateScreenWidth);
      window.removeEventListener('feed:claimed', handleFeedClaimed);
    };
  }, []);

  // 今日の受け取り状態（クライアントでのみ算出）
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const last = typeof window !== 'undefined' ? localStorage.getItem('dailyFeedClaimedAt') : null;
    setHasClaimedToday(last === today);
  }, []);

  // 認証ローディング中は安定したプレースホルダを表示
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
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-bold text-forest-primary mb-4">
                モンスターのお世話をするにはログインが必要です
              </h2>
              <p className="text-forest-secondary mb-6">
                忘れ物モンスターにえさをあげて育てましょう。
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/login">
                  <Button>ログイン</Button>
                </Link>
                <Link href="/register">
                  <Button variant="secondary">新規登録</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // ローディング中
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <div className="feed-background">
      {/* Feed専用森レイヤー */}
      <div className="feed-forest-layers">
        <div className="forest-layer forest-back"></div>
        <div className="forest-layer forest-mid"></div>
        <div className="forest-layer forest-front"></div>
      </div>
      
      <div className="relative min-h-screen overflow-hidden z-10">
        {/* ナビゲーション */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-emerald-900/20 backdrop-blur-md border-b border-emerald-400/30">
          <div className="flex justify-between items-center p-4">
            <Link href="/" className="text-xl font-bold text-forest-primary">🦖 TAMU-NYA</Link>
            <div className="flex gap-4">
              <Link href="/" className="text-forest-secondary hover:text-forest-primary">ホーム</Link>
              <Link href="/input" className="text-forest-secondary hover:text-forest-primary">入力</Link>
              <Link href="/analysis" className="text-forest-secondary hover:text-forest-primary">分析</Link>
              <Link href="/encyclopedia" className="text-forest-secondary hover:text-forest-primary">図鑑</Link>
              <Link href="/feed" className="text-forest-primary font-bold">フィード</Link>
            </div>
          </div>
        </nav>
        
        {/* フィードコンテンツ */}

        {/* フローティングヘッダー */}
        <div className="relative z-10 pt-24 p-6">
          <div className="bg-emerald-900/10 backdrop-blur-sm border-2 border-emerald-400/20 p-4 rounded-xl mb-6">
            <h1 className="text-2xl font-bold text-forest-primary mb-2 flex items-center gap-2">
              🌲 妖精の森
            </h1>
            <p className="text-forest-secondary mb-4">忘れ物から生まれた妖精たちがさまよっています</p>
            
            {/* えさと妖精数の表示 */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-emerald-900/20 rounded-full border border-emerald-400/40">
                  <span className="text-forest-primary font-medium">🌰 えさ: {feedInventory}</span>
                </div>
                <div className="px-3 py-1 bg-emerald-900/20 rounded-full border border-emerald-400/40">
                  <span className="text-forest-primary font-medium">🧚‍♀️ 妖精: {monsters.length}</span>
                </div>
              </div>
              <div className="text-xs text-forest-secondary">
                えさ5個で成長
              </div>
            </div>
            
            {/* 今日のえさ受け取り状況 */}
            <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-800 text-center">
                <span className="font-medium">📅 今日のえさ: </span>
                {hasClaimedToday === null ? '...' : (hasClaimedToday ? '✅ 受取済み' : '⏳ 未受取')}
              </div>
            </div>
          </div>
        </div>

        {/* 妖精エリア */}
        <div className="relative z-5 px-6 pb-6">
          <div className="fairy-container">
            {monsters.map((monster, index) => {
              // より広い範囲でランダムな動きを作成
              const wanderRadius = 200 + monster.stage * 50;
              const baseX = 150 + (index * 250) % (screenWidth - 300);
              const baseY = 250 + (index * 120) % 400;
              
              return (
                <div
                  key={monster.thingId}
                  className="fairy-sprite"
                  style={{
                    left: `${baseX}px`,
                    top: `${baseY}px`,
                    animationDelay: `${index * 0.8}s`,
                    transform: `scale(${0.8 + monster.stage * 0.1})`,
                    '--wander-x': `${wanderRadius}px`,
                    '--wander-y': `${wanderRadius * 0.6}px`,
                    '--fairy-index': index
                  } as React.CSSProperties}
              >
                {/* 妖精の軌跡エフェクト */}
                <div className="fairy-trail"></div>
                <div className="fairy-glow"></div>
                <div 
                  className="fairy-body"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowFairyStatus(monster);
                  }}
                >
                  <div className="text-4xl">
                    {THING_EMOJI_MAP[monster.thingId] || '🧚‍♀️'}
                  </div>
                  <div className="fairy-wings">✨</div>
                </div>
                <div className="fairy-info">
                  <div className="text-xs font-bold text-white bg-emerald-600 px-2 py-1 rounded-full">
                    {monster.thingType}
                  </div>
                  <div className="text-xs text-forest-primary mt-1">
                    Lv.{monster.stage}
                  </div>
                </div>
                <div className="feed-hint">
                  🧚‍♀️ クリックで詳細表示
                </div>
              </div>
              );
            })}
            
            {/* 蛍のエフェクト */}
            <div className="fireflies">
              {fireflies.map((firefly) => (
                <div 
                  key={firefly.id} 
                  className="firefly" 
                  style={{
                    left: `${firefly.left}%`,
                    top: `${firefly.top}%`,
                    animationDelay: `${firefly.delay}s`,
                    animationDuration: `${firefly.duration}s`
                  }}
                ></div>
              ))}
            </div>
          </div>

          {monsters.length === 0 && (
            <div className="bg-emerald-900/10 backdrop-blur-sm border-2 border-emerald-400/20 p-8 text-center mt-8 rounded-xl">
              <div className="text-6xl mb-4">🌲</div>
              <div className="text-forest-secondary font-medium mb-2">
                森には妖精がいません
              </div>
              <div className="text-forest-secondary text-sm">
                忘れ物をすると妖精が生まれます
              </div>
            </div>
          )}
        </div>

        {/* 妖精ステータスモーダル */}
        {selectedFairy && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedFairy(null)}
          >
            <div 
              className="bg-emerald-900/10 backdrop-blur-sm border-2 border-emerald-400/20 p-6 m-4 max-w-sm w-full rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">
                  {THING_EMOJI_MAP[selectedFairy.thingId] || '🧚‍♀️'}
                </div>
                <h3 className="text-xl font-bold text-forest-primary mb-4">
                  妖精の詳細
                </h3>
                
                <div className="space-y-3 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-forest-secondary font-medium">名前:</span>
                    <span className="text-forest-primary">{selectedFairy.thingType}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-forest-secondary font-medium">ランク:</span>
                    <span className="text-forest-primary">Lv.{selectedFairy.stage}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-forest-secondary font-medium">えさ回数:</span>
                    <span className="text-forest-primary">{selectedFairy.fedCount}回</span>
                  </div>
                  
                                     <div className="flex justify-between items-center">
                     <span className="text-forest-secondary font-medium">次の成長まで:</span>
                     <span className="text-forest-primary">
                       {selectedFairy.stage >= 100 ? '最大レベル' : `${5 - (selectedFairy.fedCount % 5)}回`}
                     </span>
                   </div>
                </div>
                
                <div className="mt-6 space-y-3">
                                     <Button
                     onClick={() => {
                       handleFeedMonster(selectedFairy.thingId);
                       // ステータスを更新
                       const newFedCount = (monsterFeed[selectedFairy.thingId]?.fed || 0) + 1;
                       setSelectedFairy({
                         ...selectedFairy,
                         fedCount: newFedCount,
                         stage: Math.min(Math.floor(newFedCount / 5), 100)
                       });
                     }}
                     disabled={feedInventory <= 0 || selectedFairy.stage >= 100}
                     className="w-full"
                   >
                     {selectedFairy.stage >= 100 ? '🌰 最大レベル達成！' : `🌰 えさをあげる (${feedInventory})`}
                   </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedFairy(null)}
                    className="w-full"
                  >
                    閉じる
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .forest-background {
            background: linear-gradient(to bottom, 
              #1a1a2e 0%, 
              #16213e 20%, 
              #0f3460 40%, 
              #0e4b99 60%, 
              #2d5aa0 80%, 
              #346751 100%);
          }
          
          .forest-layers {
            opacity: 0.8;
          }
          
          .forest-layer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background-repeat: repeat-x;
            background-position: bottom;
          }
          
          .forest-back {
            height: 50%;
            background: linear-gradient(to top, 
              #1a2f1a 0%, 
              #2d4b2d 30%, 
              transparent 100%);
            opacity: 0.6;
          }
          
          .forest-mid {
            height: 70%;
            background: linear-gradient(to top, 
              #0d1f0d 0%, 
              #1a331a 40%, 
              transparent 80%);
            opacity: 0.7;
          }
          
          .forest-front {
            height: 40%;
            background: linear-gradient(to top, 
              #061206 0%, 
              #0f1f0f 20%, 
              transparent 100%);
            opacity: 0.9;
          }
          
          .glass-card {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          }
          
          .fairy-container {
            position: relative;
            min-height: 600px;
            overflow: hidden;
          }
          
          .fairy-sprite {
            position: absolute;
            cursor: pointer;
            transition: transform 0.3s ease;
            animation: fairy-wander 16s ease-in-out infinite;
            z-index: 5;
          }
          
          .fairy-sprite:hover {
            transform: scale(1.2) !important;
          }
          
          .fairy-trail {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 60px;
            height: 60px;
            transform: translate(-50%, -50%);
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            border-radius: 50%;
            animation: trail-fade 2s ease-out infinite;
            pointer-events: none;
          }
          
          .fairy-glow {
            position: absolute;
            top: -15px;
            left: -15px;
            right: -15px;
            bottom: -15px;
            background: radial-gradient(circle, rgba(255, 223, 186, 0.5) 0%, transparent 70%);
            border-radius: 50%;
            animation: fairy-glow 3s ease-in-out infinite alternate;
          }
          
          .fairy-body {
            position: relative;
            text-align: center;
            padding: 10px;
            background: transparent;
            border-radius: 50%;
            border: none;
            box-shadow: none;
            cursor: pointer;
            transition: transform 0.2s ease;
          }
          
          .fairy-body:hover {
            transform: scale(1.1);
          }
          
          .fairy-wings {
            position: absolute;
            top: -8px;
            right: -8px;
            font-size: 14px;
            animation: fairy-wings 1.5s ease-in-out infinite alternate;
          }
          
          .fairy-info {
            position: absolute;
            top: -45px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          .fairy-sprite:hover .fairy-info {
            opacity: 1;
          }
          
          .feed-hint {
            position: absolute;
            top: 65px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            color: #2d5016;
            background: rgba(255, 255, 255, 0.95);
            padding: 4px 8px;
            border-radius: 12px;
            opacity: 0;
            transition: opacity 0.3s ease;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          
          .fairy-sprite:hover .feed-hint {
            opacity: 1;
          }
          
          /* 蛍のエフェクト */
          .fireflies {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 3;
          }
          
          .firefly {
            position: absolute;
            width: 4px;
            height: 4px;
            background: #ffff99;
            border-radius: 50%;
            box-shadow: 0 0 10px #ffff99, 0 0 20px #ffff99, 0 0 30px #ffff99;
            animation: firefly-float 6s ease-in-out infinite;
            opacity: 0;
          }
          
          @keyframes fairy-wander {
            0% { 
              transform: translateX(0) translateY(0) rotate(0deg);
            }
            20% { 
              transform: translateX(calc(var(--wander-x) * 0.3)) translateY(calc(var(--wander-y) * -0.2)) rotate(5deg);
            }
            40% { 
              transform: translateX(calc(var(--wander-x) * 0.8)) translateY(calc(var(--wander-y) * -0.6)) rotate(-3deg);
            }
            60% { 
              transform: translateX(calc(var(--wander-x) * 0.5)) translateY(calc(var(--wander-y) * -0.8)) rotate(7deg);
            }
            80% { 
              transform: translateX(calc(var(--wander-x) * -0.4)) translateY(calc(var(--wander-y) * -0.3)) rotate(-2deg);
            }
            100% { 
              transform: translateX(0) translateY(0) rotate(0deg);
            }
          }
          
          @keyframes trail-fade {
            0% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.8); }
            50% { opacity: 0.1; transform: translate(-50%, -50%) scale(1.2); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
          }
          
          @keyframes fairy-glow {
            0% { opacity: 0.4; transform: scale(0.9); }
            100% { opacity: 0.7; transform: scale(1.1); }
          }
          
          @keyframes fairy-wings {
            0% { transform: rotate(-15deg) scale(0.8); }
            100% { transform: rotate(15deg) scale(1.2); }
          }
          
          @keyframes firefly-float {
            0% { 
              opacity: 0; 
              transform: translateY(0px) translateX(0px); 
            }
            10% { 
              opacity: 1; 
            }
            25% { 
              transform: translateY(-20px) translateX(10px); 
            }
            50% { 
              transform: translateY(-40px) translateX(-15px); 
            }
            75% { 
              transform: translateY(-20px) translateX(20px); 
            }
            90% { 
              opacity: 1; 
            }
            100% { 
              opacity: 0; 
              transform: translateY(0px) translateX(0px); 
            }
          }
          
          /* 森の装飾要素 */
          .forest-background::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
              radial-gradient(circle at 15% 85%, rgba(34, 139, 34, 0.4) 0%, transparent 60%),
              radial-gradient(circle at 85% 15%, rgba(34, 139, 34, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(34, 139, 34, 0.2) 0%, transparent 70%),
              radial-gradient(ellipse at 30% 70%, rgba(0, 100, 0, 0.1) 0%, transparent 80%);
            pointer-events: none;
          }
          
          /* 夜の星空効果 */
          .forest-background::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 40%;
            background-image: 
              radial-gradient(2px 2px at 20px 30px, #fff, transparent),
              radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
              radial-gradient(1px 1px at 90px 40px, #fff, transparent),
              radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
              radial-gradient(2px 2px at 160px 30px, #fff, transparent);
            background-repeat: repeat;
            background-size: 200px 100px;
            animation: stars-twinkle 4s ease-in-out infinite alternate;
            pointer-events: none;
          }
          
          @keyframes stars-twinkle {
            0% { opacity: 0.7; }
            100% { opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
