import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";
import { sendTelegramMessage, startTelegramPolling, telegramEnabled } from "../../lib/telegram";
import { events } from "../../lib/events";
import {
  appendMessageToThread,
  ChatMessage,
  ensureChatThread,
  getChatState,
  markThreadRead,
  onChatStateChange,
  StoredChatThread,
} from "../../lib/chat-storage";

const formatTime = (date: Date) => {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

export default function ChatThreadModal() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const key = (id || "aman").toString();

  const [input, setInput] = useState("");
  const [thread, setThread] = useState<StoredChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    let active = true;

    const applyFromState = (stateThread: StoredChatThread | undefined) => {
      if (!active || !stateThread) return;
      setThread(stateThread);
      setMessages(stateThread.messages);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    };

    getChatState().then(async (state) => {
      if (!active) return;
      const existing = state[key];
      if (existing) {
        applyFromState(existing);
      } else {
        const fallbackName = key === "telegram" ? "Telegram" : undefined;
        await ensureChatThread(key, fallbackName);
        if (!active) return;
        const nextState = await getChatState();
        applyFromState(nextState[key] || nextState["aman"]);
      }
    });

    const off = onChatStateChange((state) => {
      if (!active) return;
      applyFromState(state[key] || state["aman"]);
    });

    return () => {
      active = false;
      off();
    };
  }, [key]);

  const threadId = thread?.id;

  useEffect(() => {
    if (!threadId) return;
    markThreadRead(threadId).catch(() => {});
    events.emit("chat:read", { id: threadId });
  }, [threadId]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed || !thread) return;
    const now = new Date();
    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sender: "You",
      text: trimmed,
      time: formatTime(now),
      outgoing: true,
    };
    setMessages(prev => [...prev, message]);
    // fire-and-forget telegram send (if enabled)
    if (telegramEnabled) {
      sendTelegramMessage(trimmed).catch(() => {});
    }
    setInput("");
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    appendMessageToThread(thread.id, message, { markRead: true, nameFallback: thread.name }).catch(() => {});
  };

  useEffect(() => {
    if (!telegramEnabled) return;
    const stop = startTelegramPolling(({ text, from, date }) => {
      const d = new Date(date * 1000);
      const message: ChatMessage = {
        id: `${date}-${Math.random().toString(36).slice(2, 8)}`,
        sender: from || "Telegram",
        text,
        time: formatTime(d),
      };
      setMessages(prev => [...prev, message]);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
      appendMessageToThread("telegram", message, {
        markRead: key === "telegram",
        nameFallback: "Telegram",
      }).catch(() => {});
      if (key !== "telegram") {
        events.emit('chat:newMessage', { id: 'telegram' });
      }
    });
    return stop;
  }, [key]);

  const renderItem = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.row, item.outgoing ? styles.rowRight : styles.rowLeft]}>
      <View style={[styles.bubble, item.outgoing ? styles.bubbleOutgoing : styles.bubbleIncoming]}>
        <Text style={[styles.sender, item.outgoing && { color: "#E8E8E8" }]}>{item.sender}</Text>
        <Text style={[styles.msg, item.outgoing && { color: "white" }]}>{item.text}</Text>
        <Text style={[styles.time, item.outgoing && { color: "#E8E8E8" }]}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: spacing.xs }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{thread?.name || "Chats"}{(telegramEnabled && key === 'telegram') ? ' · Telegram Feed' : ''}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingVertical: spacing.md }}
        style={{ flex: 1 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} keyboardVerticalOffset={80}>
        <View style={styles.composerBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={`Message ${thread?.name ?? 'contact'}`}
            placeholderTextColor={colors.textDim}
            style={styles.composerInput}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} activeOpacity={0.8}>
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '800', flex: 1 },

  row: { paddingHorizontal: spacing.lg, marginVertical: 6, width: "100%" },
  rowLeft: { alignItems: "flex-start" },
  rowRight: { alignItems: "flex-end" },
  bubble: {
    maxWidth: "82%",
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  bubbleIncoming: { backgroundColor: colors.card, borderColor: colors.border },
  bubbleOutgoing: { backgroundColor: colors.primary, borderColor: colors.primary },
  sender: { color: colors.textDim, fontSize: 11, marginBottom: 4, fontWeight: "700" },
  msg: { color: colors.text, fontSize: 14 },
  time: { marginTop: 6, color: colors.textDim, fontSize: 10, alignSelf: "flex-end" },

  composerBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  composerInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
});
