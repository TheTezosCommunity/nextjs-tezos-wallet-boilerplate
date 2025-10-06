"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { useTezos } from "@/lib/tezos/useTezos";

// Network configuration
const NETWORK = process.env.NEXT_PUBLIC_TEZOS_NETWORK || "ghostnet";
const TZKT_API_ENDPOINTS = {
    mainnet: "https://api.tzkt.io/v1",
    ghostnet: "https://api.ghostnet.tzkt.io/v1",
    oxfordnet: "https://api.oxfordnet.tzkt.io/v1",
} as const;

const TZKT_EXPLORER_ENDPOINTS = {
    mainnet: "https://tzkt.io",
    ghostnet: "https://ghostnet.tzkt.io",
    oxfordnet: "https://oxfordnet.tzkt.io",
} as const;

const TZKT_API = TZKT_API_ENDPOINTS[NETWORK as keyof typeof TZKT_API_ENDPOINTS] || TZKT_API_ENDPOINTS.ghostnet;
const TZKT_EXPLORER =
    TZKT_EXPLORER_ENDPOINTS[NETWORK as keyof typeof TZKT_EXPLORER_ENDPOINTS] || TZKT_EXPLORER_ENDPOINTS.ghostnet;

// Smart image URI resolution
const resolveImageUri = (metadata: {
    image?: string;
    displayUri?: string;
    thumbnailUri?: string;
    artifactUri?: string;
}): string | null => {
    if (!metadata) return null;

    // Priority order: thumbnailUri > displayUri > image > artifactUri
    const uris = [metadata.thumbnailUri, metadata.displayUri, metadata.image, metadata.artifactUri].filter(Boolean);

    for (const uri of uris) {
        if (typeof uri === "string" && uri.trim()) {
            // Skip if it looks like HTML content
            if (uri.includes("<") || uri.includes("<!DOCTYPE") || uri.includes("<html>")) {
                continue;
            }

            // Convert IPFS URIs
            if (uri.startsWith("ipfs://")) {
                return uri.replace("ipfs://", "https://ipfs.fileship.xyz/");
            }

            // Return valid HTTP(S) URIs
            if (uri.startsWith("http://") || uri.startsWith("https://")) {
                return uri;
            }

            // Handle data URIs
            if (uri.startsWith("data:image/")) {
                return uri;
            }
        }
    }

    return null;
};

interface TzKTTokenBalance {
    account: {
        address: string;
    };
    token: {
        id: number;
        contract: {
            address: string;
            alias?: string;
        };
        tokenId: string;
        standard: string;
        metadata?: {
            name?: string;
            description?: string;
            displayUri?: string;
            thumbnailUri?: string;
            creators?: string[];
            symbol?: string;
        };
    };
    balance: string;
}

interface TzKTOperation {
    id: number;
    hash: string;
    target?: { address: string };
    sender?: { address: string };
    parameter?: {
        value: unknown;
    };
    status: string;
}

interface TzKTToken {
    id: number;
    contract: { address: string; alias?: string };
    tokenId: string;
    standard: string;
    totalSupply?: string;
    metadata?: {
        name?: string;
        description?: string;
        displayUri?: string;
        thumbnailUri?: string;
        artifactUri?: string;
        image?: string;
        decimals?: string;
        creators?: string[];
        symbol?: string;
        [key: string]: unknown;
    };
    firstMinter?: string;
    firstLevel?: number;
    lastLevel?: number;
}

interface TransferTransaction {
    from_?: string;
    to_: string;
    token_id: string;
    amount?: string;
}

interface TransferGroup {
    from_?: string;
    txs: TransferTransaction[];
}

interface NFT {
    id: string;
    name: string;
    description: string;
    image: string;
    collection: string;
    creator: string;
    tokenId: string;
    contract: string;
    balance: string;
    standard: string;
    metadata?: {
        name?: string;
        description?: string;
        displayUri?: string;
        thumbnailUri?: string;
        artifactUri?: string;
        image?: string;
        [key: string]: unknown;
    };
}

