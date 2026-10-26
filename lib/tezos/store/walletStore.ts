import { create } from "zustand";
import { TezosToolkit } from "@taquito/taquito";
import { ENV } from "../../constants";

// Type-only import — safe for SSR; runtime import is done lazily inside actions.
import type { OctezConnectWallet } from "../OctezConnectWallet";
import type { KukaiEmbed } from "kukai-embed";

// Network configuration types
export type TezosNetwork = "mainnet" | "ghostnet" | "shadownet";

interface NetworkConfig {
    name: string;
    rpcUrl: string;
    tzktApi: string;
    tzktExplorer: string;
    isTestnet: boolean;
    faucetUrl?: string;
}

interface WalletState {
    Tezos: TezosToolkit;
    wallet: OctezConnectWallet | null;
    kukai: KukaiEmbed | null;
    address: string | null;
    network: TezosNetwork;
    isInitialized: boolean;
    initializeWallets: () => Promise<void>;
    connectWallet: () => Promise<void>;
    connectKukai: () => Promise<void>;
    disconnectWallet: () => Promise<void>;
    switchNetwork: (network: TezosNetwork) => Promise<void>;
    setTezos: (tezos: TezosToolkit) => void;
    setWallet: (wallet: OctezConnectWallet | null) => void;
    setKukai: (kukai: KukaiEmbed | null) => void;
    setAddress: (address: string | null) => void;
    setNetwork: (network: TezosNetwork) => void;
}

// Network configurations following Taquito best practices
const NETWORK_CONFIGS: Record<TezosNetwork, NetworkConfig> = {
    mainnet: {
        name: "Mainnet",
        rpcUrl: process.env.NEXT_PUBLIC_TEZOS_RPC_MAINNET || "https://rpc.tzkt.io/mainnet",
        tzktApi: process.env.NEXT_PUBLIC_TZKT_API_MAINNET || "https://api.tzkt.io/v1",
        tzktExplorer: "https://tzkt.io",
        isTestnet: false,
    },
    ghostnet: {
        name: "Ghostnet",
        rpcUrl: process.env.NEXT_PUBLIC_TEZOS_RPC_GHOSTNET || "https://ghostnet.ecadinfra.com",
        tzktApi: process.env.NEXT_PUBLIC_TZKT_API_GHOSTNET || "https://api.ghostnet.tzkt.io/v1",
        tzktExplorer: "https://ghostnet.tzkt.io",
        isTestnet: true,
        faucetUrl: "https://faucet.ghostnet.teztnets.com",
    },
    shadownet: {
        name: "Shadownet",
        rpcUrl: process.env.NEXT_PUBLIC_TEZOS_RPC_SHADOWNET || "https://rpc.tzkt.io/shadownet",
        tzktApi: process.env.NEXT_PUBLIC_TZKT_API_SHADOWNET || "https://api.shadownet.tzkt.io/v1",
        tzktExplorer: "https://shadownet.tzkt.io",
        isTestnet: true,
        faucetUrl: "https://faucet.shadownet.teztnets.com",
    },
};

// Get initial network from environment or default to ghostnet
const getInitialNetwork = (): TezosNetwork => {
    const envNetwork = (process.env.NEXT_PUBLIC_TEZOS_NETWORK as TezosNetwork) || "ghostnet";
    return Object.keys(NETWORK_CONFIGS).includes(envNetwork) ? envNetwork : "ghostnet";
};

const initialNetwork = getInitialNetwork();

function getDAppMetadata() {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return {
        name: "Tezos Boilerplate",
        description: "A modern boilerplate for building Tezos dApps with Next.js",
        appUrl: origin || undefined,
        iconUrl: origin ? `${origin}/icon1.png` : undefined,
    };
}

/**
 * Checks if a session account matches the target network.
 * Handles custom network mapping for Ghostnet as used by Temple and other wallets.
 */
function matchesActiveNetwork(
    account: { network?: { type?: string; rpcUrl?: string } } | null,
    targetNetwork: TezosNetwork
): boolean {
    if (!account?.network?.type) return false;
    const accountNet = account.network.type.toLowerCase();
    if (targetNetwork === "mainnet") {
        return accountNet === "mainnet";
    }
    if (targetNetwork === "shadownet") {
        return accountNet === "shadownet";
    }
    // ghostnet / custom
    return accountNet === "custom" || accountNet === "ghostnet";
}

/**
 * Check if a previous Beacon session exists in localStorage.
 */
export function hasBeaconSession(): boolean {
    if (typeof window === "undefined" || typeof localStorage === "undefined") return false;
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i)?.startsWith("beacon:")) return true;
    }
    return false;
}

/**
 * Nuclear reset for any corrupted or stale Beacon state in localStorage.
 */
export function clearBeaconState(): void {
    if (typeof localStorage === "undefined") return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("beacon:")) keysToRemove.push(key);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
}

