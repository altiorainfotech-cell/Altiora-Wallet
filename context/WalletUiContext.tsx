import React, { createContext, useContext, useMemo, useState } from "react";

export type UiAccount = { id: string; label: string; address: string; balance: string };
export type UiNetwork = { id: string; name: string; symbol: string };
export type UiToken = {
  id: string;
  name: string;
  symbol: string;
  icon: string; // Ionicons name or 'custom'
  iconType?: 'ionicon' | 'custom'; // Type of icon
  balance: string;
  usdValue: string;
  change24h: number; // percentage
  price: string;
  color: string;
};

export type UiNft = {
  id: string;
  name: string;
  collection: string;
  color: string; // used for placeholder tile background
  usdValue?: string;
};

type WalletUiContextValue = {
  accounts: UiAccount[];
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  networks: UiNetwork[];
  networkIndex: number;
  setNetworkIndex: (i: number) => void;
  tokens: UiToken[];
  nfts: UiNft[];
  totalPortfolioValue: string;
  portfolioChange24h: number;
  addMockAccount: () => void;
};

const Ctx = createContext<WalletUiContextValue | undefined>(undefined);

export const WalletUiProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [accounts, setAccounts] = useState<UiAccount[]>([
    { id: "acc-0", label: "Account 1", address: "0x12A4...9F3C", balance: "0.0000" },
  ]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [networks] = useState<UiNetwork[]>([
    { id: "sepolia", name: "Sepolia", symbol: "ETH" },
    { id: "polygon", name: "Polygon", symbol: "MATIC" },
    { id: "base", name: "Base", symbol: "ETH" },
  ]);
  const [networkIndex, setNetworkIndex] = useState(0);

  const [tokens] = useState<UiToken[]>([
    {
      id: "eth",
      name: "Ethereum",
      symbol: "ETH",
      icon: "ethereum",
      iconType: "custom",
      balance: "0.7107",
      usdValue: "1945.20",
      change24h: 5.68,
      price: "2718.03",
      color: "#627EEA"
    },
    {
      id: "usdc",
      name: "USDC Coin",
      symbol: "USDC",
      icon: "cash-outline",
      iconType: "ionicon",
      balance: "110.16",
      usdValue: "110.20",
      change24h: 0.77,
      price: "1.00",
      color: "#2775CA"
    },
    {
      id: "usdt",
      name: "Tether",
      symbol: "USDT",
      icon: "cash",
      iconType: "ionicon",
      balance: "136.00",
      usdValue: "136.00",
      change24h: -0.2,
      price: "1.00",
      color: "#50AF95"
    },
    {
      id: "bnb",
      name: "BNB",
      symbol: "BNB",
      icon: "diamond-outline",
      iconType: "ionicon",
      balance: "1.42",
      usdValue: "568.49",
      change24h: 5.90,
      price: "400.35",
      color: "#F3BA2F"
    },
    {
      id: "pepe",
      name: "PEPE",
      symbol: "PEPE",
      icon: "happy",
      iconType: "ionicon",
      balance: "350429430.60",
      usdValue: "35,325.00",
      change24h: -1.60,
      price: "0.0001",
      color: "#6AA64C"
    },
    {
      id: "wbtc",
      name: "Wrapped Bitcoin",
      symbol: "WBTC",
      icon: "logo-bitcoin",
      iconType: "ionicon",
      balance: "0.064",
      usdValue: "6238.00",
      change24h: -1.60,
      price: "97468.75",
      color: "#F09242"
    },
    // Additional tokens
    {
      id: "matic",
      name: "Polygon",
      symbol: "MATIC",
      icon: "prism-outline",
      iconType: "ionicon",
      balance: "250.00",
      usdValue: "180.00",
      change24h: 2.1,
      price: "0.72",
      color: "#8247E5"
    },
    {
      id: "sol",
      name: "Solana",
      symbol: "SOL",
      icon: "sparkles-outline",
      iconType: "ionicon",
      balance: "12.50",
      usdValue: "2700.00",
      change24h: -0.9,
      price: "216.00",
      color: "#14F195"
    },
    {
      id: "link",
      name: "Chainlink",
      symbol: "LINK",
      icon: "link-outline",
      iconType: "ionicon",
      balance: "45.2",
      usdValue: "610.00",
      change24h: 1.4,
      price: "13.50",
      color: "#2A5ADA"
    },
    {
      id: "arb",
      name: "Arbitrum",
      symbol: "ARB",
      icon: "flash-outline",
      iconType: "ionicon",
      balance: "320.00",
      usdValue: "410.00",
      change24h: 3.2,
      price: "1.28",
      color: "#28A0F0"
    },
    {
      id: "op",
      name: "Optimism",
      symbol: "OP",
      icon: "rocket-outline",
      iconType: "ionicon",
      balance: "180.00",
      usdValue: "390.00",
      change24h: -2.6,
      price: "2.17",
      color: "#FF0420"
    },
    {
      id: "ada",
      name: "Cardano",
      symbol: "ADA",
      icon: "ellipse-outline",
      iconType: "ionicon",
      balance: "1500.00",
      usdValue: "780.00",
      change24h: 0.4,
      price: "0.52",
      color: "#0033AD"
    },
    {
      id: "dot",
      name: "Polkadot",
      symbol: "DOT",
      icon: "radio-button-on-outline",
      iconType: "ionicon",
      balance: "220.00",
      usdValue: "146.00",
      change24h: -1.2,
      price: "0.66",
      color: "#E6007A"
    },
    {
      id: "avax",
      name: "Avalanche",
      symbol: "AVAX",
      icon: "triangle-outline",
      iconType: "ionicon",
      balance: "34.00",
      usdValue: "1228.00",
      change24h: 4.2,
      price: "36.12",
      color: "#E84142"
    },
    {
      id: "doge",
      name: "Dogecoin",
      symbol: "DOGE",
      icon: "paw-outline",
      iconType: "ionicon",
      balance: "5400.00",
      usdValue: "450.00",
      change24h: -0.8,
      price: "0.083",
      color: "#C2A633"
    }
  ]);

  const [nfts] = useState<UiNft[]>([
    { id: "nft-azuki-1", name: "Azuki #4521", collection: "Azuki", color: "#C14AFF", usdValue: "2,350.00" },
    { id: "nft-bayc-1", name: "BAYC #839", collection: "Bored Ape YC", color: "#F9C23C", usdValue: "78,200.00" },
    { id: "nft-mayc-1", name: "MAYC #1201", collection: "Mutant Ape YC", color: "#8BE38B", usdValue: "12,450.00" },
    { id: "nft-doodles-1", name: "Doodle #201", collection: "Doodles", color: "#FF8FA3", usdValue: "3,120.00" },
    { id: "nft-pudgy-1", name: "Pudgy #9901", collection: "Pudgy Penguins", color: "#6AC6FF", usdValue: "5,980.00" },
    { id: "nft-mfers-1", name: "mfers #101", collection: "mfers", color: "#9E9E9E", usdValue: "890.00" }
  ]);

  const totalPortfolioValue = useMemo(() => {
    const total = tokens.reduce((sum, token) => sum + parseFloat(token.usdValue), 0);
    return total.toFixed(2);
  }, [tokens]);

  const portfolioChange24h = useMemo(() => {
    const totalValue = parseFloat(totalPortfolioValue);
    const previousValue = tokens.reduce((sum, token) => {
      const currentValue = parseFloat(token.usdValue);
      const previousValue = currentValue / (1 + token.change24h / 100);
      return sum + previousValue;
    }, 0);
    const change = ((totalValue - previousValue) / previousValue) * 100;
    return change;
  }, [tokens, totalPortfolioValue]);

  const generateMockAddress = (existing: Set<string>) => {
    const hex = '0123456789abcdef';
    let addr = '';
    do {
      let body = '';
      for (let i = 0; i < 40; i++) body += hex[Math.floor(Math.random() * hex.length)];
      addr = `0x${body}`;
    } while (existing.has(addr));
    return addr;
  };

  const addMockAccount = () => {
    const next = accounts.length + 1;
    const existing = new Set(accounts.map(a => a.address));
    const address = generateMockAddress(existing);
    setAccounts(prev => [
      ...prev,
      { id: `acc-${next - 1}`, label: `Account ${next}`, address, balance: "0.0000" }
    ]);
    setActiveIndex(next - 1);
  };

  const value = useMemo(() => ({
    accounts,
    activeIndex,
    setActiveIndex,
    networks,
    networkIndex,
    setNetworkIndex,
    tokens,
    nfts,
    totalPortfolioValue,
    portfolioChange24h,
    addMockAccount
  }),
    [accounts, activeIndex, networks, networkIndex, tokens, nfts, totalPortfolioValue, portfolioChange24h]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useWalletUi = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWalletUi must be used within WalletUiProvider");
  return ctx;
};
