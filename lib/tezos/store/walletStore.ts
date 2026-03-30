import { create } from "zustand";
import { TezosToolkit } from "@taquito/taquito";
import { ENV } from "../../constants";

// Type-only import — safe for SSR; runtime import is done lazily inside actions.
import type { OctezConnectWallet } from "../OctezConnectWallet";
import type { KukaiEmbed } from "kukai-embed";

// Network configuration types
export type TezosNetwork = "mainnet" | "ghostnet" | "oxfordnet" | "shadownet";

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
        rpcUrl: process.env.NEXT_PUBLIC_TEZOS_RPC_MAINNET || "https://mainnet.api.tez.ie",
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
    oxfordnet: {
        name: "Oxfordnet",
        rpcUrl: process.env.NEXT_PUBLIC_TEZOS_RPC_OXFORDNET || "https://oxfordnet.ecadinfra.com",
        tzktApi: process.env.NEXT_PUBLIC_TZKT_API_OXFORDNET || "https://api.oxfordnet.tzkt.io/v1",
        tzktExplorer: "https://oxfordnet.tzkt.io",
        isTestnet: true,
    },
    shadownet: {
        name: "Shadownet",
        rpcUrl: process.env.NEXT_PUBLIC_TEZOS_RPC_SHADOWNET || "https://rpc.shadownet.teztnets.com",
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
            const networkConfig = NETWORK_CONFIGS[get().network];

            const wallet = new OctezConnectWallet({
                name: "Tezos Boilerplate",
                network: buildNetwork(get().network, networkConfig.rpcUrl),
            });

            const { Tezos } = get();
            Tezos.setWalletProvider(wallet);
            set({ wallet });

            // Restore any active session from a previous page load
            try {
                const activeAccount = await wallet.client.getActiveAccount();
                if (activeAccount) {
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

            // Lazily create the wallet if initializeWallets has not run yet
            if (!wallet) {
                const { OctezConnectWallet, buildNetwork } = await import("../OctezConnectWallet");
                const networkConfig = NETWORK_CONFIGS[get().network];

                wallet = new OctezConnectWallet({
                    name: "Tezos Boilerplate",
                    network: buildNetwork(get().network, networkConfig.rpcUrl),
                });

                const { Tezos } = get();
                Tezos.setWalletProvider(wallet);
                set({ wallet });
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
                    name: "Tezos Boilerplate",
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
