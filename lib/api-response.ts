import { NextResponse } from "next/server";

/**
 * JSON response with explicit UTF-8 charset to prevent encoding issues
 * with Chinese, Japanese, and other Unicode characters.
 */
export function jsonUtf8(data: unknown, init?: { status?: number; headers?: HeadersInit }) {
  return new NextResponse(JSON.stringify(data), {
    status: init?.status ?? 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...init?.headers,
    },
  });
}
