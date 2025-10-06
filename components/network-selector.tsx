"use client";

import { useState } from "react";
import { Globe, Zap, ExternalLink, Ghost, Blend, Loader2 } from "lucide-react";
import { useTezos } from "@/lib/tezos/useTezos";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWalletStore, NETWORK_CONFIGS, type TezosNetwork } from "@/lib/tezos/store/walletStore";

// Helper function to get network icons
const getNetworkIcon = (network: TezosNetwork) => {
    switch (network) {
        case "mainnet":
            return Globe;
        case "ghostnet":
            return Ghost;
        case "shadownet":
            return Blend;
        case "oxfordnet":
            return Zap;
        default:
            return Globe;
    }
};

interface NetworkSelectorProps {
    variant?: "default" | "compact";
    className?: string;
}

export function NetworkSelector({ variant = "default", className = "" }: NetworkSelectorProps) {
    const { address } = useTezos();
    const { network, switchNetwork } = useWalletStore();
    const isConnected = !!address;
    const [isLoading, setIsLoading] = useState(false);

    const currentNetwork = NETWORK_CONFIGS[network];

    const handleNetworkChange = async (newNetwork: TezosNetwork) => {
        if (newNetwork === network) return;

        setIsLoading(true);
        try {
            await switchNetwork(newNetwork);
            console.log(`Successfully switched to ${NETWORK_CONFIGS[newNetwork].name}`);
        } catch (error) {
            console.error("Failed to switch network:", error);
            // Could add toast notification here
        } finally {
            setIsLoading(false);
        }
    };

    if (variant === "compact") {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <Select value={network} onValueChange={handleNetworkChange} disabled={isLoading}>
                    <SelectTrigger className="h-8 px-3 text-xs font-medium gap-1.5 w-auto min-w-[100px]">
                        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <SelectValue />}
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(NETWORK_CONFIGS).map(([networkKey, config]) => {
                            const NetworkIcon = getNetworkIcon(networkKey as TezosNetwork);
                            return (
                                <SelectItem key={networkKey} value={networkKey}>
                                    <div className="flex items-center gap-2">
                                        <NetworkIcon className="w-4 h-4" />
                                        <div>
                                            <div className="font-medium">{config.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {config.isTestnet ? "Testnet" : "Mainnet"}
                                            </div>
                                        </div>
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
                {isConnected && (
                    <Badge variant="outline" className="text-xs h-6 px-2">
                        Connected
                    </Badge>
                )}
            </div>
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex items-center justify-between">
                <label htmlFor="network-selector" className="text-sm font-medium text-foreground">
                    Network
                </label>
                {isConnected && (
                    <Badge variant="outline" className="text-xs">
                        Connected
                    </Badge>
                )}
            </div>
            <Select value={network} onValueChange={handleNetworkChange} disabled={isLoading}>
                <SelectTrigger id="network-selector" className="w-full h-auto min-h-[3rem] p-3">
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Switching network...</span>
                        </div>
                    ) : (
                        <SelectValue />
                    )}
                </SelectTrigger>
                <SelectContent className="w-full">
                    {Object.entries(NETWORK_CONFIGS).map(([networkKey, config]) => {
                        const NetworkIcon = getNetworkIcon(networkKey as TezosNetwork);
                        return (
                            <SelectItem key={networkKey} value={networkKey} className="p-3">
                                <div className="flex items-center gap-3 w-full">
                                    <div className="p-1.5 rounded-md bg-muted flex-shrink-0">
                                        <NetworkIcon className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm">{config.name}</div>
                                        <div className="text-xs text-muted-foreground line-clamp-2">
                                            {config.isTestnet
                                                ? "Test network for development"
                                                : "Production network with real XTZ"}
                                        </div>
                                    </div>
                                    {networkKey === network && (
                                        <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
                                            Active
                                        </Badge>
                                    )}
                                </div>
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
            {(isConnected || currentNetwork.faucetUrl) && (
                <div className="flex items-center justify-between text-xs">
                    {isConnected && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="w-2 h-2 bg-green-600 rounded-full" />
                            <span>Wallet connected to {currentNetwork.name}</span>
                        </div>
                    )}
                    {currentNetwork.faucetUrl && (
                        <a
                            href={currentNetwork.faucetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 hover:underline transition-colors"
                        >
                            <ExternalLink className="w-3 h-3" />
                            <span>Get testnet tokens</span>
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
