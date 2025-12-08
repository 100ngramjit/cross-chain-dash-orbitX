import {
  Alchemy,
  Network,
  AssetTransfersCategory,
  SortingOrder,
} from "alchemy-sdk";
import pLimit from "p-limit";
import type { Chain, Transaction } from "../types";

// Limit to 5 concurrent requests globally
const limit = pLimit(5);

const CHAIN_SETTINGS: Record<Chain, Network> = {
  ETH_MAINNET: Network.ETH_MAINNET,
  ETH_SEPOLIA: Network.ETH_SEPOLIA,
  MATIC_MAINNET: Network.MATIC_MAINNET,
  ARB_MAINNET: Network.ARB_MAINNET,
};

export const CHAIN_DISPLAY: Record<
  Chain,
  { name: string; nativeCurrency: string }
> = {
  ETH_MAINNET: { name: "Ethereum", nativeCurrency: "ETH" },
  ETH_SEPOLIA: { name: "Sepolia", nativeCurrency: "ETH" },
  MATIC_MAINNET: { name: "Polygon", nativeCurrency: "MATIC" },
  ARB_MAINNET: { name: "Arbitrum", nativeCurrency: "ETH" },
};

export const fetchChainHistory = async (
  address: string,
  chain: Chain
): Promise<Transaction[]> => {
  const settings = {
    apiKey: import.meta.env.ALCHEMY_API_KEY,
    network: CHAIN_SETTINGS[chain],
  };

  const alchemy = new Alchemy(settings);

  try {
    const [sentData, receivedData] = await Promise.all([
      limit(() =>
        alchemy.core.getAssetTransfers({
          fromAddress: address,
          category: [
            AssetTransfersCategory.EXTERNAL,
            AssetTransfersCategory.ERC20,
          ],
          order: SortingOrder.DESCENDING,
          maxCount: 20,
          withMetadata: true,
        })
      ),
      limit(() =>
        alchemy.core.getAssetTransfers({
          toAddress: address,
          category: [
            AssetTransfersCategory.EXTERNAL,
            AssetTransfersCategory.ERC20,
          ],
          order: SortingOrder.DESCENDING,
          maxCount: 20,
          withMetadata: true,
        })
      ),
    ]);

    // Helper to format Alchemy response to our Transaction type
    const formatTx = (tx: any, type: "sent" | "received"): Transaction => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value || 0,
      timestamp: tx.metadata.blockTimestamp,
      chain: chain,
      type: type,
      status: "confirmed",
      asset: tx.asset || CHAIN_DISPLAY[chain].nativeCurrency,
    });

    const sentTxs = sentData.transfers.map((tx) => formatTx(tx, "sent"));
    const receivedTxs = receivedData.transfers.map((tx) =>
      formatTx(tx, "received")
    );

    const allTxs = [...sentTxs, ...receivedTxs].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return allTxs.slice(0, 10);
  } catch (error) {
    console.error("Alchemy API Error:", error);
    throw new Error("Failed to fetch data from Alchemy. Check API Key.");
  }
};
