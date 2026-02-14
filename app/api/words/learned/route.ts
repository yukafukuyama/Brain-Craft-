import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getLearnedWords } from "@/lib/words-store";

function formatLearnedAt(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const learned = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((today.getTime() - learned.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "今日";
  if (diffDays === 1) return "昨日";
  if (diffDays < 7) return `${diffDays}日前`;
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("braincraft_session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  }
  let session: { lineId: string };
  try {
    session = JSON.parse(sessionCookie);
  } catch {
    return NextResponse.json({ error: "セッションが無効です" }, { status: 401 });
  }

  const words = await getLearnedWords(session.lineId);
  const withFormatted = words.map((w) => ({
    ...w,
    learnedAtDisplay: w.learnedAt ? formatLearnedAt(w.learnedAt) : "",
  }));

  const now = new Date();
  const startOfWeek = new Date(now);
  const day = now.getDay();
  const daysToMonday = day === 0 ? 6 : day - 1;
  startOfWeek.setDate(now.getDate() - daysToMonday);
  startOfWeek.setHours(0, 0, 0, 0);
  const thisWeekCount = words.filter((w) => w.learnedAt && new Date(w.learnedAt) >= startOfWeek).length;

  return NextResponse.json({
    words: withFormatted,
    stats: { thisWeekCount, totalCount: words.length },
  });
}
