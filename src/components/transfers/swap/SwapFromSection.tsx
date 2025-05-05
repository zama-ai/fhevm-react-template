// frontend/src/components/transfers/swap/SwapFromSection.tsx
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Token } from '@/types/tokenTypes';
import { Card } from '@/components/ui/card';

interface SwapToFromSectionProps {
  swapFrom: boolean;
  amount: string;
  setAmount: (value: string) => void;
  token: Token | null;
  tokenId: string;
  setTokenId: (value: string) => void;
  displayBalance: string;
  isPendingTransfer: boolean;
  eligibleTokens: Token[] | null;
}

const SwapToFromSection: React.FC<SwapToFromSectionProps> = ({
  swapFrom,
  amount,
  setAmount,
  token,
  tokenId,
  setTokenId,
  displayBalance,
  isPendingTransfer,
  eligibleTokens,
}) => {
  useEffect(() => {
    if (eligibleTokens && eligibleTokens.length > 0 && !tokenId) {
      setTokenId(eligibleTokens[0].id);
    }
  }, [eligibleTokens, setTokenId, tokenId]);

  return (
    <Card className={`${swapFrom ? 'bg-card' : 'bg-card-accent'} p-8`}>
      <div className="space-y-2 grid grid-cols-3">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="source-token">{swapFrom ? 'From' : 'To'}</Label>
          <div className="relative ">
            {swapFrom ? (
              <Input
                id="amount"
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isPendingTransfer}
                className="p-0 pr-8 border-none bg-card text-4xl md:text-4xl"
                step="any"
              />
            ) : (
              <div className="p-0 pr-8 border-none text-4xl">
                {amount ? amount : '0.0'}
              </div>
            )}
          </div>
          <div className="flex justify-between">
            {token && (
              <div className="flex justify-start py-1">
                <span className="text-xs text-muted-foreground">
                  {displayBalance} {token.symbol}
                </span>
                {swapFrom && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-auto"
                    onClick={() => setAmount(displayBalance)}
                    disabled={isPendingTransfer}
                  >
                    Use Max
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2 flex items-center">
          <Select
            value={tokenId}
            onValueChange={setTokenId}
            disabled={isPendingTransfer || eligibleTokens.length === 0}
          >
            <SelectTrigger id="source-token" className="w-full">
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent>
              {eligibleTokens &&
                eligibleTokens.map((token) => (
                  <SelectItem key={token.id} value={token.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 overflow-hidden flex items-center justify-center">
                        {token.logo ? (
                          <img
                            src={token.logo}
                            alt={token.name}
                            className="w-4 h-4 object-contain"
                          />
                        ) : (
                          <span className="text-xs">
                            {token.symbol.slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <span>{token.symbol}</span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};

export default SwapToFromSection;
