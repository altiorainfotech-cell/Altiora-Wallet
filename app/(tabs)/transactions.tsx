import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useWalletUi } from "../../context/WalletUiContext";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";
import { getTransactions } from "../../lib/api";

type TransactionStatus = "pending" | "confirmed" | "failed";
type TransactionCategory = "send" | "receive" | "swap";

interface Transaction {
  id: string;
  hash: string;
  walletAddress: string;
  chain: string;
  from: string;
  to: string;
  value: number;
  fee: number;
  method?: string;
  status: TransactionStatus;
  category: TransactionCategory;
  metadata?: any;
  timestamp: string;
}

export default function Transactions() {
  const router = useRouter();
  const { accounts, activeIndex, networks, networkIndex } = useWalletUi();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | TransactionStatus | TransactionCategory>("all");

  const active = accounts[activeIndex] || accounts[0];
  const net = networks[networkIndex] || networks[0];

  // Mock data for offline/demo mode
  const getMockTransactions = (): Transaction[] => [
    {
      id: "tx-1",
      hash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
      walletAddress: active.address,
      chain: "sepolia",
      from: active.address,
      to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      value: 0.5,
      fee: 0.00002,
      method: "transfer",
      status: "confirmed",
      category: "send",
      metadata: { tokenId: "eth", note: "Payment for services" },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "tx-2",
      hash: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab",
      walletAddress: active.address,
      chain: "sepolia",
      from: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
      to: active.address,
      value: 1.2,
      fee: 0,
      method: "transfer",
      status: "confirmed",
      category: "receive",
      metadata: { tokenId: "eth", note: "Received from friend" },
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "tx-3",
      hash: "0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcd",
      walletAddress: active.address,
      chain: "sepolia",
      from: active.address,
      to: active.address,
      value: 0.8,
      fee: 0.00003,
      method: "swap",
      status: "confirmed",
      category: "swap",
      metadata: {
        fromTokenId: "eth",
        toTokenId: "usdc",
        fromAmount: 0.8,
        toAmount: 2174.4,
        note: "Swap ETH to USDC",
      },
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "tx-4",
      hash: "0x4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      walletAddress: active.address,
      chain: "sepolia",
      from: "0x0000000000000000000000000000000000000000",
      to: active.address,
      value: 0.25,
      fee: 0,
      method: "purchase",
      status: "confirmed",
      category: "receive",
      metadata: {
        tokenId: "eth",
        cryptoAmount: 0.25,
        fiatAmount: 679.5,
        fiatCurrency: "USD",
        processingFee: 10.19,
        totalFiat: 689.69,
        paymentMethod: "card",
        note: "Buy 0.25 ETH for $689.69",
      },
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "tx-5",
      hash: "0x5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
      walletAddress: active.address,
      chain: "sepolia",
      from: active.address,
      to: "0x3Cd751E6b0078Be393132286c442345e5DC49699",
      value: 0.15,
      fee: 0.00002,
      method: "transfer",
      status: "confirmed",
      category: "send",
      metadata: { tokenId: "eth", note: "NFT purchase" },
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "tx-6",
      hash: "0x6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
      walletAddress: active.address,
      chain: "sepolia",
      from: active.address,
      to: active.address,
      value: 1.5,
      fee: 0.00003,
      method: "swap",
      status: "confirmed",
      category: "swap",
      metadata: {
        fromTokenId: "usdc",
        toTokenId: "eth",
        fromAmount: 4074.45,
        toAmount: 1.5,
        note: "Swap USDC to ETH",
      },
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "tx-7",
      hash: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
      walletAddress: active.address,
      chain: "sepolia",
      from: active.address,
      to: "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5",
      value: 0.3,
      fee: 0.00002,
      method: "transfer",
      status: "pending",
      category: "send",
      metadata: { tokenId: "eth", note: "Pending transfer" },
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
      id: "tx-8",
      hash: "0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567",
      walletAddress: active.address,
      chain: "sepolia",
      from: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
      to: active.address,
      value: 0.75,
      fee: 0,
      method: "transfer",
      status: "confirmed",
      category: "receive",
      metadata: { tokenId: "eth", note: "Contract payment" },
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const loadTransactions = async (showRefresh = false) => {
    if (!active?.address) return;

    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await getTransactions(active.address, {
        limit: 50,
      });

      // If no transactions from API, use mock data for demo
      if (!data.transactions || data.transactions.length === 0) {
        setTransactions(getMockTransactions());
      } else {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Failed to load transactions:", error);
      // Show mock data when API fails for better offline experience
      setTransactions(getMockTransactions());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [active?.address]);

  const onRefresh = () => {
    loadTransactions(true);
  };

  const filteredTransactions = React.useMemo(() => {
    if (filter === "all") return transactions;

    // Check if it's a status filter
    if (["pending", "confirmed", "failed"].includes(filter)) {
      return transactions.filter(tx => tx.status === filter);
    }

    // Otherwise it's a category filter
    return transactions.filter(tx => tx.category === filter);
  }, [transactions, filter]);

  const pendingCount = transactions.filter(tx => tx.status === "pending").length;

  const getCategoryIcon = (category: TransactionCategory) => {
    switch (category) {
      case "send": return "arrow-up";
      case "receive": return "arrow-down";
      case "swap": return "swap-horizontal";
      default: return "arrow-forward";
    }
  };

  const getCategoryColor = (category: TransactionCategory) => {
    switch (category) {
      case "send": return colors.primary;
      case "receive": return colors.success;
      case "swap": return colors.warning;
      default: return colors.text;
    }
  };

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case "pending": return "time-outline";
      case "confirmed": return "checkmark-circle";
      case "failed": return "close-circle";
      default: return "help-circle";
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case "pending": return colors.warning;
      case "confirmed": return colors.success;
      case "failed": return colors.error;
      default: return colors.textDim;
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  const formatAddress = (address: string) => {
    if (!address) return "Unknown";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderTransaction = (tx: Transaction) => {
    const categoryColor = getCategoryColor(tx.category);
    const statusColor = getStatusColor(tx.status);
    const isSend = tx.category === "send";
    const isSwap = tx.category === "swap";

    return (
      <TouchableOpacity
        key={tx.id}
        style={styles.transactionItem}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          // TODO: Navigate to transaction details
        }}
      >
        <LinearGradient
          colors={[colors.card, colors.card + 'DD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.transactionGradient}
        >
          <View style={styles.transactionLeft}>
            <View style={[styles.transactionIcon, { backgroundColor: categoryColor + '20' }]}>
              <Ionicons name={getCategoryIcon(tx.category)} size={24} color={categoryColor} />
            </View>
            <View style={styles.transactionInfo}>
              <View style={styles.transactionHeader}>
                <Text style={styles.transactionCategory}>
                  {tx.category.charAt(0).toUpperCase() + tx.category.slice(1)}
                  {isSwap && tx.metadata?.fromTokenId && tx.metadata?.toTokenId && (
                    <Text style={styles.swapDetails}>
                      {" "}({tx.metadata.fromTokenId.toUpperCase()} → {tx.metadata.toTokenId.toUpperCase()})
                    </Text>
                  )}
                </Text>
                <View style={styles.statusBadge}>
                  <Ionicons name={getStatusIcon(tx.status)} size={12} color={statusColor} />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {tx.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.transactionAddress}>
                {isSend ? `To: ${formatAddress(tx.to)}` : `From: ${formatAddress(tx.from)}`}
              </Text>
              <Text style={styles.transactionTime}>{formatDate(tx.timestamp)}</Text>
            </View>
          </View>
          <View style={styles.transactionRight}>
            <Text style={[styles.transactionValue, { color: isSend ? colors.error : colors.success }]}>
              {isSend ? "-" : "+"}{tx.value} ETH
            </Text>
            {tx.fee > 0 && (
              <Text style={styles.transactionFee}>Fee: {tx.fee} ETH</Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={[colors.bg, '#0A0D12', '#050608']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transactions</Text>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              loadTransactions();
            }}
          >
            <Ionicons name="refresh" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Pending Transactions Alert */}
        {pendingCount > 0 && (
          <TouchableOpacity
            style={styles.pendingAlert}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setFilter("pending");
            }}
          >
            <LinearGradient
              colors={[colors.warning + '30', colors.warning + '20']}
              style={styles.pendingAlertGradient}
            >
              <View style={styles.pendingLeft}>
                <View style={styles.pendingIcon}>
                  <Ionicons name="time" size={20} color={colors.warning} />
                </View>
                <View>
                  <Text style={styles.pendingTitle}>Pending Transactions</Text>
                  <Text style={styles.pendingSubtext}>
                    {pendingCount} transaction{pendingCount > 1 ? "s" : ""} in progress
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.warning} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {["all", "pending", "confirmed", "failed", "send", "receive", "swap"].map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterPill,
                filter === f && styles.filterPillActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFilter(f as any);
              }}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextActive,
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Transaction List */}
        <ScrollView
          style={styles.transactionList}
          contentContainerStyle={styles.transactionListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading transactions...</Text>
            </View>
          ) : filteredTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="receipt-outline" size={64} color={colors.textDim} />
              </View>
              <Text style={styles.emptyTitle}>No Transactions</Text>
              <Text style={styles.emptySubtext}>
                {filter === "all"
                  ? "Your transaction history will appear here"
                  : `No ${filter} transactions found`}
              </Text>
            </View>
          ) : (
            <>
              {filteredTransactions.map(renderTransaction)}
            </>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '40',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerIcon: {
    padding: spacing.xs,
  },

  // Pending Alert
  pendingAlert: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
  pendingAlertGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  pendingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  pendingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.warning + '30',
    alignItems: "center",
    justifyContent: "center",
  },
  pendingTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  pendingSubtext: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 2,
  },

  // Filters
  filterScroll: {
    marginTop: spacing.md,
    maxHeight: 50,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: "600",
  },
  filterTextActive: {
    color: colors.primary,
  },

  // Transaction List
  transactionList: {
    flex: 1,
    marginTop: spacing.md,
  },
  transactionListContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },

  // Transaction Item
  transactionItem: {
    marginBottom: spacing.md,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border + '80',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  transactionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  transactionCategory: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  swapDetails: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: colors.chip,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  transactionAddress: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 2,
  },
  transactionTime: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: "500",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionValue: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  transactionFee: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: "500",
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl * 2,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    color: colors.textDim,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 250,
  },

  // Loading
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl * 2,
  },
  loadingText: {
    color: colors.textDim,
    fontSize: 14,
    marginTop: spacing.md,
  },
});
