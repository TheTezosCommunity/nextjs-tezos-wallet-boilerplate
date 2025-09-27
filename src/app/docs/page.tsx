import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function DocsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold">Welcome to Tezos Wallet Boilerplate</h1>
                <p className="text-xl text-muted-foreground mt-4">
                    A complete Next.js boilerplate for building Tezos dApps with wallet integration, transaction
                    handling, and smart contract interactions.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="p-6 border rounded-lg">
                    <h2 className="text-2xl font-semibold mb-2">🚀 Quick Start</h2>
                    <p className="text-muted-foreground mb-4">
                        Get up and running with Tezos wallet integration in minutes.
                    </p>
                    <Link href="/docs/installation">
                        <Button className="gap-2">
                            Get Started
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                <div className="p-6 border rounded-lg">
                    <h2 className="text-2xl font-semibold mb-2">🧩 Components</h2>
                    <p className="text-muted-foreground mb-4">
                        Pre-built components for wallet connection, transactions, and more.
                    </p>
                    <Link href="/docs/components">
                        <Button variant="outline" className="gap-2">
                            View Components
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                <div className="p-6 border rounded-lg">
                    <h2 className="text-2xl font-semibold mb-2">⚙️ Configuration</h2>
                    <p className="text-muted-foreground mb-4">
                        Configure networks, RPC endpoints, and wallet providers.
                    </p>
                    <Link href="/docs/configuration">
                        <Button variant="outline" className="gap-2">
                            Configuration
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                <div className="p-6 border rounded-lg">
                    <h2 className="text-2xl font-semibold mb-2">💡 Examples</h2>
                    <p className="text-muted-foreground mb-4">Working examples of dApp patterns and integrations.</p>
                    <Link href="/docs/examples">
                        <Button variant="outline" className="gap-2">
                            See Examples
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-3xl font-bold mb-4">Features</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🔐 Wallet Integration</h3>
                        <p className="text-sm text-muted-foreground">
                            Beacon SDK integration with support for all major Tezos wallets
                        </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">💸 Transactions</h3>
                        <p className="text-sm text-muted-foreground">
                            Send XTZ with gas estimation and confirmation tracking
                        </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">📄 Smart Contracts</h3>
                        <p className="text-sm text-muted-foreground">
                            Interact with SmartPy contracts, call methods, and view storage
                        </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🖼️ NFT Gallery</h3>
                        <p className="text-sm text-muted-foreground">
                            Display and manage FA2 tokens with metadata support
                        </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🔍 Blockchain Explorer</h3>
                        <p className="text-sm text-muted-foreground">
                            Explore blocks, operations, and accounts via TzKT API
                        </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🎨 Modern UI</h3>
                        <p className="text-sm text-muted-foreground">
                            Built with Tailwind CSS 4 and shadcn/ui components
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
