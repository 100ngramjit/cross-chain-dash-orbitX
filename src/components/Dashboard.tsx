import clsx from "clsx";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
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

const getStatusStyles = (status: string) => {
  const normalizedStatus = status.toLowerCase();
  switch (normalizedStatus) {
    case "success":
    case "confirmed":
      return {
        style: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        icon: <CheckCircle2 className="w-3 h-3" />,
      };
    case "pending":
    case "processing":
      return {
        style: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        icon: <Loader2 className="w-3 h-3 animate-spin" />,
      };
    case "failed":
    case "reverted":
      return {
        style: "bg-red-500/10 text-red-500 border-red-500/20",
        icon: <XCircle className="w-3 h-3" />,
      };
    default:
      return {
        style: "bg-slate-500/10 text-slate-500 border-slate-500/20",
        icon: null,
      };
  }
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

  const getExplorerUrl = (hash: string) => {
    const baseUrl =
      selectedChain === "ETH_MAINNET" ? "etherscan.io" : "sepolia.etherscan.io";
    return `https://${baseUrl}/tx/${hash}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 transition-colors duration-300">
      {/* Header */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="md:text-3xl text-2xl font-bold text-text-main mb-2">
          Transaction Feed
        </h1>
        <p className="text-text-muted text-sm md:text-base">
          Real-time data from Alchemy.
        </p>
      </div>

      {/* Wallet Not Connected */}
      {!isConnected && (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-surface/30 shadow-md">
          <p className="text-text-muted mb-3">Connect your wallet to begin.</p>
          <p className="text-sm text-text-muted text-center">
            Transaction and chain data will appear here once connected.
          </p>
        </div>
      )}

      {/* Only render when connected */}
      {isConnected && (
        <>
          {/* Chain Selector */}
          <div className="flex flex-wrap gap-2 mb-8">
            {(Object.keys(CHAIN_DISPLAY) as Chain[]).map((key) => (
              <button
                key={key}
                onClick={() => setChain(key)}
                disabled={isLoading}
                className={clsx(
                  "md:px-4 px-2 md:py-2 py-1 rounded-full text-xs md:text-sm font-medium transition-all border cursor-pointer shadow-lg",
                  selectedChain === key
                    ? "bg-primary-dim border-primary text-primary "
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

          {/* Data Area */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-surface rounded-xl animate-pulse shadow-2xl border border-border"
                />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-text-muted bg-surface rounded-xl border border-border">
              No recent transactions found on{" "}
              {CHAIN_DISPLAY[selectedChain].name}.
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const statusConfig = getStatusStyles(tx.status);
                return (
                  <div
                    key={tx.hash}
                    className="group bg-surface hover:bg-surface-hover border border-border rounded-xl md:p-4 p-2 flex flex-col sm:flex-row items-start sm:items-center shadow-md justify-between gap-4 transition-colors"
                  >
                    {/* Left Section */}
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

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-text-main truncate text-sm md:text-base">
                            {tx.type === "sent" ? "Sent" : "Received"}{" "}
                            {tx.asset}
                          </span>
                          <span
                            className={clsx(
                              "text-xs font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 capitalize",
                              statusConfig.style
                            )}
                          >
                            {statusConfig.icon}
                            {tx.status}
                          </span>
                        </div>

                        <div className="text-xs md:text-sm text-text-muted flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {formatDistanceToNow(new Date(tx.timestamp), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <span className="hidden sm:inline text-border">
                            •
                          </span>
                          <span className="hidden sm:inline font-mono text-xs md:text-sm">
                            {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                          </span>
                          <span className="hidden sm:inline text-border">
                            •
                          </span>
                          <a
                            href={getExplorerUrl(tx.hash)}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-xs md:text-sm text-primary hover:underline hover:text-primary-hover transition-colors flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                            <ExternalLink className="w-3 h-3 opacity-50" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Right Section */}
                    <div className="text-left sm:text-right w-full sm:w-auto pl-14 sm:pl-0 text-xs md:text-sm">
                      <p
                        className={clsx(
                          "md:text-lg text-base font-bold",
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
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
