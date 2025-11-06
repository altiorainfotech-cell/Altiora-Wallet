import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_ENABLED, TELEGRAM_PROXY_BASE_URL, TELEGRAM_USE_PROXY } from './telegram-config';

type TgUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    date: number;
    text?: string;
    chat: { id: number; title?: string; type: string };
    from?: { id: number; is_bot: boolean; first_name?: string; last_name?: string; username?: string };
  };
};

export const telegramEnabled = TELEGRAM_ENABLED && !!TELEGRAM_BOT_TOKEN && !!TELEGRAM_CHAT_ID;

const baseUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!telegramEnabled) return false;
  try {
    const url = TELEGRAM_USE_PROXY
      ? `${TELEGRAM_PROXY_BASE_URL}/send`
      : `${baseUrl}/sendMessage`;
    const body = TELEGRAM_USE_PROXY
      ? { text }
      : { chat_id: TELEGRAM_CHAT_ID, text };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export function startTelegramPolling(onText: (args: { text: string; from?: string; chatId: number; date: number }) => void) {
  if (!telegramEnabled) return () => {};
  let stopped = false;
  let offset = 0;

  const tick = async () => {
    if (stopped) return;
    try {
      let updates: TgUpdate[] = [];
      if (TELEGRAM_USE_PROXY) {
        const res = await fetch(`${TELEGRAM_PROXY_BASE_URL}/updates?offset=${offset}`, { method: 'GET' });
        const json = await res.json();
        updates = json.result || json.updates || [];
      } else {
        const res = await fetch(`${baseUrl}/getUpdates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offset, timeout: 10 }), // long poll
        });
        const json = await res.json();
        updates = json.result || [];
      }
      for (const u of updates) {
        offset = u.update_id + 1;
        const m = u.message;
        if (!m) continue;
        if (!TELEGRAM_USE_PROXY && m.chat?.id !== TELEGRAM_CHAT_ID) continue; // only target chat when direct
        if (!m.text) continue;
        const from = m.from?.username || [m.from?.first_name, m.from?.last_name].filter(Boolean).join(' ') || 'Unknown';
        onText({ text: m.text, from, chatId: m.chat.id, date: m.date });
      }
    } catch (e) {
      // swallow errors; continue polling
    } finally {
      if (!stopped) setTimeout(tick, 1500);
    }
  };

  tick();

  return () => { stopped = true; };
}
