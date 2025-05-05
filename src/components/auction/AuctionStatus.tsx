import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, Clock, Info } from "lucide-react";

interface AuctionStatusProps {
  currentPrice: number;
  paymentTokenSymbol: string;
  timeRemaining: number;
  hasAuctionStarted: boolean;
  formatTimeRemaining: (seconds: number) => string;
}

const AuctionStatus = ({
  currentPrice,
  paymentTokenSymbol,
  timeRemaining,
  hasAuctionStarted,
  formatTimeRemaining,
}: AuctionStatusProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Current Price</p>
            <p className="text-3xl font-bold text-purple-600">
              {currentPrice.toFixed(2)} {paymentTokenSymbol}
            </p>
            <div className="flex items-center justify-center mt-2 text-gray-500">
              <ArrowDown className="h-4 w-4 mr-1" />
              <span className="text-xs">Decreasing</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Time Remaining</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatTimeRemaining(timeRemaining)}
            </p>
            <div className="flex items-center justify-center mt-2 text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-xs">Until auction end</span>
              {/* TODO: should be "Until next price drop", but this needs some rework on useAuctionTimer */}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Auction Status</p>
            <p
              className={`text-xl font-bold ${
                hasAuctionStarted ? "text-green-600" : "text-red-600"
              }`}
            >
              {hasAuctionStarted ? "Active" : "Ended"}
            </p>
            <div className="flex items-center justify-center mt-2 text-gray-500">
              <Info className="h-4 w-4 mr-1" />
              <span className="text-xs">
                {hasAuctionStarted ? "Place a bid to win" : "Auction complete"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuctionStatus;
