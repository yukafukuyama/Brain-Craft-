import type { Locale } from "./settings-store";

export type ContentLang = "ja" | "en" | "zh";

const HIRAGANA = /[\u3040-\u309F]/;
const KATAKANA = /[\u30A0-\u30FF]/;
const CJK = /[\u4E00-\u9FFF]/;
const LATIN = /[a-zA-Z]/;

/**
 * 入力単語からコンテンツ言語を推定する
 * - ひらがな・カタカナを含む → 日本語
 * - CJKのみ（漢字のみ）で locale=zh → 中国語
 * - CJKのみで locale≠zh → 日本語（漢字のみの単語）
 * - ラテン文字中心 → 英語
 */
export function detectContentLang(word: string, locale: Locale): ContentLang {
  const w = word.trim();
  if (!w) return "en";
  if (HIRAGANA.test(w) || KATAKANA.test(w)) return "ja";
  if (CJK.test(w) && !LATIN.test(w)) {
    return locale === "zh" ? "zh" : "ja";
  }
  return "en";
}

/** locale と contentLang が一致するか（訳を非表示にする条件） */
export function shouldHideTranslation(locale: Locale, contentLang?: ContentLang): boolean {
  if (!contentLang) return false;
  if (locale === "en") return false; // 英語選択時は常に 英語＋訳日本語 で表示
  return locale === contentLang;
}

/** zh選択＋ja単語のとき（日本語訳）を非表示（二重表示防止） */
export function shouldHideJtForZhJa(locale: Locale, contentLang?: ContentLang): boolean {
  return locale === "zh" && contentLang === "ja";
}

/**
 * 例文・問題文から、locale と contentLang が一致する場合に訳の行を除去
 * - （訳）: en コンテンツの日本語訳
 * - （日本語訳）: zh コンテンツの日本語訳
 * - （中文）: zh コンテンツ。locale=zh かつ contentLang=zh の場合は（日本語訳）のみ除去
 */
export function filterTranslationLines(
  text: string,
  locale: Locale,
  contentLang?: ContentLang
): string {
  const lines = text.split("\n");
  const filtered = lines.filter((line) => {
    const t = line.trim();
    if (shouldHideTranslation(locale, contentLang)) {
      if (locale === "ja" && contentLang === "ja") {
        return !t.startsWith("（訳）") && !t.startsWith("（日本語訳）");
      }
      // zh選択＋中国語単語時は（日本語訳）を残す：中国語例文・問題の日本語訳は学習に必要
      if (locale === "zh" && contentLang === "zh") {
        return true;
      }
      if (locale === "en" && contentLang === "en") {
        return !t.startsWith("（訳）") && !t.startsWith("（日本語訳）");
      }
    }
    if (shouldHideJtForZhJa(locale, contentLang)) {
      return !t.startsWith("（日本語訳）"); // zh選択＋ja単語時は（日本語訳）を非表示（二重防止）
    }
    return true;
  });
  return filtered.join("\n").trim();
}
