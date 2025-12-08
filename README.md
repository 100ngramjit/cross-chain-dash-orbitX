# Cross Chain Dash

## Setup & Run

```bash
npm install
npm start
```

Open the printed local URL (default `http://localhost:5173`), then connect your wallet.

## Configuration

Create `.env` (or `.env.local`) in the project root:

```
VITE_ALCHEMY_API_KEY=your_alchemy_key
```

Notes:

- The dapp expects a browser wallet injected as `window.ethereum` (tested with MetaMask). No custom RPC endpoints are configured; Alchemy handles RPC.
- Chain list is defined in `services/alchemyService.ts` (`CHAIN_SETTINGS` / `CHAIN_DISPLAY`).

## Architecture & Component Structure

- `index.html` at the root is the single HTML entry page; Vite injects the compiled JavaScript from src/main.tsx into this file at build and dev time.​
- `src/main.tsx` is the runtime entry point that creates the React root and renders the App component into the DOM.​
- `App.tsx` defines the top-level UI shell (wrapping the navbar and dashboard), while App.css and index.css provide global styling applied across the entire app.

- `src/components/` contains reusable UI components; here Dashboard.tsx implements the main dashboard view and Navbar.tsx handles the top navigation.
- `src/hooks/` groups custom React hooks, such as useTheme.ts, which centralizes theme-related state and logic instead of scattering it across components.
- `src/store/` holds application state management logic; useWalletStore.ts encapsulates wallet-related state (addresses, balances, connection status) behind a clean API.

- `src/services/` groups external integration code; alchemyService.ts isolates all interactions with the Alchemy blockchain APIs so UI and store code call a single service layer.
- `src/assets/` stores importable static assets (like react.svg) that are processed through Vite’s asset pipeline when imported from code.​
- `types.ts` and `vite-env.d.ts` centralize shared TypeScript types and ambient declarations (including Vite-specific env typings), keeping type definitions in one place.

## Tech Choices

- **React + Vite + TS**: Fast dev experience, easy setup , type safety, and HMR.
- **Zustand**: Lightweight global state without boilerplate; also comes with localstorage hooks inbuilt.
- **Tailwind**: easy to setup , clean and inbuilt style classes which can be used globally and responsive by default.
- **ethers v6**: Wallet connection (MetaMask) and provider abstraction.
- **p-limit**: rate limits concurrent Alchemy calls to maximum 5 nos.
- **lucide-react & date-fns**: Icon library and human readable date time formats.

## Assumptions & Tradeoffs

- I assumed only MetaMask or compatible EIP-1193 provider is available; no fallback wallet UI.
- Only the user's chain prefernces is persisted ; wallet connection is restored via `eth_accounts` using ethers.js browserprovider to avoid storing addresses in localStorage.
- I used a simple USD price estimate (static value) instead of a live price feed to avoid extra API calls .
- Limited history to the 10 most recent combined sent/received transfers per chain .

## Known Limitations / Future Improvements

- No pagination or infinite scroll; only the latest 10 transfers.
- No live price feed; USD estimates keep changing , live price APIs can be used like CoinGecko.
- Explorer links are hardcoded to Etherscan/Sepolia; Polygon/Arbitrum and other scan links can be added as chains increase.
- Error handling is generic; could surface specific RPC/Alchemy issues.
- UX: Could add toast feedback, network switching, and a unified connect modal with more wallets , preferably using standard solutions like RainbowKit .
- unit and automated tests can be added when the number of components increase and project complexity increases.
