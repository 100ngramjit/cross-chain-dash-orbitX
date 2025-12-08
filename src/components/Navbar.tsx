import { useState, useRef, useEffect } from "react";
import {
  Wallet,
  LogOut,
  Sun,
  Moon,
  Copy,
  Check,
  User,
  ChevronDown,
} from "lucide-react";
import { useWalletStore } from "../store/useWalletStore";
import { useTheme } from "../hooks/useTheme";
import clsx from "clsx";

export const Navbar = () => {
  const { isConnected, address, connectWallet, disconnectWallet } =
    useWalletStore();
  const { theme, toggleTheme } = useTheme();

  // State for the dropdown, copy feedback, and scroll status
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); // New state for scroll
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Track scroll position to toggle sticky styles
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopy = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={clsx(
        "sticky top-0 z-50 h-16 flex items-center justify-between px-6 transition-all duration-300 border-b",
        // Conditional styles based on scroll state
        isScrolled
          ? "bg-surface/85 backdrop-blur-md border-border shadow-sm supports-[backdrop-filter]:bg-surface/60"
          : "bg-surface border-transparent" // Or keep border-border if you want lines always visible
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 text-primary font-bold text-sm md:text-xl">
        <div className="p-1.5 bg-primary-dim rounded-lg">
          <Wallet className="w-6 h-6" />
        </div>
        <span>Cross Chain Dashboard</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-surface hover:bg-surface-hover text-text-muted hover:text-primary transition-colors cursor-pointer border border-border"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? (
            <Sun className="md:w-5 w-4 md:h-5 h-4" />
          ) : (
            <Moon className="md:w-5 w-4 md:h-5 h-4" />
          )}
        </button>

        {/* Wallet Connection Section */}
        {!isConnected ? (
          <button
            onClick={connectWallet}
            className="bg-primary hover:bg-primary-hover text-white dark:text-black font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer text-xs md:text-sm"
          >
            Connect
          </button>
        ) : (
          <div className="relative" ref={menuRef}>
            {/* Trigger Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={clsx(
                "flex items-center gap-2 p-1.5 pr-3 rounded-xl border transition-all cursor-pointer",
                isMenuOpen
                  ? "bg-surface-hover border-primary shadow-[0_0_10px_var(--primary-dim)]"
                  : "bg-surface border-border hover:border-primary/50"
              )}
            >
              {/* Avatar Gradient Icon */}
              <div className="md:w-8 w-6 md:h-8 h-6 rounded-lg bg-gradient-to-br from-primary to-emerald-800 flex items-center justify-center text-white shadow-inner">
                <User className="w-4 h-4" />
              </div>

              {/* Address (Hidden on Mobile, Visible on Desktop) */}
              <div className="hidden md:flex flex-col items-start">
                <span className="text-xs text-text-muted font-medium leading-none mb-1">
                  Wallet
                </span>
                <span className="text-sm font-mono text-text-main leading-none">
                  {address?.slice(0, 4)}...{address?.slice(-4)}
                </span>
              </div>

              <ChevronDown
                className={clsx(
                  "w-4 h-4 text-text-muted transition-transform duration-200",
                  isMenuOpen && "rotate-180"
                )}
              />
            </button>

            {/* Dropdown Popup */}
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-surface rounded-xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                {/* Header */}
                <div className="p-4 border-b border-border bg-surface-hover/50">
                  <p className="text-sm text-text-muted mb-1">
                    Connected Account
                  </p>
                  <div className="flex items-center justify-between bg-background p-2 rounded-lg border border-border">
                    <span className="font-mono text-sm text-text-main truncate mr-2">
                      {address?.slice(0, 6)}...{address?.slice(-6)}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="p-1.5 hover:bg-surface-hover rounded-md text-text-muted hover:text-primary transition-colors cursor-pointer"
                      title="Copy Address"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-2">
                  <a
                    href={`https://etherscan.io/address/${address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
                  >
                    <Wallet className="w-4 h-4" />
                    View on Explorer
                  </a>

                  <div className="h-px bg-border my-1 mx-2"></div>

                  <button
                    onClick={handleDisconnect}
                    className="flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect Wallet
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
