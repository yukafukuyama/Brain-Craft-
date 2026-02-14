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
  const updates: { enabled?: boolean; time?: string } = {};
  if (typeof enabled === "boolean") updates.enabled = enabled;
  if (body.time != null) {
    const time = String(body.time).trim();
    const match = time.match(/^(\d{1,2}):(\d{1,2})$/);
    if (match) {
      const h = Math.min(23, Math.max(0, parseInt(match[1], 10)));
      const m = Math.min(59, Math.max(0, parseInt(match[2], 10)));
      updates.time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
  }
  const settings = await setNotificationSettings(session.lineId, updates);
  return NextResponse.json(settings);
}
