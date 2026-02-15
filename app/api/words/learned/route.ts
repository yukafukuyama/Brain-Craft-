import { NextResponse } from "next/server";
import { jsonUtf8 } from "@/lib/api-response";
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

  const isThisWeek = (learnedAtStr: string): boolean => {
    const match = learnedAtStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return false;
    const [, y, m, d] = match;
    const learnedDate = new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0, 0);
    return learnedDate >= startOfWeek;
  };
  const thisWeekCount = words.filter((w) => w.learnedAt && isThisWeek(w.learnedAt)).length;

  return jsonUtf8({
    words: withFormatted,
    stats: { thisWeekCount, totalCount: words.length },
  });
}