export function NFTGallery() {
    const { address } = useTezos();
    const isConnected = !!address;
    const isInitialized = true;
    const [nfts, setNfts] = useState<NFT[]>([]);
    const [createdNfts, setCreatedNfts] = useState<NFT[]>([]);
    const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCreated, setIsLoadingCreated] = useState(false);
    const [error, setError] = useState("");
    const [createdError, setCreatedError] = useState("");

    const fetchUserNFTs = useCallback(async (address: string) => {
        setIsLoading(true);
        setError("");

        try {
            // Fetch token balances for the user (FA2 tokens only, excluding fungible tokens)
            const response = await fetch(
                `${TZKT_API}/tokens/balances?account=${address}&token.standard=fa2&balance.gt=0&limit=50`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: TzKTTokenBalance[] = await response.json();

            // Filter and format NFTs (tokens with decimals: "0" are actual NFTs)
            const formattedNFTs: NFT[] = data
                .filter((item) => {
                    // Only show tokens with decimals: "0" (actual NFTs, not fungible tokens)
                    const metadata = item.token.metadata as {
                        decimals?: string;
                        name?: string;
                        [key: string]: unknown;
                    };
                    const isNFT = metadata?.decimals === "0";
                    const hasMetadata = Boolean(metadata?.name);
                    return isNFT && hasMetadata;
                })
                .map((item) => {
                    const metadata = item.token.metadata as {
                        name?: string;
                        description?: string;
                        displayUri?: string;
                        thumbnailUri?: string;
                        artifactUri?: string;
                        image?: string;
                        creators?: string[];
                        [key: string]: unknown;
                    };

                    return {
                        id: `${item.token.contract.address}-${item.token.tokenId}`,
                        name: metadata?.name || `Token #${item.token.tokenId}`,
                        description: metadata?.description || "No description available",
                        image: resolveImageUri(metadata) || "/placeholder.svg",
                        collection:
                            item.token.contract.alias || `Contract ${item.token.contract.address.slice(0, 10)}...`,
                        creator: metadata?.creators?.[0] || "Unknown",
                        tokenId: item.token.tokenId,
                        contract: item.token.contract.address,
                        balance: item.balance,
                        standard: item.token.standard,
                        metadata: item.token.metadata || {},
                    };
                });

            setNfts(formattedNFTs);
        } catch (err) {
            console.error("Failed to fetch NFTs:", err);
            setError("Failed to fetch NFTs. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchCreatedNFTs = useCallback(async (address: string) => {
        setIsLoadingCreated(true);
        setCreatedError("");

        try {
            // New approach: Find tokens where the user was the original minter
            // We'll look for fa2_transfer operations where the user received tokens from a null address (mint)
            const mintTransfersResponse = await fetch(
                `${TZKT_API}/operations/transactions?anyof.target.sender=${address}&status=applied&entrypoint=transfer&limit=200&sort.desc=id`
            );

            const createdTokens: TzKTToken[] = [];

            if (mintTransfersResponse.ok) {
                const transfers: TzKTOperation[] = await mintTransfersResponse.json();

                // Filter for operations where tokens were minted to this address
                const mintOperations = transfers.filter((op) => {
                    // Check if this is a mint operation (transfer from null/empty address to user)
                    const params = op.parameter?.value;
                    if (!params || !Array.isArray(params)) return false;

                    return (params as TransferGroup[]).some((transferGroup) => {
                        if (!transferGroup.txs || !Array.isArray(transferGroup.txs)) return false;

                        return transferGroup.txs.some((tx) => {
                            // Check if this is a mint (from_: null or empty, to_: our address)
                            return (
                                (!tx.from_ || tx.from_ === address) && tx.to_ === address && tx.token_id !== undefined
                            );
                        });
                    });
                });

                // For each mint operation, get the specific tokens that were minted
                for (const mintOp of mintOperations) {
                    const contractAddress = mintOp.target?.address;
                    const params = mintOp.parameter?.value;

                    if (contractAddress && params && Array.isArray(params)) {
                        for (const transferGroup of params as TransferGroup[]) {
                            if (transferGroup.txs && Array.isArray(transferGroup.txs)) {
                                for (const tx of transferGroup.txs) {
                                    if (
                                        (!tx.from_ || tx.from_ === address) &&
                                        tx.to_ === address &&
                                        tx.token_id !== undefined
                                    ) {
                                        try {
                                            // Get the specific token that was minted
                                            const tokenResponse = await fetch(
                                                `${TZKT_API}/tokens?contract=${contractAddress}&tokenId=${tx.token_id}&select=id,contract,tokenId,standard,totalSupply,metadata,firstMinter,firstLevel,lastLevel`
                                            );

                                            if (tokenResponse.ok) {
                                                const tokens: TzKTToken[] = await tokenResponse.json();
                                                if (tokens.length > 0) {
                                                    createdTokens.push(tokens[0]);
                                                }
                                            }
                                        } catch {
                                            console.log(`Failed to fetch token ${contractAddress}:${tx.token_id}`);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Alternative approach: Look for mint operations by entrypoint
            const mintCallsResponse = await fetch(
                `${TZKT_API}/operations/transactions?sender=${address}&status=applied&entrypoint.in=mint,mint_token,mint_artist,create,mint_nft&limit=100&sort.desc=id`
            );

            if (mintCallsResponse.ok) {
                const mintCalls: TzKTOperation[] = await mintCallsResponse.json();

                for (const call of mintCalls) {
                    if (call.target?.address && call.parameter) {
                        // Try to extract token ID from mint parameters
                        const params = call.parameter.value as Record<string, unknown>;
                        const tokenIds: string[] = [];

                        // Common patterns for mint parameters
                        if (params.token_id !== undefined && params.token_id !== null) {
                            tokenIds.push(params.token_id.toString());
                        } else if (params.tokenId !== undefined && params.tokenId !== null) {
                            tokenIds.push(params.tokenId.toString());
                        } else if (Array.isArray(params)) {
                            // Some contracts use arrays of mint data
                            params.forEach((item) => {
                                const mintItem = item as Record<string, unknown>;
                                if (mintItem.token_id !== undefined && mintItem.token_id !== null) {
                                    tokenIds.push(mintItem.token_id.toString());
                                } else if (mintItem.tokenId !== undefined && mintItem.tokenId !== null) {
                                    tokenIds.push(mintItem.tokenId.toString());
                                }
                            });
                        }

                        // If we couldn't extract token IDs, get recent tokens from the contract
                        if (tokenIds.length === 0) {
                            try {
                                const recentTokensResponse = await fetch(
                                    `${TZKT_API}/tokens?contract=${call.target.address}&standard=fa2&firstMinter=${address}&limit=10&sort.desc=id`
                                );

                                if (recentTokensResponse.ok) {
                                    const tokens: TzKTToken[] = await recentTokensResponse.json();
                                    createdTokens.push(...tokens);
                                }
                            } catch {
                                console.log(`Failed to fetch recent tokens for ${call.target.address}`);
                            }
                        } else {
                            // Get the specific tokens by ID
                            for (const tokenId of tokenIds) {
                                try {
                                    const tokenResponse = await fetch(
                                        `${TZKT_API}/tokens?contract=${call.target.address}&tokenId=${tokenId}&firstMinter=${address}&select=id,contract,tokenId,standard,totalSupply,metadata,firstMinter,firstLevel,lastLevel`
                                    );

                                    if (tokenResponse.ok) {
                                        const tokens: TzKTToken[] = await tokenResponse.json();
                                        if (tokens.length > 0) {
                                            createdTokens.push(tokens[0]);
                                        }
                                    }
                                } catch {
                                    console.log(`Failed to fetch token ${call.target.address}:${tokenId}`);
                                }
                            }
                        }
                    }
                }
            }

            // Deduplicate tokens
            const tokenMap = new Map();
            for (const token of createdTokens) {
                const tokenKey = `${token.contract.address}-${token.tokenId}`;
                if (!tokenMap.has(tokenKey) && token.metadata) {
                    tokenMap.set(tokenKey, token);
                }
            }

            // Format the created NFTs
            const formattedCreatedNFTs: NFT[] = Array.from(tokenMap.values())
                .filter((token) => {
                    const hasMetadata = token.metadata && (token.metadata.name || token.metadata.displayUri);
                    return hasMetadata;
                })
                .map((token) => ({
                    id: `${token.contract.address}-${token.tokenId}`,
                    name: token.metadata?.name || `Token #${token.tokenId}`,
                    description: token.metadata?.description || "No description available",
                    image: resolveImageUri(token.metadata) || "/placeholder.svg",
                    collection: token.contract.alias || `Contract ${token.contract.address.slice(0, 10)}...`,
                    creator: address, // The user is the creator
                    tokenId: token.tokenId,
                    contract: token.contract.address,
                    balance: "1", // Default to 1 for created tokens
                    standard: token.standard || "fa2",
                    metadata: token.metadata || {},
                }));

            setCreatedNfts(formattedCreatedNFTs);
        } catch (err) {
            console.error("Failed to fetch created NFTs:", err);
            setCreatedError("Failed to fetch created NFTs. Please try again.");
        } finally {
            setIsLoadingCreated(false);
        }
    }, []);

    useEffect(() => {
        if (isConnected && address) {
            fetchUserNFTs(address);
            fetchCreatedNFTs(address);
        } else {
            setNfts([]);
            setCreatedNfts([]);
            setError("");
            setCreatedError("");
        }
    }, [isConnected, address, fetchUserNFTs, fetchCreatedNFTs]);

    const handleRefresh = () => {
        if (address) {
            fetchUserNFTs(address);
            fetchCreatedNFTs(address);
        }
    };

    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center h-40 border rounded-md">
                <p className="text-muted-foreground">Initializing wallet...</p>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="flex items-center justify-center h-40 border rounded-md">
                <p className="text-muted-foreground">Connect your wallet to view your NFTs</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading || isLoadingCreated}>
                    <Loader2 className={`h-4 w-4 mr-2 ${isLoading || isLoadingCreated ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            <Tabs defaultValue="owned">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="owned">Owned NFTs</TabsTrigger>
                    <TabsTrigger value="created">Created NFTs</TabsTrigger>
                </TabsList>

                <TabsContent value="owned" className="pt-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {isLoading && (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span>Loading your NFTs...</span>
                        </div>
                    )}

                    {!isLoading && nfts.length === 0 && !error && (
                        <div className="flex items-center justify-center h-40 border rounded-md">
                            <p className="text-muted-foreground">No NFTs found in your wallet</p>
                        </div>
                    )}

                    {nfts.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {nfts.map((nft) => (
                                <Card
                                    key={nft.id}
                                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => setSelectedNFT(nft)}
                                >
                                    <CardContent className="p-0">
                                        <Image
                                            src={
                                                nft.image.startsWith("ipfs://")
                                                    ? nft.image.replace("ipfs://", "https://ipfs.fileship.xyz/")
                                                    : nft.image
                                            }
                                            alt={nft.name}
                                            width={300}
                                            height={300}
                                            className="w-full h-48 object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                                            }}
                                        />
                                    </CardContent>
                                    <CardFooter className="p-3">
                                        <div className="w-full">
                                            <h3 className="font-medium text-sm truncate">{nft.name}</h3>
                                            <p className="text-xs text-muted-foreground truncate">{nft.collection}</p>
                                            <p className="text-xs text-muted-foreground">Balance: {nft.balance}</p>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="created" className="pt-4">
                    {createdError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{createdError}</AlertDescription>
                        </Alert>
                    )}

                    {isLoadingCreated && (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span>Loading created NFTs...</span>
                        </div>
                    )}

                    {!isLoadingCreated && createdNfts.length === 0 && !createdError && (
                        <div className="flex items-center justify-center h-40 border rounded-md">
                            <p className="text-muted-foreground">No NFTs created by this wallet found</p>
                        </div>
                    )}

                    {createdNfts.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {createdNfts.map((nft) => (
                                <Card
                                    key={nft.id}
                                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-green-200 bg-green-50/50"
                                    onClick={() => setSelectedNFT(nft)}
                                >
                                    <CardContent className="p-0">
                                        <Image
                                            src={
                                                nft.image.startsWith("ipfs://")
                                                    ? nft.image.replace("ipfs://", "https://ipfs.fileship.xyz/")
                                                    : nft.image
                                            }
                                            alt={nft.name}
                                            width={300}
                                            height={300}
                                            className="w-full h-48 object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                                            }}
                                        />
                                    </CardContent>
                                    <CardFooter className="p-3">
                                        <div className="w-full">
                                            <h3 className="font-medium text-sm truncate">{nft.name}</h3>
                                            <p className="text-xs text-muted-foreground truncate">{nft.collection}</p>
                                            <p className="text-xs text-green-600 font-medium">Created by you</p>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {selectedNFT && (
                <div className="mt-6 border rounded-md p-4">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3">
                            <Image
                                src={
                                    selectedNFT.image.startsWith("ipfs://")
                                        ? selectedNFT.image.replace("ipfs://", "https://ipfs.fileship.xyz/")
                                        : selectedNFT.image
                                }
                                alt={selectedNFT.name}
                                width={300}
                                height={300}
                                className="w-full rounded-md"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                            />
                        </div>
                        <div className="md:w-2/3 space-y-4">
                            <div>
                                <h2 className="text-2xl font-bold">{selectedNFT.name}</h2>
                                <p className="text-muted-foreground">{selectedNFT.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Collection</p>
                                    <p className="font-medium">{selectedNFT.collection}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Token ID</p>
                                    <p className="font-medium">{selectedNFT.tokenId}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Balance</p>
                                    <p className="font-medium">{selectedNFT.balance}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Standard</p>
                                    <p className="font-medium">{selectedNFT.standard.toUpperCase()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Creator</p>
                                    <p className="font-mono text-xs truncate">{selectedNFT.creator}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Contract</p>
                                    <p className="font-mono text-xs truncate">{selectedNFT.contract}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button variant="outline" size="sm" asChild>
                                    <a
                                        href={`${TZKT_EXPLORER}/${selectedNFT.contract}/tokens/${selectedNFT.tokenId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View on TzKT
                                    </a>
                                </Button>
                                <Button variant="outline" size="sm" disabled>
                                    Transfer (Coming Soon)
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" className="mt-4" onClick={() => setSelectedNFT(null)}>
                        Close Details
                    </Button>
                </div>
            )}
        </div>
    );
}
