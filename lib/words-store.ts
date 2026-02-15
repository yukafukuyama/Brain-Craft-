import type { Word } from "./words";
import { DEFAULT_LIST_NAME } from "./words";
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
  const newWord: Word = { ...word, id, listName: word.listName?.trim() || DEFAULT_LIST_NAME };
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
  updates: Partial<Pick<Word, "word" | "meaning" | "example" | "question" | "answer" | "listName">>
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
  if (updates.listName !== undefined) word.listName = updates.listName?.trim() || DEFAULT_LIST_NAME;
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

export async function getListNames(lineId: string): Promise<string[]> {
  const words = await getWords(lineId);
  const names = new Set<string>([DEFAULT_LIST_NAME]);
  for (const w of words) {
    names.add(w.listName?.trim() || DEFAULT_LIST_NAME);
  }
  return Array.from(names).sort((a, b) => (a === DEFAULT_LIST_NAME ? -1 : a.localeCompare(b)));
}

export async function deleteList(lineId: string, listName: string): Promise<number> {
  if (listName === DEFAULT_LIST_NAME) return 0;
  const data = await loadWords();
  const list = data[lineId] ?? [];
  let count = 0;
  for (const w of list) {
    if ((w.listName?.trim() || DEFAULT_LIST_NAME) === listName) {
      w.listName = DEFAULT_LIST_NAME;
      count++;
    }
  }
  if (count > 0) await saveWords(data);
  return count;
}
