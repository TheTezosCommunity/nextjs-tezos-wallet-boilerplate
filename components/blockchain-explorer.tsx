"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, RefreshCw, ExternalLink, Loader2, AlertCircle } from "lucide-react";

// Network configuration from environment variables
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

interface Block {
    level: number;
    hash: string;
    timestamp: string;
    operations: number;
    baker?: { address: string };
}

interface Operation {
    hash: string;
    type: string;
    sender?: { address: string };
    target?: { address: string };
    amount?: number;
    timestamp: string;
    status: string;
    level: number;
}

interface TzKTBlock {
    level: number;
    hash: string;
    timestamp: string;
    operations?: unknown[];
    baker: {
        address: string;
    };
}

interface TzKTOperation {
    hash: string;
    type: string;
    sender?: {
        address: string;
    };
    target?: {
        address: string;
    };
    amount?: number;
    timestamp: string;
    status: string;
    level: number;
}

interface TzKTAccount {
    address: string;
    balance?: number;
    type: string;
}

interface TzKTContract {
    address: string;
    balance?: number;
    type: string;
}

type SearchResultData = TzKTBlock | TzKTOperation | TzKTAccount | TzKTContract;

interface SearchResult {
    type: "block" | "operation" | "account" | "contract";
    data: SearchResultData;
}

