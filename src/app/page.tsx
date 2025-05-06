import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletConnect } from "@/components/wallet-connect";
import { NFTGallery } from "@/components/nft-gallery";
import { TransactionForm } from "@/components/transaction-form";
import { SmartContractInteraction } from "@/components/smart-contract-interaction";
import { BlockchainExplorer } from "@/components/blockchain-explorer";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 226 226"
                            className="h-8 w-8"
                            fill="currentColor"
                        >
                            <path d="M113,22.6L22.6,113l90.4,90.4l90.4-90.4L113,22.6z M113,96.8c-8.9,0-16.2-7.3-16.2-16.2c0-8.9,7.3-16.2,16.2-16.2 c8.9,0,16.2,7.3,16.2,16.2C129.2,89.6,121.9,96.8,113,96.8z M113,161.5c-8.9,0-16.2-7.3-16.2-16.2c0-8.9,7.3-16.2,16.2-16.2 c8.9,0,16.2,7.3,16.2,16.2C129.2,154.3,121.9,161.5,113,161.5z M161.5,113c0-8.9,7.3-16.2,16.2-16.2c8.9,0,16.2,7.3,16.2,16.2 c0,8.9-7.3,16.2-16.2,16.2C168.8,129.2,161.5,121.9,161.5,113z M64.5,113c0-8.9,7.3-16.2,16.2-16.2c8.9,0,16.2,7.3,16.2,16.2 c0,8.9-7.3,16.2-16.2,16.2C71.7,129.2,64.5,121.9,64.5,113z" />
                        </svg>
                        <span className="font-bold">Tezos Boilerplate</span>
                    </div>
                    <nav className="hidden md:flex gap-6">
                        <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
                            Home
                        </Link>
                        <Link
                            href="#"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            Documentation
                        </Link>
                        <Link
                            href="#"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            Examples
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <WalletConnect />
                    </div>
                </div>
            </header>
            <main className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
                    <div className="container px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                    Tezos Blockchain Integration Boilerplate
                                </h1>
                                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                                    A comprehensive starter template for building decentralized applications on Tezos
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                <Button>Get Started</Button>
                                <Button variant="outline">View on GitHub</Button>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="container py-12 md:py-16 px-6">
                    <h2 className="mb-8 text-2xl font-bold text-center">Integration Components</h2>
                    <Tabs defaultValue="wallet" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="wallet">Wallet</TabsTrigger>
                            <TabsTrigger value="nfts">NFTs</TabsTrigger>
                            <TabsTrigger value="transactions">Transactions</TabsTrigger>
                            <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
                            <TabsTrigger value="explorer">Explorer</TabsTrigger>
                        </TabsList>
                        <TabsContent value="wallet" className="p-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Wallet Connection</CardTitle>
                                    <CardDescription>
                                        Connect to popular Tezos wallets like Temple, Kukai, and AirGap
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <WalletConnect showDetails={true} />
                                </CardContent>
                                <CardFooter>
                                    <p className="text-sm text-muted-foreground">
                                        Supports Temple Wallet, Kukai Wallet, Spire, and more
                                    </p>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                        <TabsContent value="nfts" className="p-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>NFT Gallery</CardTitle>
                                    <CardDescription>Display and interact with Tezos NFTs (FA2 tokens)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <NFTGallery />
                                </CardContent>
                                <CardFooter>
                                    <p className="text-sm text-muted-foreground">
                                        Supports all major Tezos NFT marketplaces and standards
                                    </p>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                        <TabsContent value="transactions" className="p-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Transaction Submission</CardTitle>
                                    <CardDescription>Send tez and tokens to other addresses</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <TransactionForm />
                                </CardContent>
                                <CardFooter>
                                    <p className="text-sm text-muted-foreground">
                                        Includes transaction status tracking and confirmation handling
                                    </p>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                        <TabsContent value="contracts" className="p-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Smart Contract Interaction</CardTitle>
                                    <CardDescription>Interact with Tezos smart contracts</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <SmartContractInteraction />
                                </CardContent>
                                <CardFooter>
                                    <p className="text-sm text-muted-foreground">
                                        Supports contract origination, invocation, and parameter building
                                    </p>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                        <TabsContent value="explorer" className="p-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Blockchain Explorer</CardTitle>
                                    <CardDescription>
                                        Explore blocks, operations, and accounts on the Tezos blockchain
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <BlockchainExplorer />
                                </CardContent>
                                <CardFooter>
                                    <p className="text-sm text-muted-foreground">
                                        Connects to TzKT and TzStats APIs for comprehensive blockchain data
                                    </p>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </section>
                <section className="container py-12 md:py-16 px-6">
                    <h2 className="mb-8 text-2xl font-bold text-center">Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Wallet Integration</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Connect to multiple wallet providers</li>
                                    <li>Account management and switching</li>
                                    <li>Balance display and refresh</li>
                                    <li>Persistent connections</li>
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Smart Contract Tools</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Contract deployment helpers</li>
                                    <li>Method invocation utilities</li>
                                    <li>Parameter builders</li>
                                    <li>Contract storage viewers</li>
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Data Fetching</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Blockchain data queries</li>
                                    <li>Token balances and metadata</li>
                                    <li>Historical transaction data</li>
                                    <li>Real-time updates</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>
            <footer className="border-t py-6 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-6">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built with Next.js and Tezos. Open source under MIT license.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                            GitHub
                        </Link>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                            Documentation
                        </Link>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                            Tezos Resources
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
