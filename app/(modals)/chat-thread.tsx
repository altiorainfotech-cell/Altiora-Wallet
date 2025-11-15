import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";
import { sendTelegramMessage, startTelegramPolling, telegramEnabled } from "../../lib/telegram";
import { events } from "../../lib/events";
import { getChatMessages, sendChatMessage } from "../../lib/api";
import AsyncStorage from '@react-native-async-storage/async-storage';

type ChatMessage = { id: string; sender: string; text: string; time: string; outgoing?: boolean };

function generateMockAIResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  // Greeting responses
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return "Hello! I'm your crypto assistant. I can help you with portfolio management, trading strategies, DeFi protocols, and market analysis. What would you like to explore today?";
  }
  
  // Price and market analysis
  if (message.includes('price') || message.includes('market') || message.includes('btc') || message.includes('eth')) {
    return "📈 Market Analysis: Current crypto markets are showing volatility. For price tracking, I recommend setting up alerts for key levels. ETH is showing strength in the DeFi sector, while BTC remains the store of value. Consider dollar-cost averaging for long-term positions.";
  }
  
  // Trading and swapping
  if (message.includes('swap') || message.includes('trade') || message.includes('buy') || message.includes('sell')) {
    return "💱 Trading Tips: Always check slippage tolerance (0.5-1% for stable pairs, 2-5% for volatile tokens). Use reputable DEXs like Uniswap, 1inch, or Curve. Monitor gas fees and consider Layer 2 solutions like Polygon or Arbitrum for cheaper transactions.";
  }
  
  // Staking and yield farming
  if (message.includes('stake') || message.includes('staking') || message.includes('yield') || message.includes('farm')) {
    return "🏦 Staking Opportunities: ETH 2.0 staking offers ~4-6% APY with some lock-up. Polygon staking provides ~8-12% with more flexibility. Consider liquid staking tokens like stETH or rETH for maintaining liquidity. Always research validator reputation and smart contract risks.";
  }
  
  // Security and safety
  if (message.includes('security') || message.includes('safe') || message.includes('hack') || message.includes('scam')) {
    return "🔒 Security Best Practices: Use hardware wallets for large amounts, enable 2FA everywhere, never share your seed phrase, verify contract addresses on Etherscan, be cautious of phishing sites, and start with small amounts when trying new protocols.";
  }
  
  // Portfolio management
  if (message.includes('portfolio') || message.includes('balance') || message.includes('diversif')) {
    return "📊 Portfolio Strategy: Aim for diversification across sectors (30% BTC/ETH, 40% altcoins, 20% DeFi tokens, 10% experimental). Rebalance quarterly, set stop-losses at -20%, and take profits at +50-100%. Track your cost basis and consider tax implications.";
  }
  
  // DeFi protocols
  if (message.includes('defi') || message.includes('protocol') || message.includes('liquidity')) {
    return "🌐 DeFi Insights: Popular protocols include Uniswap (DEX), Aave (lending), Compound (borrowing), and Curve (stablecoins). Always check TVL, audit reports, and start with blue-chip protocols. Impermanent loss is a key risk in liquidity provision.";
  }
  
  // NFTs
  if (message.includes('nft') || message.includes('opensea') || message.includes('collectible')) {
    return "🎨 NFT Market: Focus on utility-driven projects, established collections, and strong communities. Check floor prices, trading volume, and roadmap execution. Be aware of royalties and gas fees when trading.";
  }
  
  // Gas fees
  if (message.includes('gas') || message.includes('fee') || message.includes('expensive')) {
    return "⛽ Gas Optimization: Use Layer 2 solutions (Polygon, Arbitrum, Optimism) for cheaper transactions. Check gas trackers like GasNow or ETH Gas Station. Batch transactions when possible and avoid peak hours (US market open).";
  }
  
  // General help
  return "🚀 I'm your crypto assistant! I can help with:\n\n📈 Market analysis & price tracking\n💱 Trading strategies & DEX usage\n🏦 Staking & yield opportunities\n🔒 Security best practices\n📊 Portfolio management\n🌐 DeFi protocols\n\nWhat specific topic interests you?";
}

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
  const key = (id || "").toString();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [threadTitle, setThreadTitle] = useState('AI Assistant');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // Save messages to storage
  const saveMessages = async (msgs: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(`chat_${key}`, JSON.stringify(msgs));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  };

  // Load messages from storage
  const loadStoredMessages = async (): Promise<ChatMessage[]> => {
    try {
      const stored = await AsyncStorage.getItem(`chat_${key}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load stored messages:', error);
      return [];
    }
  };

  useEffect(() => {
    loadMessages();
  }, [id]);

  const loadMessages = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    // Load stored messages first
    const storedMessages = await loadStoredMessages();
    setMessages(storedMessages);

    // Handle sample threads (telegram, etc.)
    if (SAMPLE_THREADS[key]) {
      const thread = SAMPLE_THREADS[key];
      const combinedMessages = [...storedMessages, ...thread.messages.filter(msg => !storedMessages.find(s => s.id === msg.id))];
      setMessages(combinedMessages);
      setThreadTitle(thread.name);
      setLoading(false);
      return;
    }

    // Handle AI Assistant fallback
    if (key === 'ai-assistant' || key.startsWith('temp-')) {
      setThreadTitle('AI Assistant');
      setLoading(false);
      return;
    }

    try {
      const { messages: apiMessages } = await getChatMessages(id.toString());
      const formattedMessages = apiMessages.map((msg: any) => ({
        id: msg.id,
        sender: msg.role === 'user' ? 'You' : 'AI Assistant',
        text: msg.content,
        time: new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        outgoing: msg.role === 'user'
      }));
      
      // Merge with stored messages, prioritizing API messages
      const mergedMessages = [...formattedMessages];
      storedMessages.forEach(stored => {
        if (!mergedMessages.find(api => api.id === stored.id)) {
          mergedMessages.push(stored);
        }
      });
      
      setMessages(mergedMessages.sort((a, b) => new Date(`1970/01/01 ${a.time}`).getTime() - new Date(`1970/01/01 ${b.time}`).getTime()));
      setThreadTitle('AI Assistant');
    } catch (error) {
      console.error('Failed to load messages:', error);
      setThreadTitle('AI Assistant');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    
    // Add user message immediately
    const userMessage = { id: `${Date.now()}`, sender: "You", text: trimmed, time: `${hh}:${mm}`, outgoing: true };
    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      saveMessages(newMessages);
      return newMessages;
    });
    setInput("");
    
    // Handle different chat types
    if (id && !SAMPLE_THREADS[key] && key !== 'ai-assistant' && !key.startsWith('temp-')) {
      // Real AI chat thread
      try {
        const { userMessage: apiUserMsg, assistantMessage } = await sendChatMessage(id.toString(), trimmed);
        
        // Replace temp message with API response and add AI response
        const aiMessage = {
          id: assistantMessage.id,
          sender: "AI Assistant",
          text: assistantMessage.content,
          time: new Date(assistantMessage.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          outgoing: false
        };
        
        setMessages(prev => {
          const updatedMessages = [...prev.slice(0, -1), 
            { ...userMessage, id: apiUserMsg.id },
            aiMessage
          ];
          saveMessages(updatedMessages);
          return updatedMessages;
        });
      } catch (error) {
        console.error('Failed to send message:', error);
        // Add mock AI response for fallback
        setTimeout(() => {
          const mockResponse = generateMockAIResponse(trimmed);
          const aiMessage = {
            id: `mock-${Date.now()}`,
            sender: "AI Assistant",
            text: mockResponse,
            time: `${hh}:${mm}`,
            outgoing: false
          };
          setMessages(prev => {
            const updatedMessages = [...prev, aiMessage];
            saveMessages(updatedMessages);
            return updatedMessages;
          });
          requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
        }, 1000); // Add 1 second delay to simulate AI thinking
      }
    } else if (key === 'ai-assistant' || key.startsWith('temp-')) {
      // Fallback AI chat with typing delay
      setTimeout(() => {
        const mockResponse = generateMockAIResponse(trimmed);
        const aiMessage = {
          id: `mock-${Date.now()}`,
          sender: "AI Assistant",
          text: mockResponse,
          time: `${hh}:${mm}`,
          outgoing: false
        };
        setMessages(prev => {
          const updatedMessages = [...prev, aiMessage];
          saveMessages(updatedMessages);
          return updatedMessages;
        });
        requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
      }, 1000);
    } else if (key === 'telegram' && telegramEnabled) {
      // Handle telegram
      sendTelegramMessage(trimmed).catch(() => {});
    }
    
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  useEffect(() => {
    if (!telegramEnabled) return;
    const stop = startTelegramPolling(({ text, from, date }) => {
      const d = new Date(date * 1000);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const newMessage = { id: `${Date.now()}-${Math.random()}`, sender: from || 'Telegram', text, time: `${hh}:${mm}` };
      setMessages(prev => {
        const updatedMessages = [...prev, newMessage];
        saveMessages(updatedMessages);
        return updatedMessages;
      });
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
        <Text style={styles.title}>{threadTitle}{(telegramEnabled && key === 'telegram') ? ' · Telegram Feed' : ''}</Text>
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
            placeholder={`Message ${threadTitle}`}
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
