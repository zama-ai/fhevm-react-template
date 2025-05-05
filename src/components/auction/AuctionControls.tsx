
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer } from "lucide-react";

interface AuctionControlsProps {
  isAuctionActive: boolean;
  startPrice: number;
  setStartPrice: (value: number) => void;
  endPrice: number;
  setEndPrice: (value: number) => void;
  duration: number;
  setDuration: (value: number) => void;
  initialTokenSupply: number;
  setInitialTokenSupply: (value: number) => void;
  tokenName: string;
  setTokenName: (value: string) => void;
  resetAuction: () => void;
}

const AuctionControls = ({
  isAuctionActive,
  startPrice,
  setStartPrice,
  endPrice,
  setEndPrice,
  duration,
  setDuration,
  initialTokenSupply,
  setInitialTokenSupply,
  tokenName,
  setTokenName,
  resetAuction,
}: AuctionControlsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Auction Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-price">Start Price (ETH)</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="start-price"
                  value={[startPrice]}
                  min={endPrice}
                  max={200}
                  step={1}
                  onValueChange={(values) => setStartPrice(values[0])}
                  disabled={isAuctionActive}
                />
                <span className="w-12 text-center">{startPrice}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-price">End Price (ETH)</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="end-price"
                  value={[endPrice]}
                  min={1}
                  max={startPrice}
                  step={1}
                  onValueChange={(values) => setEndPrice(values[0])}
                  disabled={isAuctionActive}
                />
                <span className="w-12 text-center">{endPrice}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="duration"
                  value={[duration]}
                  min={1}
                  max={72}
                  step={1}
                  onValueChange={(values) => setDuration(values[0])}
                  disabled={isAuctionActive}
                />
                <span className="w-12 text-center">{duration}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initial-supply">Initial Token Supply</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="initial-supply"
                  value={[initialTokenSupply]}
                  min={100}
                  max={10000}
                  step={100}
                  onValueChange={(values) => {
                    setInitialTokenSupply(values[0]);
                    if (!isAuctionActive) {
                      setInitialTokenSupply(values[0]);
                    }
                  }}
                  disabled={isAuctionActive}
                />
                <span className="w-20 text-center">{initialTokenSupply}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="token-name">Token Name</Label>
              <Input
                id="token-name"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                placeholder="Token Name"
                disabled={isAuctionActive}
                maxLength={10}
              />
            </div>
          </div>
          
          <Button 
            onClick={resetAuction} 
            variant="outline" 
            className="w-full"
            disabled={isAuctionActive}
          >
            <Timer className="mr-2 h-4 w-4" />
            Reset Auction
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuctionControls;
