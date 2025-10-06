"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import TezosLogo from "@/components/tezos-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    CheckCircle,
    AlertCircle,
    Loader2,
    Send,
    ArrowRight,
    ExternalLink,
    Copy,
    Check,
    Wallet,
    RefreshCw,
    Calculator,
    ChevronDownIcon,
} from "lucide-react";
import { NetworkSelector } from "@/components/network-selector";
import { NETWORK_CONFIGS } from "@/lib/tezos/store/walletStore";
import { useTezos } from "@/lib/tezos/useTezos";

// Utility function for formatting token amounts with proper localization
const formatTokenAmount = (balance: string | number): string => {
    const num = typeof balance === "string" ? parseFloat(balance) : balance;

    if (Number.isNaN(num) || num === 0) return "0";

    // Handle very large numbers with abbreviations
    if (num >= 1e9) {
        return (num / 1e9).toLocaleString("en-US", { maximumFractionDigits: 2 }) + "B";
    }
    if (num >= 1e6) {
        return (num / 1e6).toLocaleString("en-US", { maximumFractionDigits: 2 }) + "M";
    }
    if (num >= 1e3) {
        return (num / 1e3).toLocaleString("en-US", { maximumFractionDigits: 2 }) + "K";
    }

    // For smaller numbers, show appropriate decimal places
    if (num >= 100) {
        return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
    }
    if (num >= 1) {
        return num.toLocaleString("en-US", { maximumFractionDigits: 4 });
    }

    // For very small numbers, show more precision
    return num.toLocaleString("en-US", { maximumFractionDigits: 6 });
};

// Type definitions
interface WalletOperation {
    opHash: string;
    confirmation: () => Promise<unknown>;
}

interface WalletAsset {
    type: "tez" | "token";
    name: string;
    symbol: string;
    balance: string;
    formattedBalance: string;
    decimals: number;
    contract?: string;
    tokenId?: string;
    standard?: string;
    thumbnailUri?: string;
}

interface TransactionEstimate {
    gasLimit: number;
    storageLimit: number;
    suggestedFeeMutez: number;
    totalCost: number;
    burnFeeMutez: number;
}

interface TransactionData {
    recipient: string;
    amount: string;
    selectedAsset: WalletAsset | null;
}

type TransactionStatus = "idle" | "estimating" | "loading" | "success" | "error";

interface TzKTTokenBalance {
    token: {
        contract: { address: string };
        tokenId: string;
        metadata?: {
            name?: string;
            symbol?: string;
            decimals?: string;
            thumbnailUri?: string;
            image?: string;
        };
    };
    balance: string;
}

