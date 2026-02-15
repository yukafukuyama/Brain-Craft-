import type { Word, WordType } from "./words";
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

export async function addWord(
  lineId: string,
  word: Omit<Word, "id"> & { type?: WordType; containedWords?: string[] }
): Promise<Word> {
  const data = await loadWords();
  const list = data[lineId] ?? [];
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const newWord: Word = {
    ...word,
    id,
    listName: word.listName?.trim() || DEFAULT_LIST_NAME,
    type: word.type ?? "word",
    containedWords: word.containedWords,
  };
  list.unshift(newWord);
  data[lineId] = list;
  await saveWords(data);
  return newWord;
}

export async function getWords(lineId: string): Promise<Word[]> {
  const data = await loadWords();
  return data[lineId] ?? [];
}

/** type でフィルタ（指定なしは全件） */
export async function getWordsByType(lineId: string, type?: WordType): Promise<Word[]> {
  const list = await getWords(lineId);
  if (!type) return list;
  return list.filter((w) => (w.type ?? "word") === type);
}

/** この単語を含むイディオム一覧 */
export async function getIdiomsContainingWord(lineId: string, wordText: string): Promise<Word[]> {
  const list = await getWords(lineId);
  const lower = wordText.trim().toLowerCase();
  if (!lower) return [];
  return list.filter((w) => {
    if ((w.type ?? "word") !== "idiom") return false;
    const cw = w.containedWords ?? w.word.split(/\s+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
    return cw.some((t) => t === lower);
  });
}

/** 単語テキストに完全一致する単語（type=word）を取得 */
export async function getWordByExactText(lineId: string, wordText: string): Promise<Word | null> {
  const list = await getWords(lineId);
  const lower = wordText.trim().toLowerCase();
  return list.find((w) => (w.type ?? "word") === "word" && w.word.trim().toLowerCase() === lower) ?? null;
}

export async function updateWord(
  lineId: string,
  wordId: string,
  updates: Partial<Pick<Word, "word" | "meaning" | "example" | "question" | "answer" | "listName" | "type" | "containedWords">>
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
  if (updates.type !== undefined) word.type = updates.type;
  if (updates.containedWords !== undefined) word.containedWords = updates.containedWords;
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

/** リストを削除：中の単語を未分類へ移動 */
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

/** リストを削除：中の単語もすべて削除 */
export async function deleteListAndWords(lineId: string, listName: string): Promise<number> {
  if (listName === DEFAULT_LIST_NAME) return 0;
  const data = await loadWords();
  const list = data[lineId] ?? [];
  const filtered = list.filter((w) => (w.listName?.trim() || DEFAULT_LIST_NAME) !== listName);
  const count = list.length - filtered.length;
  if (count > 0) {
    data[lineId] = filtered;
    await saveWords(data);
  }
  return count;
}

/** リスト名を変更 */
export async function renameList(
  lineId: string,
  oldName: string,
  newName: string
): Promise<boolean> {
  if (oldName === DEFAULT_LIST_NAME || newName === DEFAULT_LIST_NAME) return false;
  const trimmed = newName.trim();
  if (!trimmed || trimmed === oldName) return false;
  const data = await loadWords();
  const list = data[lineId] ?? [];
  let changed = false;
  for (const w of list) {
    if ((w.listName?.trim() || DEFAULT_LIST_NAME) === oldName) {
      w.listName = trimmed;
      changed = true;
    }
  }
  if (changed) await saveWords(data);
  return changed;
}
