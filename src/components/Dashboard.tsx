import clsx from "clsx";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useWalletStore } from "../store/useWalletStore";
import { CHAIN_DISPLAY } from "../services/alchemyService";
import type { Chain } from "../types";
import { formatDistanceToNow } from "date-fns";

const PRICE_ESTIMATES: Record<string, number> = {
  ETH: 2800,
  MATIC: 0.6,
  USDC: 1,
  DAI: 1,
  USDT: 1,
};

export const Dashboard = () => {
  const {
    transactions,
    isLoading,
    selectedChain,
    setChain,
    isConnected,
    error,
  } = useWalletStore();

  const getUsdValue = (amount: number, asset: string) => {
    const price = PRICE_ESTIMATES[asset] || 0;
    return (amount * price).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 transition-colors duration-300">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-main mb-2">
          Activity Feed
        </h1>
        <p className="text-text-muted">Real-time data from Alchemy.</p>
      </div>

      {/* Chain Selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(Object.keys(CHAIN_DISPLAY) as Chain[]).map((key) => (
          <button
            key={key}
            onClick={() => setChain(key)}
            disabled={isLoading}
            className={clsx(
              "px-4 py-2 rounded-full text-sm font-medium transition-all border cursor-pointer",
              selectedChain === key
                ? "bg-primary-dim border-primary text-primary shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "bg-surface border-border text-text-muted hover:border-primary/50 hover:text-text-main"
            )}
          >
            {CHAIN_DISPLAY[key].name}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Content Area */}
      {!isConnected ? (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-surface/30">
          <p className="text-text-muted">Connect wallet to view data</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div
              key={i}
              className="h-24 bg-surface rounded-xl animate-pulse shadow-2xl border border-border"
            />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 text-text-muted bg-surface rounded-xl border border-border">
          No recent transactions found on {CHAIN_DISPLAY[selectedChain].name}.
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.hash}
              className="group bg-surface hover:bg-surface-hover border border-border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center shadow-md justify-between gap-4 transition-colors"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div
                  className={clsx(
                    "p-3 rounded-full shrink-0",
                    tx.type === "sent"
                      ? "bg-orange-500/10 text-orange-500"
                      : "bg-primary-dim text-primary"
                  )}
                >
                  {tx.type === "sent" ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <ArrowDownLeft className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-text-main truncate text-sm md:text-base">
                      {tx.type === "sent" ? "Sent" : "Received"} {tx.asset}
                    </span>
                    <a
                      href={`https://${
                        selectedChain === "ETH_MAINNET"
                          ? "etherscan.io"
                          : "sepolia.etherscan.io"
                      }/tx/${tx.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs md:text-sm px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 hover:underline"
                    >
                      {tx.status}
                    </a>
                  </div>
                  <div className="text-xs md:text-sm text-text-muted flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(new Date(tx.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline font-mono text-xs md:text-sm">
                      {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right w-full sm:w-auto pl-14 sm:pl-0 text-xs md:text-sm">
                <p
                  className={clsx(
                    "text-lg font-bold",
                    tx.type === "sent" ? "text-text-main" : "text-primary"
                  )}
                >
                  {tx.type === "sent" ? "-" : "+"}
                  {tx.value.toFixed(4)} {tx.asset}
                </p>
                <p className="text-xs md:text-sm text-text-muted">
                  ≈ {getUsdValue(tx.value, tx.asset)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
