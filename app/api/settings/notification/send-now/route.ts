import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getWords } from "@/lib/words-store";
import { sendPushMessage } from "@/lib/line-messaging";

export async function POST() {
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

  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!channelAccessToken) {
    return NextResponse.json({ error: "LINE通知が設定されていません" }, { status: 500 });
  }

  const words = await getWords(session.lineId);
  if (words.length === 0) {
    return NextResponse.json({ error: "登録された単語がありません" }, { status: 400 });
  }

  const blocks = words.map((w) => {
    const parts = [`【${w.word}】`];
    if (w.meaning) parts.push(`意味: ${w.meaning}`);
    if (w.example) parts.push(`例文: ${w.example}`);
    if (w.question) parts.push(`問題: ${w.question}`);
    if (w.answer) parts.push(`答え: ${w.answer}`);
    return parts.join("\n");
  });
  const text = blocks.join("\n\n");

  const ok = await sendPushMessage(channelAccessToken, session.lineId, text);
  if (!ok) {
    return NextResponse.json({ error: "送信に失敗しました" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
