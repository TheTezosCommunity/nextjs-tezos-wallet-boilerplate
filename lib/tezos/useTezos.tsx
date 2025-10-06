"use client";
import { useEffect } from "react";
import { useWalletStore } from "./store/walletStore";

export const useTezos = () => {
    const {
        Tezos,
        address,
        wallet,
        kukai,
        network,
        isInitialized,
        initializeWallets,
        connectWallet,
        connectKukai,
        disconnectWallet,
        switchNetwork,
    } = useWalletStore();

    // Initialize wallets on first mount to check for existing connections
    useEffect(() => {
        if (!isInitialized) {
            initializeWallets();
        }
    }, [isInitialized, initializeWallets]);

    // Simple hook that returns store state and methods
    return {
        Tezos,
        wallet,
        address,
        kukai,
        network,
        isInitialized,
        connectWallet,
        connectKukai,
        disconnectWallet,
        switchNetwork,
    };
};
