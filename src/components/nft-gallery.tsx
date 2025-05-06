"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Dummy NFT data
const dummyNFTs = [
  {
    id: "1",
    name: "Tezos Pixel Art #1",
    description: "A unique pixel art piece on Tezos",
    image: "/placeholder.svg?height=300&width=300",
    collection: "Pixel Art Collection",
    creator: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
    tokenId: "0",
    contract: "KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton",
  },
  {
    id: "2",
    name: "Tezos Abstract #42",
    description: "Abstract art minted on Tezos",
    image: "/placeholder.svg?height=300&width=300",
    collection: "Abstract Collection",
    creator: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
    tokenId: "42",
    contract: "KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton",
  },
  {
    id: "3",
    name: "Tezos Landscape #7",
    description: "Beautiful landscape art on Tezos",
    image: "/placeholder.svg?height=300&width=300",
    collection: "Landscape Collection",
    creator: "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6",
    tokenId: "7",
    contract: "KT1KEa8z6vWXDJrVqtMrAeDVzsvxat3kHaCE",
  },
  {
    id: "4",
    name: "Tezos Portrait #15",
    description: "Digital portrait art on Tezos",
    image: "/placeholder.svg?height=300&width=300",
    collection: "Portrait Collection",
    creator: "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6",
    tokenId: "15",
    contract: "KT1KEa8z6vWXDJrVqtMrAeDVzsvxat3kHaCE",
  },
]

export function NFTGallery() {
  const [selectedNFT, setSelectedNFT] = useState<(typeof dummyNFTs)[0] | null>(null)

  return (
    <div className="space-y-4">
      <Tabs defaultValue="owned">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="owned">Owned NFTs</TabsTrigger>
          <TabsTrigger value="created">Created NFTs</TabsTrigger>
        </TabsList>
        <TabsContent value="owned" className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {dummyNFTs.map((nft) => (
              <Card
                key={nft.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedNFT(nft)}
              >
                <CardContent className="p-0">
                  <Image
                    src={nft.image || "/placeholder.svg"}
                    alt={nft.name}
                    width={300}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                </CardContent>
                <CardFooter className="p-3">
                  <div className="w-full">
                    <h3 className="font-medium text-sm truncate">{nft.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{nft.collection}</p>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="created" className="pt-4">
          <div className="flex items-center justify-center h-40 border rounded-md">
            <p className="text-muted-foreground">No created NFTs found</p>
          </div>
        </TabsContent>
      </Tabs>

      {selectedNFT && (
        <div className="mt-6 border rounded-md p-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <Image
                src={selectedNFT.image || "/placeholder.svg"}
                alt={selectedNFT.name}
                width={300}
                height={300}
                className="w-full rounded-md"
              />
            </div>
            <div className="md:w-2/3 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedNFT.name}</h2>
                <p className="text-muted-foreground">{selectedNFT.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Collection</p>
                  <p className="font-medium">{selectedNFT.collection}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Token ID</p>
                  <p className="font-medium">{selectedNFT.tokenId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Creator</p>
                  <p className="font-mono text-xs truncate">{selectedNFT.creator}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contract</p>
                  <p className="font-mono text-xs truncate">{selectedNFT.contract}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm">
                  Transfer
                </Button>
                <Button variant="outline" size="sm">
                  View on Marketplace
                </Button>
              </div>
            </div>
          </div>
          <Button variant="ghost" className="mt-4" onClick={() => setSelectedNFT(null)}>
            Close Details
          </Button>
        </div>
      )}
    </div>
  )
}