export function TransactionForm() {
    const { Tezos: tezos, address, network } = useTezos();
    const isConnected = !!address;

    // Memoize account object to prevent unnecessary re-renders
    const account = useMemo(() => (address ? { address } : null), [address]);

    // Use network-aware endpoints from NETWORK_CONFIGS
    const currentNetworkConfig = NETWORK_CONFIGS[network];
    const TZKT_API = currentNetworkConfig.tzktApi;
    const TZKT_EXPLORER = currentNetworkConfig.tzktExplorer;

    // State management
    const [walletAssets, setWalletAssets] = useState<WalletAsset[]>([]);
    const [isLoadingAssets, setIsLoadingAssets] = useState(false);
    const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
    const [data, setData] = useState<TransactionData>({
        recipient: "",
        amount: "",
        selectedAsset: null,
    });
    const [status, setStatus] = useState<TransactionStatus>("idle");
    const [txHash, setTxHash] = useState("");
    const [error, setError] = useState("");
    const [estimate, setEstimate] = useState<TransactionEstimate | null>(null);
    const [copied, setCopied] = useState(false);

    // Fetch wallet assets (Tez + tokens)
    const fetchWalletAssets = useCallback(async () => {
        if (!account?.address || !tezos) return;

        setIsLoadingAssets(true);
        try {
            const assets: WalletAsset[] = [];

            // Fetch Tez balance
            const tezBalance = await tezos.tz.getBalance(account.address);
            const tezAmount = tezBalance.toNumber() / 1000000;
            const tezFormatted = formatTokenAmount(tezAmount);
            assets.push({
                type: "tez",
                name: "Tezos",
                symbol: "XTZ",
                balance: tezBalance.toString(),
                formattedBalance: tezFormatted,
                decimals: 6,
            });

            // Fetch ALL token balances from TzKT with pagination
            let allTokenBalances: TzKTTokenBalance[] = [];
            let offset = 0;
            const limit = 1000; // Fetch 1000 at a time

            while (true) {
                const tokenResponse = await fetch(
                    `${TZKT_API}/tokens/balances?account=${account.address}&balance.ne=0&limit=${limit}&offset=${offset}`
                );

                if (!tokenResponse.ok) break;

                const tokenBalances: TzKTTokenBalance[] = await tokenResponse.json();
                if (tokenBalances.length === 0) break; // No more results

                allTokenBalances = allTokenBalances.concat(tokenBalances);
                offset += limit;

                // If we got less than the limit, we've reached the end
                if (tokenBalances.length < limit) break;
            }

            console.log("Raw token balances from TzKT (ALL PAGES):", allTokenBalances.length);

            if (allTokenBalances.length > 0) {
                // Filter and format tokens (ONLY fungible tokens with decimals > 0)
                const filteredTokens = allTokenBalances.filter((item: TzKTTokenBalance) => {
                    const decimals = item.token.metadata?.decimals;
                    const symbol = item.token.metadata?.symbol;
                    const name = item.token.metadata?.name;

                    // Must have decimals field defined
                    if (!decimals) {
                        console.log("Filtered out (no decimals field):", name || `Token #${item.token.tokenId}`);
                        return false;
                    }

                    const decimalValue = parseInt(decimals);

                    // STRICT RULE: Only include tokens with decimals > 0 (fungible tokens)
                    // NFTs have decimals = 0, so this excludes ALL NFTs
                    if (decimalValue <= 0) {
                        console.log("Filtered out (NFT - decimals <= 0):", name || `Token #${item.token.tokenId}`, {
                            decimals,
                            symbol,
                        });
                        return false;
                    }

                    console.log("Including fungible token:", name, { decimals, symbol, balance: item.balance });
                    return true;
                });

                console.log(`Filtered tokens: ${filteredTokens.length} out of ${allTokenBalances.length}`);

                filteredTokens.forEach((item: TzKTTokenBalance) => {
                    const decimals = parseInt(item.token.metadata?.decimals || "0");
                    const rawBalance = item.balance;
                    const tokenAmount =
                        decimals > 0 ? parseInt(rawBalance) / Math.pow(10, decimals) : parseInt(rawBalance);
                    const formattedBalance = formatTokenAmount(tokenAmount);

                    // Extract and convert thumbnail URI from IPFS to fileship
                    let thumbnailUri = item.token.metadata?.thumbnailUri || item.token.metadata?.image;
                    if (thumbnailUri?.startsWith("ipfs://")) {
                        thumbnailUri = thumbnailUri.replace("ipfs://", "https://ipfs.fileship.xyz/ipfs/");
                    }

                    assets.push({
                        type: "token",
                        name: item.token.metadata?.name || `Token #${item.token.tokenId}`,
                        symbol: item.token.metadata?.symbol || "???",
                        balance: rawBalance,
                        formattedBalance,
                        decimals,
                        contract: item.token.contract.address,
                        tokenId: item.token.tokenId,
                        standard: decimals > 0 ? "fa2" : "fa1.2",
                        thumbnailUri,
                    });
                });
            }

            setWalletAssets(assets);

            // Auto-select Tez if no asset selected
            if (!data.selectedAsset && assets.length > 0) {
                setData((prev) => ({ ...prev, selectedAsset: assets[0] }));
            }
        } catch (err) {
            console.error("Failed to fetch wallet assets:", err);
            setError("Failed to load wallet assets");
        } finally {
            setIsLoadingAssets(false);
        }
    }, [account?.address, tezos, data.selectedAsset, TZKT_API]);

    // Handle transaction execution
    const executeTransaction = useCallback(async () => {
        if (!tezos || !account || !data.selectedAsset || !data.recipient || !data.amount) return;

        setStatus("loading");
        setError("");

        // Get gas estimation with retries
        const getGasEstimate = async (maxRetries = 3): Promise<TransactionEstimate | null> => {
            if (!data.selectedAsset) return null;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    let estimateResult: Awaited<ReturnType<typeof tezos.estimate.transfer>>;

                    if (data.selectedAsset.type === "tez") {
                        estimateResult = await tezos.estimate.transfer({
                            to: data.recipient,
                            amount: parseFloat(data.amount),
                        });
                    } else {
                        if (!data.selectedAsset.contract || !account?.address) {
                            throw new Error("Missing contract or account information");
                        }
                        const contract = await tezos.wallet.at(data.selectedAsset.contract);
                        const amount = Math.floor(parseFloat(data.amount) * Math.pow(10, data.selectedAsset.decimals));

                        if (data.selectedAsset.standard === "fa1.2") {
                            const transferParams = await contract.methodsObject
                                .transfer({
                                    from: account.address,
                                    to: data.recipient,
                                    value: amount,
                                })
                                .toTransferParams();
                            estimateResult = await tezos.estimate.transfer(transferParams);
                        } else {
                            if (!data.selectedAsset.tokenId) {
                                throw new Error("Token ID is required for FA2 transfers");
                            }
                            const transferParams = await contract.methodsObject
                                .transfer([
                                    {
                                        from_: account.address,
                                        txs: [
                                            {
                                                to_: data.recipient,
                                                token_id: parseInt(data.selectedAsset.tokenId),
                                                amount,
                                            },
                                        ],
                                    },
                                ])
                                .toTransferParams();
                            estimateResult = await tezos.estimate.transfer(transferParams);
                        }
                    }

                    return {
                        gasLimit: estimateResult.gasLimit,
                        storageLimit: estimateResult.storageLimit,
                        suggestedFeeMutez: estimateResult.suggestedFeeMutez,
                        totalCost: estimateResult.totalCost,
                        burnFeeMutez: estimateResult.burnFeeMutez,
                    };
                } catch (err) {
                    console.warn(`Gas estimation attempt ${attempt} failed:`, err);
                    if (attempt === maxRetries) {
                        console.error("All gas estimation attempts failed, proceeding without estimation");
                        return null;
                    }
                    // Wait a bit before retrying
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
            }
            return null;
        };

        try {
            // First, try to get gas estimation
            setStatus("estimating");
            const gasEstimate = await getGasEstimate();

            setStatus("loading");
            let operation: WalletOperation;

            if (data.selectedAsset.type === "tez") {
                const transferParams = {
                    to: data.recipient,
                    amount: parseFloat(data.amount),
                };

                if (gasEstimate) {
                    operation = await tezos.wallet
                        .transfer({
                            ...transferParams,
                            gasLimit: gasEstimate.gasLimit,
                            storageLimit: gasEstimate.storageLimit,
                            fee: gasEstimate.suggestedFeeMutez,
                        })
                        .send();
                } else {
                    operation = await tezos.wallet.transfer(transferParams).send();
                }
            } else {
                if (!data.selectedAsset.contract) {
                    throw new Error("Contract address is required");
                }
                const contract = await tezos.wallet.at(data.selectedAsset.contract);
                const amount = Math.floor(parseFloat(data.amount) * Math.pow(10, data.selectedAsset.decimals));

                const sendOptions = gasEstimate
                    ? {
                          gasLimit: gasEstimate.gasLimit,
                          storageLimit: gasEstimate.storageLimit,
                          fee: gasEstimate.suggestedFeeMutez,
                      }
                    : {};

                if (data.selectedAsset.standard === "fa1.2") {
                    operation = await contract.methodsObject
                        .transfer({
                            from: account.address,
                            to: data.recipient,
                            value: amount,
                        })
                        .send(sendOptions);
                } else {
                    if (!data.selectedAsset.tokenId) {
                        throw new Error("Token ID is required for FA2 transfers");
                    }
                    operation = await contract.methodsObject
                        .transfer([
                            {
                                from_: account.address,
                                txs: [
                                    {
                                        to_: data.recipient,
                                        token_id: parseInt(data.selectedAsset.tokenId),
                                        amount,
                                    },
                                ],
                            },
                        ])
                        .send(sendOptions);
                }
            }

            // Wait for confirmation
            await operation.confirmation();
            setStatus("success");
            setTxHash(operation.opHash);

            // Refresh wallet assets after successful transaction
            fetchWalletAssets();
        } catch (err) {
            console.error("Transaction failed:", err);
            setStatus("error");
            setError(err instanceof Error ? err.message : "Transaction failed");
        }
    }, [tezos, account, data, fetchWalletAssets]);

    // Load wallet assets on mount and account change
    useEffect(() => {
        if (isConnected && account?.address) {
            fetchWalletAssets();
        }
    }, [isConnected, account?.address, fetchWalletAssets]);

    // Form validation
    const isFormValid = () => {
        if (!data.selectedAsset || !data.recipient.trim() || !data.amount.trim()) return false;
        if (!data.recipient.match(/^(tz1|tz2|tz3|KT1)/)) return false;

        const amount = parseFloat(data.amount);
        if (amount <= 0) return false;

        // Check sufficient balance (reserve small amount for fees)
        const maxAmount =
            data.selectedAsset.type === "tez"
                ? parseFloat(data.selectedAsset.formattedBalance) - 0.01 // Reserve for fees
                : parseFloat(data.selectedAsset.formattedBalance);

        return amount <= maxAmount;
    };

    // Helper functions
    const updateData = (updates: Partial<TransactionData>) => {
        setData((prev) => ({ ...prev, ...updates }));
        setError("");
    };

    const resetForm = () => {
        setData({
            recipient: "",
            amount: "",
            selectedAsset: walletAssets[0] || null,
        });
        setStatus("idle");
        setTxHash("");
        setError("");
        setEstimate(null);
    };

    const copyTxHash = async () => {
        if (txHash) {
            await navigator.clipboard.writeText(txHash);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const setMaxAmount = () => {
        if (!data.selectedAsset) return;

        let maxAmount = parseFloat(data.selectedAsset.formattedBalance);

        // For Tez, subtract estimated fees
        if (data.selectedAsset.type === "tez" && estimate) {
            maxAmount = Math.max(0, maxAmount - estimate.totalCost / 1000000);
        }

        updateData({ amount: maxAmount.toFixed(data.selectedAsset.decimals) });
    };

    // Wallet not connected state
    if (!isConnected) {
        return (
            <Card className="max-w-md mx-auto">
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                            <Wallet className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-medium">Connect Your Wallet</h3>
                            <p className="text-sm text-muted-foreground">
                                Connect your wallet to view balances and send transactions
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Success state
    if (status === "success") {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardContent className="pt-10 px-10">
                    <div className="text-center space-y-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-green-900">Transaction Sent!</h3>
                            <p className="text-sm text-green-700">
                                Your transaction has been confirmed on the blockchain
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Amount</span>
                                    <span className="font-medium">
                                        {data.amount} {data.selectedAsset?.symbol}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">To</span>
                                    <span className="font-mono text-xs">{data.recipient.slice(0, 10)}...</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Asset</span>
                                    <span className="font-medium">{data.selectedAsset?.name}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                                <span className="text-xs font-mono flex-1 truncate">{txHash}</span>
                                <Button size="sm" variant="ghost" onClick={copyTxHash} className="h-6 w-6 p-0">
                                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                </Button>
                                <Button size="sm" variant="ghost" asChild className="h-6 w-6 p-0">
                                    <a href={`${TZKT_EXPLORER}/${txHash}`} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </Button>
                            </div>
                        </div>

                        <Button onClick={resetForm} className="w-full">
                            Send Another Transaction
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Main transaction form
    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="pb-8 px-10 pt-10">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                        <Send className="w-7 h-7" />
                        Send Transaction
                    </CardTitle>
                    <NetworkSelector variant="compact" />
                </div>
            </CardHeader>

            <CardContent className="space-y-10 px-10 pb-10">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        executeTransaction();
                    }}
                    className="space-y-6"
                >
                    {/* Asset Selection */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-medium">Asset</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={fetchWalletAssets}
                                disabled={isLoadingAssets}
                                className="h-6 px-2"
                            >
                                <RefreshCw className={`w-3 h-3 ${isLoadingAssets ? "animate-spin" : ""}`} />
                            </Button>
                        </div>

                        <Popover open={isAssetDropdownOpen} onOpenChange={setIsAssetDropdownOpen}>
                            <PopoverTrigger asChild>
                                {/** biome-ignore lint/a11y/useSemanticElements: Custom dropdown with rich UI elements (icons, images, complex layout) that native <select> cannot support */}
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={isAssetDropdownOpen}
                                    className="w-full h-auto min-h-[100px] px-8 py-6 text-lg justify-start"
                                >
                                    {data.selectedAsset ? data.selectedAsset.name : "Select asset to send"}
                                    <ChevronDownIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-[var(--radix-popover-trigger-width)] p-0 max-h-80 overflow-hidden"
                                align="start"
                            >
                                <div className="p-3 pb-0">
                                    <div className="text-sm font-medium text-muted-foreground mb-4 px-3">
                                        Your Assets
                                    </div>
                                </div>
                                <div className="max-h-64 overflow-y-auto px-3 pb-3">
                                    {walletAssets.map((asset) => (
                                        <button
                                            type="button"
                                            key={`${asset.type}-${asset.contract || "tez"}-${asset.tokenId || ""}`}
                                            className="w-full h-auto min-h-[100px] cursor-pointer hover:bg-muted/50 rounded-lg my-1 p-0 text-left"
                                            onClick={() => {
                                                updateData({ selectedAsset: asset, amount: "" });
                                                setIsAssetDropdownOpen(false);
                                            }}
                                        >
                                            <div className="flex items-center justify-between w-full px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    {asset.type === "tez" ? (
                                                        <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
                                                            <TezosLogo className="!w-7 !h-7 text-white" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                                            {asset.thumbnailUri ? (
                                                                <Image
                                                                    src={asset.thumbnailUri}
                                                                    alt={asset.name}
                                                                    width={56}
                                                                    height={56}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.style.display = "none";
                                                                        const fallback =
                                                                            target.nextElementSibling as HTMLElement;
                                                                        if (fallback) fallback.style.display = "flex";
                                                                    }}
                                                                    unoptimized
                                                                />
                                                            ) : null}
                                                            <span
                                                                className="text-lg font-bold text-purple-600"
                                                                style={{
                                                                    display: asset.thumbnailUri ? "none" : "flex",
                                                                }}
                                                            >
                                                                {asset.symbol?.charAt(0) || "T"}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="text-left">
                                                        <div className="font-semibold text-lg leading-tight">
                                                            {asset.name}
                                                        </div>
                                                        <div className="text-base text-muted-foreground mt-1">
                                                            {asset.symbol}
                                                            {asset.type === "token" && asset.standard && (
                                                                <span className="ml-2 px-2 py-1 bg-muted rounded text-sm font-medium">
                                                                    {asset.standard.toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="font-bold text-xl leading-tight whitespace-nowrap text-foreground tracking-tight">
                                                        {asset.formattedBalance}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground/70 mt-0.5 whitespace-nowrap font-medium uppercase tracking-wide">
                                                        {asset.symbol}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Amount */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="amount" className="text-lg font-medium">
                                Amount
                            </Label>
                            {data.selectedAsset && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={setMaxAmount}
                                    className="h-8 px-3 text-sm"
                                >
                                    MAX
                                </Button>
                            )}
                        </div>
                        <Input
                            id="amount"
                            type="number"
                            step={
                                data.selectedAsset
                                    ? `0.${"0".repeat(Math.max(0, data.selectedAsset.decimals - 1))}1`
                                    : "0.000001"
                            }
                            min="0"
                            placeholder="0.0"
                            value={data.amount}
                            onChange={(e) => updateData({ amount: e.target.value })}
                            className="text-xl h-16 px-6"
                        />
                        {data.selectedAsset && (
                            <div className="text-sm text-muted-foreground font-medium">
                                Available:{" "}
                                <span className="font-bold text-foreground">{data.selectedAsset.formattedBalance}</span>{" "}
                                <span className="text-muted-foreground/70 uppercase tracking-wide text-xs">
                                    {data.selectedAsset.symbol}
                                </span>
                            </div>
                        )}
                    </div>

                    <Separator className="my-6" />

                    {/* Recipient */}
                    <div className="space-y-3">
                        <Label htmlFor="recipient" className="text-lg font-medium">
                            To
                        </Label>
                        <Input
                            id="recipient"
                            placeholder="tz1... or KT1..."
                            value={data.recipient}
                            onChange={(e) => updateData({ recipient: e.target.value })}
                            className="h-16 px-6 text-lg"
                        />
                    </div>

                    {/* Transaction Estimate */}
                    {estimate && (
                        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Calculator className="w-4 h-4" />
                                Transaction Estimate
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Gas:</span>
                                    <span>{estimate.gasLimit}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Storage:</span>
                                    <span>{estimate.storageLimit}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Fee:</span>
                                    <span>{(estimate.suggestedFeeMutez / 1000000).toFixed(6)} ꜩ</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total:</span>
                                    <span className="font-medium">{(estimate.totalCost / 1000000).toFixed(6)} ꜩ</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === "estimating" && (
                        <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Estimating transaction costs...
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={!isFormValid() || status === "loading" || status === "estimating"}
                        className="w-full h-16 text-lg"
                        size="lg"
                    >
                        {status === "loading" ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending Transaction...
                            </>
                        ) : (
                            <>
                                Send Transaction
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
