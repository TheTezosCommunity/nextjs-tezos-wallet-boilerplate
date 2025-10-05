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
                <h2 className="text-3xl font-semibold mb-4">WalletConnect</h2>
                <p className="mb-4">
                    A comprehensive wallet connection component with support for all major Tezos wallets via Beacon SDK.
                </p>


                <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-3">Props</h3>
                    <ApiTable rows={[["showDetails", "boolean - Show expanded wallet details panel"]]} />
                </div>

                <Example title="Code Example">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code>{`import { WalletConnect } from "@/components/wallet-connect";

export function Header() {
  return (
    <header className="flex justify-between items-center p-4">
      <h1>My Tezos DApp</h1>
      <WalletConnect />
    </header>
  );
}`}</code>
                    </pre>
                </Example>
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
                <h2 className="text-3xl font-semibold mb-4">BlockchainExplorer</h2>
                <p className="mb-4">
                    Explore the Tezos blockchain with search functionality for blocks, operations, and accounts via TzKT
                    API.
                </p>

                <div className="p-6 border rounded-lg bg-muted/30">
                    <h3 className="font-semibold mb-4">Blockchain Explorer</h3>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Search blocks, addresses, operations..."
                                className="flex-1 p-2 border rounded-md"
                                disabled
                            />
                            <button
                                type="button"
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md opacity-50 cursor-not-allowed"
                                disabled
                            >
                                Search
                            </button>
                        </div>
                        <div className="grid gap-2">
                            <div className="p-3 border rounded-md">
                                <p className="font-medium">Latest Block: #4,123,456</p>
                                <p className="text-sm text-muted-foreground">2 operations, 15 seconds ago</p>
                            </div>
                            <div className="p-3 border rounded-md">
                                <p className="font-medium">Recent Operation</p>
                                <p className="text-sm text-muted-foreground">Transaction: 5.0 XTZ</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-3">Props</h3>
                    <ApiTable
                        rows={[
                            ["network", "string - Tezos network (mainnet, ghostnet, etc.)"],
                            ["defaultQuery", "string - Initial search query"],
                            ["onResult", "Function - Callback with search results"],
                            ["showRecent", "boolean - Show recent blocks/operations"],
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
                        <a href="/" className="text-primary hover:underline text-sm">
                            Go to demo →
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
