"use client";

import { useState } from "react";
import { Globe, Zap, ExternalLink, Ghost, Blend } from "lucide-react";
import { useTezos } from "@/lib/tezos/useTezos";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TezosNetwork = "mainnet" | "ghostnet" | "oxfordnet" | "shadownet";

interface NetworkConfig {
    name: string;
    value: TezosNetwork;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    faucetUrl?: string;
    isTestnet: boolean;
}

const NETWORKS: NetworkConfig[] = [
    {
        name: "Mainnet",
        value: "mainnet",
        icon: Globe,
        description: "Production network with real XTZ",
        isTestnet: false,
    },
    {
        name: "Ghostnet",
        value: "ghostnet",
        icon: Ghost,
        description: "Public testnet for development",
        faucetUrl: "https://faucet.ghostnet.teztnets.com",
        isTestnet: true,
    },
    {
        name: "Shadownet",
        value: "shadownet",
        icon: Blend,
        description: "Long-term testnet for development",
        faucetUrl: "https://faucet.shadownet.teztnets.com",
        isTestnet: true,
    },
    {
        name: "Oxfordnet",
        value: "oxfordnet",
        icon: Zap,
        description: "Protocol testing network",
        isTestnet: true,
    },
];

interface NetworkSelectorProps {
    variant?: "default" | "compact";
    className?: string;
}

export function NetworkSelector({ variant = "default", className = "" }: NetworkSelectorProps) {
    const { address } = useTezos();
    const isConnected = !!address;
    const [isLoading, setIsLoading] = useState(false);
    const [network, setNetwork] = useState<TezosNetwork>("ghostnet");

    const currentNetwork = NETWORKS.find((n) => n.value === network) || NETWORKS[1]; // Default to ghostnet

    const handleNetworkChange = async (newNetwork: TezosNetwork) => {
        if (newNetwork === network) return;

        setIsLoading(true);
        try {
            setNetwork(newNetwork);
            // TODO: Implement network switching in useTezos hook
            console.log("Switching to network:", newNetwork);
        } catch (error) {
            console.error("Failed to switch network:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (variant === "compact") {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <Select value={network} onValueChange={handleNetworkChange} disabled={isLoading}>
                    <SelectTrigger className="h-8 px-3 text-xs font-medium gap-1.5 w-auto min-w-[100px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {NETWORKS.map((net) => (
                            <SelectItem key={net.value} value={net.value}>
                                <div className="flex items-center gap-2">
                                    <net.icon className="w-4 h-4" />
                                    <div>
                                        <div className="font-medium">{net.name}</div>
                                        <div className="text-xs text-muted-foreground">{net.description}</div>
                                    </div>
                                </div>
                            </SelectItem>
                        ))}
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
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-full">
                    {NETWORKS.map((net) => (
                        <SelectItem key={net.value} value={net.value} className="p-3">
                            <div className="flex items-center gap-3 w-full">
                                <div className="p-1.5 rounded-md bg-muted flex-shrink-0">
                                    <net.icon className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm">{net.name}</div>
                                    <div className="text-xs text-muted-foreground line-clamp-2">{net.description}</div>
                                </div>
                                {net.value === network && (
                                    <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
                                        Active
                                    </Badge>
                                )}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {(isConnected || currentNetwork.faucetUrl) && (
                <div className="flex items-center justify-between text-xs">
                    {isConnected && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="w-2 h-2 bg-green-600 rounded-full" />
                            <span>Wallet connected</span>
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
