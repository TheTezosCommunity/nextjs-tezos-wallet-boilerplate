"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, ChevronDown, LogOut, Copy, ExternalLink } from "lucide-react";
import { useBeacon } from "@/components/beacon-provider";
import { NetworkSelector } from "@/components/network-selector";

interface WalletConnectProps {
    showDetails?: boolean;
}

// TzKT Explorer endpoints
const TZKT_EXPLORER_ENDPOINTS = {
    mainnet: "https://tzkt.io",
    ghostnet: "https://ghostnet.tzkt.io",
    oxfordnet: "https://oxfordnet.tzkt.io",
    shadownet: "https://shadownet.tzkt.io",
} as const;

export function WalletConnect({ showDetails = false }: WalletConnectProps) {
    const { isConnected, account, network, isInitialized, connectWallet, disconnectWallet } = useBeacon();

    const tzktExplorer =
        TZKT_EXPLORER_ENDPOINTS[network as keyof typeof TZKT_EXPLORER_ENDPOINTS] || TZKT_EXPLORER_ENDPOINTS.ghostnet;

    const copyAddress = () => {
        if (account?.address) {
            navigator.clipboard.writeText(account.address);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <NetworkSelector variant="compact" />
            {!isInitialized ? (
                <Button variant="outline" className="gap-2" disabled>
                    <Wallet className="h-4 w-4" />
                    Loading...
                </Button>
            ) : !isConnected ? (
                <Button variant="outline" className="gap-2" onClick={connectWallet}>
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                </Button>
            ) : (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Wallet className="h-4 w-4" />
                            {account?.address.slice(0, 7)}...{account?.address.slice(-4)}
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={copyAddress} className="gap-2 cursor-pointer">
                            <Copy className="h-4 w-4" />
                            Copy Address
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 cursor-pointer" asChild>
                            <a href={`${tzktExplorer}/${account?.address}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                                View on TzKT
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={disconnectWallet} className="gap-2 cursor-pointer text-red-500">
                            <LogOut className="h-4 w-4" />
                            Disconnect
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {showDetails && isConnected && account && (
                <div className="mt-4 p-4 border rounded-md w-full">
                    <div className="grid gap-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Address:</span>
                            <span className="text-sm font-mono">
                                {account.address.slice(0, 10)}...{account.address.slice(-4)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Balance:</span>
                            <span className="text-sm font-mono">{account.balance} ꜩ</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Network:</span>
                            <span className="text-sm capitalize">
                                {network} {network !== "mainnet" ? "(Testnet)" : ""}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
