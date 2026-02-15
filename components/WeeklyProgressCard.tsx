"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  getQuizProgress,
  getWeekData,
  getWeekRangeLabel,
  getMonthData,
  getMonthRangeLabel,
  getTotalAnswers,
  getStreak,
  GOAL_COUNT,
  type ChartDataPoint,
} from "@/lib/quiz-progress";

const BAR_LIGHT = "#FEF08A";
const BAR_GOAL = "#FDE68A";

export function WeeklyProgressCard() {
  const [mode, setMode] = useState<"week" | "month">("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [rangeLabel, setRangeLabel] = useState("");
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const progress = getQuizProgress();
    setTotal(getTotalAnswers(progress));
    setStreak(getStreak(progress));
    if (mode === "week") {
      setData(getWeekData(weekOffset, progress));
      setRangeLabel(getWeekRangeLabel(weekOffset));
    } else {
      setData(getMonthData(monthOffset, progress));
      setRangeLabel(getMonthRangeLabel(monthOffset));
    }
  }, [mode, weekOffset, monthOffset, refreshKey]);

  useEffect(() => {
    const onFocus = () => setRefreshKey((k) => k + 1);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const handlePrev = () => {
    if (mode === "week") setWeekOffset((o) => o + 1);
    else setMonthOffset((o) => Math.min(o + 1, 11));
  };

  const handleNext = () => {
    if (mode === "week") setWeekOffset((o) => Math.max(0, o - 1));
    else setMonthOffset((o) => Math.max(0, o - 1));
  };

  const xDataKey = mode === "week" ? "label" : "shortLabel";
  const canGoNext = mode === "week" ? weekOffset > 0 : monthOffset > 0;

  return (
    <section
      className="rounded-2xl p-4 shadow-sm"
      style={{ backgroundColor: "#F8FAFC" }}
    >
      {/* セグメントコントロール */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex rounded-xl overflow-hidden bg-gray-200/80 p-0.5">
          <button
            type="button"
            onClick={() => setMode("week")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              mode === "week" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
            }`}
          >
            週間
          </button>
          <button
            type="button"
            onClick={() => setMode("month")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              mode === "month" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
            }`}
          >
            月間
          </button>
        </div>
      </div>

      {/* 期間表示 + 矢印 */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={handlePrev}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="前へ"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="text-sm font-medium text-gray-700">{rangeLabel}</span>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          className={`p-2 -mr-2 rounded-full transition-colors ${
            canGoNext ? "text-gray-500 hover:text-gray-700 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed"
          }`}
          aria-label="次へ"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* グラフ */}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey={xDataKey}
              tick={{ fontSize: 10, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
              interval={mode === "month" ? "preserveStartEnd" : 0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              domain={[0, 50]}
            />
            <Tooltip
              formatter={(value: number | undefined) => [`${value ?? 0} 問`, "解答数"]}
              labelFormatter={(_, payload) => {
                const p = payload?.[0]?.payload as ChartDataPoint | undefined;
                if (!p?.date) return "";
                const parts = p.date.split("-");
                return `${parts[1]}/${parts[2]}（${p.label}）`;
              }}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <ReferenceLine
              y={GOAL_COUNT}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={mode === "week" ? 36 : 12}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.count >= GOAL_COUNT ? BAR_GOAL : BAR_LIGHT}
                  opacity={entry.count === 0 ? 0.3 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* スタッツ */}
      <div className="flex justify-between gap-4 mt-4 pt-4 border-t border-gray-200/80">
        <div>
          <p className="text-xs text-gray-500">累計解答数</p>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">継続日数（Streak）</p>
          <p className="text-2xl font-bold text-gray-900">{streak} 日</p>
        </div>
      </div>
    </section>
  );
}
