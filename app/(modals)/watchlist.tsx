import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useWalletUi } from "@/context/WalletUiContext";
import { EthereumIcon } from "@/components/icons";
import colors from "@/theme/colors";
import spacing from "@/theme/spacing";
import PrimaryButton from "@/components/PrimaryButton";
import Sheet from "@/components/Sheet";

export default function WatchlistScreen() {
  const router = useRouter();
  const {
    watchlist,
    tokens,
    removeFromWatchlist,
    setStopLoss,
    removeStopLoss,
    setPriceAlert
  } = useWalletUi();

  const [stopLossOpen, setStopLossOpen] = useState(false);
  const [priceAlertOpen, setPriceAlertOpen] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [stopLossPercentage, setStopLossPercentage] = useState("");
  const [alertPrice, setAlertPrice] = useState("");
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('below');

  const watchedTokens = tokens.filter(t => watchlist.some(w => w.tokenId === t.id));

  const handleSetStopLoss = () => {
    if (!selectedTokenId || !stopLossPrice) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStopLoss(
      selectedTokenId,
      stopLossPrice,
      stopLossPercentage ? parseFloat(stopLossPercentage) : undefined
    );
    setStopLossOpen(false);
    setStopLossPrice("");
    setStopLossPercentage("");
    setSelectedTokenId(null);
    Alert.alert("Stop Loss Set", "Your stop loss has been configured successfully");
  };

  const handleSetPriceAlert = () => {
    if (!selectedTokenId || !alertPrice) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPriceAlert(selectedTokenId, alertPrice, alertCondition);
    setPriceAlertOpen(false);
    setAlertPrice("");
    setSelectedTokenId(null);
    Alert.alert("Price Alert Set", `You'll be notified when price goes ${alertCondition} $${alertPrice}`);
  };

  const getWatchlistItem = (tokenId: string) => {
    return watchlist.find(w => w.tokenId === tokenId);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Watchlist</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {watchedTokens.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="star-outline" size={64} color={colors.textDim} />
            <Text style={styles.emptyTitle}>No tokens in watchlist</Text>
            <Text style={styles.emptySubtitle}>
              Add tokens to your watchlist to monitor prices and set alerts
            </Text>
          </View>
        ) : (
          watchedTokens.map(token => {
            const watchItem = getWatchlistItem(token.id);
            return (
              <View key={token.id} style={styles.tokenCard}>
                <View style={styles.tokenHeader}>
                  <View style={styles.tokenInfo}>
                    <View style={[styles.tokenIcon, { backgroundColor: `${token.color}20` }]}>
                      {token.iconType === 'custom' && token.icon === 'ethereum' ? (
                        <EthereumIcon size={24} color={token.color} />
                      ) : (
                        <Ionicons name={token.icon as any} size={24} color={token.color} />
                      )}
                    </View>
                    <View>
                      <Text style={styles.tokenName}>{token.symbol}</Text>
                      <Text style={styles.tokenFullName}>{token.name}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert(
                        "Remove from Watchlist",
                        `Remove ${token.symbol} from your watchlist?`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Remove",
                            style: "destructive",
                            onPress: () => removeFromWatchlist(token.id)
                          }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="close-circle" size={24} color={colors.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.priceRow}>
                  <View>
                    <Text style={styles.price}>${token.price}</Text>
                    <Text style={[
                      styles.change,
                      { color: token.change24h >= 0 ? colors.success : colors.error }
                    ]}>
                      {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                    </Text>
                  </View>
                  <Text style={styles.balance}>
                    {token.balance} {token.symbol}
                  </Text>
                </View>

                {watchItem?.stopLoss && (
                  <View style={styles.alert}>
                    <Ionicons name="shield-checkmark" size={16} color={colors.warning} />
                    <Text style={styles.alertText}>
                      Stop Loss: ${watchItem.stopLoss.price}
                      {watchItem.stopLoss.percentage && ` (-${watchItem.stopLoss.percentage}%)`}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        removeStopLoss(token.id);
                      }}
                    >
                      <Ionicons name="close" size={16} color={colors.textDim} />
                    </TouchableOpacity>
                  </View>
                )}

                {watchItem?.priceAlert && (
                  <View style={styles.alert}>
                    <Ionicons name="notifications" size={16} color={colors.primary} />
                    <Text style={styles.alertText}>
                      Alert: {watchItem.priceAlert.condition === 'above' ? 'Above' : 'Below'} $
                      {watchItem.priceAlert.targetPrice}
                    </Text>
                  </View>
                )}

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedTokenId(token.id);
                      setStopLossPrice(token.price);
                      setStopLossOpen(true);
                    }}
                  >
                    <Ionicons name="shield-outline" size={18} color={colors.text} />
                    <Text style={styles.actionText}>Set Stop Loss</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedTokenId(token.id);
                      setAlertPrice(token.price);
                      setPriceAlertOpen(true);
                    }}
                  >
                    <Ionicons name="notifications-outline" size={18} color={colors.text} />
                    <Text style={styles.actionText}>Price Alert</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Stop Loss Sheet */}
      <Sheet visible={stopLossOpen} onClose={() => setStopLossOpen(false)}>
        <Text style={styles.sheetTitle}>Set Stop Loss</Text>
        <Text style={styles.sheetSubtitle}>
          Automatically sell when price drops to prevent losses
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Stop Loss Price (USD)</Text>
          <TextInput
            style={styles.input}
            value={stopLossPrice}
            onChangeText={setStopLossPrice}
            placeholder="Enter price"
            placeholderTextColor={colors.textDim}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Percentage Drop (Optional)</Text>
          <TextInput
            style={styles.input}
            value={stopLossPercentage}
            onChangeText={setStopLossPercentage}
            placeholder="e.g., 10 for 10%"
            placeholderTextColor={colors.textDim}
            keyboardType="decimal-pad"
          />
        </View>

        <PrimaryButton
          title="Set Stop Loss"
          icon={<Ionicons name="shield-checkmark" size={18} color="white" />}
          onPress={handleSetStopLoss}
          disabled={!stopLossPrice}
        />
      </Sheet>

      {/* Price Alert Sheet */}
      <Sheet visible={priceAlertOpen} onClose={() => setPriceAlertOpen(false)}>
        <Text style={styles.sheetTitle}>Set Price Alert</Text>
        <Text style={styles.sheetSubtitle}>
          Get notified when price reaches your target
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Target Price (USD)</Text>
          <TextInput
            style={styles.input}
            value={alertPrice}
            onChangeText={setAlertPrice}
            placeholder="Enter target price"
            placeholderTextColor={colors.textDim}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Condition</Text>
          <View style={styles.conditionRow}>
            <TouchableOpacity
              style={[
                styles.conditionButton,
                alertCondition === 'above' && styles.conditionButtonActive
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAlertCondition('above');
              }}
            >
              <Text
                style={[
                  styles.conditionText,
                  alertCondition === 'above' && styles.conditionTextActive
                ]}
              >
                Above
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.conditionButton,
                alertCondition === 'below' && styles.conditionButtonActive
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAlertCondition('below');
              }}
            >
              <Text
                style={[
                  styles.conditionText,
                  alertCondition === 'below' && styles.conditionTextActive
                ]}
              >
                Below
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <PrimaryButton
          title="Set Alert"
          icon={<Ionicons name="notifications" size={18} color="white" />}
          onPress={handleSetPriceAlert}
          disabled={!alertPrice}
        />
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { padding: spacing.xs },
  title: { fontSize: 20, fontWeight: "700", color: colors.text },
  container: { flex: 1, padding: spacing.lg },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },

  tokenCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tokenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  tokenInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tokenName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  tokenFullName: {
    fontSize: 12,
    color: colors.textDim,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  price: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  change: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  balance: {
    fontSize: 14,
    color: colors.textDim,
  },
  alert: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.bg,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  alertText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },

  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: colors.textDim,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  conditionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  conditionButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  conditionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  conditionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  conditionTextActive: {
    color: "white",
  },
});
