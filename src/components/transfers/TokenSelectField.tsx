import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Token } from "@/types/tokenTypes";

interface TokenSelectFieldProps {
  selectedTokenId: string;
  setSelectedTokenId: (value: string) => void;
  tokens: Token[];
  displayBalance: string;
  isPending: boolean;
}

const TokenSelectField = ({
  selectedTokenId,
  setSelectedTokenId,
  tokens,
  displayBalance,
  isPending,
}: TokenSelectFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="token">Token</Label>
      <Select
        value={selectedTokenId}
        onValueChange={setSelectedTokenId}
        disabled={isPending || tokens.length === 0}
      >
        <SelectTrigger id="token" className="w-full">
          <SelectValue placeholder="Select token" />
        </SelectTrigger>
        <SelectContent>
          {tokens.map((token) => (
            <SelectItem key={token.id} value={token.id}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {token.logo ? (
                    <img
                      src={token.logo}
                      alt={token.name}
                      className="w-4 h-4 object-contain"
                    />
                  ) : (
                    <span className="text-xs">{token.symbol.slice(0, 2)}</span>
                  )}
                </div>
                <span>{token.symbol}</span>
                <span className="text-muted-foreground text-xs">
                  {token.id === selectedTokenId
                    ? displayBalance
                    : token.balance}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TokenSelectField;