export function BlockchainExplorer() {
    const [searchQuery, setSearchQuery] = useState("");
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [operations, setOperations] = useState<Operation[]>([]);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchLatestBlocks = useCallback(async () => {
        try {
            const response = await fetch(`${TZKT_API}/blocks?limit=10&sort.desc=level`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            const formattedBlocks: Block[] = data.map((block: TzKTBlock) => ({
                level: block.level,
                hash: block.hash,
                timestamp: block.timestamp,
                operations: block.operations?.length || 0,
                baker: block.baker.address,
            }));

            setBlocks(formattedBlocks);
        } catch (err) {
            console.error("Failed to fetch blocks:", err);
            setError("Failed to fetch latest blocks");
        }
    }, []);

    const fetchLatestOperations = useCallback(async () => {
        try {
            const response = await fetch(`${TZKT_API}/operations?limit=10&sort.desc=level`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            const formattedOps: Operation[] = data.map((op: TzKTOperation) => ({
                hash: op.hash,
                type: op.type,
                sender: op.sender?.address,
                target: op.target?.address,
                amount: op.amount,
                timestamp: op.timestamp,
                status: op.status,
                level: op.level,
            }));

            setOperations(formattedOps);
        } catch (err) {
            console.error("Failed to fetch operations:", err);
            setError("Failed to fetch latest operations");
        }
    }, []);

    // Fetch latest blocks on component mount
    useEffect(() => {
        fetchLatestBlocks();
        fetchLatestOperations();
    }, [fetchLatestBlocks, fetchLatestOperations]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setError("");
        setSearchResults([]);

        try {
            // Try searching for different types of entities
            const searchPromises = [];

            // Search for blocks (by level or hash)
            if (!Number.isNaN(Number(searchQuery))) {
                searchPromises.push(
                    fetch(`${TZKT_API}/blocks/${searchQuery}`)
                        .then((res) => (res.ok ? res.json() : null))
                        .then((data) => (data ? { type: "block" as const, data } : null))
                );
            }

            // Search for accounts/contracts
            if (searchQuery.startsWith("tz") || searchQuery.startsWith("KT")) {
                searchPromises.push(
                    fetch(`${TZKT_API}/accounts/${searchQuery}`)
                        .then((res) => (res.ok ? res.json() : null))
                        .then((data) =>
                            data
                                ? {
                                      type: data.type === "contract" ? ("contract" as const) : ("account" as const),
                                      data,
                                  }
                                : null
                        )
                );
            }

            // Search for operations
            if (searchQuery.startsWith("o")) {
                searchPromises.push(
                    fetch(`${TZKT_API}/operations/${searchQuery}`)
                        .then((res) => (res.ok ? res.json() : null))
                        .then((data) => (data ? { type: "operation" as const, data } : null))
                );
            }

            const results = await Promise.all(searchPromises);
            const validResults = results.filter(Boolean) as SearchResult[];

            setSearchResults(validResults);

            if (validResults.length === 0) {
                setError("No results found for your search query");
            }
        } catch (err) {
            console.error("Search failed:", err);
            setError("Search failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsLoading(true);
        setError("");
        await Promise.all([fetchLatestBlocks(), fetchLatestOperations()]);
        setIsLoading(false);
    };

    const formatAmount = (amount?: number) => {
        if (!amount) return "0 ꜩ";
        return `${(amount / 1000000).toFixed(2)} ꜩ`;
    };

    const getResultKey = (result: SearchResult, index: number): string => {
        if (result.type === "block") {
            return `${result.type}-${(result.data as TzKTBlock).level}`;
        } else if (result.type === "operation") {
            return `${result.type}-${(result.data as TzKTOperation).hash}`;
        } else if (result.type === "account" || result.type === "contract") {
            return `${result.type}-${(result.data as TzKTAccount | TzKTContract).address}`;
        }
        return `${result.type}-${index}`;
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };

    const truncateHash = (hash: string, length = 12) => {
        return `${hash.slice(0, length)}...${hash.slice(-6)}`;
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1">
                    <Input
                        placeholder="Search by block, operation, address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button type="submit" disabled={isLoading}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                </Button>
                <Button type="button" variant="outline" onClick={handleRefresh} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    <span className="sr-only">Refresh</span>
                </Button>
            </form>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {isLoading && (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading...</span>
                </div>
            )}

            {searchResults.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Search Results</CardTitle>
                        <CardDescription>Results for "{searchQuery}"</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {searchResults.map((result, index) => (
                                <div key={getResultKey(result, index)} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold capitalize">{result.type}</h3>
                                            {result.type === "block" && (
                                                <p className="text-sm text-muted-foreground">
                                                    Level: {(result.data as TzKTBlock).level} | Operations:{" "}
                                                    {(result.data as TzKTBlock).operations?.length || 0}
                                                </p>
                                            )}
                                            {result.type === "account" && (
                                                <p className="text-sm text-muted-foreground">
                                                    Balance: {formatAmount((result.data as TzKTAccount).balance)} |
                                                    Type: {(result.data as TzKTAccount).type}
                                                </p>
                                            )}
                                            {result.type === "contract" && (
                                                <p className="text-sm text-muted-foreground">
                                                    Contract | Balance:{" "}
                                                    {formatAmount((result.data as TzKTContract).balance)}
                                                </p>
                                            )}
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <a
                                                href={`${TZKT_EXPLORER}/${
                                                    result.type === "block"
                                                        ? (result.data as TzKTBlock).level
                                                        : result.type === "operation"
                                                        ? (result.data as TzKTOperation).hash
                                                        : (result.data as TzKTAccount | TzKTContract).address
                                                }`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                View on TzKT
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="blocks">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="blocks">Recent Blocks</TabsTrigger>
                    <TabsTrigger value="operations">Recent Operations</TabsTrigger>
                </TabsList>

                <TabsContent value="blocks" className="pt-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Latest Blocks</CardTitle>
                            <CardDescription>Most recent blocks on the Tezos blockchain</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Hash</TableHead>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>Operations</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {blocks.map((block) => (
                                        <TableRow key={block.hash}>
                                            <TableCell className="font-medium">{block.level}</TableCell>
                                            <TableCell className="font-mono text-xs truncate max-w-[120px]">
                                                {truncateHash(block.hash)}
                                            </TableCell>
                                            <TableCell>{formatTimestamp(block.timestamp)}</TableCell>
                                            <TableCell>{block.operations}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <a
                                                        href={`${TZKT_EXPLORER}/${block.hash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                        <span className="sr-only">View details</span>
                                                    </a>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                            <Button variant="outline" size="sm">
                                Load More
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="operations" className="pt-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Latest Operations</CardTitle>
                            <CardDescription>Most recent operations on the Tezos blockchain</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Hash</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Sender</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {operations.map((op) => (
                                        <TableRow key={op.hash}>
                                            <TableCell className="font-mono text-xs truncate max-w-[120px]">
                                                {truncateHash(op.hash)}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${
                                                        op.type === "transaction"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : op.type === "origination"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-purple-100 text-purple-800"
                                                    }`}
                                                >
                                                    {op.type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs truncate max-w-[100px]">
                                                {op.sender?.address ? truncateHash(op.sender.address, 8) : "N/A"}
                                            </TableCell>
                                            <TableCell>{formatAmount(op.amount)}</TableCell>
                                            <TableCell>{formatTimestamp(op.timestamp)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <a
                                                        href={`${TZKT_EXPLORER}/${op.hash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                        <span className="sr-only">View details</span>
                                                    </a>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                            <Button variant="outline" size="sm">
                                Load More
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
