"use client";

import { useRouter } from "next/navigation";

export default function AuthSuccessPage() {
  const router = useRouter();

  const goHome = () => router.replace("/home");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-4 pt-6 pb-4 text-center">
        <h1 className="text-xl font-bold text-blue-600 tracking-wide flex items-center justify-center gap-2">
          <span>BRAINCRAFT</span>
          <span>🧠</span>
        </h1>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-4 max-w-lg mx-auto w-full">
        <h2 className="text-base text-gray-900 text-center mb-1">~ 最初のステップ ~</h2>
        <p className="text-xl font-bold text-gray-900 text-center mb-8">
          ブラウザで開いて
          <br />
          ホームに追加しよう!
        </p>

        {/* Step 1 */}
        <div className="w-full p-4 bg-gray-100 rounded-xl flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium flex items-center justify-center shrink-0">
              1
            </span>
            <span className="text-gray-900">お使いのブラウザで開く</span>
          </div>
          <div className="w-10 h-10 flex items-center justify-center text-blue-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </div>
        </div>

        {/* Step 2 header */}
        <div className="w-full flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium flex items-center justify-center shrink-0">
            2
          </span>
          <span className="text-gray-900">端末に合わせてホームに追加</span>
        </div>

        {/* iPhone & Android cards */}
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          {/* iPhone */}
          <div className="p-4 bg-gray-100 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <span className="text-xs font-medium text-gray-400 uppercase">IPHONE</span>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0">1</span>
                  <span className="text-sm text-gray-800">[共有] をタップ</span>
                </div>
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0">2</span>
                  <span className="text-sm text-gray-800">[追加] を選択</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
                  <span className="text-gray-500">+</span>
                  <span className="text-xs text-gray-600">ホーム画面に...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Android */}
          <div className="p-4 bg-gray-100 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
                <path d="M17.523 2.047a10.5 10.5 0 0 0-9.046 0 10.5 10.5 0 0 0-6.477 10.453 10.5 10.5 0 0 0 10.5 10.5 10.5 10.5 0 0 0 10.5-10.5 10.5 10.5 0 0 0-6.477-10.453z" />
              </svg>
              <span className="text-xs font-medium text-gray-400 uppercase">ANDROID</span>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0">1</span>
                  <span className="text-sm text-gray-800">[メニュー]をタップ</span>
                </div>
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#2563eb">
                    <circle cx="12" cy="6" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="18" r="1.5" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0">2</span>
                  <span className="text-sm text-gray-800">[追加] を選択</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-gray-500">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                  </svg>
                  <span className="text-xs text-gray-600">ホーム画面に...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={goHome}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors"
        >
          ホームへ進む
        </button>
      </main>
    </div>
  );
}
