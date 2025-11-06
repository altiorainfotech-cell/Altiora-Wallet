import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";
import { sendTelegramMessage, startTelegramPolling, telegramEnabled } from "../../lib/telegram";
import { events } from "../../lib/events";

type ChatMessage = { id: string; sender: string; text: string; time: string; outgoing?: boolean };

const SAMPLE_THREADS: Record<string, { name: string; messages: ChatMessage[] }>
  = {
    aman: {
      name: "Aman",
      messages: [
        { id: "1", sender: "Aman", text: "Arre bhai, market ka kya scene hai aaj?", time: "09:12" },
        { id: "2", sender: "You", text: "ETH green me dikh raha hai.", time: "09:13", outgoing: true },
        { id: "3", sender: "Aman", text: "Toh thoda buy karte?", time: "09:14" },
      ]
    },
    priya: {
      name: "Priya",
      messages: [
        { id: "1", sender: "Priya", text: "Kal ke dip me entry li thi!", time: "10:01" },
        { id: "2", sender: "You", text: "Nice, average price achha ho gaya hoga!", time: "10:02", outgoing: true },
      ]
    },
    ravi: {
      name: "Ravi",
      messages: [
        { id: "1", sender: "Ravi", text: "WBTC breakout lag raha hai.", time: "08:44" },
        { id: "2", sender: "You", text: "Targets kya dekh rahe ho?", time: "08:45", outgoing: true },
      ]
    },
    neha: {
      name: "Neha",
      messages: [
        { id: "1", sender: "Neha", text: "Pepe me thoda scalp mara.", time: "12:21" },
      ]
    }
  };

export default function ChatThreadModal() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const key = (id || "aman").toString();
  const thread = SAMPLE_THREADS[key] || SAMPLE_THREADS["aman"];

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(thread.messages);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    setMessages(prev => [...prev, { id: `${Date.now()}`, sender: "You", text: trimmed, time: `${hh}:${mm}`, outgoing: true }]);
    // fire-and-forget telegram send (if enabled)
    if (telegramEnabled) {
      sendTelegramMessage(trimmed).catch(() => {});
    }
    setInput("");
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  useEffect(() => {
    if (!telegramEnabled) return;
    const stop = startTelegramPolling(({ text, from, date }) => {
      const d = new Date(date * 1000);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      setMessages(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, sender: from || 'Telegram', text, time: `${hh}:${mm}` }]);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
      // bump unread in list when not already on list; still emit to keep counters consistent
      events.emit('chat:newMessage', { id: 'telegram' });
    });
    return stop;
  }, []);

  // mark as read when opening
  useEffect(() => {
    events.emit('chat:read', { id: key });
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
        <Text style={styles.title}>{thread.name}{(telegramEnabled && key === 'telegram') ? ' · Telegram Feed' : ''}</Text>
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
            placeholder={`Message ${thread.name}`}
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
