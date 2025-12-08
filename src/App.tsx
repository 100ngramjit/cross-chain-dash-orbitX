import { useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./components/Dashboard";
import { useWalletStore } from "./store/useWalletStore";

function App() {
  const { checkConnection, disconnectWallet } = useWalletStore();

  useEffect(() => {
    checkConnection();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          useWalletStore.setState({ address: accounts[0], isConnected: true });
          useWalletStore.getState().fetchHistory();
        } else {
          disconnectWallet();
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, [checkConnection, disconnectWallet]);

  return (
    <div className="min-h-screen bg-background text-gray-200 selection:bg-primary selection:text-black">
      <Navbar />
      <Dashboard />
    </div>
  );
}

export default App;
