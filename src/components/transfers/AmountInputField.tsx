import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Token } from '@/types/tokenTypes';
import { Loader2 } from 'lucide-react';

interface AmountInputFieldProps {
  amount: string;
  setAmount: (value: string) => void;
  selectedToken: Token | null;
  displayBalance: string;
  handleDecrypt: () => void;
  isDecrypting: boolean;
  isPending: boolean;
}

const AmountInputField = ({
  amount,
  setAmount,
  selectedToken,
  displayBalance,
  handleDecrypt,
  isDecrypting,
  isPending,
}: AmountInputFieldProps) => {
  if (!selectedToken) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="amount" className="font-medium">
          Amount
        </Label>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">
            Balance: {displayBalance} {selectedToken.symbol}
          </span>
          {selectedToken.isConfidential && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDecrypt}
              className="h-8 text-xs"
              disabled={isDecrypting}
            >
              {isDecrypting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Decrypt</>
              )}
            </Button>
          )}
        </div>
      </div>
      <div className="relative">
        <Input
          id="amount"
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isPending}
          className="pr-16"
          step="any"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span className="text-muted-foreground">{selectedToken.symbol}</span>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs h-auto py-1"
          onClick={() => setAmount(displayBalance)}
          disabled={isPending}
        >
          Use Max
        </Button>
      </div>
    </div>
  );
};

export default AmountInputField;
