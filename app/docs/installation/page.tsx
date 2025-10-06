import { ApiTable } from "@/components/api-table";
import { Example } from "@/components/example";

export default function InstallationPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold">Installation</h1>
                <p className="text-xl text-muted-foreground mt-4">
                    Get started with the Tezos Wallet Boilerplate in your Next.js project.
                </p>
            </div>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Prerequisites</h2>
                <p className="mb-4">Before you begin, make sure you have the following installed:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Node.js 18+ or Bun runtime</li>
                    <li>Git for version control</li>
                    <li>A code editor (VS Code recommended)</li>
                </ul>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Clone the Repository</h2>
                <Example title="Using Git">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code>{`# Clone the repository
git clone https://github.com/your-username/nextjs-tezos-wallet-boilerplate.git

# Navigate to the project directory
cd nextjs-tezos-wallet-boilerplate

# Install dependencies
bun install
# or
npm install`}</code>
                    </pre>
                </Example>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Package Dependencies</h2>
                <p className="mb-4">The boilerplate includes the following key dependencies:</p>

                <ApiTable
                    rows={[
                        ["@airgap/beacon-dapp", "Beacon SDK types and utilities"],
                        ["@airgap/beacon-sdk", "Multi-wallet connection protocol"],
                        ["@taquito/taquito", "Tezos JavaScript SDK for blockchain interactions"],
                        ["@taquito/beacon-wallet", "Beacon wallet adapter for Taquito"],
                        ["kukai-embed", "Direct Kukai wallet integration"],
                        ["zustand", "Lightweight state management"],
                        ["next", "React framework with App Router"],
                        ["tailwindcss", "Utility-first CSS framework (v4)"],
                        ["@radix-ui/react-*", "Accessible headless UI components"],
                        ["lucide-react", "Beautiful icon library"],
                    ]}
                />

                <div className="mt-6 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <h3 className="font-semibold mb-2">🔄 Auto-Installation</h3>
                    <p className="text-sm text-muted-foreground">
                        All dependencies are automatically installed when you run <code>bun install</code> or{" "}
                        <code>npm install</code>. No additional setup required for wallet providers!
                    </p>
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Development Server</h2>
                <Example title="Start the development server">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                        <code>{`# Start the development server
bun dev
# or
npm run dev

# Open http://localhost:3000 in your browser`}</code>
                    </pre>
                </Example>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Project Structure</h2>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                    <code>{`nextjs-tezos-wallet-boilerplate/
├── app/                       # Next.js 15 App Router
│   ├── docs/                 # Documentation pages
│   ├── globals.css           # Global styles with Tailwind
│   ├── layout.tsx            # Root layout with providers
│   └── page.tsx              # Main application page
├── components/               # React components
│   ├── layout/              # Layout components
│   │   ├── Header.tsx       # Navigation header
│   │   └── connect/         # Wallet connection components
│   ├── providers/           # React providers
│   │   └── wallet-provider.tsx  # Wallet initialization
│   ├── ui/                  # shadcn/ui components
│   ├── contract-playground.tsx  # Smart contract interaction
│   ├── tez-faucet.tsx       # Testnet token faucet
│   └── ...                  # Other dApp components
├── lib/                     # Utilities and configuration
│   ├── tezos/              # Tezos-specific code
│   │   ├── store/          # Zustand state management
│   │   │   └── walletStore.ts  # Wallet state store
│   │   └── useTezos.tsx    # Main Tezos hook
│   ├── constants.ts        # App constants
│   └── utils.ts            # Utility functions
├── public/                 # Static assets
├── package.json           # Dependencies and scripts
├── tailwind.config.ts     # Tailwind CSS 4 configuration
├── components.json        # shadcn/ui configuration
└── next.config.mjs        # Next.js configuration`}</code>
                </pre>

                <div className="mt-4 p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <h3 className="font-semibold mb-2">🏗️ Architecture Highlights</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>
                            • <strong>App Router</strong>: Uses Next.js 15 App Router for optimal performance
                        </li>
                        <li>
                            • <strong>Provider Pattern</strong>: WalletProvider handles global wallet state
                        </li>
                        <li>
                            • <strong>State Management</strong>: Zustand for lightweight, performant state
                        </li>
                        <li>
                            • <strong>Auto-Restoration</strong>: Wallet connections persist across refreshes
                        </li>
                    </ul>
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Next Steps</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🔧 Configuration</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Configure network settings and RPC endpoints
                        </p>
                        <a href="/docs/configuration" className="text-primary hover:underline text-sm">
                            Configure your app →
                        </a>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🧩 Components</h3>
                        <p className="text-sm text-muted-foreground mb-3">Learn about the available components</p>
                        <a href="/docs/components" className="text-primary hover:underline text-sm">
                            Explore components →
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
