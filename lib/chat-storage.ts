import AsyncStorage from "@react-native-async-storage/async-storage";
import { events } from "./events";

export type ChatMessage = {
  id: string;
  sender: string;
  text: string;
  time: string;
  outgoing?: boolean;
};

export type StoredChatThread = {
  id: string;
  name: string;
  messages: ChatMessage[];
  last: string;
  time: string;
  unread: number;
  pinned: boolean;
  muted: boolean;
  archived: boolean;
  updatedAt: number;
};

export type ChatState = Record<string, StoredChatThread>;

export type ChatPreview = Pick<
  StoredChatThread,
  "id" | "name" | "last" | "time" | "unread" | "pinned" | "muted" | "archived" | "updatedAt"
>;

const STORAGE_KEY = "@altiora.chat.state.v1";

const NOW = Date.now();

const SAMPLE_STATE: ChatState = (() => {
  const makeThread = (thread: {
    id: string;
    name: string;
    messages: ChatMessage[];
    unread?: number;
    pinned?: boolean;
  },
  index: number): StoredChatThread => {
    const lastMessage = thread.messages[thread.messages.length - 1];
    return {
      id: thread.id,
      name: thread.name,
      messages: thread.messages.map((message, i) => ({
        ...message,
        id: `${thread.id}-${i + 1}`,
      })),
      last: lastMessage?.text ?? "",
      time: lastMessage?.time ?? "",
      unread: thread.unread ?? 0,
      pinned: !!thread.pinned,
      muted: false,
      archived: false,
      updatedAt: NOW - index * 5 * 60 * 1000,
    };
  };

  return {
    aman: makeThread({
      id: "aman",
      name: "Aman",
      unread: 2,
      messages: [
        { sender: "Aman", text: "Arre bhai, market ka kya scene hai aaj?", time: "09:12" },
        { sender: "You", text: "ETH green me dikh raha hai.", time: "09:13", outgoing: true },
        { sender: "Aman", text: "Toh thoda buy karte?", time: "09:14" },
      ],
    }, 0),
    priya: makeThread({
      id: "priya",
      name: "Priya",
      messages: [
        { sender: "Priya", text: "Kal ke dip me entry li thi!", time: "10:01" },
        { sender: "You", text: "Nice, average price achha ho gaya hoga!", time: "10:02", outgoing: true },
      ],
    }, 1),
    ravi: makeThread({
      id: "ravi",
      name: "Ravi",
      unread: 1,
      messages: [
        { sender: "Ravi", text: "WBTC breakout lag raha hai.", time: "08:44" },
        { sender: "You", text: "Targets kya dekh rahe ho?", time: "08:45", outgoing: true },
      ],
    }, 2),
    neha: makeThread({
      id: "neha",
      name: "Neha",
      messages: [
        { sender: "Neha", text: "Pepe me thoda scalp mara.", time: "12:21" },
      ],
    }, 3),
  } satisfies ChatState;
})();

let cache: ChatState | null = null;

const cloneMessage = (message: ChatMessage): ChatMessage => ({ ...message });

const normalizeMessage = (message: Partial<ChatMessage> | undefined, fallbackId: string): ChatMessage => {
  const outgoing = !!message?.outgoing;
  const sender = typeof message?.sender === "string"
    ? message.sender
    : (outgoing ? "You" : "Unknown");
  const normalized: ChatMessage = {
    id: typeof message?.id === "string" ? message.id : fallbackId,
    sender,
    text: typeof message?.text === "string" ? message.text : "",
    time: typeof message?.time === "string" ? message.time : "",
  };
  if (outgoing) normalized.outgoing = true;
  return normalized;
};

const cloneThread = (thread: StoredChatThread): StoredChatThread => ({
  ...thread,
  messages: thread.messages.map(cloneMessage),
});

const defaultName = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

