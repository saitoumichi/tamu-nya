"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Trophy,
} from "lucide-react";

interface ThingsRecord {
  id: string;
  category: string;
  thingType: string;
  thingId: string;
  title: string;
  content?: string;
  details?: string;
  difficulty: number;
  location?: string;
  datetime?: string;
  createdAt: string;
  situation?: string;
  didForget?: boolean;
  categoryName?: string;
  categoryEmoji?: string;
}

type TimeRange = "week" | "month";

export default function AnalysisPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedThingType, setSelectedThingType] = useState<string>("");
  const [selectedSituation, setSelectedSituation] = useState<string>("");
  const [thingsRecords, setThingsRecords] = useState<ThingsRecord[]>([]);
  const [baseFiltered, setBaseFiltered] = useState<ThingsRecord[]>([]);

  const timeRanges = [
    { id: "week", name: "週間", emoji: "📅" },
    { id: "month", name: "月間", emoji: "📆" },
  ];

  const [customCategories, setCustomCategories] = useState<Array<{id: string, name: string, emoji: string}>>([]);

  const categories = useMemo(() => {
    // 入力されたデータからカテゴリを動的に生成
    const categoryMap = new Map<string, { id: string, name: string, emoji: string }>();
    
    // デフォルトカテゴリを追加
    categoryMap.set("", { id: "", name: "すべて", emoji: "🌟" });
    
    // 入力されたデータからカテゴリを抽出
    thingsRecords.forEach(record => {
      // カテゴリ情報がある場合
      if (record.categoryName && record.categoryEmoji) {
        const categoryId = record.category || record.thingId || 'unknown';
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            id: categoryId,
            name: record.categoryName,
            emoji: record.categoryEmoji
          });
        }
      }
      // カテゴリ情報がない場合でも、カテゴリIDが存在する場合は処理
      else if (record.category || record.thingId) {
        const categoryId = record.category || record.thingId;
        if (!categoryMap.has(categoryId)) {
          // デフォルトの絵文字を設定
          let defaultEmoji = '📦';
          if (categoryId === 'key') defaultEmoji = '🔑';
          else if (categoryId === 'umbrella') defaultEmoji = '☂️';
          else if (categoryId === 'wallet') defaultEmoji = '👛';
          else if (categoryId === 'medicine') defaultEmoji = '💊';
          else if (categoryId === 'smartphone') defaultEmoji = '📱';
          else if (categoryId === 'homework') defaultEmoji = '📚';
          else if (categoryId === 'schedule') defaultEmoji = '🗓️';
          else if (categoryId === 'time') defaultEmoji = '⏰';
          
          categoryMap.set(categoryId, {
            id: categoryId,
            name: record.thingType || categoryId,
            emoji: defaultEmoji
          });
        }
      }
    });
    
    // カスタムカテゴリも追加
    customCategories.forEach(cat => {
      if (!categoryMap.has(cat.id)) {
        categoryMap.set(cat.id, cat);
      }
    });
    
    return Array.from(categoryMap.values());
  }, [thingsRecords, customCategories]);

  const [customThings, setCustomThings] = useState<Array<{id: string, name: string, emoji: string, categoryId: string}>>([]);

  const things = useMemo(() => {
    // 入力されたデータから「忘れたもの」を動的に生成
    const thingMap = new Map<string, { id: string, name: string, emoji: string, categoryId: string }>();
    
    // デフォルトの「すべて」を追加
    thingMap.set("", { id: "", name: "すべて", emoji: "🌟", categoryId: "" });
    
    // カスタム「忘れたもの」も追加（ただし「忘れなかった」は除外）
    customThings.forEach(thing => {
      if (thing.name !== '忘れなかった' && thing.id !== 'forget_not') {
        if (!thingMap.has(thing.id)) {
          thingMap.set(thing.id, thing);
        } else {
          // 既存の「忘れたもの」がある場合は、カスタムのものを優先
          thingMap.set(thing.id, thing);
        }
      }
    });
    
    const result = Array.from(thingMap.values());
    console.log('生成された「忘れたもの」配列:', result);
    console.log('生成された配列の詳細:', result.map(t => ({ id: t.id, name: t.name, emoji: t.emoji, categoryId: t.categoryId })));
    
    // 重複チェックの最終確認
    const duplicateIds = result.filter((item, index, self) => 
      self.findIndex(s => s.id === item.id) !== index
    );
    if (duplicateIds.length > 0) {
      console.warn('重複したIDが検出されました:', duplicateIds);
    }
    
    return result;
  }, [customThings]);

  const [customSituations, setCustomSituations] = useState<Array<{id: string, name: string, emoji: string}>>([]);

  const getDefaultSituationName = (situationId: string): string => {
    const nameMap: { [key: string]: string } = {
      "morning": "朝",
      "home": "家",
      "before-out": "外出前",
      "hurry": "急いでた",
      "rain": "雨",
      "work": "仕事",
      "school": "学校",
      "forget": "物忘れ",
      "schedule-miss": "予定忘れ",
      "late": "寝坊・遅刻",
      "other": "その他"
    };
    return nameMap[situationId] || situationId;
  };

  const getSituationEmoji = (situationName: string): string => {
    const emojiMap: { [key: string]: string } = {
      "朝": "🌅",
      "家": "🏠",
      "外出前": "🚪",
      "急いでた": "⏰",
      "雨": "🌧️",
      "仕事": "💼",
      "学校": "🎒",
      "物忘れ": "🎒",
      "予定忘れ": "🗓️",
      "寝坊・遅刻": "⏰",
      "その他": "😊"
    };
    return emojiMap[situationName] || "📋";
  };

  const situations = useMemo(() => {
    // 入力されたデータから「状況」を動的に生成
    const situationMap = new Map<string, { id: string, name: string, emoji: string }>();
    const nameMap = new Map<string, { id: string, name: string, emoji: string }>();
    
    // デフォルトの「すべて」を追加
    const allSituation = { id: "", name: "すべて", emoji: "🌟" };
    situationMap.set("", allSituation);
    nameMap.set("すべて", allSituation);
    
    // 入力されたデータから「状況」を抽出
    const processedSituations = new Set<string>();
    
    thingsRecords.forEach(record => {
      if (record.situation) {
        const situationIds = record.situation;
        
        // situationIdが配列の場合はすべての要素を処理
        if (Array.isArray(situationIds)) {
          situationIds.forEach(situationId => {
            if (typeof situationId === 'string' && !processedSituations.has(situationId)) {
              processedSituations.add(situationId);
              
              // 英語のIDを日本語に変換
              let displayName = getDefaultSituationName(situationId);
              let displayId = situationId;
              
              if (situationId === 'before_going_out') {
                displayName = '外出前';
                displayId = 'before-out';
              } else if (situationId === 'in_a_hurry') {
                displayName = '急いでた';
                displayId = 'hurry';
              }
              
              // 名前ベースで重複チェック
              if (!nameMap.has(displayName)) {
                const newSituation = {
                  id: displayId,
                  name: displayName,
                  emoji: getSituationEmoji(displayName)
                };
                situationMap.set(displayId, newSituation);
                nameMap.set(displayName, newSituation);
              } else {
                console.log('名前重複を検出（入力データ）:', { existing: nameMap.get(displayName), new: { displayId, displayName } });
              }
            }
          });
        } else if (typeof situationIds === 'string' && !processedSituations.has(situationIds)) {
          processedSituations.add(situationIds);
          
          // 英語のIDを日本語に変換
          let displayName = getDefaultSituationName(situationIds);
          let displayId = situationIds;
          
          if (situationIds === 'before_going_out') {
            displayName = '外出前';
            displayId = 'before-out';
          } else if (situationIds === 'in_a_hurry') {
            displayName = '急いでた';
            displayId = 'hurry';
          }
          
          // 名前ベースで重複チェック
          if (!nameMap.has(displayName)) {
            const newSituation = {
              id: displayId,
              name: displayName,
              emoji: getSituationEmoji(displayName)
            };
            situationMap.set(displayId, newSituation);
            nameMap.set(displayName, newSituation);
          } else {
            console.log('名前重複を検出（入力データ）:', { existing: nameMap.get(displayName), new: { displayId, displayName } });
          }
        }
      }
    });
    
    // カスタム「状況」も追加（重複チェックを強化）
    customSituations.forEach(situation => {
      // 名前ベースで重複チェック
      if (!nameMap.has(situation.name)) {
        situationMap.set(situation.id, situation);
        nameMap.set(situation.name, situation);
      } else {
        console.log('名前重複を検出（カスタム）:', { existing: nameMap.get(situation.name), new: situation });
      }
    });
    
    const result = Array.from(situationMap.values());
    console.log('生成された「状況」配列:', result);
    console.log('「状況」の詳細:', result.map(s => ({ id: s.id, name: s.name, emoji: s.emoji })));
    
    // 最終的な重複チェックと除去
    const uniqueResult = result.filter((item, index, self) => {
      const firstIndex = self.findIndex(s => s.id === item.id);
      if (firstIndex !== index) {
        console.log('重複IDを除去:', { item, firstIndex, index });
        return false;
      }
      return true;
    });
    
    console.log('重複除去後の「状況」配列:', uniqueResult);
    console.log('重複除去後の詳細:', uniqueResult.map(s => ({ id: s.id, name: s.name, emoji: s.emoji })));
    
    return uniqueResult;
  }, [thingsRecords, customSituations]);

  useEffect(() => {
    const loadRecords = () => {
      const raw = localStorage.getItem("thingsRecords");
      try {
        const records = raw ? (JSON.parse(raw) as ThingsRecord[]) : [];
        // 「忘れたもの」のみをフィルタリング（didForget === true のもの）
        const forgottenRecords = Array.isArray(records) ? records.filter(r => r.didForget === true) : [];
        setThingsRecords(forgottenRecords);
        setBaseFiltered(forgottenRecords);
      } catch {
        setThingsRecords([]);
        setBaseFiltered([]);
      }
    };

    const loadCustomCategories = () => {
      const customCardsRaw = localStorage.getItem("customCards");
      try {
        if (customCardsRaw) {
          const customCards = JSON.parse(customCardsRaw);
          if (customCards.categories && Array.isArray(customCards.categories)) {
            setCustomCategories(customCards.categories);
          }
          if (customCards.things && Array.isArray(customCards.things)) {
            // 「忘れなかった」を除外してカスタム「忘れたもの」を設定
            const filteredThings = customCards.things.filter((thing: {name?: string, id?: string}) => 
              thing.name !== '忘れなかった' && 
              thing.id !== 'forget_not'
            );
            
            // カスタム「忘れたもの」のデータ構造を正しく変換
            const processedThings = filteredThings.map((thing: {id?: string, name?: string, emoji?: string, categoryId?: string}) => ({
              id: thing.id || '',
              name: thing.name || '',
              emoji: thing.emoji || '📦', // デフォルト絵文字を設定
              categoryId: thing.categoryId || 'forget_things' // デフォルトカテゴリを設定
            }));
            
            // 重複を除外してカスタム「忘れたもの」を設定
            const uniqueThings = processedThings.filter((thing: {id?: string}, index: number, self: {id?: string}[]) => 
              index === self.findIndex(t => t.id === thing.id)
            );
            
            console.log('カスタム「忘れたもの」:', filteredThings);
            console.log('カスタム「忘れたもの」の詳細:', filteredThings.map((t: {id?: string, name?: string, emoji?: string}) => ({ id: t.id, name: t.name, emoji: t.emoji })));
            console.log('処理後のカスタム「忘れたもの」:', processedThings);
            console.log('重複除外後のカスタム「忘れたもの」:', uniqueThings);
            setCustomThings(uniqueThings);
          }
          if (customCards.situations && Array.isArray(customCards.situations)) {
            // 重複を除外してカスタム「状況」を設定
            const uniqueSituations = customCards.situations.filter((situation: {id?: string}, index: number, self: {id?: string}[]) => 
              index === self.findIndex(s => s.id === situation.id)
            );
            console.log('カスタム「状況」:', customCards.situations);
            console.log('重複除外後のカスタム「状況」:', uniqueSituations);
            setCustomSituations(uniqueSituations);
          }
        }
      } catch {
        setCustomCategories([]);
        setCustomThings([]);
        setCustomSituations([]);
      }
    };

    loadRecords();
    loadCustomCategories();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "thingsRecords") loadRecords();
      if (e.key === "customCards") loadCustomCategories();
    };
    const handleCustomStorageChange = () => {
      loadRecords();
      loadCustomCategories();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("thingsRecordsChanged", handleCustomStorageChange as EventListener);
    window.addEventListener("customCardsChanged", handleCustomStorageChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("thingsRecordsChanged", handleCustomStorageChange as EventListener);
      window.removeEventListener("customCardsChanged", handleCustomStorageChange as EventListener);
    };
  }, []);

  useEffect(() => {
    let filtered = [...thingsRecords];

    if (selectedCategory !== "") {
      filtered = filtered.filter(
        (r) => r.category === selectedCategory || r.thingId === selectedCategory
      );
    }

    if (selectedThingType !== "" && selectedThingType !== "すべて") {
      filtered = filtered.filter((r) => r.thingType === selectedThingType);
    }

    if (selectedSituation !== "") {
      filtered = filtered.filter((r) => (r.situation || "") === selectedSituation);
    }

    setBaseFiltered(filtered);
  }, [selectedCategory, selectedThingType, selectedSituation, thingsRecords]);

  const timeFilteredRecords = useMemo(() => {
    const now = new Date();
    const lower = new Date(
      now.getTime() - (timeRange === "week" ? 7 : 30) * 24 * 60 * 60 * 1000
    );
    return baseFiltered.filter((r) => new Date(r.createdAt) >= lower);
  }, [baseFiltered, timeRange]);

  const weeklyData = useMemo(() => {
    const days = ["日", "月", "火", "水", "木", "金", "土"] as const;
    const arr = days.map((day) => ({ day, count: 0 }));
    timeFilteredRecords.forEach((r) => {
      const d = new Date(r.createdAt).getDay();
      arr[d].count++;
    });
    return arr;
  }, [timeFilteredRecords]);

  const weeklyMaxCount = useMemo(
    () => Math.max(1, ...weeklyData.map((x) => x.count)),
    [weeklyData]
  );

  const categoryStats = useMemo(() => {
    const map = new Map<string, number>();
    timeFilteredRecords.forEach((r) => {
      const key = r.category || r.thingId || "other";
      map.set(key, (map.get(key) || 0) + 1);
    });

    const total = timeFilteredRecords.length;
    const stats = Array.from(map.entries()).map(([id, count]) => {
      const cat = categories.find((c) => c.id === id);
      const name = cat?.name ?? "その他";
      const emoji = cat?.emoji ?? "📦";
      const pct = total > 0 ? (count / total) * 100 : 0;
      return { id, name, emoji, count, pct };
    });

    return stats.sort((a, b) => b.count - a.count);
  }, [timeFilteredRecords, categories]);

