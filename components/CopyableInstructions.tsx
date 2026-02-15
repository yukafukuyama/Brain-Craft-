"use client";

import { useState } from "react";

type Props = {
  text: string;
  children: React.ReactNode;
};

export function CopyableInstructions({ text, children }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // フォールバック: テキストを選択してコピー促す
      const range = document.createRange();
      range.selectNodeContents(document.getElementById("copyable-instructions")!);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
    }
  };

  return (
    <div className="relative">
      <div
        id="copyable-instructions"
        className="select-text cursor-text [user-select:text] [-webkit-user-select:text]"
      >
        {children}
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="mt-2 text-xs text-blue-600 hover:text-blue-700 hover:underline"
      >
        {copied ? "コピーしました" : "指示をコピー"}
      </button>
    </div>
  );
}
