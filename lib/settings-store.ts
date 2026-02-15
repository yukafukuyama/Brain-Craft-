import { storageGet, storageSet, storageKeys } from "./storage";

const SETTINGS_PREFIX = "settings:";

export type NotificationSettings = {
  enabled: boolean;
  time?: string; // 後方互換
  times?: string[]; // "HH:mm" 最大5つ。空配列 = 通知なし
  lastSentDate?: string;
  lastSentTimes?: string[]; // 同日に送信済みの時刻
  /** イディオムの通知を送るか（未設定は true） */
  idiomNotificationsEnabled?: boolean;
};

type UserSettings = { notification: NotificationSettings };

async function getSettings(lineId: string): Promise<UserSettings> {
  const data = await storageGet<UserSettings>(SETTINGS_PREFIX + lineId);
  if (!data) return { notification: { enabled: false, times: [] } };
  const n = data.notification;
  if (!n.times?.length && n.time) n.times = [n.time];
  if (n.times === undefined) n.times = [];
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
  let times = settings.times ?? n.times ?? (n.time ? [n.time] : []);
  times = times.slice(0, 5).filter((t) => /^\d{1,2}:\d{1,2}$/.test(t));
  // 空配列 = 通知なし（デフォルトで08:00を入れない）
  const updated = { ...n, ...settings, times } as NotificationSettings;
  await setSettings(lineId, { notification: updated });
  return updated;
}

function toHHmm(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function normalizeTime(t: string): string {
  const m = t.match(/^(\d{1,2}):(\d{1,2})$/);
  if (!m) return "";
  const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
  const min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  return toHHmm(h, min);
}

export async function getUsersToNotify(nowHour: number, nowMinute: number): Promise<string[]> {
  const lineIds = await storageKeys(SETTINGS_PREFIX);
  const result: string[] = [];
  const timeStr = toHHmm(nowHour, nowMinute);
  for (const lineId of lineIds) {
    const s = await getSettings(lineId);
    const n = s?.notification;
    const times = (n?.times ?? (n?.time ? [n.time] : [])).map(normalizeTime).filter(Boolean);
    if (n?.enabled && times.includes(timeStr)) {
      const dateStr = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const sentToday = n.lastSentDate === dateStr && (n.lastSentTimes ?? []).includes(timeStr);
      if (!sentToday) result.push(lineId);
    }
  }
  return result;
}

export async function markNotificationSent(lineId: string, dateStr: string, timeStr: string): Promise<void> {
  const current = await getSettings(lineId);
  if (current.notification.lastSentDate !== dateStr) {
    current.notification.lastSentDate = dateStr;
    current.notification.lastSentTimes = [];
  }
  const sent = current.notification.lastSentTimes ?? [];
  if (!sent.includes(timeStr)) sent.push(timeStr);
  current.notification.lastSentTimes = sent;
  await setSettings(lineId, current);
}
