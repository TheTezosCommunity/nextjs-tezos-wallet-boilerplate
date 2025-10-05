"use client";
import { useEffect } from 'react';
import { useWalletStore } from './store/walletStore';
import { ENV } from '../constants';


export const useTezos = () => {
  const { Tezos,address, wallet, kukai, setWallet, setAddress, setKukai, connectWallet, connectKukai, disconnectWallet } = useWalletStore();
  
  const initClientLibraries = async () => {
    try {
      const { BeaconWallet } = await import('@taquito/beacon-wallet');
      const { KukaiEmbed, Networks } = await import('kukai-embed');
      const { NetworkType } = await import('@airgap/beacon-dapp');

      // Initialize BeaconWallet
      const walletInstance = new BeaconWallet({ name: 'Test Connect', preferredNetwork: ENV === 'dev' ? NetworkType.GHOSTNET : NetworkType.MAINNET });
      Tezos.setWalletProvider(walletInstance);
      setWallet(walletInstance);

      const activeAccount = await walletInstance.client.getActiveAccount();
      if (activeAccount) {
        setAddress(activeAccount.address);
      }

      // Initialize KukaiEmbed
      const kukaiInstance = new KukaiEmbed({ net: ENV === 'dev' ? Networks.ghostnet : Networks.mainnet });
      await kukaiInstance.init();
      setKukai(kukaiInstance);

      const userInfo = kukaiInstance.user;
      if (userInfo) {
        setAddress(userInfo.pkh);
      }
    } catch (error) {
      console.error('Error initializing client libraries:', error);
    }
  };

  useEffect(() => {
   if (Tezos) initClientLibraries();
  }, [Tezos])

  return { Tezos, wallet, address, kukai, connectWallet, connectKukai, disconnectWallet }
}