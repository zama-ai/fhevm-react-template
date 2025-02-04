"use client"

import { useState } from "react"
import { Copy, ExternalLink, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConfidentialDapp() {
  const [amount, setAmount] = useState("")
  const [receiverAddress, setReceiverAddress] = useState("")
  const [encryptedAmount, setEncryptedAmount] = useState({
    handle: "",
    inputProof: "",
  })

  const handleCopyAddress = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Confidential ERC20 dApp</h1>
          <p className="text-gray-600">Securely manage and transfer your encrypted tokens</p>
        </div>

        <div className="space-y-4">
          {/* Connected Address */}
          <div className="space-y-1">
            <div className="text-sm text-gray-600">Connected with</div>
            <div className="flex items-center gap-2">
              <div className="font-mono">0x10ef1f2080b53584599e98d24620fb998602659</div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleCopyAddress("0x10ef1f2080b53584599e98d24620fb998602659")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Balances */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">ETH Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl">9999.998796010735208183 ETH</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Encrypted Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm break-all">
                  668417539412690311801084714400933816847430071323684476655737276745809189176
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Decrypted Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Decrypted Private Balance</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="font-mono text-xl">10000</div>
              <Button variant="outline" className="gap-2">
                <Lock className="h-4 w-4" />
                Decrypt
              </Button>
            </CardContent>
          </Card>

          {/* Transfer Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Transfer Tokens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Amount</div>
                <div className="font-mono text-xl">20</div>
                <div className="text-sm text-gray-600">Encrypt 20</div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-gray-600">This is an encryption of 20:</div>
                <div className="space-y-1">
                  <div className="font-mono text-sm break-all">
                    Handle: 0x9d43a7b0c2d9f17c207dea3bdcf19b6706c455e03841e2a78747a6ef52000500
                  </div>
                  <div className="font-mono text-sm break-all">
                    Input Proof: 0x0101ec7930fb8905f148bbd8608b2257d0bc5a0dd85b6bc75762fc53c6ec9e35e
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-gray-600">Receiver Address</div>
                <div className="flex gap-2">
                  <Input
                    value={receiverAddress}
                    onChange={(e) => setReceiverAddress(e.target.value)}
                    placeholder="0x..."
                    className="font-mono"
                  />
                  <Button className="px-6">OK</Button>
                </div>
                {receiverAddress && (
                  <div className="text-sm text-gray-600">
                    Chosen Address For Receiver:
                    <br />
                    <span className="font-mono">0x10Ef1f2080b53584599E98D24620fB998602659</span>
                  </div>
                )}
              </div>

              <Button className="w-full" size="lg">
                Transfer Encrypted Amount To Receiver
              </Button>
            </CardContent>
          </Card>
        </div>

        <CardFooter className="justify-center pt-4">
          <a href="#" className="text-primary hover:text-primary/80 flex items-center gap-2">
            See the documentation
            <ExternalLink className="h-4 w-4" />
          </a>
        </CardFooter>
      </div>
    </div>
  )
}

