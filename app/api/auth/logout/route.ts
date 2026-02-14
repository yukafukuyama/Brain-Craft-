import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.set("braincraft_session", "", { maxAge: 0, path: "/" });
  return NextResponse.redirect(new URL("/", request.url));
}
