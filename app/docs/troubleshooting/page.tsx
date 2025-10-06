import { ApiTable } from "@/components/api-table";
import { Example } from "@/components/example";

export default function TroubleshootingPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold">Troubleshooting</h1>
                <p className="text-xl text-muted-foreground mt-4">
                    Common issues and solutions for wallet connections, transactions, and gas estimation.
                </p>
            </div>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Wallet Connection Issues</h2>

                <div className="space-y-6">
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2 text-red-600">
                            ❌ &quot;Kukai-Embed Already Present&quot; Error
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            This error occurs when Kukai is initialized multiple times.
                        </p>
                        <div className="bg-muted p-3 rounded text-sm">
                            <strong>Solution:</strong> This has been fixed in the latest version. The wallet store now
                            prevents duplicate initialization. If you still see this error, ensure you&apos;re using the
                            latest code and only one WalletProvider in your app.
                        </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2 text-red-600">❌ Wallet Not Connecting</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Wallet connection button doesn&apos;t respond or fails silently.
                        </p>
                        <Example title="Debug Steps">
                            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                                <code>{`// 1. Check if wallets are initialized
const { isInitialized } = useTezos();
console.log('Wallets initialized:', isInitialized);

// 2. Check for errors in browser console
// Look for wallet-related errors during connection

// 3. Verify wallet extension is installed
// Temple Wallet: chrome-extension://ookjlbkiijinhpmnjffcofjonbfbgaoc
// Check in browser extensions page

// 4. Check network permissions
// Some wallets require specific network permissions`}</code>
                            </pre>
                        </Example>
                    </div>

                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2 text-red-600">❌ State Not Restoring on Refresh</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Wallet connection is lost when page refreshes.
                        </p>
                        <Example title="Check Setup">
                            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                                <code>{`// Verify WalletProvider is wrapping your app
// app/layout.tsx should have:

<WalletProvider>
  <div className="app">
    {children}
  </div>
</WalletProvider>

// Check browser storage for wallet data:
// 1. Open DevTools → Application → Local Storage
// 2. Look for keys starting with "beacon:" or "kukai:"
// 3. If missing, wallet didn't save connection properly`}</code>
                            </pre>
                        </Example>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Transaction Problems</h2>

                <div className="space-y-6">
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2 text-red-600">❌ &quot;Counter in the Future&quot; Error</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Transaction fails with counter mismatch error.
                        </p>
                        <div className="bg-muted p-3 rounded text-sm">
                            <strong>Cause:</strong> This happens when multiple transactions are sent too quickly or when
                            there&apos;s a counter synchronization issue.
                            <br />
                            <br />
                            <strong>Solution:</strong> The new transaction system includes automatic gas estimation with
                            retry logic that handles this. Wait for transactions to complete before sending new ones.
                        </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2 text-red-600">❌ Gas Estimation Fails</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Transaction gas estimation keeps failing or timing out.
                        </p>
                        <Example title="Gas Estimation Debug">
                            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                                <code>{`// The new system has built-in retry logic:

async function debugGasEstimation() {
  const { Tezos } = useTezos();
  
  try {
    // Manual estimation test
    const estimate = await Tezos.estimate.transfer({
      to: 'tz1...',
      amount: 1 // 1 XTZ
    });
    
    console.log('Gas estimation successful:', {
      gasLimit: estimate.gasLimit,
      fee: estimate.suggestedFeeMutez,
      storage: estimate.storageLimit
    });
    
  } catch (error) {
    console.error('Gas estimation failed:', error);
    // Check: 
    // - Is wallet connected?
    // - Is recipient address valid?
    // - Does account have sufficient balance?
    // - Is network connection stable?
  }
}`}</code>
                            </pre>
                        </Example>
                    </div>

                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2 text-red-600">❌ Insufficient Balance for Fees</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Transaction fails because account doesn&apos;t have enough XTZ for fees.
                        </p>
                        <div className="bg-muted p-3 rounded text-sm">
                            <strong>Solution:</strong> Always reserve some XTZ for transaction fees. The transaction
                            form automatically accounts for this by reserving ~0.01 XTZ for fees when calculating
                            maximum sendable amount.
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Network & RPC Issues</h2>

                <div className="space-y-6">
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2 text-red-600">❌ RPC Connection Timeouts</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Operations timeout or fail to connect to Tezos network.
                        </p>
                        <Example title="Check RPC Status">
                            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                                <code>{`// Test RPC connectivity
const { Tezos } = useTezos();

async function testRPC() {
  try {
    // Test basic connectivity
    const head = await Tezos.rpc.getBlockHeader();
    console.log('RPC connected, current block:', head.level);
    
    // Test if wallet is properly set
    const walletPKH = await Tezos.wallet.pkh();
    console.log('Wallet address:', walletPKH);
    
  } catch (error) {
    console.error('RPC test failed:', error);
    // Try different RPC endpoint or check network
  }
}

// Current RPC endpoints:
// Mainnet: https://rpc.tzkt.io/mainnet  
// Ghostnet: https://rpc.tzkt.io/ghostnet`}</code>
                            </pre>
                        </Example>
                    </div>

                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2 text-red-600">❌ Wrong Network Configuration</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            App connects to wrong network or wallet shows different network.
                        </p>
                        <div className="bg-muted p-3 rounded text-sm">
                            <strong>Check:</strong> Verify your .env.local file has the correct NEXT_PUBLIC_NETWORK
                            setting.
                            <br />
                            <strong>Ghostnet:</strong> NEXT_PUBLIC_NETWORK=ghostnet
                            <br />
                            <strong>Mainnet:</strong> NEXT_PUBLIC_NETWORK=mainnet
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Development Issues</h2>

                <div className="space-y-6">
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2 text-red-600">❌ TypeScript Errors</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Type errors related to wallet objects or Tezos operations.
                        </p>
                        <Example title="Common Type Fixes">
                            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                                <code>{`// Use proper null checks
const { address, Tezos } = useTezos();

// ❌ Don't do this:
// const balance = await Tezos.tz.getBalance(address);

// ✅ Do this:
if (address) {
  const balance = await Tezos.tz.getBalance(address);
}

// ❌ Don't do this:
// wallet.methodsObject.transfer(...)

// ✅ Do this:
const contract = await Tezos.wallet.at(contractAddress);
await contract.methodsObject.transfer(...).send();`}</code>
                            </pre>
                        </Example>
                    </div>

                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2 text-red-600">❌ Hot Reload Issues</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Wallet state gets corrupted during development hot reloads.
                        </p>
                        <div className="bg-muted p-3 rounded text-sm">
                            <strong>Solution:</strong> This is normal during development. Simply refresh the page (Cmd+R
                            / Ctrl+R) to reset wallet state. In production builds, this won&apos;t be an issue.
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Debug Tools & Commands</h2>
                <p className="mb-4">Useful debugging commands and tools for diagnosing wallet issues.</p>

                <Example title="Debug Console Commands">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                        <code>{`// In browser console:

// Check wallet store state
const store = window.__zustand_stores__?.wallet;
console.log('Wallet store:', store);

// Check local storage for wallet data
Object.keys(localStorage).filter(key => 
  key.includes('beacon') || key.includes('kukai')
);

// Test wallet connection manually
const walletStore = /* get from useTezos hook */;
await walletStore.connectWallet();

// Clear all wallet data (reset)
localStorage.clear();
location.reload();

// Check current network
console.log('Network:', process.env.NEXT_PUBLIC_NETWORK);`}</code>
                    </pre>
                </Example>

                <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-3">Browser Extensions</h3>
                    <ApiTable
                        rows={[
                            ["Temple Wallet", "Manages Tezos accounts and signs transactions"],
                            ["React DevTools", "Inspect React component state and props"],
                            ["Redux DevTools", "Works with Zustand stores for state debugging"],
                        ]}
                    />
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Getting Help</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">📖 Documentation</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Check other documentation sections for detailed guides
                        </p>
                        <div className="space-y-1 text-sm">
                            <a href="/docs/wallet-guide" className="text-primary hover:underline block">
                                Wallet Integration Guide →
                            </a>
                            <a href="/docs/examples" className="text-primary hover:underline block">
                                Code Examples →
                            </a>
                            <a href="/docs/configuration" className="text-primary hover:underline block">
                                Configuration Guide →
                            </a>
                        </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🛠️ External Resources</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Community resources and official documentation
                        </p>
                        <div className="space-y-1 text-sm">
                            <a
                                href="https://taquito.io"
                                target="_blank"
                                rel="noopener"
                                className="text-primary hover:underline block"
                            >
                                Taquito Documentation ↗
                            </a>
                            <a
                                href="https://docs.walletbeacon.io"
                                target="_blank"
                                rel="noopener"
                                className="text-primary hover:underline block"
                            >
                                Beacon SDK Docs ↗
                            </a>
                            <a
                                href="https://docs.kukai.app"
                                target="_blank"
                                rel="noopener"
                                className="text-primary hover:underline block"
                            >
                                Kukai Documentation ↗
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
