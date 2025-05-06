"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, ChevronDown, LogOut, Copy, ExternalLink } from "lucide-react"

interface WalletConnectProps {
  showDetails?: boolean
}

export function WalletConnect({ showDetails = false }: WalletConnectProps) {
  const [connected, setConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [balance, setBalance] = useState("0")

  const connectWallet = () => {
    // In a real implementation, this would directly trigger the Beacon SDK
    // to show the wallet selection popup
    console.log("Connecting wallet via Beacon SDK...")

    // Simulate successful connection
    setTimeout(() => {
      setWalletAddress("tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb")
      setBalance("42.5")
      setConnected(true)
    }, 1000)
  }

  const disconnectWallet = () => {
    setConnected(false)
    setWalletAddress("")
    setBalance("0")
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
  }

  return (
    <div className="flex items-center gap-2">
      {!connected ? (
        <Button variant="outline" className="gap-2" onClick={connectWallet}>
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Wallet className="h-4 w-4" />
              {walletAddress.slice(0, 7)}...{walletAddress.slice(-4)}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={copyAddress} className="gap-2 cursor-pointer">
              <Copy className="h-4 w-4" />
              Copy Address
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <ExternalLink className="h-4 w-4" />
              View on TzKT
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={disconnectWallet} className="gap-2 cursor-pointer text-red-500">
              <LogOut className="h-4 w-4" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {showDetails && connected && (
        <div className="mt-4 p-4 border rounded-md w-full">
          <div className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Address:</span>
              <span className="text-sm font-mono">
                {walletAddress.slice(0, 10)}...{walletAddress.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Balance:</span>
              <span className="text-sm font-mono">{balance} ꜩ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Network:</span>
              <span className="text-sm">Ghostnet (Testnet)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
