
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NativeAmountInputProps {
  amount: string;
  setAmount: (value: string) => void;
  symbol: string | undefined;
  balance: string;
  isDisabled: boolean;
}

const NativeAmountInput = ({ 
  amount, 
  setAmount, 
  symbol, 
  balance, 
  isDisabled 
}: NativeAmountInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="amount">Amount</Label>
      <div className="relative">
        <Input
          id="amount"
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          disabled={isDisabled}
          className="pr-16"
          step="any"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span className="text-muted-foreground">
            {symbol}
          </span>
        </div>
      </div>
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-xs h-auto py-1"
        onClick={() => setAmount(balance)}
        disabled={isDisabled}
      >
        Use Max
      </Button>
    </div>
  );
};

export default NativeAmountInput;