export const useWalletStore = create<WalletState>((set, get) => ({
    Tezos: new TezosToolkit(NETWORK_CONFIGS[initialNetwork].rpcUrl),
    wallet: null,
    kukai: null,
    address: null,
    network: initialNetwork,
    isInitialized: false,
    initializeWallets: async () => {
        try {
            const { OctezConnectWallet, buildNetwork } = await import("../OctezConnectWallet");
            const currentNetwork = get().network;
            const networkConfig = NETWORK_CONFIGS[currentNetwork];

            const wallet = new OctezConnectWallet({
                ...getDAppMetadata(),
                network: buildNetwork(currentNetwork, networkConfig.rpcUrl),
            });

            const { Tezos } = get();
            Tezos.setWalletProvider(wallet);
            set({ wallet });

            // Restore any active session that matches the current network
            try {
                const activeAccount = await wallet.client.getActiveAccount();
                if (activeAccount && matchesActiveNetwork(activeAccount, currentNetwork)) {
                    set({ address: activeAccount.address });
                }
            } catch {
                // No prior session — start fresh
            }

            set({ isInitialized: true });
        } catch (error) {
            console.error("Error initializing wallets:", error);
            set({ isInitialized: true }); // Mark as initialized even on error
        }
    },
    connectWallet: async () => {
        try {
            let { wallet } = get();
            const currentNetwork = get().network;
            const networkConfig = NETWORK_CONFIGS[currentNetwork];

            // Lazily create the wallet if initializeWallets has not run yet
            if (!wallet) {
                const { OctezConnectWallet, buildNetwork } = await import("../OctezConnectWallet");

                wallet = new OctezConnectWallet({
                    ...getDAppMetadata(),
                    network: buildNetwork(currentNetwork, networkConfig.rpcUrl),
                });

                const { Tezos } = get();
                Tezos.setWalletProvider(wallet);
                set({ wallet });
            }

            // Check if there is already a matching active account from a previous session
            const existing = await wallet.client.getActiveAccount();
            if (existing && matchesActiveNetwork(existing, currentNetwork)) {
                set({ address: existing.address });
                return;
            }

            // If account is on another chain, clear before requesting fresh permissions
            if (existing) {
                try {
                    await wallet.clearActiveAccount();
                } catch {
                    // Ignore clear failure
                }
            }

            await wallet.requestPermissions();
            const userAddress = await wallet.getPKH();
            set({ address: userAddress });
        } catch (error) {
            console.error("Error connecting wallet:", error);
            throw error;
        }
    },
    connectKukai: async () => {
        try {
            let { kukai } = get();

            // If kukai not initialized, initialize it first
            if (!kukai) {
                const { KukaiEmbed, Networks } = await import("kukai-embed");

                // Single attempt at initialization - fail fast if there are conflicts
                kukai = new KukaiEmbed({
                    net: ENV === "dev" ? Networks.ghostnet : Networks.mainnet,
                });
                await kukai.init();
                set({ kukai });
            }

            const userInfo = await kukai.login({ wideButtons: [true, false] });
            set({ address: userInfo.pkh });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            // Provide clear error message for common singleton conflicts
            if (errorMessage.includes("Already Present") || errorMessage.includes("Kukai-Embed")) {
                throw new Error(
                    "Kukai is already initialized elsewhere. Please refresh the page to reset the state and try again."
                );
            }

            console.error("Error connecting Kukai:", error);
            throw error;
        }
    },
    disconnectWallet: async () => {
        const { wallet, kukai } = get();
        if (wallet) {
            await wallet.clearActiveAccount();
            set({ address: null });
        }
        if (kukai) {
            kukai.logout();
            set({ address: null });
        }
    },
    switchNetwork: async (newNetwork: TezosNetwork) => {
        try {
            const { Tezos } = get();
            const networkConfig = NETWORK_CONFIGS[newNetwork];

            // Update RPC provider
            Tezos.setProvider({ rpc: networkConfig.rpcUrl });

            // Recreate the wallet for the new network.
            // reset: true destroys the existing DAppClient singleton so the
            // new one can register its own keypair and message listeners.
            const { OctezConnectWallet, buildNetwork } = await import("../OctezConnectWallet");
            const newWallet = new OctezConnectWallet(
                {
                    ...getDAppMetadata(),
                    network: buildNetwork(newNetwork, networkConfig.rpcUrl),
                },
                true // reset singleton
            );

            Tezos.setWalletProvider(newWallet);
            set({ wallet: newWallet, address: null, network: newNetwork });
        } catch (error) {
            console.error("Failed to switch network:", error);
            throw error;
        }
    },
    setTezos: (tezos) => set({ Tezos: tezos }),
    setWallet: (wallet) => set({ wallet }),
    setKukai: (kukai) => set({ kukai }),
    setAddress: (address) => set({ address }),
    setNetwork: (network) => set({ network }),
}));

// Export network configurations for use in components
export { NETWORK_CONFIGS };
