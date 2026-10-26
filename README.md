# Next.js Tezos Wallet Boilerplate

A modern, production-ready boilerplate for building Tezos dApps with Next.js and comprehensive wallet integration.

## 🚀 Features

-   🔐 **Multi-Wallet Support** - Octez Connect SDK (Temple, Kukai, Umami, MetaMask) + Kukai Embed
-   🔄 **Persistent Connections** - Automatic wallet state restoration on page refresh
-   🌐 **Multi-Network Ready** - First-class support for Mainnet and Shadownet
-   ⚡ **Optimized Performance** - Smart gas estimation with retry logic
-   🎨 **Modern UI** - Built with shadcn/ui components and Tailwind CSS 4
-   🏗️ **Smart Contracts** - Deploy and interact with SmartPy contracts
-   💸 **Token Support** - Send XTZ and FA1.2/FA2 tokens
-   🔧 **Type Safety** - Full TypeScript support with proper types
-   📱 **Responsive Design** - Mobile-first approach

## 🛠️ Tech Stack

-   **Next.js 16** - React 19 framework with App Router
-   **Taquito v25** - Tezos blockchain interaction library
-   **Octez Connect SDK v5** - `@tezos-x/octez.connect-sdk` multi-wallet connection protocol
-   **Kukai Embed** - Direct Kukai wallet integration
-   **Zustand** - Lightweight state management
-   **Tailwind CSS 4** - Utility-first CSS framework
-   **shadcn/ui** - Accessible component library
-   **TypeScript** - Type-safe development

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/skullzarmy/nextjs-tezos-wallet-boilerplate
cd nextjs-tezos-wallet-boilerplate

# Install dependencies
bun install
# or npm install / yarn install / pnpm install

# Start development server
bun dev
# or npm run dev / yarn dev / pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your dApp in action!

## 📁 Project Structure

```text
├── app/                    # Next.js App Router
│   ├── docs/              # Documentation pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main application page
├── components/
│   ├── layout/            # Layout components (Header, WalletConnection)
│   ├── providers/         # React providers (WalletProvider)
│   ├── ui/                # shadcn/ui reusable components
│   ├── contract-playground.tsx  # Smart contract interaction
│   ├── tez-faucet.tsx     # Testnet token faucet
│   └── ...                # Other dApp components
├── lib/
│   ├── tezos/
│   │   ├── store/         # Zustand wallet store
│   │   │   └── walletStore.ts
│   │   └── useTezos.tsx   # Main Tezos hook
│   ├── constants.ts       # App constants
│   └── utils.ts           # Utility functions
├── public/                # Static assets
├── next.config.mjs        # Next.js configuration
├── tailwind.config.ts     # Tailwind configuration
└── components.json        # shadcn/ui configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```bash
# Network configuration: mainnet or shadownet
NEXT_PUBLIC_TEZOS_NETWORK=shadownet
```

### Wallet Configuration

The app automatically configures wallet providers based on your network:

-   **Shadownet**: Testnet matching latest protocol updates
-   **Mainnet**: Production Tezos network

## 🏗️ Architecture

### Wallet Management

The boilerplate uses a sophisticated wallet management system:

```typescript
// Zustand store for global wallet state
const useWalletStore = create<WalletState>((set, get) => ({
    Tezos: new TezosToolkit(rpcUrl),
    wallet: null,
    address: null,
    // Automatic initialization and state restoration
    initializeWallets: async () => {
        /* ... */
    },
}));

// React hook for components
export const useTezos = () => {
    const store = useWalletStore();
    // Auto-initialization on first use
    useEffect(() => {
        if (!store.isInitialized) {
            store.initializeWallets();
        }
    }, []);
    return store;
};
```

### Key Features

1. **Auto-Restoration**: Wallet connections persist across page refreshes
2. **Multi-Provider**: Supports Beacon SDK + Kukai Embed simultaneously
3. **Smart Gas**: Automatic gas estimation with retry logic
4. **Type Safety**: Full TypeScript integration

## 🔗 Available Wallets

-   **Temple Wallet** - Browser extension
-   **Kukai** - Web wallet with social login
-   **Umami** - Mobile and browser wallet
-   **Ledger** - Hardware wallet support
-   **And more** - Any Beacon SDK compatible wallet

## 📚 Documentation

Visit `/docs` in your running application for comprehensive guides:

-   Installation & Setup
-   Configuration Options
-   Component API Reference
-   Code Examples & Patterns
-   Troubleshooting Guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⭐ Support

If you find this boilerplate helpful, please give it a star on GitHub!

---

Built with ❤️ for the Tezos ecosystem
