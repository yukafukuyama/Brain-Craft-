"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

const LINE_ADD_FRIEND_URL = (() => {
  const url = process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL?.trim();
  if (!url || !url.startsWith("https://line.me")) return "";
  return url;
})();

// スマホでLINEアプリを直接開くURL（line://）
const LINE_DEEP_LINK = LINE_ADD_FRIEND_URL
  ? LINE_ADD_FRIEND_URL.replace(/^https:\/\/line\.me\/R?\/?/, "line://")
  : "";

export default function HomePage() {
  const router = useRouter();
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [listName, setListName] = useState("");
  const [newListName, setNewListName] = useState("");
  const [lists, setLists] = useState<{ name: string; isNotificationEnabled: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateQuiz, setGenerateQuiz] = useState(true);
  const [generateAnswer, setGenerateAnswer] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/lists")
      .then((res) => (res.ok ? res.json() : { lists: [] }))
      .then((data) => setLists(data.lists ?? []))
      .catch(() => setLists([]));
  }, []);

  const handleAiGenerate = async () => {
    const trimmed = word.trim();
    if (!trimmed) {
      setError("先に単語を入力してください");
      return;
    }
    setError("");
    setGenerating(true);
    try {
      const res = await fetch("/api/words/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: trimmed,
          generateQuiz,
          generateAnswer,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "生成に失敗しました");
        return;
      }
      setMeaning(data.meaning ?? "");
      setExample(data.example ?? "");
      if (generateQuiz) setQuestion(data.question ?? "");
      if (generateAnswer) setAnswer(data.answer ?? trimmed);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setGenerating(false);
    }
  };

  const handleRegister = async () => {
    setError("");
    if (!word.trim()) {
      setError("単語を入力してください");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/words/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: word.trim(),
          meaning: meaning.trim(),
          example: example.trim(),
          question: question.trim(),
          answer: answer.trim(),
          listName: (newListName.trim() || listName || "").trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "登録に失敗しました");
        return;
      }
      setWord("");
      setMeaning("");
      setExample("");
      setQuestion("");
      setAnswer("");
      setNewListName("");
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>BrainCraft</span>
            <span className="text-2xl">🧠</span>
          </h1>
          <p className="text-sm text-gray-500">中々覚えられない単語を、日常の一部に！</p>
        </div>
      </header>

      {/* Form */}
      <main className="px-4 max-w-lg mx-auto">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">リスト</label>
            <div className="flex gap-2">
              <select
                value={newListName ? "" : listName}
                onChange={(e) => {
                  setListName(e.target.value);
                  setNewListName("");
                }}
                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">未分類</option>
                {lists.filter((l) => l.name !== "未分類").map((l) => (
                  <option key={l.name} value={l.name}>{l.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="新規リスト名"
                value={newListName}
                onChange={(e) => {
                  setNewListName(e.target.value);
                  if (e.target.value) setListName("");
                }}
                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">単語</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="例: Resilience または get back to（イディオム）"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={generating || !word.trim()}
                className="flex-shrink-0 px-4 py-3 bg-blue-100 text-blue-700 font-medium rounded-xl hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 min-w-[120px] justify-center"
              >
                {generating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" strokeOpacity="0.75" />
                    </svg>
                    生成中
                  </>
                ) : (
                  <>AIで自動入力</>
                )}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateQuiz}
                  onChange={(e) => setGenerateQuiz(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                問題を生成
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateAnswer}
                  onChange={(e) => setGenerateAnswer(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                答えを生成
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">意味</label>
            <input
              type="text"
              placeholder="例: 回復力、弾力性"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">例文</label>
            <textarea
              placeholder="例: She showed great resilience."
              value={example}
              onChange={(e) => setExample(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 resize-y min-h-[120px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">問題</label>
            <textarea
              placeholder="例: 回復力、弾力性を表す英単語は？"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">答え</label>
            <input
              type="text"
              placeholder="例: Resilience"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
          >
            {loading ? "登録中..." : "単語登録"}
          </button>

          <Link
            href="/notification"
            className="w-full py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            通知の時間を設定
          </Link>

          {LINE_ADD_FRIEND_URL ? (
            <div className="space-y-2">
              <a
                href={LINE_ADD_FRIEND_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (LINE_DEEP_LINK && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                    e.preventDefault();
                    window.location.href = LINE_DEEP_LINK;
                  }
                }}
                className="w-full py-4 bg-[#00c300] hover:bg-[#00a800] text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755z" />
                </svg>
                LINE通知の登録（友だち追加）
              </a>
              <p className="text-sm text-gray-600">
                友だち追加すると、単語登録時にLINEへ通知が届き、設定した時刻に復習通知が送られます。
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-2">
              LINE通知は Messaging API 設定後に利用できます
            </p>
          )}
        </div>
      </main>

      <BottomNav variant="3" />
    </div>
  );
}
