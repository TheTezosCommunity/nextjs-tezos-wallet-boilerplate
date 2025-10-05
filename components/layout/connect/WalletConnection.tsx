"use client";

import React, { useEffect, useState } from 'react';
import { useTezos } from '@/lib/tezos/useTezos';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet, LogOut } from 'lucide-react';

const WalletConnection: React.FC = () => {
  const { connectWallet, disconnectWallet, address } = useTezos();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (address !== null) {
      setIsLoading(false);
    }
  }, [address]);

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <div>
      {address ? (
        <Button variant="outline" onClick={disconnectWallet} className="gap-2">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Disconnect</span>
        </Button>
      ) : (
        <Button onClick={connectWallet} className="gap-2">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">Connect</span>
        </Button>
      )}
    </div>
  );
};

export default WalletConnection;
