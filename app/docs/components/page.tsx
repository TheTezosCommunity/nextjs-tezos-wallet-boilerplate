import Link from "next/link";
import { ApiTable } from "@/components/api-table";
import { Example } from "@/components/example";

export default function ComponentsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold">Components</h1>
                <p className="text-xl text-muted-foreground mt-4">
                    Pre-built React components for common Tezos dApp functionality.
                </p>
            </div>

            <section>
                <h2 className="text-3xl font-semibold mb-4">WalletConnection</h2>
                <p className="mb-4">
                    Modern wallet connection component with automatic state restoration and multi-wallet support.
                </p>

                <div className="p-6 border rounded-lg bg-muted/30">
                    <h3 className="font-semibold mb-4">Wallet Connection</h3>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md opacity-50 cursor-not-allowed"
                        >
                            <span>👛</span>
                            Connect Wallet (Demo)
                        </button>
                        <span className="text-sm text-muted-foreground">Supports Temple, Kukai, Umami & more</span>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-3">Features</h3>
                    <ul className="space-y-2 text-sm">
                        <li>✅ Automatic wallet detection and initialization</li>
                        <li>✅ Persistent connections across page refreshes</li>
                        <li>✅ Loading states and error handling</li>
                        <li>✅ Multi-wallet support (Beacon + Kukai)</li>
                        <li>✅ Responsive design with mobile support</li>
                    </ul>
                </div>

                <Example title="Usage">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code>{`import WalletConnection from "@/components/layout/connect/WalletConnection";

export function Header() {
  return (
    <header className="flex justify-between items-center p-4">
      <h1>My Tezos DApp</h1>
      <WalletConnection />
    </header>
  );
}`}</code>
                    </pre>
                </Example>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">WalletProvider</h2>
                <p className="mb-4">
                    Root provider component that handles wallet initialization and state management for the entire app.
                </p>

                <Example title="Setup in Layout">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code>{`// app/layout.tsx
import { WalletProvider } from "@/components/providers/wallet-provider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <WalletProvider>
            {children}
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}`}</code>
                    </pre>
                </Example>

                <div className="mt-4 p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                    <h3 className="font-semibold mb-2">⚡ Auto-Initialization</h3>
                    <p className="text-sm text-muted-foreground">
                        The WalletProvider automatically checks for existing wallet connections on app startup and
                        restores the user&apos;s wallet state without requiring re-connection.
                    </p>
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">TransactionForm</h2>
                <p className="mb-4">
                    A form component for sending XTZ transactions with validation, gas estimation, and confirmation
                    tracking.
                </p>

                <div className="p-6 border rounded-lg bg-muted/30">
                    <h3 className="font-semibold mb-4">Send XTZ</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="demo-recipient" className="block text-sm font-medium mb-2">
                                Recipient Address
                            </label>
                            <input
                                id="demo-recipient"
                                type="text"
                                placeholder="tz1..."
                                className="w-full p-2 border rounded-md"
                                disabled
                            />
                        </div>
                        <div>
                            <label htmlFor="demo-amount" className="block text-sm font-medium mb-2">
                                Amount (XTZ)
                            </label>
                            <input
                                id="demo-amount"
                                type="number"
                                placeholder="0.0"
                                className="w-full p-2 border rounded-md"
                                disabled
                            />
                        </div>
                        <button
                            type="button"
                            className="w-full p-2 bg-primary text-primary-foreground rounded-md opacity-50 cursor-not-allowed"
                            disabled
                        >
                            Send Transaction (Demo)
                        </button>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-3">Props</h3>
                    <ApiTable
                        rows={[
                            ["onSuccess", "Function - Callback when transaction succeeds"],
                            ["onError", "Function - Callback when transaction fails"],
                            ["defaultRecipient", "string - Pre-fill recipient address"],
                            ["disabled", "boolean - Disable the form"],
                        ]}
                    />
                </div>

                <Example title="Code Example">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code>{`import { TransactionForm } from "@/components/transaction-form";

export function SendPage() {
  const handleSuccess = (opHash: string) => {
    console.log("Transaction successful:", opHash);
  };

  const handleError = (error: Error) => {
    console.error("Transaction failed:", error);
  };

  return (
    <div className="max-w-md mx-auto">
      <TransactionForm 
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  );
}`}</code>
                    </pre>
                </Example>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">SmartContractInteraction</h2>
                <p className="mb-4">
                    Component for interacting with SmartPy contracts - call methods, view storage, and handle
                    parameters. Includes examples of classic SmartPy contracts.
                </p>

                <div className="p-6 border rounded-lg bg-muted/30">
                    <h3 className="font-semibold mb-4">Contract Interaction</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="demo-contract" className="block text-sm font-medium mb-2">
                                Contract Address
                            </label>
                            <input
                                id="demo-contract"
                                type="text"
                                placeholder="KT1..."
                                className="w-full p-2 border rounded-md"
                                disabled
                            />
                        </div>
                        <div>
                            <label htmlFor="demo-entrypoint" className="block text-sm font-medium mb-2">
                                Entry Point
                            </label>
                            <select id="demo-entrypoint" className="w-full p-2 border rounded-md" disabled>
                                <option>increment</option>
                                <option>decrement</option>
                                <option>add</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="demo-params" className="block text-sm font-medium mb-2">
                                Parameters (JSON)
                            </label>
                            <textarea
                                id="demo-params"
                                placeholder='{"value": 5}'
                                className="w-full p-2 border rounded-md h-20"
                                disabled
                            />
                        </div>
                        <button
                            type="button"
                            className="w-full p-2 bg-primary text-primary-foreground rounded-md opacity-50 cursor-not-allowed"
                            disabled
                        >
                            Call Contract (Demo)
                        </button>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-3">Props</h3>
                    <ApiTable
                        rows={[
                            ["contractAddress", "string - Tezos contract address (KT1...)"],
                            ["onSuccess", "Function - Callback when operation succeeds"],
                            ["onError", "Function - Callback when operation fails"],
                            ["entryPoints", "string[] - Available contract entry points"],
                        ]}
                    />
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">NFTGallery</h2>
                <p className="mb-4">
                    Display and manage FA2 tokens (NFTs) with metadata, images, and transfer functionality.
                </p>

                <div className="p-6 border rounded-lg bg-muted/30">
                    <h3 className="font-semibold mb-4">NFT Collection</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="border rounded-lg p-3">
                                <div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center">
                                    <span className="text-muted-foreground text-sm">NFT #{i}</span>
                                </div>
                                <p className="text-sm font-medium">Token #{i}</p>
                                <p className="text-xs text-muted-foreground">Demo Collection</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-3">Props</h3>
                    <ApiTable
                        rows={[
                            ["walletAddress", "string - Owner wallet address"],
                            ["contractAddresses", "string[] - FA2 contract addresses to query"],
                            ["onTransfer", "Function - Callback for NFT transfers"],
                            ["showTransferButton", "boolean - Show transfer functionality"],
                        ]}
                    />
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">useTezos Hook</h2>
                <p className="mb-4">The main hook for accessing Tezos functionality throughout your app.</p>

                <Example title="Basic Usage">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code>{`import { useTezos } from "@/lib/tezos/useTezos";

export function MyComponent() {
  const { 
    Tezos, 
    address, 
    wallet, 
    isInitialized, 
    connectWallet, 
    disconnectWallet 
  } = useTezos();

  if (!isInitialized) {
    return <div>Initializing wallets...</div>;
  }

  return (
    <div>
      {address ? (
        <div>Connected: {address}</div>
      ) : (
        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}`}</code>
                    </pre>
                </Example>

                <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-3">Returned Properties</h3>
                    <ApiTable
                        rows={[
                            ["Tezos", "TezosToolkit - Main Taquito instance"],
                            ["address", "string | null - Connected wallet address"],
                            ["wallet", "BeaconWallet | null - Beacon wallet instance"],
                            ["kukai", "KukaiEmbed | null - Kukai wallet instance"],
                            ["isInitialized", "boolean - Whether wallets are initialized"],
                            ["connectWallet", "() => Promise<void> - Connect Beacon wallet"],
                            ["connectKukai", "() => Promise<void> - Connect Kukai wallet"],
                            ["disconnectWallet", "() => Promise<void> - Disconnect wallet"],
                        ]}
                    />
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Next Steps</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">💡 Examples</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            See these components in action with working examples
                        </p>
                        <a href="/docs/examples" className="text-primary hover:underline text-sm">
                            View examples →
                        </a>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🏠 Home</h3>
                        <p className="text-sm text-muted-foreground mb-3">Try the components on the home page demo</p>
                        <Link href="/" className="text-primary hover:underline text-sm">
                            Go to demo →
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
