import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getLanguage, setLanguage, type Locale } from "@/lib/settings-store";

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
  const language = await getLanguage(session.lineId);
  return NextResponse.json({ language });
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
  const lang = body.language === "en" ? "en" : body.language === "zh" ? "zh" : "ja";
  await setLanguage(session.lineId, lang as Locale);
  return NextResponse.json({ language: lang });
}
