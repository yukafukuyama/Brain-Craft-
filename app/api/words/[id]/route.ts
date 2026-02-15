import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getWords, updateWord, deleteWord } from "@/lib/words-store";

export async function GET(
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

  const words = await getWords(session.lineId);
  const word = words.find((w) => w.id === wordId);
  if (!word) {
    return NextResponse.json({ error: "単語が見つかりません" }, { status: 404 });
  }
  return NextResponse.json(word);
}

export async function PATCH(
  request: NextRequest,
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

  const body = await request.json();
  const word = String(body.word ?? "").trim();
  const meaning = String(body.meaning ?? "").trim();
  const example = String(body.example ?? "").trim();

  if (!word) {
    return NextResponse.json({ error: "単語を入力してください" }, { status: 400 });
  }

  const ok = await updateWord(session.lineId, wordId, { word, meaning, example });
  if (!ok) {
    return NextResponse.json({ error: "単語が見つかりません" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(
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

  const ok = await deleteWord(session.lineId, wordId);
  if (!ok) {
    return NextResponse.json({ error: "単語が見つかりません" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
