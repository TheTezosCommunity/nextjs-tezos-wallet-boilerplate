import { ApiTable } from "@/components/api-table";
import { Example } from "@/components/example";

export default function ConfigurationPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold">Configuration</h1>
                <p className="text-xl text-muted-foreground mt-4">
                    Configure your Tezos dApp with the right network settings and providers.
                </p>
            </div>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Network Configuration</h2>
                <p className="mb-4">
                    The boilerplate automatically configures networks based on your environment. The wallet store
                    handles RPC endpoint selection.
                </p>

                <ApiTable
                    rows={[
                        ["Mainnet", "https://rpc.tzkt.io/mainnet"],
                        ["Ghostnet (Testnet)", "https://rpc.tzkt.io/ghostnet"],
                    ]}
                />

                <Example title="Automatic Network Configuration">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code>{`// lib/tezos/store/walletStore.ts
import { ENV } from '../../constants';

export const useWalletStore = create<WalletState>((set, get) => ({
  Tezos: new TezosToolkit(
    ENV === 'dev' 
      ? 'https://rpc.tzkt.io/ghostnet' 
      : 'https://rpc.tzkt.io/mainnet'
  ),
  // ... rest of store
}));

// lib/constants.ts 
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'ghostnet';
export const ENV: 'dev' | 'prod' = NETWORK === 'ghostnet' ? 'dev' : 'prod';`}</code>
                    </pre>
                </Example>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Wallet Store Configuration</h2>
                <p className="mb-4">
                    The new wallet store automatically handles multi-wallet initialization and state management.
                </p>

                <Example title="Wallet Store Architecture">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code>{`// lib/tezos/store/walletStore.ts
interface WalletState {
  Tezos: TezosToolkit;
  wallet: BeaconWallet | null;
  kukai: KukaiEmbed | null;
  address: string | null;
  isInitialized: boolean;
  initializeWallets: () => Promise<void>;
  connectWallet: () => Promise<void>;
  connectKukai: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  // Auto-initialization on app start
  initializeWallets: async () => {
    // Check for existing Beacon connections
    const activeAccount = await wallet.client.getActiveAccount();
    if (activeAccount) {
      set({ address: activeAccount.address });
    }
    
    // Check for existing Kukai sessions  
    const userInfo = kukai.user;
    if (userInfo?.pkh) {
      set({ address: userInfo.pkh });
    }
  }
}));`}</code>
                    </pre>
                </Example>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Environment Variables</h2>
                <p className="mb-4">Configure your environment variables for different deployment environments.</p>

                <Example title=".env.local">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code>{`# Network Configuration (only variable needed!)
NEXT_PUBLIC_NETWORK=ghostnet
# or 
# NEXT_PUBLIC_NETWORK=mainnet

# Optional: Custom RPC endpoints (uses defaults if not set)
# NEXT_PUBLIC_RPC_MAINNET=https://your-mainnet-rpc.com
# NEXT_PUBLIC_RPC_GHOSTNET=https://your-ghostnet-rpc.com`}</code>
                    </pre>
                </Example>

                <div className="mt-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <h3 className="font-semibold mb-2">🎯 Simplified Configuration</h3>
                    <p className="text-sm text-muted-foreground">
                        The new architecture only requires <code>NEXT_PUBLIC_NETWORK</code> to be set. All other
                        configuration (RPC endpoints, wallet providers, network types) is handled automatically.
                    </p>
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Supported Wallets</h2>
                <p className="mb-4">The Beacon SDK automatically supports all major Tezos wallets:</p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🔗 Temple Wallet</h3>
                        <p className="text-sm text-muted-foreground">Popular browser extension wallet</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">📱 Kukai</h3>
                        <p className="text-sm text-muted-foreground">Web-based wallet with social login</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">📟 Ledger</h3>
                        <p className="text-sm text-muted-foreground">Hardware wallet support</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🔐 AirGap</h3>
                        <p className="text-sm text-muted-foreground">Mobile wallet with QR code signing</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">👻 Spire</h3>
                        <p className="text-sm text-muted-foreground">Modern mobile wallet</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🦄 Umami</h3>
                        <p className="text-sm text-muted-foreround">Desktop wallet application</p>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">TzKT API Configuration</h2>
                <p className="mb-4">Configure TzKT API for blockchain data and indexing services.</p>

                <ApiTable
                    rows={[
                        ["Mainnet API", "https://api.tzkt.io"],
                        ["Ghostnet API", "https://api.ghostnet.tzkt.io"],
                        ["Oxfordnet API", "https://api.oxfordnet.tzkt.io"],
                    ]}
                />

                <Example title="TzKT API Usage">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code>{`// Fetch account information
const response = await fetch(
  \`https://api.ghostnet.tzkt.io/v1/accounts/\${address}\`
);
const account = await response.json();

// Fetch account operations
const opsResponse = await fetch(
  \`https://api.ghostnet.tzkt.io/v1/accounts/\${address}/operations\`
);
const operations = await opsResponse.json();`}</code>
                    </pre>
                </Example>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Next Steps</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🧩 Components</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Learn about the available components and their APIs
                        </p>
                        <a href="/docs/components" className="text-primary hover:underline text-sm">
                            Explore components →
                        </a>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">💡 Examples</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            See working examples of common dApp patterns
                        </p>
                        <a href="/docs/examples" className="text-primary hover:underline text-sm">
                            View examples →
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
