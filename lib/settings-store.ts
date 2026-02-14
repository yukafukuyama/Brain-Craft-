import { storageGet, storageSet, storageKeys } from "./storage";

const SETTINGS_PREFIX = "settings:";

export type NotificationSettings = {
  enabled: boolean;
  time?: string; // "HH:mm" 1日1回の送信時刻（デフォルト 08:00）
  times?: string[]; // 後方互換
  lastSentDate?: string;
};

type UserSettings = { notification: NotificationSettings };

const DEFAULT_TIME = "08:00";

async function getSettings(lineId: string): Promise<UserSettings> {
  const data = await storageGet<UserSettings>(SETTINGS_PREFIX + lineId);
  if (!data) return { notification: { enabled: false, time: DEFAULT_TIME } };
  const n = data.notification;
  if (!n.time && n.times?.[0]) n.time = n.times[0];
  if (!n.time) n.time = DEFAULT_TIME;
  return data;
}

async function setSettings(lineId: string, data: UserSettings): Promise<void> {
  await storageSet(SETTINGS_PREFIX + lineId, data);
}

export async function getNotificationSettings(lineId: string): Promise<NotificationSettings> {
  const data = await getSettings(lineId);
  return data.notification;
}

export async function setNotificationSettings(
  lineId: string,
  settings: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  const current = await getSettings(lineId);
  const n = current.notification;
  let time = settings.time ?? n.time ?? DEFAULT_TIME;
  if (!/^\d{1,2}:\d{1,2}$/.test(time)) time = DEFAULT_TIME;
  const updated = { ...n, ...settings, time } as NotificationSettings;
  await setSettings(lineId, { notification: updated });
  return updated;
}

export async function getUsersToNotify(nowHour: number, nowMinute: number): Promise<string[]> {
  const lineIds = await storageKeys(SETTINGS_PREFIX);
  const result: string[] = [];
  const timeStr = `${String(nowHour).padStart(2, "0")}:${String(nowMinute).padStart(2, "0")}`;
  for (const lineId of lineIds) {
    const s = await getSettings(lineId);
    const n = s?.notification;
    const userTime = n?.time ?? DEFAULT_TIME;
    if (n?.enabled && userTime === timeStr) {
      const dateStr = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
      if (n.lastSentDate !== dateStr) result.push(lineId);
    }
  }
  return result;
}

export async function markNotificationSent(lineId: string, dateStr: string): Promise<void> {
  const current = await getSettings(lineId);
  current.notification.lastSentDate = dateStr;
  await setSettings(lineId, current);
}
