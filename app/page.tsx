import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Logo } from "@/components/Logo";

export default async function SplashPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  // ログイン済みならホームへ自動リダイレクト
  if (!params.error) {
    const cookieStore = await cookies();
    const session = cookieStore.get("braincraft_session")?.value;
    if (session) {
      try {
        const data = JSON.parse(session);
        if (data?.lineId) redirect("/home");
      } catch {
        // パース失敗時はログイン画面を表示
      }
    }
  }
  const errorMessages: Record<string, string> = {
    config: "LINEログインの設定がありません。",
    invalid_state:
      "ログインに失敗しました。LINEアプリ内で開いている場合は、右上「…」→「ブラウザで開く」でSafariやChromeで開き直してから、もう一度お試しください。",
    invalid_callback:
      "認証に失敗しました。ブラウザで直接開くか、Cookieを有効にして再度お試しください。",
    token_exchange: "トークン取得に失敗しました。しばらく待ってからもう一度お試しください。",
    ACCESS_DENIED: "ログインがキャンセルされました。もう一度お試しください。",
  };
  const errorMsg = params.error ? errorMessages[params.error] || "エラーが発生しました。" : null;
  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-6 py-12 bg-white">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        {/* Logo & Title */}
        <div className="flex flex-col items-center text-center">
          <Logo size={160} className="mb-4" />
          <h1 className="text-5xl font-bold text-gray-800">BrainCraft</h1>
          <p className="text-sm text-gray-500 mt-1">学習</p>
        </div>

        {/* Tagline */}
        <p className="text-xl text-gray-700 text-center mt-16 leading-relaxed">
          覚えられない単語を、
          <br />
          日常の一部に！
        </p>

        {errorMsg && (
          <p className="mt-4 text-sm text-red-600 text-center">{errorMsg}</p>
        )}
        {/* LINE Login Button */}
        <p className="mt-12 text-sm text-gray-500">LINEアカウントが必要です</p>
        <Link
          href="/api/auth/line"
          className="mt-4 w-full max-w-sm flex items-center justify-center gap-3 bg-[#00c300] hover:bg-[#00a800] text-white font-bold py-4 px-8 rounded-full transition-colors"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
          </svg>
          LINEでログイン
        </Link>

        <details className="mt-8 w-full max-w-sm text-left">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
            うまくログインできない場合
          </summary>
          <ul className="mt-2 text-xs text-gray-600 space-y-1 pl-4 list-disc">
            <li>
              <strong>エラーになる場合</strong>：LINEアプリ内で開いていると失敗しやすいです。右上「…」→「ブラウザで開く」でSafariやChromeを選び、再度お試しください
            </li>
            <li>ブラウザのCookieを有効にしてください</li>
            <li>「Login to Vercel」と出る→管理者に連絡してください</li>
          </ul>
        </details>
      </div>

      {/* Footer */}
      <footer className="flex flex-col items-center gap-2 pt-8">
        <div className="flex gap-6 text-sm text-gray-500">
          <Link href="#" className="hover:text-gray-700">利用規約</Link>
          <Link href="#" className="hover:text-gray-700">プライバシーポリシー</Link>
        </div>
        <p className="text-xs text-gray-400">© 2024 BRAINCRAFT</p>
      </footer>
    </main>
  );
}
