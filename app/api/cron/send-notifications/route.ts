import { NextRequest, NextResponse } from "next/server";
import { getUsersToNotify, markNotificationSent, getNotificationSettings, getLanguage } from "@/lib/settings-store";
import { getWords } from "@/lib/words-store";
import { getListNotificationSettings } from "@/lib/list-settings-store";
import { sendPushMessage } from "@/lib/line-messaging";
import { buildNotificationMessage } from "@/lib/notification-message";

// JST = UTC+9
function getJST(): { hour: number; minute: number; dateStr: string } {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const dateStr = jst.toISOString().slice(0, 10);
  return {
    hour: jst.getUTCHours(),
    minute: jst.getUTCMinutes(),
    dateStr,
  };
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!channelAccessToken) {
    return NextResponse.json({ error: "LINE_CHANNEL_ACCESS_TOKEN not set" }, { status: 500 });
  }

  const { hour, minute, dateStr } = getJST();
  const lineIds = await getUsersToNotify(hour, minute);

  const results: { lineId: string; ok: boolean }[] = [];
  const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  for (const lineId of lineIds) {
    const allWords = await getWords(lineId);
    const listNames = [...new Set(allWords.map((w) => w.listName?.trim() || "未分類"))];
    const notifSettings = await getListNotificationSettings(lineId, listNames);
    const notificationSettings = await getNotificationSettings(lineId);
    const idiomEnabled = notificationSettings.idiomNotificationsEnabled !== false;
    const words = allWords.filter((w) => {
      const listName = w.listName?.trim() || "未分類";
      if (!(notifSettings[listName] ?? true)) return false;
      if ((w.type ?? "word") === "idiom" && !idiomEnabled) return false;
      return true;
    });

    if (words.length === 0) {
      await markNotificationSent(lineId, dateStr, timeStr);
      results.push({ lineId, ok: true });
      continue;
    }

    const locale = await getLanguage(lineId);
    const text = buildNotificationMessage(words, locale);

    const ok = await sendPushMessage(channelAccessToken, lineId, text);
    results.push({ lineId, ok });
    if (ok) {
      await markNotificationSent(lineId, dateStr, timeStr);
    }
  }

  return NextResponse.json({
    sent: results.length,
    results,
    debug: { jst: { hour, minute }, timeStr, userCount: lineIds.length },
  });
}
