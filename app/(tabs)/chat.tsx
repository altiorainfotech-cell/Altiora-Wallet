import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";
import { telegramEnabled } from "../../lib/telegram";
import Sheet from "../../components/Sheet";
import {
  ChatPreview,
  ensureChatThread,
  getChatPreviews,
  getChatState,
  markThreadRead,
  onChatStateChange,
  updateThreadMeta,
} from "../../lib/chat-storage";

export default function ChatListScreen() {
  const router = useRouter();
  const [telegramUsername, setTelegramUsername] = useState<string>("");
  const [query, setQuery] = useState("");
  const [actionsOpen, setActionsOpen] = useState(false);
  const [archivedOpen, setArchivedOpen] = useState(false);
  const [selected, setSelected] = useState<ChatPreview | null>(null);
  const [chats, setChats] = useState<ChatPreview[]>([]);

  useEffect(() => {
    let active = true;
    getChatState().then(state => {
      if (!active) return;
      setChats(getChatPreviews(state));
    });
    const off = onChatStateChange(state => {
      if (!active) return;
      setChats(getChatPreviews(state));
    });
    return () => { active = false; off(); };
  }, []);

  useEffect(() => {
    if (!telegramEnabled) return;
    ensureChatThread("telegram", "Telegram").catch(() => {});
  }, []);

  const ordered = useMemo(() => {
    const visible = chats.filter(c => !c.archived);
    return [...visible].sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
  }, [chats]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ordered;
    return ordered.filter(c => c.name.toLowerCase().includes(q));
  }, [query, ordered]);

  const archived = useMemo(() => chats.filter(c => c.archived), [chats]);

  const onLongPress = (item: ChatPreview) => {
    setSelected(item);
    setActionsOpen(true);
  };

  const renderItem = ({ item }: { item: ChatPreview }) => (
    <TouchableOpacity style={styles.item} onPress={() => router.push(`/(modals)/chat-thread?id=${item.id}`)} onLongPress={() => onLongPress(item)}>
      <View style={styles.itemLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.slice(0,1).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text numberOfLines={1} style={styles.preview}>{item.last}</Text>
        </View>
      </View>
      <View style={styles.itemRight}>
        <Text style={styles.time}>{item.time}</Text>
        {item.unread ? (
          <View style={styles.unreadBadge}><Text style={styles.unreadText}>{item.unread}</Text></View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <View style={styles.usernameRow}>
          <Ionicons name="paper-plane-outline" size={16} color={colors.primary} />
          <TextInput
            style={styles.usernameInput}
            value={telegramUsername}
            onChangeText={setTelegramUsername}
            placeholder="Set Telegram username"
            placeholderTextColor={colors.textDim}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={16} color={colors.textDim} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor={colors.textDim}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 140 }}
      />

      {/* Actions sheet */}
      {selected && (
        <Sheet visible={actionsOpen} onClose={() => setActionsOpen(false)}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetHeaderTitle}>{selected.name}</Text>
            <TouchableOpacity onPress={() => setActionsOpen(false)}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => {
              updateThreadMeta(selected.id, { pinned: !selected.pinned }).catch(() => {});
              setSelected(prev => prev ? { ...prev, pinned: !prev.pinned } : prev);
              setActionsOpen(false);
            }}
          >
            <View style={styles.rowLeft}>
              <View style={styles.rowIconContainer}><Ionicons name="pin" size={16} color={colors.text} /></View>
              <View style={styles.rowTexts}>
                <Text style={styles.rowTitle}>{selected.pinned ? 'Unpin chat' : 'Pin chat'}</Text>
                <Text style={styles.rowSub}>Keep on top of your list</Text>
              </View>
            </View>
            {selected.pinned && (<View style={[styles.statusPill, { backgroundColor: colors.primary + '26' }]}><Text style={[styles.statusPillText, { color: colors.primary }]}>Pinned</Text></View>)}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => {
              updateThreadMeta(selected.id, { muted: !selected.muted }).catch(() => {});
              setSelected(prev => prev ? { ...prev, muted: !prev.muted } : prev);
              setActionsOpen(false);
            }}
          >
            <View style={styles.rowLeft}>
              <View style={styles.rowIconContainer}><Ionicons name="notifications-off-outline" size={16} color={colors.text} /></View>
              <View style={styles.rowTexts}>
                <Text style={styles.rowTitle}>{selected.muted ? 'Unmute' : 'Mute'}</Text>
                <Text style={styles.rowSub}>Silence notifications</Text>
              </View>
            </View>
            {selected.muted && (<View style={[styles.statusPill, { backgroundColor: '#6663' }]}><Text style={styles.statusPillText}>Muted</Text></View>)}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => {
              updateThreadMeta(selected.id, { archived: !selected.archived }).catch(() => {});
              if (!selected.archived) {
                markThreadRead(selected.id).catch(() => {});
              }
              setSelected(prev => prev ? { ...prev, archived: !prev.archived, unread: 0 } : prev);
              setActionsOpen(false);
            }}
          >
            <View style={styles.rowLeft}>
              <View style={styles.rowIconContainer}><Ionicons name="archive-outline" size={16} color={colors.text} /></View>
              <View style={styles.rowTexts}>
                <Text style={styles.rowTitle}>{selected.archived ? 'Unarchive' : 'Archive'}</Text>
                <Text style={styles.rowSub}>Move chat out of main list</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Sheet>
      )}

      {/* Archived list with same polished UI */}
      {archived.length > 0 && (
        <Sheet visible={archivedOpen} onClose={() => setArchivedOpen(false)}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetHeaderTitle}>Archived</Text>
            <TouchableOpacity onPress={() => setArchivedOpen(false)}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={archived}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={styles.archivedItem}>
                <TouchableOpacity
                  style={styles.itemLeft}
                  onPress={() => {
                    setArchivedOpen(false);
                    markThreadRead(item.id).catch(() => {});
                    router.push(`/(modals)/chat-thread?id=${item.id}`);
                  }}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name.slice(0,1).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text numberOfLines={1} style={styles.preview}>{item.last || 'Tap to open'}</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.itemRight}>
                  <Text style={styles.time}>{item.time}</Text>
                  <TouchableOpacity
                    style={styles.unarchiveBtn}
                    onPress={() => updateThreadMeta(item.id, { archived: false }).catch(() => {})}
                  >
                    <Ionicons name="arrow-up-circle-outline" size={16} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontWeight: '700' }}>Unarchive</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingTop: spacing.sm }}
          />
        </Sheet>
      )}

      {archived.length > 0 && (
        <TouchableOpacity style={styles.archivedPill} onPress={() => setArchivedOpen(true)}>
          <Ionicons name="archive-outline" size={14} color={colors.text} />
          <Text style={{ color: colors.text, fontWeight: '700' }}>Archived ({archived.length})</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
    gap: spacing.sm,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: '800' },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  usernameInput: { flex: 1, color: colors.text, paddingVertical: 4 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  searchInput: { flex: 1, color: colors.text, paddingVertical: 4 },
  item: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  avatarText: { color: colors.text, fontWeight: '800' },
  name: { color: colors.text, fontSize: 15, fontWeight: '700' },
  preview: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  itemRight: { alignItems: 'flex-end', gap: 6 },
  time: { color: colors.textDim, fontSize: 11 },
  unreadBadge: { backgroundColor: colors.primary, minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  unreadText: { color: 'white', fontSize: 11, fontWeight: '800' },
  archivedPill: { position: 'absolute', right: spacing.lg, bottom: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: 8, backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 16 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  sheetHeaderTitle: { color: colors.text, fontWeight: '800', fontSize: 18 },
  rowItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  rowIconContainer: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  rowTexts: { flex: 1 },
  rowTitle: { color: colors.text, fontWeight: '700' },
  rowSub: { color: colors.textDim, marginTop: 2 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  statusPillText: { fontSize: 11, fontWeight: '800' },
  archivedItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  unarchiveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }
});
