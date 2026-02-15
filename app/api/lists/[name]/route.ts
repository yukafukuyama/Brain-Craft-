import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteListAndWords, renameList } from "@/lib/words-store";
import {
  setListNotificationEnabled,
  renameListSettings,
  deleteListSettings,
} from "@/lib/list-settings-store";
import { DEFAULT_LIST_NAME } from "@/lib/words";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name: listName } = await params;
  const decodedName = decodeURIComponent(listName);

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

  const body = await request.json().catch(() => ({}));
  const enabled = body.enabled ?? body.isNotificationEnabled;
  const newName = typeof body.newName === "string" ? body.newName.trim() : undefined;

  if (newName !== undefined) {
    if (!newName || newName === decodedName) {
      return NextResponse.json({ error: "新しいリスト名を入力してください" }, { status: 400 });
    }
    if (newName === DEFAULT_LIST_NAME) {
      return NextResponse.json({ error: "そのリスト名は使用できません" }, { status: 400 });
    }
    const ok = await renameList(session.lineId, decodedName, newName);
    if (ok) await renameListSettings(session.lineId, decodedName, newName);
  }

  if (typeof enabled === "boolean") {
    const targetName = newName ?? decodedName;
    await setListNotificationEnabled(session.lineId, targetName, enabled);
  }

  return NextResponse.json({
    success: true,
    isNotificationEnabled: typeof enabled === "boolean" ? enabled : undefined,
    newName: newName ?? undefined,
  });
}

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

  const count = await deleteListAndWords(session.lineId, decodedName);
  await deleteListSettings(session.lineId, decodedName);
  return NextResponse.json({ success: true, deletedCount: count });
}
