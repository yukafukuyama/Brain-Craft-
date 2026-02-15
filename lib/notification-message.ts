import type { Word } from "@/lib/words";

/**
 * LINE通知用のメッセージを生成
 * 単語・意味・例文のみ表示（問題・答えは含めない）
 */
export function buildNotificationMessage(words: Word[]): string {
  const blocks = words.map((w) => {
    const parts: string[] = [`✅${w.word}`];
    if (w.meaning) parts.push(`（意味）${w.meaning}`);
    if (w.example) {
      const idx = w.example.indexOf("（訳）");
      if (idx >= 0) {
        const examplePart = w.example.slice(0, idx).trim();
        const transPart = w.example.slice(idx + "（訳）".length).trim();
        if (examplePart) parts.push(`（例文）${examplePart}`);
        if (transPart) parts.push(`（訳）${transPart}`);
      } else {
        parts.push(`（例文）${w.example}`);
      }
    }
    return parts.join("\n");
  });
  return blocks.join("\n\n");
}
