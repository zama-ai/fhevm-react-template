import { Token } from "@/hooks/token/useTokens";
import TokenBalanceDisplay from "../TokenBalanceDisplay";

interface NativeTokenHeaderProps {
  nativeToken: {
    name: string;
    symbol: string;
    logo?: string;
  };
  tokenBalance: {
    balance: string;
    symbol: string | undefined;
    isLoading: boolean;
  };
}

const NativeTokenHeader = ({
  nativeToken,
  tokenBalance,
}: NativeTokenHeaderProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full overflow-hidden bg-muted flex items-center justify-center">
          {nativeToken.logo ? (
            <img
              src={nativeToken.logo}
              alt={nativeToken.name}
              className="w-5 h-5 object-contain"
            />
          ) : (
            <span className="text-xs">{nativeToken.symbol.slice(0, 2)}</span>
          )}
        </div>
        <h3 className="text-lg font-medium">Send {tokenBalance.symbol}</h3>
      </div>

      <TokenBalanceDisplay
        balance={tokenBalance.balance}
        symbol={tokenBalance.symbol || ""}
        isLoading={tokenBalance.isLoading}
      />
    </div>
  );
};

export default NativeTokenHeader;
