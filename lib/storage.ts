/**
 * ストレージ層
 * - 本番（Vercel）: Upstash Redis (KV_REST_API_URL が設定されている場合)
 * - ローカル: ファイルシステム
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");

async function getKv() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { kv } = await import("@vercel/kv");
    return kv;
  }
  return null;
}

export async function storageGet<T>(key: string): Promise<T | null> {
  const kv = await getKv();
  if (kv) {
    const v = await kv.get(key);
    return v as T | null;
  }
  try {
    const safeKey = key.replace(/:/g, "_");
    const path = join(DATA_DIR, `${safeKey}.json`);
    const data = await readFile(path, "utf-8");
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export async function storageSet(key: string, value: unknown): Promise<void> {
  const kv = await getKv();
  if (kv) {
    await kv.set(key, value);
    return;
  }
  await mkdir(DATA_DIR, { recursive: true });
  const safeKey = key.replace(/:/g, "_");
  const path = join(DATA_DIR, `${safeKey}.json`);
  await writeFile(path, JSON.stringify(value, null, 2));
}

export async function storageKeys(prefix: string): Promise<string[]> {
  const kv = await getKv();
  if (kv) {
    const keys = await kv.keys(`${prefix}*`);
    const re = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
    return keys.map((k) => String(k).replace(re, ""));
  }
  // ファイルの場合は簡易実装（ディレクトリ読み取り）
  try {
    const { readdir } = await import("fs/promises");
    const files = await readdir(DATA_DIR);
    const safePrefix = prefix.replace(/:/g, "_");
    return files
      .filter((f) => f.startsWith(safePrefix) && f.endsWith(".json"))
      .map((f) => f.slice(safePrefix.length, -5));
  } catch {
    return [];
  }
}
