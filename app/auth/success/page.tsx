"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthSuccessPage() {
  const router = useRouter();

  const goHome = () => router.replace("/home");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-between px-4 pt-6 pb-4">
        <h1 className="text-lg font-bold text-blue-600 tracking-wide">BRAINCRAFT</h1>
        <button
          type="button"
          onClick={goHome}
          className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="閉じる"
        >
          <span className="text-4xl leading-none">×</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-8 max-w-lg mx-auto">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mb-4">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">ログイン完了</h2>
          <p className="text-gray-600">BrainCraftへようこそ</p>
        </div>

        <Link
          href="#add-to-home"
          className="text-blue-600 font-medium mb-6 text-lg"
        >
          ホーム画面に追加して始める
        </Link>

        <div className="w-full space-y-4">
          <div
            className="block w-full p-4 bg-gray-100 rounded-xl flex items-center justify-between pointer-events-none select-none"
          >
            <span className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-medium">1</span>
              <span className="text-gray-800">お使いのブラウザで開く</span>
            </span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </div>

          <div id="add-to-home" className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-100 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-500">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <span className="text-sm font-medium text-gray-500">IPHONE</span>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="inline-flex w-5 h-5 rounded-full bg-blue-600 text-white text-xs items-center justify-center mr-2">1</span>
                  <span className="text-sm text-blue-600 font-medium">[共有]をタップ</span>
                  <div className="mt-1 flex justify-center">
                    <div className="w-12 h-12 flex items-center justify-center text-blue-600">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="inline-flex w-5 h-5 rounded-full bg-blue-600 text-white text-xs items-center justify-center mr-2">2</span>
                  <span className="text-sm text-blue-600 font-medium">[ホーム画面に追加]を選択</span>
                  <div className="mt-1 px-3 py-2 bg-gray-200 rounded-lg text-xs text-gray-600 flex items-center gap-2">
                    <span className="text-lg">+</span>
                    ホーム画面に...
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-100 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-500">
                  <path d="M17.523 2.047a10.5 10.5 0 0 0-9.046 0 10.5 10.5 0 0 0-6.477 10.453 10.5 10.5 0 0 0 10.5 10.5 10.5 10.5 0 0 0 10.5-10.5 10.5 10.5 0 0 0-6.477-10.453z" />
                </svg>
                <span className="text-sm font-medium text-gray-500">ANDROID</span>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="inline-flex w-5 h-5 rounded-full bg-blue-600 text-white text-xs items-center justify-center mr-2">1</span>
                  <span className="text-sm text-blue-600 font-medium">[メニュー]をタップ</span>
                  <div className="mt-1 flex justify-center">
                    <div className="w-12 h-12 flex items-center justify-center text-blue-600">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="6" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="18" r="1.5" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="inline-flex w-5 h-5 rounded-full bg-blue-600 text-white text-xs items-center justify-center mr-2">2</span>
                  <span className="text-sm text-blue-600 font-medium">[ホーム画面に追加]を選択</span>
                  <div className="mt-1 px-3 py-2 bg-gray-200 rounded-lg text-xs text-gray-600 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                    </svg>
                    ホーム画面に...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={goHome}
          className="mt-8 w-full py-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          ホームへ進む
        </button>
      </main>
    </div>
  );
}
