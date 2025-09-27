"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Rocket, Code2, Calculator, Database, Play, CheckCircle, AlertCircle } from "lucide-react";
import { SmartContractInteraction } from "./smart-contract-interaction";
import { TezFaucet } from "./tez-faucet";
import { useBeacon } from "./beacon-provider";
import { smartPyExamples } from "@/lib/smartpy-contracts";

interface DeployedContract {
    name: string;
    address: string;
    opHash: string;
    timestamp: number;
    network: string;
}

export function ContractPlayground() {
    const { account } = useBeacon();
    const [deployedContracts, setDeployedContracts] = useState<DeployedContract[]>([]);
    const currentNetwork = { name: "ghostnet" }; // Default to ghostnet for now

    const handleContractDeployed = (opHash: string, type: "invoke" | "deploy") => {
        if (type === "deploy") {
            // This would normally get the contract address from the operation
            // For demo purposes, we'll create a placeholder
            const newContract: DeployedContract = {
                name: "New Contract",
                address: "KT1...", // Would be extracted from operation result
                opHash,
                timestamp: Date.now(),
                network: currentNetwork?.name || "ghostnet",
            };
            setDeployedContracts((prev) => [newContract, ...prev]);
        }
    };

    const contractIcons = {
        Counter: Calculator,
        Calculator: Code2,
        Storage: Database,
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                    <Rocket className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">SmartPy Contract Playground</h1>
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Deploy and interact with SmartPy contracts on Tezos testnets. Get testnet tokens, deploy contracts,
                    and test their functionality.
                </p>

                {/* Network & Account Status */}
                <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg max-w-2xl mx-auto">
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-2 h-2 rounded-full ${
                                currentNetwork?.name === "ghostnet"
                                    ? "bg-blue-500"
                                    : currentNetwork?.name === "shadownet"
                                    ? "bg-purple-500"
                                    : "bg-gray-500"
                            }`}
                        />
                        <span className="text-sm font-medium">{currentNetwork?.name || "Not connected"}</span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="text-sm">
                        {account ? (
                            <span className="font-mono text-xs">
                                {account.address.slice(0, 8)}...{account.address.slice(-4)}
                            </span>
                        ) : (
                            <span className="text-muted-foreground">Connect wallet</span>
                        )}
                    </div>
                </div>
            </div>

            <Tabs defaultValue="deploy" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="faucet">Get Tokens</TabsTrigger>
                    <TabsTrigger value="deploy">Deploy</TabsTrigger>
                    <TabsTrigger value="interact">Interact</TabsTrigger>
                    <TabsTrigger value="examples">Examples</TabsTrigger>
                </TabsList>

                {/* Faucet Tab */}
                <TabsContent value="faucet" className="space-y-4">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-semibold mb-2">Get Testnet Tokens</h2>
                        <p className="text-muted-foreground">
                            Request free testnet tokens to pay for contract deployment and transactions
                        </p>
                    </div>
                    <TezFaucet />
                </TabsContent>

                {/* Deploy Tab */}
                <TabsContent value="deploy" className="space-y-4">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-semibold mb-2">Deploy Contracts</h2>
                        <p className="text-muted-foreground">
                            Choose from SmartPy templates or deploy custom Michelson contracts
                        </p>
                    </div>

                    {!account && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>Connect your wallet to deploy contracts</AlertDescription>
                        </Alert>
                    )}

                    <SmartContractInteraction
                        onSuccess={handleContractDeployed}
                        onError={(error) => console.error("Contract operation failed:", error)}
                    />
                </TabsContent>

                {/* Interact Tab */}
                <TabsContent value="interact" className="space-y-4">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-semibold mb-2">Interact with Contracts</h2>
                        <p className="text-muted-foreground">Call contract methods and view storage state</p>
                    </div>

                    {deployedContracts.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Your Deployed Contracts</CardTitle>
                                <CardDescription>Recent contracts deployed in this session</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3">
                                    {deployedContracts.map((contract) => (
                                        <button
                                            key={contract.opHash}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 w-full text-left"
                                            onClick={() => console.log("Select contract:", contract.address)}
                                            type="button"
                                        >
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <div>
                                                    <div className="font-medium">{contract.name}</div>
                                                    <div className="text-sm text-muted-foreground font-mono">
                                                        {contract.address}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary">{contract.network}</Badge>
                                                <Button variant="ghost" size="sm">
                                                    <Play className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <SmartContractInteraction
                        onSuccess={handleContractDeployed}
                        onError={(error) => console.error("Contract operation failed:", error)}
                    />
                </TabsContent>

                {/* Examples Tab */}
                <TabsContent value="examples" className="space-y-4">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-semibold mb-2">SmartPy Examples</h2>
                        <p className="text-muted-foreground">
                            Explore pre-built SmartPy contracts with detailed explanations
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {smartPyExamples.map((example) => {
                            const IconComponent = contractIcons[example.name as keyof typeof contractIcons] || Code2;
                            return (
                                <Card key={example.name} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <IconComponent className="h-5 w-5 text-primary" />
                                            <CardTitle className="text-lg">{example.name}</CardTitle>
                                        </div>
                                        <CardDescription>{example.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2">Entry Points:</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {example.entrypoints.map((ep) => (
                                                    <Badge key={ep.name} variant="outline" className="text-xs">
                                                        {ep.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold">Usage Examples:</h4>
                                            <div className="text-xs text-muted-foreground space-y-1">
                                                {example.entrypoints.slice(0, 2).map((ep) => (
                                                    <div key={ep.name} className="font-mono bg-muted p-2 rounded">
                                                        <span className="text-primary">{ep.name}</span>
                                                        {ep.example && (
                                                            <span className="ml-2">
                                                                {typeof ep.example === "object"
                                                                    ? JSON.stringify(ep.example)
                                                                    : ep.example?.toString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <Button variant="outline" size="sm" className="w-full gap-2">
                                                <Rocket className="h-3 w-3" />
                                                Deploy & Test
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <Card className="bg-blue-50 dark:bg-blue-950/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ExternalLink className="h-5 w-5" />
                                Learn More
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm">
                                These examples are based on SmartPy, a Python-like language for writing Tezos smart
                                contracts.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <a href="https://smartpy.io/ide" target="_blank" rel="noopener noreferrer">
                                        SmartPy IDE <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                    <a href="https://smartpy.io/docs" target="_blank" rel="noopener noreferrer">
                                        Documentation <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                    <a href="https://teztnets.com/" target="_blank" rel="noopener noreferrer">
                                        Testnets <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
