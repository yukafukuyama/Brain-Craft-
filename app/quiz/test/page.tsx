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

const QUIZ_COUNT = 5;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function QuizTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listParam = searchParams.get("list") ?? "";
  const [status, setStatus] = useState<"loading" | "no-words" | "quiz" | "done">("loading");
  const [quizWords, setQuizWords] = useState<QuizWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

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
        const picked = shuffle(filtered).slice(0, QUIZ_COUNT);
        setQuizWords(picked);
        setStatus("quiz");
        setCurrentIndex(0);
        setUserAnswer("");
        setResult(null);
        setCorrectCount(0);
      })
      .catch(() => setStatus("no-words"));
  }, [router, listParam]);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  const currentWord = quizWords[currentIndex];
  const isLastQuestion = currentIndex === quizWords.length - 1;

  const handleSubmit = () => {
    if (!currentWord || result !== null) return;
    const correct = currentWord.word.trim().toLowerCase() === userAnswer.trim().toLowerCase();
    setResult(correct);
    if (correct) setCorrectCount((c) => c + 1);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setStatus("done");
    } else {
      setCurrentIndex((i) => i + 1);
      setUserAnswer("");
      setResult(null);
    }
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
        <div className="space-y-6">
          <p className="text-sm text-gray-500">
            問題 {currentIndex + 1} / {quizWords.length}
          </p>

          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            {currentWord.question ? (
              <div className="space-y-1">
                {currentWord.question.split("\n").map((line, i) => (
                  <p
                    key={i}
                    className={line.startsWith("（訳）") ? "text-sm text-gray-500" : "text-lg font-medium text-gray-800"}
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
            {currentWord.example && (
              <p className="text-sm text-gray-600 italic">
                {currentWord.example.split("\n")[0]}
              </p>
            )}
          </div>

          {result === null ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">答えを入力</label>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="英単語を入力"
                  autoFocus
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!userAnswer.trim()}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl"
              >
                答え合わせ
              </button>
            </>
          ) : (
            <>
              <div
                className={`rounded-xl p-4 ${
                  result ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                }`}
              >
                <p className="font-bold">
                  {result ? "正解！" : "不正解"}
                </p>
                {!result && (
                  <p className="mt-1">正解: {currentWord.word}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
              >
                {isLastQuestion ? "結果を見る" : "次の問題"}
              </button>
            </>
          )}
        </div>
      )}

      {status === "done" && (
        <div className="text-center py-12 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">テスト結果</h2>
          <p className="text-2xl font-bold text-blue-600">
            {correctCount} / {QUIZ_COUNT} 問正解
          </p>
          <p className="text-gray-600">
            {correctCount === QUIZ_COUNT
              ? "全問正解！素晴らしい！"
              : `${QUIZ_COUNT - correctCount}問復習してみましょう。`}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/quiz"
              className="inline-block w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
            >
              もう一度テストする
            </Link>
            <Link href="/quiz" className="text-gray-600 hover:underline text-sm">
              問題に戻る
            </Link>
          </div>
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
