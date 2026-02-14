import { NextRequest, NextResponse } from "next/server";
import { getUsersToNotify, markNotificationSent } from "@/lib/settings-store";
import { getWords } from "@/lib/words-store";
import { sendPushMessage } from "@/lib/line-messaging";

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
    const words = await getWords(lineId);

    if (words.length === 0) {
      await markNotificationSent(lineId, dateStr, timeStr);
      results.push({ lineId, ok: true });
      continue;
    }

    const recent = words.slice(0, 5);
    const blocks = recent.map((w) => {
      const parts = [`【${w.word}】`];
      if (w.meaning) parts.push(`意味: ${w.meaning}`);
      if (w.example) parts.push(`例文: ${w.example}`);
      return parts.join("\n");
    });
    const text =
      blocks.join("\n\n") +
      (words.length > 5 ? `\n\n他 ${words.length - 5} 件...` : "");

    const ok = await sendPushMessage(channelAccessToken, lineId, text);
    results.push({ lineId, ok });
    if (ok) {
      await markNotificationSent(lineId, dateStr, timeStr);
    }
  }

  return NextResponse.json({ sent: results.length, results });
}