// ---- 困った度ランキング --------------------------------------------------
const difficultyRanking = useMemo(() => {
  const map = new Map<string, { sum: number; count: number }>();

  timeFilteredRecords.forEach((r) => {
    const key = r.category || r.thingId || "other";
    const difficulty = typeof r.difficulty === "number" ? r.difficulty : 0;
    const prev = map.get(key) || { sum: 0, count: 0 };
    map.set(key, { sum: prev.sum + difficulty, count: prev.count + 1 });
  });

  const ranking = Array.from(map.entries())
    .map(([id, { sum, count }]) => {
      const cat = categories.find((c) => c.id === id);
      const name = cat?.name ?? "その他";
      const emoji = cat?.emoji ?? "📦";
      const avg = count > 0 ? sum / count : 0;

      // 互換目的：sum（main）とtotal（feature）の両方を持たせる
      return { id, name, emoji, sum, total: sum, count, avg };
    })
    .filter((x) => x.sum > 0)
    .sort(
      (a, b) =>
        b.sum - a.sum ||        // 合計困った度が大きい順
        b.count - a.count ||    // 件数が多い順
        a.name.localeCompare(b.name, "ja")
    );

  return ranking;
}, [timeFilteredRecords, categories]);

  const totalCount = timeFilteredRecords.length;
  const averagePerDay =
    timeRange === "week"
      ? (totalCount / 7).toFixed(1)
      : (totalCount / 30).toFixed(1);

  const monthGrid = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const daysInMonth = last.getDate();
    const startDay = first.getDay();

    const cells: (string | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(y, m, d).toISOString().slice(0, 10));
    }
    return cells;
  }, []);

  const getDateCount = (date: string) =>
    timeFilteredRecords.filter(
      (r) => new Date(r.createdAt).toISOString().slice(0, 10) === date
    ).length;

  const PieChart = ({
    data,
    size = 220,
    strokeWidth = 0,
  }: {
    data: { id: string; name: string; emoji: string; count: number; pct: number }[];
    size?: number;
    strokeWidth?: number;
  }) => {
    const total = data.reduce((s, d) => s + d.count, 0);
    const r = size / 2;
    const cx = r;
    const cy = r;

    const colors = [
      "#60a5fa",
      "#34d399",
      "#fbbf24",
      "#f472b6",
      "#a78bfa",
      "#f87171",
      "#22d3ee",
      "#fb923c",
    ];

    let angle = -Math.PI / 2;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {total === 0 ? (
          <circle cx={cx} cy={cy} r={r - strokeWidth / 2} fill="#f3f4f6" />
        ) : (
          data.map((d, i) => {
            const slice = (d.count / total) * Math.PI * 2;
            const x1 = cx + (r - strokeWidth / 2) * Math.cos(angle);
            const y1 = cy + (r - strokeWidth / 2) * Math.sin(angle);
            const x2 = cx + (r - strokeWidth / 2) * Math.cos(angle + slice);
            const y2 = cy + (r - strokeWidth / 2) * Math.sin(angle + slice);
            const largeArc = slice > Math.PI ? 1 : 0;
            const path = `
              M ${cx} ${cy}
              L ${x1} ${y1}
              A ${r - strokeWidth / 2} ${r - strokeWidth / 2} 0 ${largeArc} 1 ${x2} ${y2}
              Z
            `;
            angle += slice;
            return <path key={d.id || String(i)} d={path} fill={colors[i % colors.length]} />;
          })
        )}
      </svg>
    );
  };



  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">分析</h1>
            <p className="text-gray-600">忘れ物の傾向と統計</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Calendar className="h-5 w-5 text-primary" />
              {timeRange === "week" ? "週間カテゴリー" : "月間カテゴリー"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                    selected={timeRange === (range.id as TimeRange)}
                    onClick={() => setTimeRange(range.id as TimeRange)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Chip
                    key={c.id}
                    label={c.name}
                    emoji={c.emoji}
                    selected={selectedCategory === c.id}
                    onClick={() => setSelectedCategory(c.id)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                忘れたもの種類
              </label>
              <div className="flex flex-wrap gap-2">
                {things.map((thing) => (
                  <Chip
                    key={thing.id || "all"}
                    label={thing.name}
                    emoji={thing.emoji}
                    selected={thing.name === "すべて" ? selectedThingType === "" : selectedThingType === thing.name}
                    onClick={() => setSelectedThingType(thing.name === "すべて" ? "" : thing.name)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                状況（シチュエーション）
              </label>
              <div className="flex flex-wrap gap-2">
                {situations.map((s) => (
                  <Chip
                    key={s.id}
                    label={s.name}
                    emoji={s.emoji}
                    selected={selectedSituation === s.id}
                    onClick={() => setSelectedSituation(s.id)}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <TrendingUp className="h-5 w-5 text-primary" />
              {timeRange === "week" ? "週間トレンド" : "月間トレンド"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeRange === "week" ? (
              <div className="space-y-4">
                {weeklyData.map((d) => {
                  const pct = weeklyMaxCount > 0 ? (d.count / weeklyMaxCount) * 100 : 0;
                  return (
                    <div key={d.day} className="flex items-center gap-4">
                      <div className="w-12 text-sm font-medium text-gray-600">{d.day}</div>
                      <div className="flex-1">

                        <Progress value={pct} max={100} />
                      </div>
                      <div className="w-16 text-right text-sm font-medium text-gray-900">
                        {d.count}件
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-1 text-center">
                  {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
                    <div key={day} className="text-sm font-medium text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {monthGrid.map((date, idx) => (
                    <div
                      key={idx}
                      className={`aspect-square border rounded-lg p-1 text-xs ${
                        date ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100"
                      } ${date && getDateCount(date) > 0 ? "border-blue-300 bg-blue-50" : ""}`}
                    >
                      {date && (
                        <>
                          <div className="text-gray-900 font-medium">
                            {new Date(date).getDate()}
                          </div>
                          {getDateCount(date) > 0 && (
                            <div className="text-blue-600 font-bold text-center">
                              {getDateCount(date)}件
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <PieChartIcon className="h-5 w-5 text-primary" />
              {timeRange === "week" ? "週間カテゴリー（円グラフ）" : "月間カテゴリー（円グラフ）"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalCount === 0 ? (
              <div className="text-sm text-gray-500">データがありません。</div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-6">
                <PieChart data={categoryStats} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-1/2">
                  {categoryStats.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between border rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{c.emoji}</span>
                        <span className="text-sm font-medium text-gray-900">{c.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{c.count}件</div>
                        <div className="text-xs text-gray-500">{c.pct.toFixed(0)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>



        {/* 困った度ランキング */}

        <Card>
          <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900">
            <Trophy className="h-5 w-5 text-primary" />
            困った度ランキング
          </CardTitle>
          </CardHeader>
          <CardContent>
            {difficultyRanking.length === 0 ? (
              <div className="text-sm text-gray-500">データがありません。</div>
            ) : (
              <div className="space-y-3">
                {difficultyRanking.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 text-sm font-medium text-gray-600">
                        {index + 1}位
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.emoji}</span>
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">合計{item.sum}点</div>
                      <div className="text-xs text-gray-500">{item.count}件</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
