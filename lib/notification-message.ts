import type { Locale } from "@/lib/settings-store";
import { filterTranslationLines } from "@/lib/content-lang";
import type { Word } from "@/lib/words";

/**
 * LINE通知用のメッセージを生成
 * 単語・意味・例文のみ表示（問題・答えは含めない）
 * locale を指定すると、言語一致時に（訳）を除去
 */
export function buildNotificationMessage(words: Word[], locale?: Locale): string {
  const blocks = words.map((w) => {
    const parts: string[] = [`✅${w.word}`];
    if (w.meaning) parts.push(`（意味）${w.meaning}`);
    const example = locale ? filterTranslationLines(w.example ?? "", locale, w.contentLang) : (w.example ?? "");
    if (example) {
      const idx = example.indexOf("（訳）");
      if (idx >= 0) {
        const examplePart = example.slice(0, idx).trim();
        const transPart = example.slice(idx + "（訳）".length).trim();
        if (examplePart) parts.push(`（例文）${examplePart}`);
        if (transPart) parts.push(`（訳）${transPart}`);
      } else {
        parts.push(`（例文）${example}`);
      }
    }
    return parts.join("\n");
  });
  return blocks.join("\n\n");
}
