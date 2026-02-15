import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  generatePKCE,
  buildAuthUrl,
  createStateWithVerifier,
} from "@/lib/auth/line";

function getBaseUrl(request: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl && envUrl.startsWith("http")) return envUrl.replace(/\/$/, "");
  const proto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host;
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const clientId = process.env.LINE_CHANNEL_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  const cookieStore = await cookies();

  // 重要：古いセッション・State を確実にクリアしてから新しい認証を開始
  cookieStore.set("line_oauth_state", "", { maxAge: 0, path: "/" });
  cookieStore.set("line_oauth_code_verifier", "", { maxAge: 0, path: "/" });

  const { codeVerifier, codeChallenge } = generatePKCE();
  const state = createStateWithVerifier(codeVerifier);

  const baseUrl = getBaseUrl(request);
  const redirectUri = `${baseUrl}/api/auth/line/callback`;

  const authUrl = buildAuthUrl({
    clientId,
    redirectUri,
    state,
    codeChallenge,
  });

  const isProd = process.env.NODE_ENV === "production";
  // PC・スマホ両対応：本番は SameSite=None（リダイレクト経由でCookie送信）、開発は lax
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
