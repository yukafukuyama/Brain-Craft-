/**
 * ローカル開発用：既存データの lineId で擬似ログイン
 * NODE_ENV=development のときのみ有効
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const DEV_LINE_ID = "U41171324e47ec0fd149fd94ce438a5f3";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "開発時のみ利用可能です" }, { status: 403 });
  }

  const session = JSON.stringify({
    lineId: DEV_LINE_ID,
    name: "開発ユーザー",
  });

  const cookieStore = await cookies();
  cookieStore.set("braincraft_session", session, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return NextResponse.redirect(new URL("/home", request.url));
}
