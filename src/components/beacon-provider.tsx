"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { DAppClient } from "@airgap/beacon-sdk";
import type { TezosToolkit } from "@taquito/taquito";

// Dynamic imports for client-side only
const importBeaconSDK = () => import("@airgap/beacon-sdk");
const importTaquito = () => import("@taquito/taquito");

type TezosNetwork = "mainnet" | "ghostnet" | "oxfordnet" | "shadownet";

interface BeaconContextType {
    client: DAppClient | null;
    tezos: TezosToolkit | null;
    isConnected: boolean;
    account: { address: string; balance: string } | null;
    network: TezosNetwork;
    isInitialized: boolean;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => Promise<void>;
    switchNetwork: (network: TezosNetwork) => Promise<void>;
}

const BeaconContext = createContext<BeaconContextType | undefined>(undefined);

interface BeaconProviderProps {
    children: ReactNode;
}

// Network configuration (moved outside component to prevent re-creation)
const RPC_ENDPOINTS = {
    mainnet: process.env.NEXT_PUBLIC_TEZOS_RPC_MAINNET || "https://mainnet.api.tez.ie",
    ghostnet: process.env.NEXT_PUBLIC_TEZOS_RPC_GHOSTNET || "https://ghostnet.ecadinfra.com",
    oxfordnet: process.env.NEXT_PUBLIC_TEZOS_RPC_OXFORDNET || "https://oxfordnet.ecadinfra.com",
    shadownet: process.env.NEXT_PUBLIC_TEZOS_RPC_SHADOWNET || "https://rpc.shadownet.teztnets.com",
} as const;

export const BeaconProvider = ({ children }: BeaconProviderProps) => {
    // Network state - user can switch networks
    const [network, setNetwork] = useState<TezosNetwork>(
        (process.env.NEXT_PUBLIC_TEZOS_NETWORK as TezosNetwork) || "ghostnet"
    );

    // Client-side only state initialization
    const [client, setClient] = useState<DAppClient | null>(null);
    const [tezos, setTezos] = useState<TezosToolkit | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [account, setAccount] = useState<{ address: string; balance: string } | null>(null);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    // Initialize client-side only
    useEffect(() => {
        const initializeClients = async () => {
            try {
                // Only run on client-side
                if (typeof window === "undefined") return;

                // Dynamic imports to avoid SSR issues
                const [beaconModule, taquitoModule] = await Promise.all([importBeaconSDK(), importTaquito()]);

                const { DAppClient, BeaconEvent } = beaconModule;
                const { TezosToolkit } = taquitoModule;

                // Initialize DAppClient
                const beaconClient = new DAppClient({
                    name: process.env.NEXT_PUBLIC_DAPP_NAME || "Tezos Wallet Boilerplate",
                    iconUrl: process.env.NEXT_PUBLIC_DAPP_URL
                        ? `${process.env.NEXT_PUBLIC_DAPP_URL}/favicon.ico`
                        : undefined,
                    appUrl: process.env.NEXT_PUBLIC_DAPP_URL || undefined,
                });

                // Initialize TezosToolkit
                const rpcUrl = RPC_ENDPOINTS[network as keyof typeof RPC_ENDPOINTS] || RPC_ENDPOINTS.ghostnet;
                const tezosClient = new TezosToolkit(rpcUrl);

                setClient(beaconClient);
                setTezos(tezosClient);
                setIsInitialized(true);

                // Check existing connection
                const checkConnection = async () => {
                    try {
                        const activeAccount = await beaconClient.getActiveAccount();
                        if (activeAccount?.address) {
                            setIsConnected(true);
                            const balance = await tezosClient.tz.getBalance(activeAccount.address);
                            setAccount({
                                address: activeAccount.address,
                                balance: (balance.toNumber() / 1000000).toString(),
                            });
                        } else {
                            setIsConnected(false);
                            setAccount(null);
                        }
                    } catch (error) {
                        console.error("Error checking wallet connection:", error);
                        setIsConnected(false);
                        setAccount(null);
                    }
                };

                // Subscribe to account changes
                beaconClient.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, async (accountData: unknown) => {
                    const account = accountData as { address?: string };
                    if (account?.address) {
                        setIsConnected(true);
                        try {
                            const balance = await tezosClient.tz.getBalance(account.address);
                            setAccount({
                                address: account.address,
                                balance: (balance.toNumber() / 1000000).toString(),
                            });
                        } catch {
                            setAccount({
                                address: account.address,
                                balance: "0",
                            });
                        }
                    } else {
                        setIsConnected(false);
                        setAccount(null);
                    }
                });

                await checkConnection();
            } catch (error) {
                console.error("Error initializing Beacon/Taquito clients:", error);
            }
        };

        initializeClients();
    }, [network]);

    const connectWallet = async () => {
        if (!client) {
            throw new Error("Beacon client not initialized");
        }

        try {
            const permissions = await client.requestPermissions();
            const address = permissions.address;
            setIsConnected(true);

            if (tezos) {
                try {
                    const balance = await tezos.tz.getBalance(address);
                    setAccount({
                        address,
                        balance: (balance.toNumber() / 1000000).toString(),
                    });
                } catch {
                    setAccount({
                        address,
                        balance: "0",
                    });
                }
            } else {
                setAccount({
                    address,
                    balance: "0",
                });
            }
        } catch (error) {
            console.error("Error connecting wallet:", error);
            throw error;
        }
    };

    const disconnectWallet = async () => {
        if (!client) {
            throw new Error("Beacon client not initialized");
        }

        try {
            await client.clearActiveAccount();
            setIsConnected(false);
            setAccount(null);
        } catch (error) {
            console.error("Error disconnecting wallet:", error);
            throw error;
        }
    };

    const switchNetwork = async (newNetwork: TezosNetwork) => {
        try {
            // Update network state
            setNetwork(newNetwork);

            // Reinitialize TezosToolkit with new network
            if (tezos) {
                const rpcUrl = RPC_ENDPOINTS[newNetwork];
                const taquitoModule = await importTaquito();
                const { TezosToolkit } = taquitoModule;
                const newTezosClient = new TezosToolkit(rpcUrl);
                setTezos(newTezosClient);

                // Update account balance if connected
                if (account?.address) {
                    try {
                        const balance = await newTezosClient.tz.getBalance(account.address);
                        setAccount((prev) =>
                            prev
                                ? {
                                      ...prev,
                                      balance: (balance.toNumber() / 1000000).toString(),
                                  }
                                : null
                        );
                    } catch (error) {
                        console.error("Error fetching balance on new network:", error);
                        // Keep existing account but reset balance
                        setAccount((prev) => (prev ? { ...prev, balance: "0" } : null));
                    }
                }
            }
        } catch (error) {
            console.error("Error switching network:", error);
            throw error;
        }
    };

    const contextValue: BeaconContextType = {
        client,
        tezos,
        isConnected,
        account,
        network,
        isInitialized,
        connectWallet,
        disconnectWallet,
        switchNetwork,
    };

    return <BeaconContext.Provider value={contextValue}>{children}</BeaconContext.Provider>;
};

export const useBeacon = (): BeaconContextType => {
    const context = useContext(BeaconContext);
    if (context === undefined) {
        throw new Error("useBeacon must be used within a BeaconProvider");
    }
    return context;
};
