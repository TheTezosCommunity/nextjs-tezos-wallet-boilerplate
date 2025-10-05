import { create } from 'zustand';
import { TezosToolkit } from '@taquito/taquito';
import { ENV } from '../../constants';

interface WalletState {
  Tezos: TezosToolkit;
  wallet: any | null;
  kukai: any | null;
  address: string | null;
  connectWallet: () => Promise<void>;
  connectKukai: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  setTezos: (tezos: TezosToolkit) => void;
  setWallet: (wallet: any) => void;
  setKukai: (kukai: any) => void;
  setAddress: (address: string | null) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  Tezos: new TezosToolkit(ENV === 'dev' ? 'https://rpc.tzkt.io/ghostnet' : 'https://rpc.tzkt.io/mainnet'),
  wallet: null,
  kukai: null,
  address: null,
  connectWallet: async () => {
    try {
      let { wallet } = useWalletStore.getState();

      // If wallet not initialized, initialize it first
      if (!wallet) {
        const { BeaconWallet } = await import('@taquito/beacon-wallet');
        const { NetworkType } = await import('@airgap/beacon-dapp');

        wallet = new BeaconWallet({
          name: 'Tezos Boilerplate',
          preferredNetwork: ENV === 'dev' ? NetworkType.GHOSTNET : NetworkType.MAINNET
        });

        const { Tezos } = useWalletStore.getState();
        Tezos.setWalletProvider(wallet);
        set({ wallet });
      }

      await wallet.requestPermissions();
      const userAddress = await wallet.getPKH();
      set({ address: userAddress });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  },
  connectKukai: async () => {
    try {
      let { kukai } = useWalletStore.getState();

      // If kukai not initialized, initialize it first
      if (!kukai) {
        const { KukaiEmbed, Networks } = await import('kukai-embed');

        kukai = new KukaiEmbed({
          net: ENV === 'dev' ? Networks.ghostnet : Networks.mainnet
        });
        await kukai.init();
        set({ kukai });
      }

      const userInfo = await kukai.login({ wideButtons: [true, false] });
      set({ address: userInfo.pkh });
    } catch (error) {
      console.error('Error connecting Kukai:', error);
      throw error;
    }
  },
  disconnectWallet: async () => {
    const { wallet, kukai } = useWalletStore.getState();
    if (wallet) {
      await wallet.client.clearActiveAccount();
      set({ address: null });
    }
    if (kukai) {
      kukai.logout();
      set({ address: null });
    }
  },
  setTezos: (tezos) => set({ Tezos: tezos }),
  setWallet: (wallet) => set({ wallet }),
  setKukai: (kukai) => set({ kukai }),
  setAddress: (address) => set({ address })
}));
