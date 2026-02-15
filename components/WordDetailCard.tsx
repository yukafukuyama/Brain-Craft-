"use client";

import Link from "next/link";
import { SafeHtml } from "@/components/SafeHtml";
import type { Word } from "@/lib/words";

type Props = {
  word: Word;
  onClose: () => void;
};

export function WordDetailCard({ word, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">{word.word}</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 -mr-2 -mt-1 text-gray-400 hover:text-gray-600 rounded-lg"
              aria-label="閉じる"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">意味</p>
            <p className="text-gray-800"><SafeHtml html={word.meaning} as="span" stripTags /></p>
          </div>

          {word.example && (
            <div>
              <p className="text-xs text-gray-500 mb-1">例文</p>
              <div className="text-gray-700 text-sm">
                <SafeHtml html={word.example} as="div" stripTags />
              </div>
            </div>
          )}

          {word.question && (
            <div>
              <p className="text-xs text-gray-500 mb-1">問題</p>
              <div className="text-gray-700 text-sm">
                {word.question.split("\n").map((line, i) => (
                  <p key={i} className={i > 0 ? "mt-1" : ""}>
                    <SafeHtml html={line} as="span" stripTags className={line.startsWith("（訳）") || line.startsWith("（日本語訳）") ? "text-gray-500" : ""} />
                  </p>
                ))}
              </div>
            </div>
          )}

          {word.answer && (
            <div>
              <p className="text-xs text-gray-500 mb-1">答え</p>
              <p className="text-gray-800 font-medium"><SafeHtml html={word.answer} as="span" stripTags /></p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Link
              href={`/words/${word.id}/edit`}
              className="flex-1 py-3 text-center bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700"
            >
              編集する
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-center bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
