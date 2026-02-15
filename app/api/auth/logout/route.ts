import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";
  cookieStore.set("braincraft_session", "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    `${request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "")}://${request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host}`;
  const redirectUrl = `${baseUrl.replace(/\/$/, "")}/?logout=${Date.now()}`;
  const res = NextResponse.redirect(redirectUrl);
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  return res;
}
