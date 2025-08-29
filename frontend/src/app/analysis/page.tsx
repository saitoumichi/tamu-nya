"use client";

import React, { useState, useEffect, useMemo } from "react";
// ✅ Fix: MainLayout は **default export** を想定してインポート
//    以前は `{ MainLayout }` の名前付きインポートだったため undefined になっていました。
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Chip } from "@/components/ui/chip";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";

interface ThingsRecord {
  id: string;
  category: string; // 例: "key" | "medicine" | "umbrella" | "wallet" | "smartphone"
  thingType: string; // 例: "家の鍵" / "常備薬" / "折りたたみ傘" など
  thingId: string; // 既存データ互換: "key" 等が入っている可能性あり
  title: string;
  content: string;
  details: string;
  difficulty: number;
  location: string;
  datetime: string;
  createdAt: string;
  situation?: string; // 追加: シチュエーション（下の候補から）
}

type TimeRange = "week" | "month";

export default function AnalysisPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedThingType, setSelectedThingType] = useState<string>("");
  const [selectedSituation, setSelectedSituation] = useState<string>("");
  const [thingsRecords, setThingsRecords] = useState<ThingsRecord[]>([]);
  const [baseFiltered, setBaseFiltered] = useState<ThingsRecord[]>([]);

  // ---- 定義: 期間 / カテゴリ / シチュエーション -------------------------
  const timeRanges = [
    { id: "week", name: "週間", emoji: "📅" },
    { id: "month", name: "月間", emoji: "📆" },
  ];

  // 要望: カテゴリから「物忘れ/予定忘れ/寝坊・遅刻」を削除
  const categories = [
    { id: "", name: "すべて", emoji: "🌟" },
    { id: "key", name: "鍵", emoji: "🔑" },
    { id: "medicine", name: "薬", emoji: "💊" },
    { id: "umbrella", name: "傘", emoji: "☔" },
    { id: "wallet", name: "財布", emoji: "👛" },
    { id: "smartphone", name: "スマホ", emoji: "📱" },
  ];

  // 追加: シチュエーション（要望リストを反映）
  const situations = [
    { id: "", name: "すべて", emoji: "🌟" },
    { id: "morning", name: "朝", emoji: "🌅" },
    { id: "home", name: "家", emoji: "🏠" },
    { id: "before-out", name: "外出前", emoji: "🚪" },
    { id: "hurry", name: "急いでた", emoji: "⏰" },
    { id: "rain", name: "雨", emoji: "🌧️" },
    { id: "work", name: "仕事", emoji: "💼" },
    { id: "school", name: "学校", emoji: "🎒" },
    // 以下は「カテゴリからは消したが状況としては使いたい」項目
    { id: "forget", name: "物忘れ", emoji: "🎒" },
    { id: "schedule-miss", name: "予定忘れ", emoji: "🗓️" },
    { id: "late", name: "寝坊・遅刻", emoji: "⏰" },
    { id: "other", name: "その他", emoji: "😊" },
  ];

  // ---- LocalStorageの読込＆同期 ----------------------------------------
  useEffect(() => {
    const loadRecords = () => {
      const raw = localStorage.getItem("thingsRecords");
      // ガード: JSON 破損時に落ちないように try/catch
      try {
        const records = raw ? (JSON.parse(raw) as ThingsRecord[]) : [];
        setThingsRecords(Array.isArray(records) ? records : []);
        setBaseFiltered(Array.isArray(records) ? records : []);
      } catch {
        setThingsRecords([]);
        setBaseFiltered([]);
      }
    };

    loadRecords();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "thingsRecords") loadRecords();
    };
    const handleCustomStorageChange = () => loadRecords();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("thingsRecordsChanged", handleCustomStorageChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("thingsRecordsChanged", handleCustomStorageChange as EventListener);
    };
  }, []);

  // ---- フィルタ（カテゴリ / 種類 / 状況） -------------------------------
  useEffect(() => {
    let filtered = [...thingsRecords];

    // カテゴリ（category or thingId のいずれかに一致させる：既存データ互換）
    if (selectedCategory !== "") {
      filtered = filtered.filter(
        (r) => r.category === selectedCategory || r.thingId === selectedCategory
      );
    }

    // 忘れたもの種類（thingType）
    if (selectedThingType !== "") {
      filtered = filtered.filter((r) => r.thingType === selectedThingType);
    }

    // シチュエーション（situation）
    if (selectedSituation !== "") {
      filtered = filtered.filter((r) => (r.situation || "") === selectedSituation);
    }

    setBaseFiltered(filtered);
  }, [selectedCategory, selectedThingType, selectedSituation, thingsRecords]);

  // ---- 期間フィルタ ------------------------------------------------------
  const timeFilteredRecords = useMemo(() => {
    const now = new Date();
    const lower = new Date(
      now.getTime() - (timeRange === "week" ? 7 : 30) * 24 * 60 * 60 * 1000
    );
    return baseFiltered.filter((r) => new Date(r.createdAt) >= lower);
  }, [baseFiltered, timeRange]);

  // ---- 週間データ（プログレスバー） -------------------------------------
  const weeklyData = useMemo(() => {
    const days = ["日", "月", "火", "水", "木", "金", "土"] as const;
    const arr = days.map((day) => ({ day, count: 0 }));
    timeFilteredRecords.forEach((r) => {
      const d = new Date(r.createdAt).getDay();
      arr[d].count++;
    });
    return arr;
  }, [timeFilteredRecords]);

  // Progress は 0-100 を渡す前提。最大値に対する割合に正規化
  const weeklyMaxCount = useMemo(
    () => Math.max(1, ...weeklyData.map((x) => x.count)),
    [weeklyData]
  );

  // ---- カテゴリの集計（円グラフ用） --------------------------------------
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

    // 表示は件数順
    return stats.sort((a, b) => b.count - a.count);
  }, [timeFilteredRecords]);

  // ---- 困った度ランキング --------------------------------------------------
  const difficultyRanking = useMemo(() => {
    const map = new Map<string, { sum: number; count: number }>();
    
    timeFilteredRecords.forEach((r) => {
      const key = r.category || r.thingId || "other";
      const difficulty = typeof r.difficulty === 'number' ? r.difficulty : 0;
      const existing = map.get(key);
      
      if (existing) {
        existing.sum += difficulty;
        existing.count += 1;
      } else {
        map.set(key, { sum: difficulty, count: 1 });
      }
    });

    const ranking = Array.from(map.entries())
      .map(([id, { sum, count }]) => {
        const cat = categories.find((c) => c.id === id);
        const name = cat?.name ?? "その他";
        const emoji = cat?.emoji ?? "📦";
        return { id, name, emoji, sum, count };
      })
      .filter(item => item.sum > 0) // 合計が0のカテゴリは除外
      .sort((a, b) => {
        // 合計困った度降順 → 件数降順 → 名前昇順
        if (b.sum !== a.sum) return b.sum - a.sum;
        if (b.count !== a.count) return b.count - a.count;
        return a.name.localeCompare(b.name, 'ja');
      });

    return ranking;
  }, [timeFilteredRecords, categories]);

  // ---- 1日平均・総数 -----------------------------------------------------
  const totalCount = timeFilteredRecords.length;
  const averagePerDay =
    timeRange === "week"
      ? (totalCount / 7).toFixed(1)
      : (totalCount / 30).toFixed(1);

  // ---- 月間カレンダー ----------------------------------------------------
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

  // ---- 円グラフ（シンプルSVG） -------------------------------------------
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

    // カラーパレット（必要に応じて増やせます）
    const colors = [
      "#60a5fa", // blue-400
      "#34d399", // emerald-400
      "#fbbf24", // amber-400
      "#f472b6", // pink-400
      "#a78bfa", // violet-400
      "#f87171", // red-400
      "#22d3ee", // cyan-400
      "#fb923c", // orange-400
    ];

    let angle = -Math.PI / 2; // 12時から開始
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

  // ---- 「忘れたもの種類」の候補をデータから抽出 ---------------------------
  const thingTypeOptions = useMemo(() => {
    const set = new Set<string>();
    thingsRecords.forEach((r) => r.thingType && set.add(r.thingType));
    return ["", ...Array.from(set)]; // 先頭は「すべて」
  }, [thingsRecords]);

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
              {timeRange === "week" ? "週間カテゴリー" : "月間カテゴリー"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 期間 */}
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

            {/* カテゴリ */}
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

            {/* 忘れたもの種類（thingType） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                忘れたもの種類
              </label>
              <div className="flex flex-wrap gap-2">
                {thingTypeOptions.map((type) => (
                  <Chip
                    key={type || "all"}
                    label={type === "" ? "すべて" : type}
                    emoji={type === "" ? "🌟" : "📦"}
                    selected={selectedThingType === type}
                    onClick={() => setSelectedThingType(type)}
                  />
                ))}
              </div>
            </div>

            {/* 追加: シチュエーション */}
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

        {/* サマリー統計（要望により「カテゴリ数」は削除） */}
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

        {/* 期間別トレンド */}
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
                        {/* Progress は 0-100 を受け取る前提で正規化 */}
                        <Progress value={pct} />
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

        {/* カテゴリ別（円グラフ） */}
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
              <BarChart3 className="h-5 w-5 text-primary" />
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
                    <div className="flex items-center gap-4 text-right">
                      <div className="text-sm font-medium text-gray-900">
                        合計{item.sum}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.count}件
                      </div>
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

