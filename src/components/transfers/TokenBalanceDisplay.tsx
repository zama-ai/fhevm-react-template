import { Skeleton } from "@/components/ui/skeleton";

interface TokenBalanceDisplayProps {
  balance: string;
  symbol: string;
  isLoading: boolean;
}

const TokenBalanceDisplay = ({
  balance,
  symbol,
  isLoading,
}: TokenBalanceDisplayProps) => {
  return (
    <div className="bg-muted rounded-md p-3 mt-4 mb-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Available Balance:
        </span>
        <span className="font-medium">
          {isLoading ? (
            <Skeleton className="h-4 w-16 bg-muted animate-pulse rounded" />
          ) : (
            `${balance} ${symbol}`
          )}
        </span>
      </div>
    </div>
  );
};

export default TokenBalanceDisplay;
