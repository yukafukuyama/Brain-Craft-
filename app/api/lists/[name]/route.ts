import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteList } from "@/lib/words-store";
import { DEFAULT_LIST_NAME } from "@/lib/words";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name: listName } = await params;
  const decodedName = decodeURIComponent(listName);

  if (decodedName === DEFAULT_LIST_NAME) {
    return NextResponse.json({ error: "未分類は削除できません" }, { status: 400 });
  }

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

  const count = await deleteList(session.lineId, decodedName);
  return NextResponse.json({ success: true, movedCount: count });
}
