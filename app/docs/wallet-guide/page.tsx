import Link from "next/link";
import { ApiTable } from "@/components/api-table";
import { Example } from "@/components/example";

export default function WalletGuidePage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold">Wallet Integration Guide</h1>
                <p className="text-xl text-muted-foreground mt-4">
                    Complete guide to the modern wallet system with automatic initialization and state restoration.
                </p>
            </div>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Architecture Overview</h2>
                <p className="mb-4">
                    The wallet system is built on three core components working together to provide seamless wallet
                    integration.
                </p>

                <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🏪 Wallet Store</h3>
                        <p className="text-sm text-muted-foreground">
                            Zustand-based global state management for wallet connections and Tezos instances.
                        </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🪝 useTezos Hook</h3>
                        <p className="text-sm text-muted-foreground">
                            React hook that provides easy access to wallet functionality and auto-initialization.
                        </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🔌 WalletProvider</h3>
                        <p className="text-sm text-muted-foreground">
                            React provider that ensures wallet initialization happens at the app level.
                        </p>
                    </div>
                </div>

                <Example title="System Flow">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                        <code>{`App Startup → WalletProvider → initializeWallets() → Check Existing Connections

1. Beacon Wallet Check:
   - Initialize BeaconWallet instance
   - Call wallet.client.getActiveAccount()
   - If account exists → set address in store

2. Kukai Check:
   - Initialize KukaiEmbed instance
   - Check kukai.user.pkh for existing session
   - If session exists → set address in store

3. State Ready:
   - Components receive wallet state via useTezos()
   - UI reflects connection status automatically`}</code>
                    </pre>
                </Example>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Wallet Store Details</h2>
                <p className="mb-4">
                    The Zustand store manages all wallet state and provides methods for connection management.
                </p>

                <Example title="Store Interface">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                        <code>{`interface WalletState {
  // Core instances
  Tezos: TezosToolkit;           // Main Taquito instance
  wallet: BeaconWallet | null;   // Beacon wallet instance
  kukai: KukaiEmbed | null;      // Kukai wallet instance
  
  // Connection state
  address: string | null;        // Connected wallet address
  isInitialized: boolean;        // Initialization status
  
  // Methods
  initializeWallets: () => Promise<void>;     // Auto-init on startup
  connectWallet: () => Promise<void>;         // Connect Beacon wallet
  connectKukai: () => Promise<void>;          // Connect Kukai wallet  
  disconnectWallet: () => Promise<void>;      // Disconnect all wallets
}`}</code>
                    </pre>
                </Example>

                <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-3">Key Features</h3>
                    <ul className="space-y-2 text-sm">
                        <li>
                            ✅ <strong>Auto-initialization</strong>: Checks for existing connections on app start
                        </li>
                        <li>
                            ✅ <strong>Multi-wallet support</strong>: Handles both Beacon and Kukai simultaneously
                        </li>
                        <li>
                            ✅ <strong>Network awareness</strong>: Automatically configures for testnet/mainnet
                        </li>
                        <li>
                            ✅ <strong>Error handling</strong>: Graceful degradation when wallets fail to initialize
                        </li>
                        <li>
                            ✅ <strong>Type safety</strong>: Full TypeScript support with proper error types
                        </li>
                    </ul>
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Initialization Process</h2>
                <p className="mb-4">
                    Understanding how wallet initialization works helps you debug connection issues and optimize
                    performance.
                </p>

                <Example title="Initialization Flow">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                        <code>{`async initializeWallets() {
  try {
    // 1. Import wallet libraries dynamically
    const { BeaconWallet } = await import('@taquito/beacon-wallet');
    const { KukaiEmbed, Networks } = await import('kukai-embed');
    
    // 2. Initialize Beacon Wallet
    const wallet = new BeaconWallet({
      name: 'Tezos Boilerplate',
      preferredNetwork: ENV === 'dev' ? NetworkType.GHOSTNET : NetworkType.MAINNET
    });
    
    // 3. Set as Tezos provider
    Tezos.setWalletProvider(wallet);
    
    // 4. Check for existing active account
    const activeAccount = await wallet.client.getActiveAccount();
    if (activeAccount) {
      // User was previously connected → restore state
      set({ address: activeAccount.address });
    }
    
    // 5. Initialize Kukai
    const kukai = new KukaiEmbed({
      net: ENV === 'dev' ? Networks.ghostnet : Networks.mainnet
    });
    await kukai.init();
    
    // 6. Check for existing Kukai session
    if (kukai.user?.pkh) {
      // Kukai session exists → restore state
      if (!activeAccount) { // Only if no Beacon connection
        set({ address: kukai.user.pkh });
      }
    }
    
    // 7. Mark as initialized
    set({ isInitialized: true });
    
  } catch (error) {
    console.error('Wallet initialization failed:', error);
    set({ isInitialized: true }); // Still mark as initialized to prevent retries
  }
}`}</code>
                    </pre>
                </Example>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Using the useTezos Hook</h2>
                <p className="mb-4">
                    The useTezos hook is your main interface to the wallet system. It handles initialization and
                    provides a clean API.
                </p>

                <Example title="Hook Implementation">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                        <code>{`export const useTezos = () => {
  const store = useWalletStore();
  
  // Auto-initialize on first use
  useEffect(() => {
    if (!store.isInitialized) {
      store.initializeWallets();
    }
  }, [store.isInitialized, store.initializeWallets]);
  
  return {
    Tezos: store.Tezos,
    wallet: store.wallet,
    address: store.address,
    kukai: store.kukai,
    isInitialized: store.isInitialized,
    connectWallet: store.connectWallet,
    connectKukai: store.connectKukai,
    disconnectWallet: store.disconnectWallet
  };
};`}</code>
                    </pre>
                </Example>

                <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-3">Hook Usage Patterns</h3>
                    <ApiTable
                        rows={[
                            ["Check initialization", "if (!isInitialized) return <Loading />"],
                            ["Check connection", "if (address) → show connected state"],
                            ["Connect wallet", "await connectWallet() → handles permissions"],
                            ["Send transaction", "await Tezos.wallet.transfer(...).send()"],
                            ["Get balance", "await Tezos.tz.getBalance(address)"],
                            ["Disconnect", "await disconnectWallet() → clears all state"],
                        ]}
                    />
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">State Restoration</h2>
                <p className="mb-4">
                    One of the key features is automatic state restoration - your users stay connected across page
                    refreshes.
                </p>

                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20 mb-4">
                    <h3 className="font-semibold mb-2">🔄 How State Restoration Works</h3>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>User connects wallet in your dApp</li>
                        <li>Wallet stores connection info in browser storage (handled by Beacon/Kukai)</li>
                        <li>User refreshes page or navigates away and back</li>
                        <li>WalletProvider runs initializeWallets() on app start</li>
                        <li>System checks for existing wallet connections</li>
                        <li>If found, automatically restores the connected state</li>
                        <li>UI immediately shows connected state - no re-login required!</li>
                    </ol>
                </div>

                <Example title="Testing State Restoration">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                        <code>{`// Test the restoration flow:

1. Connect wallet in your dApp
2. Open browser dev tools → Application tab → Local Storage
3. Look for beacon: or kukai: entries (these persist the connection)
4. Refresh the page (Cmd+R / Ctrl+R)
5. Watch the wallet button - it should show "Disconnect" immediately
6. No login prompt should appear

// If restoration fails:
// - Check browser console for errors
// - Verify WalletProvider is wrapping your app
// - Ensure useTezos is called in components that need wallet state`}</code>
                    </pre>
                </Example>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Best Practices</h2>
                <p className="mb-4">Follow these patterns to get the most out of the wallet system.</p>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">✅ Do</h3>
                        <ul className="text-sm space-y-1">
                            <li>• Check isInitialized before showing wallet buttons</li>
                            <li>• Use the address to determine connection state</li>
                            <li>• Handle connection errors gracefully</li>
                            <li>• Show loading states during operations</li>
                            <li>• Use Tezos.wallet for transaction operations</li>
                        </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2 text-red-600">❌ Don&apos;t</h3>
                        <ul className="text-sm space-y-1">
                            <li>• Create multiple TezosToolkit instances</li>
                            <li>• Initialize wallets outside the store</li>
                            <li>• Block UI while waiting for initialization</li>
                            <li>• Assume wallet state without checking</li>
                            <li>• Forget to handle disconnection</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Next Steps</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🚀 Try It Out</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Test the wallet system with the interactive components
                        </p>
                        <Link href="/" className="text-primary hover:underline text-sm">
                            Go to playground →
                        </Link>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🔧 Troubleshooting</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Having issues? Check the troubleshooting guide
                        </p>
                        <a href="/docs/troubleshooting" className="text-primary hover:underline text-sm">
                            Get help →
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
