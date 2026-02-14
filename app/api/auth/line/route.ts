import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  generatePKCE,
  buildAuthUrl,
  createStateWithVerifier,
} from "@/lib/auth/line";

export async function GET(request: NextRequest) {
  const clientId = process.env.LINE_CHANNEL_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  const { codeVerifier, codeChallenge } = generatePKCE();
  // state に codeVerifier を埋め込む（LINEアプリ内）＋ Cookie も設定（スマホSafari等のフォールバック）
  const state = createStateWithVerifier(codeVerifier);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    `${request.nextUrl.protocol}//${request.nextUrl.host}`;
  const redirectUri = `${baseUrl}/api/auth/line/callback`;

  const authUrl = buildAuthUrl({
    clientId,
    redirectUri,
    state,
    codeChallenge,
  });

  const isProd = process.env.NODE_ENV === "production";
  const cookieStore = await cookies();
  // 本番：LINEアプリ内・モバイルで Cookie が使えるよう SameSite=None
  cookieStore.set("line_oauth_state", state, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 60 * 10,
    path: "/",
  });
  cookieStore.set("line_oauth_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  return NextResponse.redirect(authUrl);
}
