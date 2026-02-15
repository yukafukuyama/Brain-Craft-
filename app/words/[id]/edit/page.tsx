"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function EditWordPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [listName, setListName] = useState("");
  const [newListName, setNewListName] = useState("");
  const [lists, setLists] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/words/${id}`)
      .then((res) => {
        if (res.status === 401) {
          router.replace("/");
          return null;
        }
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data) {
          setWord(data.word ?? "");
          setMeaning(data.meaning ?? "");
          setExample(data.example ?? "");
          setQuestion(data.question ?? "");
          setAnswer(data.answer ?? "");
          setListName(data.listName ?? "");
        } else {
          setError("単語が見つかりません");
        }
      })
      .catch(() => setError("読み込みに失敗しました"))
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    fetch("/api/lists")
      .then((res) => (res.ok ? res.json() : { lists: [] }))
      .then((data) => setLists(data.lists ?? []))
      .catch(() => setLists([]));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/words/${id}`, {
        method: "PATCH",
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
      if (res.ok) {
        router.push("/words");
      } else {
        setError(data.error || "保存に失敗しました");
      }
    } catch {
      setError("通信エラー");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("この単語を削除しますか？")) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/words/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/words");
      } else {
        const data = await res.json();
        setError(data.error || "削除に失敗しました");
      }
    } catch {
      setError("通信エラー");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/words" className="text-blue-600 underline">
          単語一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between border-b border-gray-200">
        <Link href="/words" className="text-blue-600 font-medium">
          キャンセル
        </Link>
        <h1 className="text-lg font-bold text-gray-900">単語を編集</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存する"}
        </button>
      </header>

      {/* Form */}
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">リスト</label>
            <div className="flex gap-2">
              <select
                value={newListName ? "" : (listName || "")}
                onChange={(e) => {
                  setListName(e.target.value);
                  setNewListName("");
                }}
                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">未分類</option>
                {lists.filter((l) => l !== "未分類").map((l) => (
                  <option key={l} value={l}>{l}</option>
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
            <div className="relative">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">意味</label>
            <input
              type="text"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">例文</label>
            <textarea
              value={example}
              onChange={(e) => setExample(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">問題</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="例: 回復力、弾力性を表す英単語は？"
              className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">答え</label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="例: Resilience"
              className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="w-full py-3 text-red-600 font-medium border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {deleting ? "削除中..." : "この単語を削除"}
            </button>
          </div>
        </div>
      </main>

      {/* Footer branding */}
      <footer className="py-8 flex flex-col items-center gap-2">
        <Logo size={48} />
        <p className="text-xs text-gray-400">BRAINCRAFT</p>
      </footer>
    </div>
  );
}
