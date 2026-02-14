import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  generatePKCE,
  generateState,
  buildAuthUrl,
} from "@/lib/auth/line";

export async function GET(request: NextRequest) {
  const clientId = process.env.LINE_CHANNEL_ID;
  if (!clientId) {
    // LINE未設定時：開発用にホームへ直接遷移（本番では .env.local を設定してください）
    return NextResponse.redirect(new URL("/home", request.url));
  }

  const { codeVerifier, codeChallenge } = generatePKCE();
  const state = generateState();

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
