import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getWords } from "@/lib/words-store";
import { getListNotificationSettings } from "@/lib/list-settings-store";
import { getNotificationSettings } from "@/lib/settings-store";
import { sendPushMessage } from "@/lib/line-messaging";
import { buildNotificationMessage } from "@/lib/notification-message";

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

  const allWords = await getWords(session.lineId);
  const listNames = [...new Set(allWords.map((w) => w.listName?.trim() || "未分類"))];
  const notifSettings = await getListNotificationSettings(session.lineId, listNames);
  const notificationSettings = await getNotificationSettings(session.lineId);
  const idiomEnabled = notificationSettings.idiomNotificationsEnabled !== false;
  const words = allWords.filter((w) => {
    const listName = w.listName?.trim() || "未分類";
    if (!(notifSettings[listName] ?? true)) return false;
    if ((w.type ?? "word") === "idiom" && !idiomEnabled) return false;
    return true;
  });

  if (words.length === 0) {
    const msg =
      allWords.length > 0
        ? "通知ONのリストに単語がありません。設定でリストの通知をONにしてください。"
        : "登録された単語がありません";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const text = buildNotificationMessage(words);

  const ok = await sendPushMessage(channelAccessToken, session.lineId, text);
  if (!ok) {
    return NextResponse.json({ error: "送信に失敗しました" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
