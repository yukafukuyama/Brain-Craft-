import type { Word } from "./words";
import { storageGet, storageSet } from "./storage";

const WORDS_KEY = "words";

async function loadWords(): Promise<Record<string, Word[]>> {
  const data = await storageGet<Record<string, Word[]>>(WORDS_KEY);
  return data ?? {};
}

async function saveWords(data: Record<string, Word[]>): Promise<void> {
  await storageSet(WORDS_KEY, data);
}

export async function addWord(lineId: string, word: Omit<Word, "id">): Promise<Word> {
  const data = await loadWords();
  const list = data[lineId] ?? [];
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const newWord: Word = { ...word, id };
  list.unshift(newWord);
  data[lineId] = list;
  await saveWords(data);
  return newWord;
}

export async function getWords(lineId: string): Promise<Word[]> {
  const data = await loadWords();
  return data[lineId] ?? [];
}

export async function updateWord(
  lineId: string,
  wordId: string,
  updates: Partial<Pick<Word, "word" | "meaning" | "example" | "question" | "answer">>
): Promise<boolean> {
  const data = await loadWords();
  const list = data[lineId] ?? [];
  const word = list.find((w) => w.id === wordId);
  if (!word) return false;
  if (updates.word !== undefined) word.word = updates.word;
  if (updates.meaning !== undefined) word.meaning = updates.meaning;
  if (updates.example !== undefined) word.example = updates.example;
  if (updates.question !== undefined) word.question = updates.question;
  if (updates.answer !== undefined) word.answer = updates.answer;
  await saveWords(data);
  return true;
}

export async function markWordAsLearned(lineId: string, wordId: string): Promise<boolean> {
  const data = await loadWords();
  const list = data[lineId] ?? [];
  const word = list.find((w) => w.id === wordId);
  if (!word) return false;
  const learnedDate = new Date().toISOString().slice(0, 10);
  word.learnedAt = learnedDate;
  await saveWords(data);
  return true;
}

export async function deleteWord(lineId: string, wordId: string): Promise<boolean> {
  const data = await loadWords();
  const list = data[lineId] ?? [];
  const idx = list.findIndex((w) => w.id === wordId);
  if (idx < 0) return false;
  list.splice(idx, 1);
  data[lineId] = list;
  await saveWords(data);
  return true;
}

export async function getLearnedWords(lineId: string): Promise<Word[]> {
  const list = await getWords(lineId);
  const learned = list.filter((w) => w.learnedAt).sort((a, b) => (b.learnedAt ?? "").localeCompare(a.learnedAt ?? ""));
  return learned;
}
