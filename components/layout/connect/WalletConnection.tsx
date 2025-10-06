"use client";

import React, { useEffect, useState } from "react";
import { useTezos } from "@/lib/tezos/useTezos";
import { Button } from "@/components/ui/button";
import { Loader2, Wallet, LogOut } from "lucide-react";

const WalletConnection: React.FC = () => {
    const { connectWallet, disconnectWallet, address, isInitialized } = useTezos();
    const [isLoading, setIsLoading] = useState(false);

    const handleConnect = async () => {
        setIsLoading(true);
        try {
            await connectWallet();
        } catch (error) {
            console.error("Failed to connect wallet:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisconnect = async () => {
        setIsLoading(true);
        try {
            await disconnectWallet();
        } catch (error) {
            console.error("Failed to disconnect wallet:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (address !== null) {
            setIsLoading(false);
        }
    }, [address]);

    // Show loading spinner while initializing wallets
    if (!isInitialized || isLoading) {
        return (
            <Button variant="outline" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
        );
    }

    return (
        <div>
            {address ? (
                <Button variant="outline" onClick={handleDisconnect} className="gap-2" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                    <span className="hidden sm:inline">Disconnect</span>
                </Button>
            ) : (
                <Button onClick={handleConnect} className="gap-2" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                    <span className="hidden sm:inline">Connect</span>
                </Button>
            )}
        </div>
    );
};

export default WalletConnection;
