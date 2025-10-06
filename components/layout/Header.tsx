'use client'

import React from 'react';
import Link from "next/link";
import TezosLogo from "@/components/tezos-logo";
import { ModeToggle } from "@/components/mode-toggle";
import WalletConnection from './connect/WalletConnection';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <TezosLogo className="text-primary" />
          <span className="font-bold">Tezos Boilerplate</span>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          <Link
            href="/docs"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Documentation
          </Link>
          <Link
            href="/docs/examples"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Examples
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <WalletConnection />
        </div>
      </div>
    </header>
  );
};

export default Header;