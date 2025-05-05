import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Clock,
  Tag,
  User,
  ArrowRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { AuctionSummary } from "@/hooks/auction/useAllAuctions";
import {
  useAuctionCurrentPrice,
  useAuctionDetails,
} from "@/hooks/auction/useAuction";
import { useAccount } from "wagmi";
import { formatAddress, formatTime } from "@/lib/helper";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/useWallet";

interface AuctionCardProps {
  auction: AuctionSummary;
  variant?: "active" | "ended" | "owned" | "default";
}

const AuctionCard: React.FC<AuctionCardProps> = ({
  auction,
  variant = "default",
}) => {
  const navigate = useNavigate();
  const shortAddress = formatAddress(auction.address);
  const {
    hasAuctionStarted,
    startAt,
    expiresAt,
    seller,
    startPrice,
    reservePrice,
  } = useAuctionDetails(auction.address);
  const { currentPrice } = useAuctionCurrentPrice(auction.address);

  const { address } = useWallet();
  const isOwner = seller?.toLowerCase() === address?.toLowerCase();
  const now = Math.floor(Date.now() / 1000);
  const isExpired = expiresAt ? expiresAt < now : false;
  const isActive = hasAuctionStarted && !isExpired;

  // Format price values to be more readable
  const formattedCurrentPrice = startPrice
    ? (currentPrice / 10 ** 6).toFixed(6)
    : "0";
  const formattedStartPrice = startPrice
    ? (startPrice / 10 ** 6).toFixed(6)
    : "0";
  const formattedReservePrice = reservePrice
    ? (reservePrice / 10 ** 6).toFixed(6)
    : "0";

  // Format dates for better display
  const formatDate = (timestamp: number) => {
    if (!timestamp) return "Loading...";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate time remaining
  const calculateTimeRemaining = () => {
    if (!expiresAt) return "Loading...";
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = expiresAt - now;

    if (timeLeft <= 0) return "Ended";

    return formatTime(timeLeft, true);
  };

  const getStatusBadge = () => {
    if (isOwner) {
      return (
        <Badge
          variant="outline"
          className="bg-purple-100 text-purple-800 px-2 py-1 flex items-center gap-1"
        >
          <User className="h-3 w-3" />
          Your Auction
        </Badge>
      );
    }

    if (isExpired) {
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 px-2 py-1 flex items-center gap-1"
        >
          <XCircle className="h-3 w-3" />
          Ended
        </Badge>
      );
    }

    if (isActive) {
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 px-2 py-1 flex items-center gap-1"
        >
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="bg-amber-100 text-amber-800 px-2 py-1 flex items-center gap-1"
      >
        <Clock className="h-3 w-3" />
        Not Started
      </Badge>
    );
  };

  return (
    <Card className="h-full overflow-hidden border shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/50">
      <CardContent className="pt-6 pb-2">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col">
            <span className="text-lg font-medium">Dutch Auction</span>
            <div className="flex items-center text-sm text-muted-foreground">
              <Tag className="h-3.5 w-3.5 mr-1" />
              {shortAddress}
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-2 mt-4">
          {hasAuctionStarted && (
            <div className="flex items-center text-sm bg-primary/5 p-2 rounded-md">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              <span
                className={
                  isExpired
                    ? "text-red-600 font-medium"
                    : "text-green-600 font-medium"
                }
              >
                {isExpired
                  ? "Auction ended"
                  : `${calculateTimeRemaining()} left`}
              </span>
            </div>
          )}

          {!hasAuctionStarted && (
            <div className="flex items-center text-sm bg-primary/5 p-2 rounded-md">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              <span className="text-amber-600 font-medium">
                Not yet started
              </span>
            </div>
          )}

          <div className="mt-4 space-y-3 p-2 bg-muted rounded-md">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Price:</span>
              <span className="font-medium">{formattedCurrentPrice} WETHc</span>
            </div>

            {/* Show start time and expiry for all auctions */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Starts At:</span>
              <span className="font-medium">{formatDate(startAt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expires At:</span>
              <span className="font-medium">{formatDate(expiresAt)}</span>
            </div>

            {/* Show price details for owner */}
            {isOwner && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Starting Price:</span>
                  <span className="font-medium">
                    {formattedStartPrice} WETHc
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reserve Price:</span>
                  <span className="font-medium">
                    {formattedReservePrice} WETHc
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/20 pt-3">
        <Button
          variant={isExpired ? "secondary" : "default"}
          className="w-full group"
          onClick={() => navigate(`/auction?address=${auction.address}`)}
        >
          <span className="flex items-center gap-2">
            {isExpired
              ? "View Details"
              : hasAuctionStarted
              ? "View Auction"
              : isOwner
              ? "Initialize Auction"
              : "View Details"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuctionCard;
