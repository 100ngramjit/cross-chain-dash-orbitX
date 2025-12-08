import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ethers } from "ethers";
import type { WalletState } from "../types";
import { fetchChainHistory } from "../services/alchemyService";

// Add checkConnection to the interface if you haven't already in types.ts
// Or simply augment the store definition here:
interface WalletStore extends WalletState {
  checkConnection: () => Promise<void>;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      address: null,
      isConnected: false,
      selectedChain: "ETH_MAINNET",
      transactions: [],
      isLoading: false,
      error: null,

      connectWallet: async () => {
        set({ isLoading: true, error: null });
        try {
          if (!window.ethereum) throw new Error("MetaMask not installed");

          const provider = new ethers.BrowserProvider(window.ethereum);
          // 'eth_requestAccounts' opens the popup
          const accounts = await provider.send("eth_requestAccounts", []);

          if (accounts.length > 0) {
            set({ address: accounts[0], isConnected: true, isLoading: false });
            get().fetchHistory();
          }
        } catch (err: any) {
          set({ error: err.message || "Connection failed", isLoading: false });
        }
      },

      // NEW: Checks if already connected on load
      checkConnection: async () => {
        if (!window.ethereum) return;

        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          // 'eth_accounts' only checks existing permissions, doesn't open popup
          const accounts = await provider.send("eth_accounts", []);

          if (accounts.length > 0) {
            set({ address: accounts[0], isConnected: true });
            get().fetchHistory();
          }
        } catch (err) {
          console.error("Failed to restore connection", err);
        }
      },

      disconnectWallet: () => {
        set({ address: null, isConnected: false, transactions: [] });
      },

      setChain: (chain) => {
        set({ selectedChain: chain });
        if (get().isConnected) {
          get().fetchHistory();
        }
      },

      fetchHistory: async () => {
        const { address, selectedChain } = get();
        if (!address) return;

        set({ isLoading: true, error: null });

        try {
          const txs = await fetchChainHistory(address, selectedChain);
          set({ transactions: txs, isLoading: false });
        } catch (err: any) {
          console.error(err);
          set({
            error: "Failed to load transactions.",
            transactions: [],
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "wallet-storage",
      // We still ONLY persist chain preference.
      // Connection state is restored via checkConnection() for security.
      partialize: (state) => ({ selectedChain: state.selectedChain }),
    }
  )
);
