import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getListNames } from "@/lib/words-store";
import { getListNotificationSettings } from "@/lib/list-settings-store";

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

  const listNames = await getListNames(session.lineId);
  const notifSettings = await getListNotificationSettings(session.lineId, listNames);
  const lists = listNames.map((name) => ({
    name,
    isNotificationEnabled: notifSettings[name] ?? true,
  }));
  return NextResponse.json({ lists }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
