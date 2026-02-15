import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";
  // スマホSafariで削除されるよう、設定時と同じ path / sameSite / secure を指定
  cookieStore.set("braincraft_session", "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
  return NextResponse.redirect(new URL("/", request.url));
}
