import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { markWordAsLearned } from "@/lib/words-store";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: wordId } = await params;
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

  const ok = await markWordAsLearned(session.lineId, wordId);
  if (!ok) {
    return NextResponse.json({ error: "単語が見つかりません" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
