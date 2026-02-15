import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeCodeForToken,
  decodeIdToken,
  parseStateForVerifier,
} from "@/lib/auth/line";

function getBaseUrl(request: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl && envUrl.startsWith("http")) return envUrl.replace(/\/$/, "");
  const proto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host;
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = getBaseUrl(request);
  const redirectUri = `${baseUrl}/api/auth/line/callback`;

  if (error) {
    console.error("LINE auth error:", error, searchParams.get("error_description"));
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/?error=invalid_callback", request.url));
  }

  // codeVerifier: 1) state から取得（LINEアプリ内）、2) なければ Cookie から（スマホSafari等）
  let codeVerifier = parseStateForVerifier(state);
  if (!codeVerifier) {
    const cookieStore = await cookies();
    const savedState = cookieStore.get("line_oauth_state")?.value;
    const fromCookie = cookieStore.get("line_oauth_code_verifier")?.value;
    if (savedState === state && fromCookie) {
      codeVerifier = fromCookie;
    }
  }
  if (!codeVerifier) {
    return NextResponse.redirect(new URL("/?error=invalid_state", request.url));
  }

  const cookieStore = await cookies();
  cookieStore.set("line_oauth_state", "", { maxAge: 0, path: "/" });
  cookieStore.set("line_oauth_code_verifier", "", { maxAge: 0, path: "/" });

  const clientId = process.env.LINE_CHANNEL_ID;
  const clientSecret = process.env.LINE_CHANNEL_SECRET;

  if (!clientId || !clientSecret) {
    console.error("LINE credentials not configured");
    return NextResponse.redirect(new URL("/?error=config", request.url));
  }

  try {
    const tokens = await exchangeCodeForToken({
      code,
      redirectUri,
      clientId,
      clientSecret,
      codeVerifier,
    });

    const profile = decodeIdToken(tokens.id_token);

    const session = JSON.stringify({
      lineId: profile.sub,
      name: profile.name || "ユーザー",
      picture: profile.picture,
      accessToken: tokens.access_token,
    });

    const isProd = process.env.NODE_ENV === "production";
    cookieStore.set("braincraft_session", session, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return NextResponse.redirect(new URL("/home", request.url));
  } catch (err) {
    console.error("LINE token exchange error:", err);
    return NextResponse.redirect(new URL("/?error=token_exchange", request.url));
  }
}
