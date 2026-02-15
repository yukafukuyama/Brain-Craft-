"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { useLanguage } from "@/components/LanguageProvider";

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
  const { t } = useLanguage();
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
  const [aiGeneratedType, setAiGeneratedType] = useState<"word" | "idiom" | null>(null);

  useEffect(() => {
    fetch("/api/lists")
      .then((res) => (res.ok ? res.json() : { lists: [] }))
      .then((data) => setLists(data.lists ?? []))
      .catch(() => setLists([]));
  }, []);

  const handleAiGenerate = async () => {
    const trimmed = word.trim();
    if (!trimmed) {
      setError(t("home.enterWordFirst"));
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
        setError(data.error || t("home.generateFailed"));
        return;
      }
      setMeaning(data.meaning ?? "");
      setExample(data.example ?? "");
      if (generateQuiz) setQuestion(data.question ?? "");
      if (generateAnswer) setAnswer(data.answer ?? trimmed);
      setAiGeneratedType(data.type === "idiom" || data.type === "word" ? data.type : null);
    } catch {
      setError(t("home.networkError"));
    } finally {
      setGenerating(false);
    }
  };

  const handleRegister = async () => {
    setError("");
    if (!word.trim()) {
      setError(t("home.enterWord"));
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
          ...(aiGeneratedType && { type: aiGeneratedType }),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("home.registerFailed"));
        return;
      }
      setWord("");
      setMeaning("");
      setExample("");
      setQuestion("");
      setAnswer("");
      setNewListName("");
      setAiGeneratedType(null);
    } catch {
      setError(t("home.networkError"));
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
            <span>{t("home.title")}</span>
            <span className="text-2xl">🧠</span>
          </h1>
          <p className="text-sm text-gray-500">{t("home.tagline")}</p>
        </div>
      </header>

      {/* Form */}
      <main className="px-4 max-w-lg mx-auto">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("home.list")}</label>
            <div className="flex gap-2">
              <select
                value={newListName ? "" : listName}
                onChange={(e) => {
                  setListName(e.target.value);
                  setNewListName("");
                }}
                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t("home.uncategorized")}</option>
                {lists.filter((l) => l.name !== "未分類").map((l) => (
                  <option key={l.name} value={l.name}>{l.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder={t("home.newList")}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("home.word")}</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t("home.wordPlaceholder")}
                value={word}
                onChange={(e) => {
                  setWord(e.target.value);
                  setAiGeneratedType(null);
                }}
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
                    {t("home.generating")}
                  </>
                ) : (
                  <>{t("home.aiAutoFill")}</>
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
                {t("home.generateQuiz")}
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateAnswer}
                  onChange={(e) => setGenerateAnswer(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                {t("home.generateAnswer")}
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("home.meaning")}</label>
            <input
              type="text"
              placeholder={t("home.meaningPlaceholder")}
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("home.example")}</label>
            <textarea
              placeholder={t("home.examplePlaceholder")}
              value={example}
              onChange={(e) => setExample(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 resize-y min-h-[120px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("quiz.title")}</label>
            <textarea
              placeholder={t("home.questionPlaceholder")}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("home.answerLabel")}</label>
            <input
              type="text"
              placeholder={t("home.answerPlaceholder")}
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
            {loading ? t("home.registering") : t("home.registerWord")}
          </button>

          <Link
            href="/notification"
            className="w-full py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {t("home.notificationSetting")}
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
                {t("home.lineAddFriend")}
              </a>
              <p className="text-sm text-gray-600">
                {t("home.lineDescription")}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-2">
              {t("home.lineUnavailable")}
            </p>
          )}
        </div>
      </main>

      <BottomNav variant="3" />
    </div>
  );
}
