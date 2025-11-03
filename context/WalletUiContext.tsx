import React, { createContext, useContext, useMemo, useState } from "react";

export type UiAccount = { id: string; label: string; address: string; balance: string };
export type UiNetwork = { id: string; name: string; symbol: string };

type WalletUiContextValue = {
  accounts: UiAccount[];
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  networks: UiNetwork[];
  networkIndex: number;
  setNetworkIndex: (i: number) => void;
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

  const addMockAccount = () => {
    const next = accounts.length + 1;
    setAccounts(prev => [...prev, { id: `acc-${next - 1}`, label: `Account ${next}`, address: `0xA${next}C...${90 + next}F`, balance: "0.0000" }]);
    setActiveIndex(next - 1);
  };

  const value = useMemo(() => ({ accounts, activeIndex, setActiveIndex, networks, networkIndex, setNetworkIndex, addMockAccount }),
    [accounts, activeIndex, networks, networkIndex]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useWalletUi = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWalletUi must be used within WalletUiProvider");
  return ctx;
};
