"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, RefreshCw, ExternalLink } from "lucide-react"

// Dummy blockchain data
const dummyBlocks = [
  {
    level: 2345678,
    hash: "BLkQD1XgquuMkG9JgD6oXHcz4LPT8JzYYZVWgVCQxL9fqgSGBqz",
    timestamp: "2023-05-15T10:30:45Z",
    operations: 42,
  },
  {
    level: 2345677,
    hash: "BLbhxBi7KVbHFPNxHmTAkFnSZ5cNgU9Lp8oNyYqEPtmVutMGGJH",
    timestamp: "2023-05-15T10:25:30Z",
    operations: 37,
  },
  {
    level: 2345676,
    hash: "BLSrpJuBBJqnxReMtP8KeHExsHbZZsXWwXkwQD7LTFUMoFGGK3t",
    timestamp: "2023-05-15T10:20:15Z",
    operations: 29,
  },
  {
    level: 2345675,
    hash: "BLQxdExVD1MYpKzBX9o8GV5L2UVm8qYhTzUygFxMqV9YVD4AHoZ",
    timestamp: "2023-05-15T10:15:00Z",
    operations: 45,
  },
]

const dummyOperations = [
  {
    hash: "ooQWGNy6FtZ9pVKDqHrXHHAVNEXtdxZRcGDgRjAGMxeib5Xkxmo",
    type: "transaction",
    sender: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
    amount: "42.5 ꜩ",
    timestamp: "2023-05-15T10:29:45Z",
  },
  {
    hash: "oo9Paw7JFo5s7BXfFP8MZ4KRBFLc3QZJaBkxGKV1YdvUG1ZTrEb",
    type: "origination",
    sender: "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6",
    amount: "0 ꜩ",
    timestamp: "2023-05-15T10:28:30Z",
  },
  {
    hash: "ooVgGKH9zZAw9dgGK7TH9GZmqbZ1K9K5NHKNuxEyRKfmPGES9Kc",
    type: "transaction",
    sender: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
    amount: "10.0 ꜩ",
    timestamp: "2023-05-15T10:27:15Z",
  },
  {
    hash: "opQkAkYw9tiGEEBNGW8BjZqpGAHxBFyfRjUzKxvP4ij5UjKBM8o",
    type: "delegation",
    sender: "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6",
    amount: "0 ꜩ",
    timestamp: "2023-05-15T10:26:00Z",
  },
]

export function BlockchainExplorer() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate search
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleRefresh = () => {
    setIsLoading(true)

    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search by block, operation, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        <Button type="button" variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </form>

      <Tabs defaultValue="blocks">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="blocks">Recent Blocks</TabsTrigger>
          <TabsTrigger value="operations">Recent Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="blocks" className="pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Latest Blocks</CardTitle>
              <CardDescription>Most recent blocks on the Tezos blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Level</TableHead>
                    <TableHead>Hash</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Operations</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyBlocks.map((block) => (
                    <TableRow key={block.hash}>
                      <TableCell className="font-medium">{block.level}</TableCell>
                      <TableCell className="font-mono text-xs truncate max-w-[120px]">{block.hash}</TableCell>
                      <TableCell>{new Date(block.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{block.operations}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" size="sm">
                Load More
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Latest Operations</CardTitle>
              <CardDescription>Most recent operations on the Tezos blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hash</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sender</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyOperations.map((op) => (
                    <TableRow key={op.hash}>
                      <TableCell className="font-mono text-xs truncate max-w-[120px]">{op.hash}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            op.type === "transaction"
                              ? "bg-blue-100 text-blue-800"
                              : op.type === "origination"
                                ? "bg-green-100 text-green-800"
                                : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {op.type}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs truncate max-w-[100px]">{op.sender}</TableCell>
                      <TableCell>{op.amount}</TableCell>
                      <TableCell>{new Date(op.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" size="sm">
                Load More
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
