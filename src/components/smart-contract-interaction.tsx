"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Code, Play, Upload } from "lucide-react"

export function SmartContractInteraction() {
  const [contractAddress, setContractAddress] = useState("")
  const [entrypoint, setEntrypoint] = useState("")
  const [parameters, setParameters] = useState("")
  const [contractCode, setContractCode] = useState("")
  const [contractStorage, setContractStorage] = useState("")

  // Sample contract data
  const sampleContracts = [
    {
      name: "Simple FA2 Token",
      address: "KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton",
      entrypoints: ["transfer", "balance_of", "update_operators"],
    },
    {
      name: "NFT Marketplace",
      address: "KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn",
      entrypoints: ["sell", "buy", "cancel", "update_price"],
    },
    {
      name: "Simple Storage",
      address: "KT1TezoooozzSmartPyzzSTATiCzzzwwBFA1",
      entrypoints: ["increment", "decrement", "reset"],
    },
  ]

  const handleContractSelect = (address: string) => {
    setContractAddress(address)
    // In a real app, we would fetch the contract's entrypoints here
  }

  const handleInvoke = () => {
    console.log("Invoking contract", contractAddress, "entrypoint", entrypoint, "with parameters", parameters)
    // This would actually call the contract
  }

  const handleDeploy = () => {
    console.log("Deploying contract with code", contractCode, "and storage", contractStorage)
    // This would actually originate the contract
  }

  return (
    <Tabs defaultValue="invoke">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="invoke">Invoke Contract</TabsTrigger>
        <TabsTrigger value="deploy">Deploy Contract</TabsTrigger>
      </TabsList>

      <TabsContent value="invoke" className="space-y-4 pt-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="contract-address">Contract Address</Label>
            <div className="flex gap-2">
              <Input
                id="contract-address"
                placeholder="KT1..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="flex-1"
              />
              <Select onValueChange={handleContractSelect}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sample contracts" />
                </SelectTrigger>
                <SelectContent>
                  {sampleContracts.map((contract) => (
                    <SelectItem key={contract.address} value={contract.address}>
                      {contract.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="entrypoint">Entrypoint</Label>
            <Select value={entrypoint} onValueChange={setEntrypoint}>
              <SelectTrigger id="entrypoint">
                <SelectValue placeholder="Select entrypoint" />
              </SelectTrigger>
              <SelectContent>
                {contractAddress &&
                  sampleContracts
                    .find((c) => c.address === contractAddress)
                    ?.entrypoints.map((ep) => (
                      <SelectItem key={ep} value={ep}>
                        {ep}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="parameters">Parameters (JSON)</Label>
            <Textarea
              id="parameters"
              placeholder='{"value": 42}'
              value={parameters}
              onChange={(e) => setParameters(e.target.value)}
              className="font-mono text-sm"
              rows={5}
            />
          </div>

          <Button onClick={handleInvoke} disabled={!contractAddress || !entrypoint} className="gap-2">
            <Play className="h-4 w-4" />
            Invoke Contract
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="deploy" className="space-y-4 pt-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="contract-code">Contract Code (Michelson)</Label>
            <Textarea
              id="contract-code"
              placeholder="parameter unit; storage int; code { CDR; NIL operation; PAIR };"
              value={contractCode}
              onChange={(e) => setContractCode(e.target.value)}
              className="font-mono text-sm"
              rows={8}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="initial-storage">Initial Storage (Michelson)</Label>
            <Textarea
              id="initial-storage"
              placeholder="0"
              value={contractStorage}
              onChange={(e) => setContractStorage(e.target.value)}
              className="font-mono text-sm"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 flex-1">
              <Code className="h-4 w-4" />
              Load Template
            </Button>
            <Button onClick={handleDeploy} className="gap-2 flex-1">
              <Upload className="h-4 w-4" />
              Deploy Contract
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
