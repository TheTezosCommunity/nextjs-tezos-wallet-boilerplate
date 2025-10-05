import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NFTGallery } from "@/old/nft-gallery";
import { TransactionForm } from "@/old/transaction-form";
import { SmartContractInteraction } from "@/old/smart-contract-interaction";
import { BlockchainExplorer } from "@/components/blockchain-explorer";
import WalletConnection from "@/components/layout/connect/WalletConnection";

export default function Home() {
    return (
        <>
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
                                <Link href="/docs">
                                    <Button>Get Started</Button>
                                </Link>
                                <Button variant="outline" asChild>
                                    <Link href="/playground">🚀 Playground</Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/docs/examples">Examples</Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link
                                        href="https://github.com/skullzarmy/nextjs-tezos-wallet-boilerplate"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View on GitHub
                                    </Link>
                                </Button>
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
                                        Connect to popular Tezos wallets like Temple, Kukai, and Umami
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <WalletConnection />
                                </CardContent>
                                <CardFooter>
                                    <p className="text-sm text-muted-foreground">
                                        Supports Temple Wallet, Kukai Wallet, Umami, and more
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
                                        Supports contract invocation, parameter building, and storage viewing
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
                                <CardTitle>Smart Contract Interaction</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Contract method invocation</li>
                                    <li>SmartPy contract examples</li>
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
            <footer className="border-t py-6 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-6">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built with Next.js and Tezos. Open source under MIT license.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground">
                            Documentation
                        </Link>
                        <Link href="/docs/examples" className="text-sm text-muted-foreground hover:text-foreground">
                            Examples
                        </Link>
                        <Link
                            href="https://github.com/skullzarmy/nextjs-tezos-wallet-boilerplate"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            GitHub
                        </Link>
                    </div>
                </div>
            </footer>
        </>
    );
}
