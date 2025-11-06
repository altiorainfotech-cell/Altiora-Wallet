// Fill these with your real values to enable Telegram integration.
// IMPORTANT: Do NOT ship real tokens in client apps. Prefer a server proxy.

export const TELEGRAM_ENABLED = false; // flip to true after configuring below
export const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN"; // e.g., 123456789:ABC... (botfather)
export const TELEGRAM_CHAT_ID = 0; // target chat ID (user/group/channel where the bot is present)
// Optional: route through your own server to hide tokens and use webhooks
export const TELEGRAM_USE_PROXY = false; // prefer using a server proxy when true
export const TELEGRAM_PROXY_BASE_URL = "https://your-server.example.com/api/telegram"; // e.g., https://api.example.com/telegram
