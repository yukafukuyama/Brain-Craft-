/**
 * リストごとの設定を保持
 * isNotificationEnabled: デフォルト true（学習データは保持し、オフ時は通知対象から除外するだけ）
 */

import { storageGet, storageSet } from "./storage";

const LIST_SETTINGS_KEY = "list_settings";

export type ListSettings = {
  isNotificationEnabled: boolean;
};

type ListSettingsMap = Record<string, ListSettings>;
type UserListSettings = Record<string, ListSettingsMap>; // lineId -> listName -> settings

async function loadSettings(): Promise<UserListSettings> {
  const data = await storageGet<UserListSettings>(LIST_SETTINGS_KEY);
  return data ?? {};
}

async function saveSettings(data: UserListSettings): Promise<void> {
  await storageSet(LIST_SETTINGS_KEY, data);
}

/** リストの通知が有効か（未設定の場合は true） */
export async function getListNotificationEnabled(
  lineId: string,
  listName: string
): Promise<boolean> {
  const data = await loadSettings();
  const user = data[lineId];
  if (!user) return true;
  const settings = user[listName];
  if (!settings) return true;
  return settings.isNotificationEnabled ?? true;
}

/** リストの通知設定を更新 */
export async function setListNotificationEnabled(
  lineId: string,
  listName: string,
  enabled: boolean
): Promise<void> {
  const data = await loadSettings();
  if (!data[lineId]) data[lineId] = {};
  data[lineId][listName] = { isNotificationEnabled: enabled };
  await saveSettings(data);
}

/** 複数リストの通知設定を一括取得 */
export async function getListNotificationSettings(
  lineId: string,
  listNames: string[]
): Promise<Record<string, boolean>> {
  const data = await loadSettings();
  const user = data[lineId] ?? {};
  const result: Record<string, boolean> = {};
  for (const name of listNames) {
    result[name] = user[name]?.isNotificationEnabled ?? true;
  }
  return result;
}
