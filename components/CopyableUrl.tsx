"use client";

import { useState, useEffect } from "react";

type CopyableUrlProps = {
  /** true = フルURL, false = originのみ（デフォルト） */
  fullUrl?: boolean;
};

export function CopyableUrl({ fullUrl = false }: CopyableUrlProps = {}) {
  const [url, setUrl] = useState("http://localhost:3000");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(fullUrl ? window.location.href : window.location.origin);
    }
  }, [fullUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <code className="text-gray-600 bg-gray-100 px-2 py-1 rounded select-text">
        {url}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap"
      >
        {copied ? "コピーしました" : "コピー"}
      </button>
    </div>
  );
}
