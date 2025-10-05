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
                    The boilerplate supports multiple Tezos networks. Configure your RPC endpoints based on your needs.
                </p>

                <ApiTable
                    rows={[
                        ["Mainnet", "https://mainnet.api.tez.ie"],
                        ["Ghostnet (Testnet)", "https://ghostnet.ecadinfra.com"],
                        ["Oxfordnet (Testnet)", "https://oxfordnet.ecadinfra.com"],
                        ["Parisnet (Archive)", "https://parisnet.ecadinfra.com"],
                    ]}
                />

                <Example title="TezosToolkit Configuration">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code>{`import { TezosToolkit } from "@taquito/taquito";

// For Ghostnet (Testnet)
const tezos = new TezosToolkit("https://ghostnet.ecadinfra.com/");

// For Mainnet
const tezos = new TezosToolkit("https://mainnet.api.tez.ie");

// With wallet integration
tezos.setWalletProvider(wallet);`}</code>
                    </pre>
                </Example>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Beacon SDK Configuration</h2>
                <p className="mb-4">
                    Configure the Beacon SDK for wallet connections. The DAppClient handles communication with Tezos
                    wallets.
                </p>

                <Example title="Beacon Client Setup">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code>{`import { DAppClient, BeaconEvent } from "@airgap/beacon-sdk";

const dAppClient = new DAppClient({ 
  name: "Your DApp Name",
  iconUrl: "https://your-domain.com/icon.png", // Optional
  appUrl: "https://your-domain.com" // Optional
});

// Subscribe to account changes
dAppClient.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, (account) => {
  if (account) {
    console.log("Connected account:", account.address);
  }
});`}</code>
                    </pre>
                </Example>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Environment Variables</h2>
                <p className="mb-4">Configure your environment variables for different deployment environments.</p>

                <Example title=".env.local">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code>{`# Tezos Network Configuration
# Choose: mainnet, ghostnet, oxfordnet
NEXT_PUBLIC_TEZOS_NETWORK=ghostnet

# Tezos RPC Endpoints
NEXT_PUBLIC_TEZOS_RPC_MAINNET=https://mainnet.api.tez.ie
NEXT_PUBLIC_TEZOS_RPC_GHOSTNET=https://ghostnet.ecadinfra.com
NEXT_PUBLIC_TEZOS_RPC_OXFORDNET=https://oxfordnet.ecadinfra.com

# TzKT API Endpoints  
NEXT_PUBLIC_TZKT_API_MAINNET=https://api.tzkt.io/v1
NEXT_PUBLIC_TZKT_API_GHOSTNET=https://api.ghostnet.tzkt.io/v1
NEXT_PUBLIC_TZKT_API_OXFORDNET=https://api.oxfordnet.tzkt.io/v1

# DApp Configuration
NEXT_PUBLIC_DAPP_NAME="Your DApp Name"
NEXT_PUBLIC_DAPP_URL=http://localhost:3000

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id`}</code>
                    </pre>
                </Example>
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
