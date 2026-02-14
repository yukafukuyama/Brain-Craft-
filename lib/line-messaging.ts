const LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push";

export async function sendPushMessage(
  channelAccessToken: string,
  userId: string,
  text: string
): Promise<boolean> {
  const res = await fetch(LINE_PUSH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: "text", text }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("LINE push error:", res.status, err);
    return false;
  }
  return true;
}
