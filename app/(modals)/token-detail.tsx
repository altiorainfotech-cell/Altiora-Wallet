import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle } from "react-native-svg";
import { useWalletUi } from "../../context/WalletUiContext";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const CHART_HEIGHT = 200;

export default function TokenDetailModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { tokens } = useWalletUi();
  const [selectedPeriod, setSelectedPeriod] = useState("1D");

  // Find token by ID from params
  const token = tokens.find(t => t.id === params.tokenId) || tokens[0];

  // Generate mock chart data
  const generateChartData = () => {
    const points = 50;
    const data = [];
    let basePrice = parseFloat(token.price);

    for (let i = 0; i < points; i++) {
      const variance = (Math.random() - 0.5) * basePrice * 0.15;
      const trend = token.change24h > 0 ? i * 0.5 : -i * 0.5;
      data.push(basePrice + variance + trend);
    }
    return data;
  };

  const chartData = generateChartData();
  const minPrice = Math.min(...chartData);
  const maxPrice = Math.max(...chartData);
  const priceRange = maxPrice - minPrice;

  // Generate SVG path for the chart
  const generatePath = () => {
    const points = chartData.map((price, index) => {
      const x = (index / (chartData.length - 1)) * CHART_WIDTH;
      const y = CHART_HEIGHT - ((price - minPrice) / priceRange) * CHART_HEIGHT;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    return points;
  };

  const periods = ["1D", "1W", "1M", "3M", "1Y", "3Y"];

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={[colors.bg, '#0A0D12']} style={styles.gradient}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{token.name}</Text>
              <View style={styles.networkBadge}>
                <Ionicons name="globe" size={12} color={colors.primary} />
                <Text style={styles.networkText}>Linea Mainnet</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.moreBtn}>
              <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Price Info */}
            <View style={styles.priceSection}>
              <Text style={styles.tokenSymbol}>{token.symbol} (Ethereum)</Text>
              <Text style={styles.price}>${token.price}</Text>
              <View style={styles.changeRow}>
                <Ionicons
                  name={token.change24h >= 0 ? "arrow-up" : "arrow-down"}
                  size={16}
                  color={token.change24h >= 0 ? colors.success : colors.error}
                />
                <Text style={[styles.changeValue, { color: token.change24h >= 0 ? colors.success : colors.error }]}>
                  ${Math.abs((parseFloat(token.price) * token.change24h) / 100).toFixed(2)} ({token.change24h >= 0 ? "+" : ""}{token.change24h}%)
                </Text>
                <Text style={styles.changePeriod}>Today</Text>
              </View>
            </View>

            {/* Chart */}
            <View style={styles.chartContainer}>
              <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                {/* Gradient fill */}
                <Path
                  d={`${generatePath()} L ${CHART_WIDTH} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z`}
                  fill={token.change24h >= 0 ? colors.success + "20" : colors.error + "20"}
                />
                {/* Line */}
                <Path
                  d={generatePath()}
                  stroke={token.change24h >= 0 ? colors.success : colors.error}
                  strokeWidth={2}
                  fill="none"
                />
                {/* Last point */}
                <Circle
                  cx={(chartData.length - 1) * (CHART_WIDTH / (chartData.length - 1))}
                  cy={CHART_HEIGHT - ((chartData[chartData.length - 1] - minPrice) / priceRange) * CHART_HEIGHT}
                  r={4}
                  fill={token.change24h >= 0 ? colors.success : colors.error}
                />
              </Svg>
            </View>

            {/* Period Selector */}
            <View style={styles.periodSelector}>
              {periods.map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[styles.periodBtn, selectedPeriod === period && styles.periodBtnActive]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Text style={[styles.periodText, selectedPeriod === period && styles.periodTextActive]}>
                    {period}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => router.push("/(modals)/send")}>
                <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
                  <Ionicons name="arrow-up" size={20} color="white" />
                </View>
                <Text style={styles.actionText}>Send</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn}>
                <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
                  <Ionicons name="swap-horizontal" size={20} color="white" />
                </View>
                <Text style={styles.actionText}>Swap</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn}>
                <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
                  <Ionicons name="link" size={20} color="white" />
                </View>
                <Text style={styles.actionText}>Bridge</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={() => router.push("/(modals)/receive")}>
                <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
                  <Ionicons name="arrow-down" size={20} color="white" />
                </View>
                <Text style={styles.actionText}>Receive</Text>
              </TouchableOpacity>
            </View>

            {/* Your Balance */}
            <View style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <View style={styles.balanceLeft}>
                  <View style={[styles.tokenIcon, { backgroundColor: token.color + "20" }]}>
                    <Ionicons name={token.icon as any} size={24} color={token.color} />
                  </View>
                  <View>
                    <Text style={styles.balanceTitle}>Your balance</Text>
                    <Text style={styles.balanceSubtitle}>Non-custodial</Text>
                  </View>
                </View>
              </View>
              <View style={styles.balanceValues}>
                <Text style={styles.balanceAmount}>{token.balance} {token.symbol}</Text>
                <Text style={styles.balanceUsd}>${token.usdValue} USD</Text>
              </View>
            </View>

            {/* Token Info */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Token information</Text>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Price</Text>
                <Text style={styles.infoValue}>${token.price}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>24h Change</Text>
                <Text style={[styles.infoValue, { color: token.change24h >= 0 ? colors.success : colors.error }]}>
                  {token.change24h >= 0 ? "+" : ""}{token.change24h}%
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Market Cap</Text>
                <Text style={styles.infoValue}>$328.5B</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>24h Volume</Text>
                <Text style={styles.infoValue}>$15.2B</Text>
              </View>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  gradient: { flex: 1 },
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backBtn: { padding: spacing.xs },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  networkBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: 4
  },
  networkText: { color: colors.primary, fontSize: 11, fontWeight: "600" },
  moreBtn: { padding: spacing.xs },

  // Price
  priceSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    alignItems: "center"
  },
  tokenSymbol: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.xs
  },
  price: {
    color: colors.text,
    fontSize: 40,
    fontWeight: "800",
    marginBottom: spacing.xs
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  changeValue: {
    fontSize: 15,
    fontWeight: "700"
  },
  changePeriod: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: "500"
  },

  // Chart
  chartContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg
  },

  // Period Selector
  periodSelector: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xl
  },
  periodBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  periodBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  periodText: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: "600"
  },
  periodTextActive: {
    color: "white"
  },

  // Actions
  actions: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  actionText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600"
  },

  // Balance Card
  balanceCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md
  },
  balanceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  balanceTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600"
  },
  balanceSubtitle: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 2
  },
  balanceValues: {
    alignItems: "flex-start"
  },
  balanceAmount: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4
  },
  balanceUsd: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: "500"
  },

  // Info Section
  infoSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.md
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  infoLabel: {
    color: colors.textDim,
    fontSize: 15,
    fontWeight: "500"
  },
  infoValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700"
  }
});
