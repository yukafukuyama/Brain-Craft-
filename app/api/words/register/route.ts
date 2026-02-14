import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { addWord } from "@/lib/words-store";
import { sendPushMessage } from "@/lib/line-messaging";

export async function POST(request: NextRequest) {
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

  const body = await request.json();
  const word = String(body.word ?? "").trim();
  const meaning = String(body.meaning ?? "").trim();
  const example = String(body.example ?? "").trim();

  if (!word) {
    return NextResponse.json({ error: "単語を入力してください" }, { status: 400 });
  }

  let newWord;
  try {
    newWord = await addWord(session.lineId, { word, meaning, example });
  } catch (err) {
    console.error("Failed to save word:", err);
    return NextResponse.json(
      { error: "単語の保存に失敗しました" },
      { status: 500 }
    );
  }

  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (channelAccessToken) {
    const lines = [`【${word}】`];
    if (meaning) lines.push(`意味: ${meaning}`);
    if (example) lines.push(`例文: ${example}`);
    const message = lines.join("\n");
    await sendPushMessage(channelAccessToken, session.lineId, message);
  }

  return NextResponse.json({ success: true, word: newWord });
}
