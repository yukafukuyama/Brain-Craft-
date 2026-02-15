"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type QuizWord = {
  id: string;
  word: string;
  meaning: string;
  example?: string;
  question?: string;
  answer?: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speakWord(text: string, lang = "en-US") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function QuizTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listParam = searchParams.get("list") ?? "";
  const [status, setStatus] = useState<"loading" | "no-words" | "quiz" | "done">("loading");
  const [quizWords, setQuizWords] = useState<QuizWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const loadWords = useCallback(() => {
    fetch("/api/words")
      .then((res) => {
        if (res.status === 401) {
          router.replace("/");
          return { words: [] };
        }
        return res.json();
      })
      .then((data) => {
        const words = (data.words ?? []).filter((w: { learnedAt?: string }) => !w.learnedAt);
        const filtered = listParam
          ? words.filter((w: { listName?: string }) => {
              const wList = (w.listName ?? "").trim() || "未分類";
              return wList === listParam;
            })
          : words;
        if (filtered.length === 0) {
          setStatus("no-words");
          return;
        }
        setQuizWords(shuffle(filtered as QuizWord[]));
        setStatus("quiz");
        setCurrentIndex(0);
        setRevealed(false);
      })
      .catch(() => setStatus("no-words"));
  }, [router, listParam]);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  const currentWord = quizWords[currentIndex];
  const isLastCard = currentIndex === quizWords.length - 1;
  const total = quizWords.length;

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleNext = () => {
    if (isLastCard) {
      setStatus("done");
    } else {
      setCurrentIndex((i) => i + 1);
      setRevealed(false);
    }
  };

  const handleSpeak = () => {
    if (!currentWord) return;
    speakWord(currentWord.word);
  };

  return (
    <div className="min-h-screen bg-white px-4 pt-12 pb-20">
      <Link href="/quiz" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        問題に戻る
      </Link>

      {status === "loading" && (
        <p className="text-center text-gray-500 py-12">読み込み中...</p>
      )}

      {status === "no-words" && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">出題できる単語がありません。</p>
          <Link href="/quiz" className="text-blue-600 hover:underline">
            問題に戻る
          </Link>
        </div>
      )}

      {status === "quiz" && currentWord && (
        <div className="space-y-6 max-w-lg mx-auto">
          <p className="text-sm text-gray-500 text-center">
            {currentIndex + 1} / {total}
          </p>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm min-h-[200px] flex flex-col justify-between">
            <div className="space-y-4">
              {currentWord.question ? (
                <div className="space-y-2">
                  {currentWord.question.split("\n").map((line, i) => (
                    <p
                      key={i}
                      className={
                        line.startsWith("（訳）")
                          ? "text-sm text-gray-500"
                          : "text-lg font-medium text-gray-800"
                      }
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-lg font-medium text-gray-800">
                  意味: {currentWord.meaning}
                </p>
              )}

              {revealed && (
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <p className="text-xl font-bold text-blue-600">{currentWord.word}</p>
                  {currentWord.example && (
                    <p className="text-sm text-gray-600 italic">
                      {currentWord.example.split("\n")[0]}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleSpeak}
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="読み上げ"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>

              {!revealed ? (
                <button
                  type="button"
                  onClick={handleReveal}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                >
                  答えを表示
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                >
                  {isLastCard ? "完了" : "次へ"}
                </button>
              )}
            </div>
          </div>

          {revealed && !isLastCard && (
            <p className="text-center text-sm text-gray-500">
              次のカードへ進むには「次へ」をタップ
            </p>
          )}
        </div>
      )}

      {status === "done" && (
        <div className="text-center py-16 space-y-8 max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-gray-900">お疲れ様でした！</h2>
          <p className="text-gray-600">
            {total} 枚のカードを復習しました
          </p>
          <Link
            href="/quiz"
            className="inline-block w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
          >
            リスト一覧に戻る
          </Link>
        </div>
      )}
    </div>
  );
}

export default function QuizTestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white px-4 pt-12 pb-20">
          <Link href="/quiz" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            問題に戻る
          </Link>
          <p className="text-center text-gray-500 py-12">読み込み中...</p>
        </div>
      }
    >
      <QuizTestContent />
    </Suspense>
  );
}
