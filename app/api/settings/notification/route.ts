import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getNotificationSettings,
  setNotificationSettings,
} from "@/lib/settings-store";

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
  const settings = await getNotificationSettings(session.lineId);
  return NextResponse.json(settings);
}

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
  const enabled = body.enabled;
  const updates: { enabled?: boolean; times?: string[]; idiomNotificationsEnabled?: boolean } = {};
  if (typeof enabled === "boolean") updates.enabled = enabled;
  if (typeof body.idiomNotificationsEnabled === "boolean") updates.idiomNotificationsEnabled = body.idiomNotificationsEnabled;
  if (Array.isArray(body.times)) {
    updates.times = body.times
      .map((t: unknown) => String(t ?? "").trim())
      .filter((t: string) => /^\d{1,2}:\d{1,2}$/.test(t))
      .map((t: string) => {
        const m = t.match(/^(\d{1,2}):(\d{1,2})$/);
        if (!m) return "";
        const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
        const min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
        return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
      })
      .filter(Boolean)
      .slice(0, 5);
  } else if (body.time != null) {
    const time = String(body.time).trim();
    const match = time.match(/^(\d{1,2}):(\d{1,2})$/);
    if (match) {
      const h = Math.min(23, Math.max(0, parseInt(match[1], 10)));
      const m = Math.min(59, Math.max(0, parseInt(match[2], 10)));
      updates.times = [`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`];
    }
  }
  const settings = await setNotificationSettings(session.lineId, updates);
  return NextResponse.json(settings);
}
