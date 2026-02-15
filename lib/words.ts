export const DEFAULT_LIST_NAME = "未分類";

import type { ContentLang } from "./content-lang";

export type WordType = "word" | "idiom";

export type Word = {
  id: string;
  word: string;
  meaning: string;
  example: string;
  question?: string;
  answer?: string;
  listName?: string;
  learnedAt?: string; // "今日" | "昨日" | "2024-10-24" etc.
  /** word=単語, idiom=イディオム */
  type?: WordType;
  /** イディオムの場合、構成する単語（例: "get back to" -> ["get","back","to"]） */
  containedWords?: string[];
  /** 例文・問題文の主言語。locale と一致する場合は（訳）を非表示 */
  contentLang?: ContentLang;
};

export const MOCK_WORDS: Word[] = [
  { id: "1", word: "Resilience", meaning: "回復力、弾力", example: "The community showed great resilience after the flood." },
  { id: "2", word: "Incentive", meaning: "動機、刺激、奨励", example: "The government offers a tax incentive for new businesses." },
  { id: "3", word: "Versatile", meaning: "多才な、万能な", example: "He is a very versatile actor who can play any role." },
  { id: "4", word: "Ambiguous", meaning: "曖昧な、不明瞭な", example: "The ending of the movie was intentionally ambiguous." },
  { id: "5", word: "Pragmatic", meaning: "実用的な、現実的な", example: "We need to take a pragmatic approach to solve this issue." },
  { id: "6", word: "Acknowledge", meaning: "認める、承認する", example: "They finally acknowledged that the plan had failed." },
];

export const MOCK_LEARNED: Word[] = [
  { id: "7", word: "Persevere", meaning: "やり抜く、粘り強く取り組む", example: "", learnedAt: "今日" },
  { id: "4", word: "Ambiguous", meaning: "曖昧な、多義的な", example: "", learnedAt: "昨日" },
  { id: "8", word: "Meticulous", meaning: "細心の注意を払った", example: "", learnedAt: "10月24日" },
  { id: "9", word: "Resilient", meaning: "回復力のある", example: "" },
  { id: "2", word: "Incentive", meaning: "動機、刺激", example: "" },
  { id: "10", word: "Paradigm", meaning: "模範、理論的枠組み", example: "" },
];
