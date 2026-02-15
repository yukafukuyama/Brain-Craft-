/**
 * セッションCookieの設定
 * ブラウザ/アプリ終了後もログイン状態を維持するため、
 * maxAge と expires を明示的に設定して永続Cookieにしています。
 * アプリを完全に閉じても、有効期限内（30日）であればログイン画面をスキップしてホームが表示されます。
 */

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30日

export function getSessionCookieOptions(isProd: boolean) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? "none" : "lax") as "lax" | "none",
    maxAge: SESSION_MAX_AGE_SECONDS,
    expires: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
    path: "/" as const,
  };
}
