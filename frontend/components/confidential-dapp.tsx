"use client"

import { useState } from "react"
import { Copy, ExternalLink, Lock, Unlock, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ConfidentialDapp() {
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [amount, setAmount] = useState("")
  const [receiverAddress, setReceiverAddress] = useState("")

  const handleCopyAddress = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold tracking-tight">Confidential ERC20 dApp</CardTitle>
            <CardDescription>Securely manage and transfer your encrypted tokens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Connected Address */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Connected with</div>
              <div className="flex items-center gap-2">
                <div className="font-mono text-sm truncate">0x10ef1f2080b53584599e98d24620f...</div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopyAddress("0x10ef1f2080b53584599e98d24620f")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Balances */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Plain Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">9999.99 ETH</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Encrypted Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs font-mono break-all text-muted-foreground">
                    68125120289975052145505836784852204694643918819176928585160587544701054092544
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Decrypt Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Decrypted Private Balance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {isDecrypting ? <Skeleton className="h-8 w-48" /> : <div className="font-mono">???</div>}
                  <Button variant="outline" onClick={() => setIsDecrypting(!isDecrypting)}>
                    {isDecrypting ? (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Encrypt
                      </>
                    ) : (
                      <>
                        <Unlock className="mr-2 h-4 w-4" />
                        Decrypt
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transfer Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Transfer Tokens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Amount</label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <Button>OK</Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Receiver Address</label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      placeholder="0x..."
                      value={receiverAddress}
                      onChange={(e) => setReceiverAddress(e.target.value)}
                    />
                    <Button>OK</Button>
                  </div>
                </div>

                {amount && receiverAddress && (
                  <div className="pt-4">
                    <Button className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      Send {amount} Tokens
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>
          <CardFooter className="justify-center">
            <a href="#" className="text-sm text-primary hover:text-primary/80 flex items-center gap-2">
              See the documentation
              <ExternalLink className="h-4 w-4" />
            </a>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

