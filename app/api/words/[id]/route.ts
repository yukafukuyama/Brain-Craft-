import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getWords, updateWord, deleteWord, getIdiomsContainingWord, getWordByExactText } from "@/lib/words-store";

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
  const isSingleWord = (word.type ?? "word") === "word";
  const idiomsContaining = isSingleWord ? await getIdiomsContainingWord(session.lineId, word.word) : [];
  const linkedWords = (word.type ?? "word") === "idiom" && word.containedWords?.length
    ? (await Promise.all(word.containedWords.map((t) => getWordByExactText(session.lineId, t)))).filter((w): w is NonNullable<typeof w> => w != null)
    : [];
  return NextResponse.json({
    ...word,
    idiomsContaining: idiomsContaining.map(({ id, word: w }) => ({ id, word: w })),
    linkedWords: linkedWords.map(({ id, word: w }) => ({ id, word: w })),
  });
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
  const wordText = String(body.word ?? "").trim();
  const meaning = String(body.meaning ?? "").trim();
  const example = String(body.example ?? "").trim();
  const question = String(body.question ?? "").trim();
  const answer = String(body.answer ?? "").trim();
  const listName = String(body.listName ?? "").trim();
  const type = body.type === "idiom" ? ("idiom" as const) : undefined;
  const containedWords = Array.isArray(body.containedWords)
    ? body.containedWords.filter((s: unknown) => typeof s === "string" && s.trim()).map((s: string) => s.trim())
    : undefined;

  if (!wordText) {
    return NextResponse.json({ error: "単語を入力してください" }, { status: 400 });
  }

  const updates: Parameters<typeof updateWord>[2] = {
    word: wordText,
    meaning,
    example,
    question: question || undefined,
    answer: answer || undefined,
    listName: listName || undefined,
  };
  if (type !== undefined) updates.type = type;
  if (containedWords !== undefined) updates.containedWords = containedWords;

  const ok = await updateWord(session.lineId, wordId, updates);
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
