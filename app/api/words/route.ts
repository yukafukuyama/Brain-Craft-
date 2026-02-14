import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getWords } from "@/lib/words-store";

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

  const words = await getWords(session.lineId);
  return NextResponse.json({ words });
}
