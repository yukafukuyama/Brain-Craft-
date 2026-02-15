import { NextRequest, NextResponse } from "next/server";
import { jsonUtf8 } from "@/lib/api-response";
import { cookies } from "next/headers";
import { getWords, getWordsByType } from "@/lib/words-store";

export async function GET(request: NextRequest) {
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

  const type = request.nextUrl.searchParams.get("type") as "word" | "idiom" | null;
  const words = type ? await getWordsByType(session.lineId, type) : await getWords(session.lineId);
  return jsonUtf8({ words }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
