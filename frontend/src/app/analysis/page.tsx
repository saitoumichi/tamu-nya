"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Chip } from "@/components/ui/chip";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Trophy,
} from "lucide-react";
import { debugApiClient } from '@/api/debug-client';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

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

// forgotten_itemの名前から絵文字を取得する関数
const getItemEmoji = (itemName: string): string => {
  const emojiMap: { [key: string]: string } = {
    '鍵': '🔑',
    '薬': '💊', 
    '傘': '☔',
    '財布': '👛',
    'スマホ': '📱',
    '予定': '📅',
    '遅刻': '⏰',
    '宿題': '📄',
    'その他': '😊'
  };
  return emojiMap[itemName] || '📦';
};

export default function AnalysisPage() {
  const { user, token } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedThingType, setSelectedThingType] = useState<string>("");
  const [selectedSituation, setSelectedSituation] = useState<string>("");
  const [thingsRecords, setThingsRecords] = useState<ThingsRecord[]>([]);
  const [baseFiltered, setBaseFiltered] = useState<ThingsRecord[]>([]);
  const [apiData, setApiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const timeRanges = [
    { id: "week", name: "週間", emoji: "📅" },
    { id: "month", name: "月間", emoji: "📆" },
  ];

  const [customCategories, setCustomCategories] = useState<Array<{id: string, name: string, emoji: string}>>([]);

  const categories = useMemo(() => {
    // より厳密な重複管理のため、名前+絵文字をキーとした一意マップを使用
    const uniqueCategories = new Map<string, { id: string, name: string, emoji: string }>();
    
    // 「すべて」は常に表示
    uniqueCategories.set("すべて🌟", { id: "", name: "すべて", emoji: "🌟" });
    
    // 入力されたデータからカテゴリを抽出
    console.log('分析処理対象レコード:', thingsRecords);
    
    thingsRecords.forEach(record => {
      console.log('処理中レコード:', { 
        category: record.category, 
        thingId: record.thingId, 
        categoryName: record.categoryName, 
        categoryEmoji: record.categoryEmoji,
        thingType: record.thingType
      });
      
      let categoryName = '';
      let categoryEmoji = '';
      let categoryId = '';
      
      // APIデータの場合、categoryName と categoryEmoji が設定されている
      if (record.categoryName && record.categoryEmoji) {
        categoryName = record.categoryName;
        categoryEmoji = record.categoryEmoji;
        categoryId = record.category || record.thingId || 'unknown';
      }
      // LocalStorageデータの場合の処理
      else if (record.category || record.thingId) {
        categoryId = record.category || record.thingId;
        categoryName = record.thingType || categoryId;
        
        // thingTypeから絵文字を推定
        if (record.thingType) {
          categoryEmoji = getItemEmoji(record.thingType);
        } else {
          // デフォルトの絵文字設定
          if (categoryId === 'key') categoryEmoji = '🔑';
          else if (categoryId === 'umbrella') categoryEmoji = '☔';
          else if (categoryId === 'wallet') categoryEmoji = '👛';
          else if (categoryId === 'medicine') categoryEmoji = '💊';
          else if (categoryId === 'smartphone') categoryEmoji = '📱';
          else if (categoryId === 'homework') categoryEmoji = '📄';
          else if (categoryId === 'schedule') categoryEmoji = '📅';
          else if (categoryId === 'time') categoryEmoji = '⏰';
          else categoryEmoji = '📦';
        }
      }
      
      // カテゴリ情報がある場合のみ追加
      if (categoryName && categoryEmoji) {
        const uniqueKey = `${categoryName}${categoryEmoji}`;
        if (!uniqueCategories.has(uniqueKey)) {
          uniqueCategories.set(uniqueKey, {
            id: categoryId,
            name: categoryName,
            emoji: categoryEmoji
          });
          console.log('カテゴリ追加:', { uniqueKey, categoryId, categoryName, categoryEmoji });
        }
      }
    });
    
    // カスタムカテゴリも追加
    customCategories.forEach(cat => {
      const uniqueKey = `${cat.name}${cat.emoji}`;
      if (!uniqueCategories.has(uniqueKey)) {
        uniqueCategories.set(uniqueKey, cat);
        console.log('カスタムカテゴリ追加:', { uniqueKey, cat });
      }
    });
    
    // 新しく作成されたカードが入力で使用された場合の処理
    if (typeof window !== 'undefined') {
      const customCardsRaw = localStorage.getItem("customCards");
      if (customCardsRaw) {
        try {
          const customCards = JSON.parse(customCardsRaw);
          if (customCards.categories && Array.isArray(customCards.categories)) {
            customCards.categories.forEach((cat: { id: string, name: string, emoji: string }) => {
              const uniqueKey = `${cat.name}${cat.emoji}`;
              if (!uniqueCategories.has(uniqueKey)) {
                uniqueCategories.set(uniqueKey, cat);
                console.log('カスタムカード（localStorage）カテゴリ追加:', { uniqueKey, cat });
              }
            });
          }
        } catch (error) {
          console.error('カスタムカードの読み込みエラー:', error);
        }
      }
    }
    
    // データが存在するカテゴリのみを返す
    const allCategories = Array.from(uniqueCategories.values());
    const categoriesWithData = allCategories.filter(cat => {
      if (cat.id === "") return true; // 「すべて」は常に表示
      return thingsRecords.some(record => 
        record.category === cat.id || record.thingId === cat.id
      );
    });
    
    // デバッグログ
    console.log('最終的なカテゴリ配列:', categoriesWithData);
    
    return categoriesWithData;
  }, [thingsRecords, customCategories]);

  const [customThings, setCustomThings] = useState<Array<{id: string, name: string, emoji: string, categoryId: string}>>([]);

  const things = useMemo(() => {
    // 入力されたデータから「忘れたもの」を動的に生成
    const thingMap = new Map<string, { id: string, name: string, emoji: string, categoryId: string }>();
    
    // 「すべて」は常に表示
    thingMap.set("", { id: "", name: "すべて", emoji: "🌟", categoryId: "" });
    
    // 入力されたデータから「忘れたもの」を抽出
    thingsRecords.forEach(record => {
      if (record.thingType) {
        const thingId = record.thingId || record.thingType;
        if (!thingMap.has(thingId)) {
          // デフォルトの絵文字を設定
          let defaultEmoji = '📦';
          if (thingId === 'key') defaultEmoji = '🔑';
          else if (thingId === 'umbrella') defaultEmoji = '☂️';
          else if (thingId === 'wallet') defaultEmoji = '👛';
          else if (thingId === 'medicine') defaultEmoji = '💊';
          else if (thingId === 'smartphone') defaultEmoji = '📱';
          else if (thingId === 'homework') defaultEmoji = '📚';
          else if (thingId === 'schedule') defaultEmoji = '🗓️';
          else if (thingId === 'time') defaultEmoji = '⏰';
          
          thingMap.set(thingId, {
            id: thingId,
            name: record.thingType,
            emoji: defaultEmoji,
            categoryId: record.category || 'forget_things'
          });
        }
      }
    });
    
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
    
    // 新しく作成されたカードが入力で使用された場合の処理
    // customCardsから直接「忘れたもの」を取得して追加
    if (typeof window !== 'undefined') {
      const customCardsRaw = localStorage.getItem("customCards");
      if (customCardsRaw) {
        try {
          const customCards = JSON.parse(customCardsRaw);
          if (customCards.things && Array.isArray(customCards.things)) {
            customCards.things.forEach((thing: { id: string, name: string, emoji: string, categoryId: string }) => {
              if (thing.name !== '忘れなかった' && thing.id !== 'forget_not') {
                if (!thingMap.has(thing.id)) {
                  thingMap.set(thing.id, {
                    id: thing.id,
                    name: thing.name,
                    emoji: thing.emoji || '📦',
                    categoryId: thing.categoryId || 'forget_things'
                  });
                }
              }
            });
          }
        } catch (error) {
          console.error('カスタムカードの読み込みエラー:', error);
        }
      }
    }
    
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
    
    // データが存在する「忘れたもの」のみを返す（「すべて」は除く）
    const thingsWithData = result.filter(thing => {
      if (thing.id === "") return true; // 「すべて」は常に表示
      return thingsRecords.some(record => 
        record.thingId === thing.id || record.thingType === thing.name
      );
    });
    
    return thingsWithData;
  }, [thingsRecords, customThings]);

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
    
    // 「すべて」は常に表示
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
    
    // カスタム「状況」も追加
    customSituations.forEach(situation => {
      // 名前ベースで重複チェック
      if (!nameMap.has(situation.name)) {
        situationMap.set(situation.id, situation);
        nameMap.set(situation.name, situation);
      } else {
        console.log('名前重複を検出（カスタム）:', { existing: nameMap.get(situation.name), new: situation });
      }
    });
    
    // 新しく作成されたカードが入力で使用された場合の処理
    // customCardsから直接「状況」を取得して追加
    if (typeof window !== 'undefined') {
      const customCardsRaw = localStorage.getItem("customCards");
      if (customCardsRaw) {
        try {
          const customCards = JSON.parse(customCardsRaw);
          if (customCards.situations && Array.isArray(customCards.situations)) {
            customCards.situations.forEach((situation: { id: string, name: string, emoji: string }) => {
              // 名前ベースで重複チェック
              if (!nameMap.has(situation.name)) {
                situationMap.set(situation.id, situation);
                nameMap.set(situation.name, situation);
              } else {
                console.log('名前重複を検出（カスタムカード）:', { existing: nameMap.get(situation.name), new: situation });
              }
            });
          }
        } catch (error) {
          console.error('カスタムカードの読み込みエラー:', error);
        }
      }
    }
    
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
    
    // データが存在する「状況」のみを返す（「すべて」は除く）
    const situationsWithData = uniqueResult.filter(situation => {
      if (situation.id === "") return true; // 「すべて」は常に表示
      return thingsRecords.some(record => {
        if (!record.situation) return false;
        const situationIds = record.situation;
        if (Array.isArray(situationIds)) {
          return situationIds.some(id => id === situation.id);
        } else {
          return situationIds === situation.id;
        }
      });
    });
    
    return situationsWithData;
  }, [thingsRecords, customSituations]);

  // APIからデータを取得
  const fetchAPIData = async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await debugApiClient.getForgottenItems();
      if (result.success && result.data) {
        setApiData(result.data);
        console.log('分析画面API取得データ:', result.data);
      }
    } catch (error) {
      console.error('分析画面API取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // APIデータを取得
    fetchAPIData();
  }, [user, token]);

  useEffect(() => {
    const loadRecords = () => {
      const raw = localStorage.getItem("thingsRecords");
      try {
        const records = raw ? (JSON.parse(raw) as ThingsRecord[]) : [];
        // 「忘れたもの」のみをフィルタリング（didForget === true のもの）
        const forgottenRecords = Array.isArray(records) ? records.filter(r => r.didForget === true) : [];
        

        // forgotten_itemの名前からカテゴリIDを取得する関数
        const getItemCategoryId = (itemName: string): string => {
          const categoryMap: { [key: string]: string } = {
            '鍵': 'key',
            '薬': 'medicine',
            '傘': 'umbrella', 
            '財布': 'wallet',
            'スマホ': 'smartphone',
            '予定': 'schedule',
            '遅刻': 'time',
            '宿題': 'homework',
            'その他': 'another'
          };
          return categoryMap[itemName] || 'other';
        };

        // APIデータをThingsRecord形式に変換
        const apiRecords: ThingsRecord[] = apiData.map((item: any, index: number) => {
          const forgottenItemName = item.forgotten_item || item.title || '忘れ物';
          const actualCategoryId = getItemCategoryId(forgottenItemName);
          const itemEmoji = getItemEmoji(forgottenItemName);
          
          return {
            id: `api_${item.id || index}`,
            category: actualCategoryId,  // forgotten_itemから推定したカテゴリID
            thingType: forgottenItemName,
            thingId: actualCategoryId,   // カテゴリIDをthingIdとして使用
            title: item.title || '',
            content: item.details || '',
            details: item.details || '',
            difficulty: item.difficulty || 3,
            location: item.location || '',
            datetime: item.datetime || item.created_at || new Date().toISOString(),
            createdAt: item.datetime || item.created_at || new Date().toISOString(),
            situation: Array.isArray(item.situation) ? item.situation.join(',') : (item.situation || ''),
            didForget: true,
            categoryName: forgottenItemName,  // forgotten_itemの名前をそのまま使用
            categoryEmoji: itemEmoji         // forgotten_itemから推定した絵文字
          };
        });

        console.log('分析画面API変換後データ:', apiRecords);

        // LocalStorageとAPIデータを統合
        const allRecords = [...forgottenRecords, ...apiRecords];
        setThingsRecords(allRecords);
        setBaseFiltered(allRecords);
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
  }, [apiData]); // apiDataが変更されたら再実行

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



  // 未認証の場合
  if (!user) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="forest-card p-8 rounded-xl text-center">
            <h2 className="text-2xl font-bold text-forest-primary mb-4">
              分析機能を使うにはログインが必要です
            </h2>
            <p className="text-forest-secondary mb-6">
              忘れ物の傾向を分析してみましょう。
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/login">
                <button className="forest-button px-6 py-2 rounded-lg">ログイン</button>
              </Link>
              <Link href="/register">
                <button className="forest-button px-6 py-2 rounded-lg">新規登録</button>
              </Link>
            </div>
          </div>
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
    <MainLayout>
      <div className="space-y-6">
        <div className="forest-card p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-forest-primary flex items-center gap-2">
                📊 分析
              </h1>
              <p className="text-forest-secondary">忘れ物の傾向と統計</p>
            </div>
          </div>
        </div>

        <div className="forest-card p-6 rounded-xl">
          <div className="mb-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-forest-primary">
              <Calendar className="h-5 w-5 text-forest-accent" />
              {timeRange === "week" ? "週間カテゴリー" : "月間カテゴリー"}
            </h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium forest-label mb-2">
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
              <label className="block text-sm font-medium forest-label mb-2">
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
              <label className="block text-sm font-medium forest-label mb-2">
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
              <label className="block text-sm font-medium forest-label mb-2">
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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="forest-card p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-forest-accent" />
              </div>
              <div>
                <p className="text-sm text-forest-secondary">総記録数</p>
                <p className="text-2xl font-bold text-forest-primary">{totalCount}</p>
              </div>
            </div>
          </div>

          <div className="forest-card p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-900/30 rounded-lg">
                <BarChart3 className="h-6 w-6 text-forest-accent" />
              </div>
              <div>
                <p className="text-sm text-forest-secondary">1日平均</p>
                <p className="text-2xl font-bold text-forest-primary">{averagePerDay}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="forest-card p-6 rounded-xl">
          <div className="mb-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-forest-primary">
              <TrendingUp className="h-5 w-5 text-forest-accent" />
              {timeRange === "week" ? "週間トレンド" : "月間トレンド"}
            </h2>
          </div>
          <div>
            {timeRange === "week" ? (
              <div className="space-y-4">
                {weeklyData.map((d) => {
                  const pct = weeklyMaxCount > 0 ? (d.count / weeklyMaxCount) * 100 : 0;
                  return (
                    <div key={d.day} className="flex items-center gap-4">
                      <div className="w-12 text-sm font-medium text-forest-secondary">{d.day}</div>
                      <div className="flex-1">

                        <Progress value={pct} max={100} />
                      </div>
                      <div className="w-16 text-right text-sm font-medium text-forest-primary">
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
                    <div key={day} className="text-sm font-medium text-forest-secondary py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {monthGrid.map((date, idx) => (
                    <div
                      key={idx}
                      className={`aspect-square border rounded-lg p-1 text-xs ${
                        date ? "bg-emerald-900/20 border-emerald-400/30" : "bg-emerald-900/10 border-emerald-400/20"
                      } ${date && getDateCount(date) > 0 ? "border-emerald-400 bg-emerald-900/30" : ""}`}
                    >
                      {date && (
                        <>
                          <div className="text-forest-primary font-medium">
                            {new Date(date).getDate()}
                          </div>
                          {getDateCount(date) > 0 && (
                            <div className="text-forest-accent font-bold text-center">
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
          </div>
        </div>

        <div className="forest-card p-6 rounded-xl">
          <div className="mb-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-forest-primary">
              <PieChartIcon className="h-5 w-5 text-forest-accent" />
              {timeRange === "week" ? "週間カテゴリー（円グラフ）" : "月間カテゴリー（円グラフ）"}
            </h2>
          </div>
          <div>
            {totalCount === 0 ? (
              <div className="text-sm text-forest-secondary">データがありません。</div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-6">
                <PieChart data={categoryStats} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-1/2">
                  {categoryStats.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between border-2 border-emerald-400/30 bg-emerald-900/20 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{c.emoji}</span>
                        <span className="text-sm font-medium text-forest-primary">{c.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-forest-primary">{c.count}件</div>
                        <div className="text-xs text-forest-secondary">{c.pct.toFixed(0)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>



        {/* 困った度ランキング */}

        <div className="forest-card p-6 rounded-xl">
          <div className="mb-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-forest-primary">
              <Trophy className="h-5 w-5 text-forest-accent" />
              困った度ランキング
            </h2>
          </div>
          <div>
            {difficultyRanking.length === 0 ? (
              <div className="text-sm text-forest-secondary">データがありません。</div>
            ) : (
              <div className="space-y-3">
                {difficultyRanking.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-2 border-emerald-400/30 bg-emerald-900/20 rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 text-sm font-medium text-forest-secondary">
                        {index + 1}位
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.emoji}</span>
                        <span className="text-sm font-medium text-forest-primary">{item.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-forest-primary">合計{item.sum}点</div>
                      <div className="text-xs text-forest-secondary">{item.count}件</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
