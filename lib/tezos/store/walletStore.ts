import { create } from "zustand";
import { TezosToolkit } from "@taquito/taquito";
import { ENV } from "../../constants";

// Import types for better type safety
import type { BeaconWallet } from "@taquito/beacon-wallet";
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
    wallet: BeaconWallet | null;
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
    setWallet: (wallet: BeaconWallet | null) => void;
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
            const { BeaconWallet } = await import("@taquito/beacon-wallet");
            const { NetworkType } = await import("@airgap/beacon-dapp");

            // Initialize BeaconWallet using singleton pattern from Taquito docs
            const wallet = new BeaconWallet({
                name: "Tezos Boilerplate",
                preferredNetwork: ENV === "dev" ? NetworkType.GHOSTNET : NetworkType.MAINNET,
            });

            const { Tezos } = get();
            Tezos.setWalletProvider(wallet);
            set({ wallet });

            // Check if there's an active Beacon account
            try {
                const activeAccount = await wallet.client.getActiveAccount();
                if (activeAccount) {
                    console.log("Found existing Beacon wallet connection:", activeAccount.address);
                    set({ address: activeAccount.address });
                }
            } catch {
                console.log("No existing Beacon wallet connection found");
            }

            // Skip Kukai initialization entirely during auto-init to prevent conflicts
            // Kukai will only be initialized when explicitly requested via connectKukai
            console.log("Skipping Kukai auto-initialization to prevent singleton conflicts");

            set({ isInitialized: true });
        } catch (error) {
            console.error("Error initializing wallets:", error);
            set({ isInitialized: true }); // Mark as initialized even on error
        }
    },
    connectWallet: async () => {
        try {
            let { wallet } = get();

            // If wallet not initialized, initialize it first
            if (!wallet) {
                const { BeaconWallet } = await import("@taquito/beacon-wallet");
                const { NetworkType } = await import("@airgap/beacon-dapp");

                wallet = new BeaconWallet({
                    name: "Tezos Boilerplate",
                    preferredNetwork: ENV === "dev" ? NetworkType.GHOSTNET : NetworkType.MAINNET,
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
            await wallet.client.clearActiveAccount();
            set({ address: null });
        }
        if (kukai) {
            kukai.logout();
            set({ address: null });
        }
    },
    switchNetwork: async (newNetwork: TezosNetwork) => {
        try {
            const { Tezos, wallet } = get();
            const networkConfig = NETWORK_CONFIGS[newNetwork];

            // Update RPC provider using Taquito setProvider pattern
            Tezos.setProvider({ rpc: networkConfig.rpcUrl });

            // If wallet is connected, reconnect to new network
            if (wallet) {
                const { BeaconWallet } = await import("@taquito/beacon-wallet");
                const { NetworkType } = await import("@airgap/beacon-dapp");

                // Clear current connection
                await wallet.client.clearActiveAccount();

                // Create new wallet instance for new network
                const networkType = newNetwork === "mainnet" ? NetworkType.MAINNET : NetworkType.GHOSTNET;
                const newWallet = new BeaconWallet({
                    name: "Tezos Boilerplate",
                    preferredNetwork: networkType,
                });

                Tezos.setWalletProvider(newWallet);
                set({ wallet: newWallet, address: null });

                console.log(`Switched to ${networkConfig.name} network`);
            }

            set({ network: newNetwork });
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