/*
====================================
🧪 Suggested Tests (Vitest + RTL)
====================================
// ファイル名例: AnalysisPage.test.tsx
// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
// MainLayout が外部依存のため最低限モック
vi.mock("@/components/layout/main-layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}));
vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <div>{children}</div>,
}));
vi.mock("@/components/ui/chip", () => ({ Chip: ({ label, onClick }: any) => <button onClick={onClick}>{label}</button> }));
vi.mock("@/components/ui/progress", () => ({ Progress: ({ value }: any) => <div aria-label="progress" data-value={value} /> }));

import AnalysisPage from "./AnalysisPage"; // 実ファイル名に合わせて変更

beforeEach(() => {
  localStorage.clear();
});

describe("AnalysisPage", () => {
  it("renders without crashing and shows layout", () => {
    render(<AnalysisPage />);
    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(screen.getByText("分析")).toBeInTheDocument();
  });

  it("shows 'データがありません。' when no records", () => {
    render(<AnalysisPage />);
    expect(screen.getByText("データがありません。")).toBeInTheDocument();
  });

  it("normalizes weekly progress value to 0-100", () => {
    const now = Date.now();
    const records = [
      { id: "1", category: "key", thingType: "家の鍵", thingId: "key", title: "", content: "", details: "", difficulty: 1, location: "", datetime: "", createdAt: new Date(now).toISOString() },
      { id: "2", category: "key", thingType: "家の鍵", thingId: "key", title: "", content: "", details: "", difficulty: 1, location: "", datetime: "", createdAt: new Date(now).toISOString() },
    ];
    localStorage.setItem("thingsRecords", JSON.stringify(records));
    render(<AnalysisPage />);
    // 最大件数に対して 100 になるバーが最低 1 本はあるはず
    const bars = screen.getAllByLabelText("progress");
    expect(bars.some((b) => Number(b.getAttribute("data-value")) === 100)).toBe(true);
  });

  it("filters by category when a category chip is clicked", async () => {
    const now = Date.now();
    const records = [
      { id: "1", category: "key", thingType: "家の鍵", thingId: "key", title: "", content: "", details: "", difficulty: 1, location: "", datetime: "", createdAt: new Date(now).toISOString() },
      { id: "2", category: "wallet", thingType: "財布", thingId: "wallet", title: "", content: "", details: "", difficulty: 1, location: "", datetime: "", createdAt: new Date(now).toISOString() },
    ];
    localStorage.setItem("thingsRecords", JSON.stringify(records));
    render(<AnalysisPage />);
    // カテゴリ chip をクリック（例: 鍵）
    const keyBtn = screen.getByRole("button", { name: "鍵" });
    keyBtn.click();
    // 円グラフの凡例に鍵が出る（財布の比率が 0 になる）想定
    expect(screen.getByText("鍵")).toBeInTheDocument();
  });
});
*/
