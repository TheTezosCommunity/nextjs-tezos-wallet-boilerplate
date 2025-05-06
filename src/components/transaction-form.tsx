"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function TransactionForm() {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [assetType, setAssetType] = useState("tez")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [txHash, setTxHash] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

    // Simulate transaction processing
    setTimeout(() => {
      setStatus("success")
      setTxHash("ooQWGNy6FtZ9pVKDqHrXHHAVNEXtdxZRcGDgRjAGMxeib5Xkxmo")
    }, 2000)
  }

  const resetForm = () => {
    setRecipient("")
    setAmount("")
    setAssetType("tez")
    setStatus("idle")
    setTxHash("")
  }

  return (
    <div>
      {status === "idle" || status === "loading" ? (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                placeholder="tz1..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.000001"
                  min="0"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="asset-type">Asset Type</Label>
                <Select value={assetType} onValueChange={setAssetType}>
                  <SelectTrigger id="asset-type">
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tez">Tez (ꜩ)</SelectItem>
                    <SelectItem value="uUSD">uUSD</SelectItem>
                    <SelectItem value="tzBTC">tzBTC</SelectItem>
                    <SelectItem value="QUIPU">QUIPU</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="memo">Memo (Optional)</Label>
              <Input id="memo" placeholder="Add a note to this transaction" />
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="text-sm text-muted-foreground">Fee: ~0.001 ꜩ</div>
              <Button type="submit" disabled={status === "loading"}>
                {status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Transaction"
                )}
              </Button>
            </div>
          </div>
        </form>
      ) : status === "success" ? (
        <div className="space-y-4">
          <Alert variant="default" className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Transaction Sent</AlertTitle>
            <AlertDescription className="text-green-700">
              Your transaction has been submitted to the Tezos blockchain.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>Transaction has been submitted to the network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="font-medium">
                    {amount} {assetType === "tez" ? "ꜩ" : assetType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Recipient:</span>
                  <span className="font-mono text-xs">{recipient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Operation Hash:</span>
                  <span className="font-mono text-xs">{txHash}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={resetForm}>
                Send Another Transaction
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>There was an error sending your transaction. Please try again.</AlertDescription>
          </Alert>
          <Button onClick={resetForm}>Try Again</Button>
        </div>
      )}
    </div>
  )
}
