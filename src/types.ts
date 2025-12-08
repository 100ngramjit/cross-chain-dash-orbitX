export type Chain =
  | "ETH_MAINNET"
  | "ETH_SEPOLIA"
  | "MATIC_MAINNET"
  | "ARB_MAINNET";

export interface Transaction {
  hash: string;
  from: string;
  to: string | null;
  value: number;
  timestamp: string;
  chain: Chain;
  type: "sent" | "received";
  status: "confirmed" | "pending" | "failed";
  asset: string;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  selectedChain: Chain;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setChain: (chain: Chain) => void;
  fetchHistory: () => Promise<void>;
}
