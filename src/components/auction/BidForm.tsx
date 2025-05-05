import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BidFormProps {
  hasAuctionStarted: boolean;
  currentTokenSupply: number;
  bidAmount: string;
  setBidAmount: (value: string) => void;
  placeBid: () => void;
  address?: string;
  currentPrice: number;
  tokenName: string;
  isBidding: boolean;
  paymentTokenSymbol: string;
}

const BidForm = ({
  hasAuctionStarted,
  currentTokenSupply,
  bidAmount,
  setBidAmount,
  placeBid,
  address,
  currentPrice,
  tokenName,
  isBidding,
  paymentTokenSymbol,
}: BidFormProps) => {
  const estimatedTokens = isNaN(parseFloat(bidAmount))
    ? 0
    : Math.min(
        Math.floor(parseFloat(bidAmount) / currentPrice),
        currentTokenSupply
      );
  const canBid = hasAuctionStarted && currentTokenSupply > 0 && !isBidding;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Place a Bid</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bid-amount">
              Amount of tokens for which you are bidding:
            </Label>
            <div className="flex space-x-2">
              <Input
                id="bid-amount"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Enter amount"
                disabled={!canBid}
                min="0"
                step="1" // TODO: adapt from current price
              />
              <Button
                onClick={placeBid}
                disabled={!address || !canBid}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Place Bid
              </Button>
            </div>
            {hasAuctionStarted && (
              <div>
                <div className="mt-2 space-y-1">
                  <p>
                    Amount of WETHc you will have to pay:{" "}
                    {Number(bidAmount) * currentPrice} {paymentTokenSymbol}
                  </p>

                  <p className="text-sm text-purple-600">
                    You will receive approximately {estimatedTokens} {tokenName}{" "}
                    tokens
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BidForm;
