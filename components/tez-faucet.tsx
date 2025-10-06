"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ExternalLink, Droplets, CheckCircle, AlertCircle } from "lucide-react";
import { useTezos } from "@/lib/tezos/useTezos";

interface FaucetNetwork {
    name: string;
    displayName: string;
    faucetUrl: string;
    explorerUrl: string;
    color: string;
}

const FAUCET_NETWORKS: FaucetNetwork[] = [
    {
        name: "ghostnet",
        displayName: "Ghostnet",
        faucetUrl: "https://faucet.ghostnet.teztnets.com",
        explorerUrl: "https://ghostnet.tzkt.io",
        color: "bg-blue-500",
    },
    {
        name: "shadownet",
        displayName: "Shadownet",
        faucetUrl: "https://faucet.shadownet.teztnets.com",
        explorerUrl: "https://shadownet.tzkt.io",
        color: "bg-purple-500",
    },
];

interface FaucetResult {
    success: boolean;
    message: string;
    txHash?: string;
    explorerUrl?: string;
}

export function TezFaucet() {
    const { address } = useTezos();
    const [selectedNetwork, setSelectedNetwork] = useState<string>("ghostnet");
    const [customAddress, setCustomAddress] = useState<string>("");
    const [useCustomAddress, setUseCustomAddress] = useState<boolean>(false);
    const [isRequesting, setIsRequesting] = useState<boolean>(false);
    const [result, setResult] = useState<FaucetResult | null>(null);

    const selectedFaucet = FAUCET_NETWORKS.find((n) => n.name === selectedNetwork);
    const targetAddress = useCustomAddress ? customAddress : address || "";
    const connected = !!address;

    const requestTokens = async () => {
        if (!selectedFaucet || !targetAddress) return;

        setIsRequesting(true);
        setResult(null);

        try {
            // For now, we'll open the faucet website since most Tezos faucets require manual interaction
            // In a real implementation, you'd integrate with faucet APIs where available
            const faucetUrl = `${selectedFaucet.faucetUrl}?address=${encodeURIComponent(targetAddress)}`;

            // Open faucet in new window
            const faucetWindow = window.open(faucetUrl, "_blank", "width=800,height=600,scrollbars=yes,resizable=yes");

            if (faucetWindow) {
                setResult({
                    success: true,
                    message: `Faucet opened for ${selectedFaucet.displayName}. Please complete the request manually.`,
                    explorerUrl: `${selectedFaucet.explorerUrl}/${targetAddress}`,
                });
            } else {
                setResult({
                    success: false,
                    message: "Failed to open faucet window. Please disable popup blocker and try again.",
                });
            }
        } catch (error) {
            console.error("Faucet request error:", error);
            setResult({
                success: false,
                message: "Failed to access faucet. Please try again later.",
            });
        } finally {
            setIsRequesting(false);
        }
    };

    const isValidTezosAddress = (address: string): boolean => {
        return /^(tz1|tz2|tz3|KT1)[1-9A-HJ-NP-Za-km-z]{33}$/.test(address);
    };

    const isFormValid = targetAddress && isValidTezosAddress(targetAddress) && selectedFaucet;

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    <CardTitle>Tezos Testnet Faucet</CardTitle>
                </div>
                <CardDescription>Request testnet tokens for development and testing on Tezos testnets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Network Selection */}
                <div className="space-y-2">
                    <Label htmlFor="network-select">Select Network</Label>
                    <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                        <SelectTrigger id="network-select">
                            <SelectValue placeholder="Choose a testnet" />
                        </SelectTrigger>
                        <SelectContent>
                            {FAUCET_NETWORKS.map((network) => (
                                <SelectItem key={network.name} value={network.name}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${network.color}`} />
                                        {network.displayName}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Address Input */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="use-custom"
                            checked={useCustomAddress}
                            onChange={(e) => setUseCustomAddress(e.target.checked)}
                            className="rounded"
                        />
                        <Label htmlFor="use-custom">Use custom address</Label>
                    </div>

                    {useCustomAddress ? (
                        <div className="space-y-2">
                            <Label htmlFor="custom-address">Recipient Address</Label>
                            <Input
                                id="custom-address"
                                type="text"
                                placeholder="tz1..."
                                value={customAddress}
                                onChange={(e) => setCustomAddress(e.target.value)}
                                className={customAddress && !isValidTezosAddress(customAddress) ? "border-red-500" : ""}
                            />
                            {customAddress && !isValidTezosAddress(customAddress) && (
                                <p className="text-sm text-red-500">
                                    Please enter a valid Tezos address (tz1, tz2, tz3, or KT1)
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label>Recipient Address</Label>
                            <div className="p-3 bg-muted rounded-md text-sm font-mono">
                                {connected && address ? (
                                    address
                                ) : (
                                    <span className="text-muted-foreground">Connect wallet to auto-fill</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Network Information */}
                {selectedFaucet && (
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${selectedFaucet.color}`} />
                            <h3 className="font-semibold">{selectedFaucet.displayName}</h3>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                                <span>Faucet:</span>
                                <a
                                    href={selectedFaucet.faucetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center gap-1"
                                >
                                    {selectedFaucet.faucetUrl}
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>Explorer:</span>
                                <a
                                    href={selectedFaucet.explorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center gap-1"
                                >
                                    {selectedFaucet.explorerUrl}
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Request Button */}
                <Button onClick={requestTokens} disabled={!isFormValid || isRequesting} className="w-full" size="lg">
                    {isRequesting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Opening Faucet...
                        </>
                    ) : (
                        <>
                            <Droplets className="mr-2 h-4 w-4" />
                            Request Testnet Tokens
                        </>
                    )}
                </Button>

                {/* Result Alert */}
                {result && (
                    <Alert className={result.success ? "border-green-500" : "border-red-500"}>
                        {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <AlertDescription>
                            {result.message}
                            {result.explorerUrl && (
                                <div className="mt-2">
                                    <a
                                        href={result.explorerUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline flex items-center gap-1"
                                    >
                                        View in Explorer <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Usage Instructions */}
                <div className="text-sm text-muted-foreground space-y-2">
                    <h4 className="font-semibold">How to use:</h4>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>
                            Select your target testnet (Ghostnet for general testing, Shadownet for latest features)
                        </li>
                        <li>Use your connected wallet address or enter a custom address</li>
                        <li>Click &quot;Request Testnet Tokens&quot; to open the faucet</li>
                        <li>Complete any required verification (captcha, etc.) on the faucet page</li>
                        <li>Tokens will be sent to your address within a few minutes</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