const normalizeThread = (
  thread: StoredChatThread | undefined,
  id: string,
  fallbackName?: string,
): StoredChatThread => {
  if (!thread) {
    if (SAMPLE_STATE[id]) {
      return cloneThread(SAMPLE_STATE[id]);
    }
    return {
      id,
      name: fallbackName || defaultName(id),
      messages: [],
      last: "",
      time: "",
      unread: 0,
      pinned: false,
      muted: false,
      archived: false,
      updatedAt: Date.now(),
    };
  }

  const sample = SAMPLE_STATE[id];
  const messages = Array.isArray(thread.messages)
    ? thread.messages.map((msg, index) => normalizeMessage(msg, `${id}-${index + 1}`))
    : [];
  const lastMessage = messages[messages.length - 1];

  return {
    id,
    name: thread.name || sample?.name || fallbackName || defaultName(id),
    messages,
    last: thread.last ?? lastMessage?.text ?? "",
    time: thread.time ?? lastMessage?.time ?? "",
    unread: typeof thread.unread === "number" ? thread.unread : 0,
    pinned: !!thread.pinned,
    muted: !!thread.muted,
    archived: !!thread.archived,
    updatedAt: typeof thread.updatedAt === "number" ? thread.updatedAt : Date.now(),
  };
};

const cloneState = (state: ChatState): ChatState => {
  const cloned: ChatState = {};
  for (const [key, value] of Object.entries(state)) {
    cloned[key] = cloneThread(value);
  }
  return cloned;
};

const persistState = async (state: ChatState) => {
  const snapshot = cloneState(state);
  cache = snapshot;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Swallow storage errors silently to avoid breaking the UI.
  }
  events.emit<ChatState>("chat:stateChanged", snapshot);
  return snapshot;
};

const ensureThread = (state: ChatState, id: string, fallbackName?: string): StoredChatThread => {
  const normalized = normalizeThread(state[id], id, fallbackName);
  state[id] = normalized;
  return normalized;
};

export const ensureChatThread = async (threadId: string, fallbackName?: string) => {
  await mutateChatState((state) => {
    ensureThread(state, threadId, fallbackName);
  });
};

export const getChatState = async (): Promise<ChatState> => {
  if (cache) {
    return cloneState(cache);
  }

  let fromStorage: ChatState | null = null;
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      fromStorage = JSON.parse(stored) as ChatState;
    }
  } catch {
    fromStorage = null;
  }

  const base = fromStorage ? cloneState(fromStorage) : cloneState(SAMPLE_STATE);

  let mutated = false;

  // Ensure sample threads exist for first run as well as after clearing storage.
  for (const key of Object.keys(SAMPLE_STATE)) {
    const before = base[key];
    ensureThread(base, key);
    if (!before) mutated = true;
  }

  // Normalize any persisted threads to guarantee required fields.
  for (const key of Object.keys(base)) {
    const original = base[key];
    const normalized = ensureThread(base, key);
    if (original !== normalized) {
      mutated = true;
    }
  }

  cache = base;
  if (!fromStorage || mutated) {
    await persistState(base);
  }

  return cloneState(base);
};

export const mutateChatState = async (
  mutator: (state: ChatState) => void,
): Promise<ChatState> => {
  const state = await getChatState();
  const draft = cloneState(state);
  mutator(draft);
  return persistState(draft);
};

export const appendMessageToThread = async (
  threadId: string,
  message: ChatMessage,
  options?: { markRead?: boolean; nameFallback?: string },
) => {
  await mutateChatState((state) => {
    const thread = ensureThread(state, threadId, options?.nameFallback);
    thread.messages = [...thread.messages, cloneMessage(message)];
    thread.last = message.text;
    thread.time = message.time;
    thread.updatedAt = Date.now();
    if (options?.markRead || message.outgoing) {
      thread.unread = 0;
    } else {
      thread.unread = (thread.unread || 0) + 1;
    }
  });
};

export const markThreadRead = async (threadId: string) => {
  await mutateChatState((state) => {
    const thread = ensureThread(state, threadId);
    thread.unread = 0;
  });
};

export const updateThreadMeta = async (
  threadId: string,
  updates: Partial<Pick<StoredChatThread, "pinned" | "muted" | "archived" | "name">>,
) => {
  await mutateChatState((state) => {
    const thread = ensureThread(state, threadId);
    Object.assign(thread, updates);
  });
};

export const getChatPreviews = (state: ChatState): ChatPreview[] =>
  Object.values(state).map((thread) => ({
    id: thread.id,
    name: thread.name,
    last: thread.last,
    time: thread.time,
    unread: thread.unread,
    pinned: thread.pinned,
    muted: thread.muted,
    archived: thread.archived,
    updatedAt: thread.updatedAt,
  }));

export const onChatStateChange = (handler: (state: ChatState) => void) =>
  events.on<ChatState>("chat:stateChanged", handler);

