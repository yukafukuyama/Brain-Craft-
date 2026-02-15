/**
 * クイズの学習進捗を localStorage で管理
 * 日付ごとの解答数を永続記録。データ形式: { "2026-02-16": 35, "2026-02-15": 20 }
 */

const STORAGE_KEY = "braincraft_quiz_progress";
const GOAL_COUNT = 20;

export type QuizProgressData = Record<string, number>;

function getTodayKey(): string {
  const d = new Date();
  return toDateKey(d);
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** 指定日が属する週の日曜日 0:00 の Date（週は日曜始まり） */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** 指定週の日曜〜土曜の日付キーを生成 */
function getWeekDates(weekOffset: number): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisWeekStart = getWeekStart(today);
  const targetWeekStart = new Date(thisWeekStart);
  targetWeekStart.setDate(targetWeekStart.getDate() - weekOffset * 7);
  const result: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(targetWeekStart);
    d.setDate(d.getDate() + i);
    result.push(d);
  }
  return result;
}

/** 指定月の日付を取得（monthOffset: 0=今月, 1=先月） */
function getMonthDates(monthOffset: number): Date[] {
  const today = new Date();
  const target = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
  const year = target.getFullYear();
  const month = target.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const result: Date[] = [];
  for (let d = 1; d <= lastDay; d++) {
    result.push(new Date(year, month, d));
  }
  return result;
}

export function getQuizProgress(): QuizProgressData {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const result: QuizProgressData = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof k === "string" && typeof v === "number" && v >= 0) {
          result[k] = v;
        }
      }
      return result;
    }
  } catch {
    // ignore
  }
  return {};
}

export function saveQuizProgress(answersToAdd: number): void {
  if (typeof window === "undefined") return;
  const today = getTodayKey();
  const data = getQuizProgress();
  data[today] = (data[today] ?? 0) + answersToAdd;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function getTotalAnswers(data?: QuizProgressData): number {
  const d = data ?? getQuizProgress();
  return Object.values(d).reduce((a, b) => a + b, 0);
}

export function getStreak(data?: QuizProgressData): number {
  const d = data ?? getQuizProgress();
  let streak = 0;
  const date = new Date();
  for (let i = 0; i < 365; i++) {
    const key = toDateKey(date);
    const count = d[key] ?? 0;
    if (count > 0) {
      streak++;
    } else {
      break;
    }
    date.setDate(date.getDate() - 1);
  }
  return streak;
}

export type ChartDataPoint = { date: string; count: number; label: string; shortLabel?: string };

/** 週間データ（日曜〜土曜）。weekOffset: 0=今週, 1=先週, 2=先々週 */
export function getWeekData(weekOffset: number, data?: QuizProgressData): ChartDataPoint[] {
  const d = data ?? getQuizProgress();
  const dates = getWeekDates(weekOffset);
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
  return dates.map((date, i) => {
    const key = toDateKey(date);
    return {
      date: key,
      count: d[key] ?? 0,
      label: dayNames[i],
      shortLabel: dayNames[i],
    };
  });
}

/** 週の表示用ラベル（例: 2/9 - 2/15） */
export function getWeekRangeLabel(weekOffset: number): string {
  const dates = getWeekDates(weekOffset);
  const start = dates[0];
  const end = dates[6];
  return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`;
}

/** 月間データ（日別）。monthOffset: 0=今月, 1=先月 */
export function getMonthData(monthOffset: number, data?: QuizProgressData): ChartDataPoint[] {
  const d = data ?? getQuizProgress();
  const dates = getMonthDates(monthOffset);
  return dates.map((date) => {
    const key = toDateKey(date);
    return {
      date: key,
      count: d[key] ?? 0,
      label: `${date.getMonth() + 1}月${date.getDate()}日`,
      shortLabel: String(date.getDate()),
    };
  });
}

/** 月の表示用ラベル（例: 2026年2月） */
export function getMonthRangeLabel(monthOffset: number): string {
  const today = new Date();
  const target = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
  return `${target.getFullYear()}年${target.getMonth() + 1}月`;
}

/** @deprecated 後方互換。getWeekData(0) を使用 */
export function getLast7DaysData(data?: QuizProgressData): ChartDataPoint[] {
  return getWeekData(0, data);
}

export { GOAL_COUNT };
