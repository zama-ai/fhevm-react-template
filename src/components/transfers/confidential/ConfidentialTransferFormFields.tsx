import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import TransferFormError from "../TransferFormError";
import TransactionStatus from "../TransactionStatus";
import NetworkWarning from "./NetworkWarning";
import { Token } from "@/types/tokenTypes";
import { sepolia } from "wagmi/chains";
import { useTokenBalance } from "@/hooks/token/useTokenBalance";

interface ConfidentialTransferFormFieldsProps {
  isOnSepolia: boolean;
  switchNetwork?: (chainId: number) => void;
  confidentialTokens: Token[];
  selectedTokenId: string;
  setSelectedTokenId: (id: string) => void;
  recipient: string;
  setRecipient: (recipient: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  formError: string;
  isPending: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const ConfidentialTransferFormFields = ({
  isOnSepolia,
  switchNetwork,
  confidentialTokens,
  selectedTokenId,
  setSelectedTokenId,
  recipient,
  setRecipient,
  amount,
  setAmount,
  formError,
  isPending,
  handleSubmit,
}: ConfidentialTransferFormFieldsProps) => {
  const { toast } = useToast();
  const { signer } = useSigner();
  const { address } = useWallet();
  // console.log("address", address);

  const token = confidentialTokens.find((t) => t.id === selectedTokenId);
  // console.log("address", address);
  // console.log("token: ", token);

  // Use the token balance hook to get real-time balance
  const tokenBalance = useTokenBalance({
    address: address,
    tokenAddress: token?.address || "native",
    enabled: !!address && !!token,
  });

  const { decryptedBalance, lastUpdated, isDecrypting, decrypt, error } =
    useEncryptedBalance({
      signer,
    });

  const handleDecrypt = async (selectedTokenId: string) => {
    if (!isOnSepolia) {
      toast({
        title: "Wrong Network",
        description:
          "Confidential tokens are only available on Sepolia testnet. Please switch networks.",
        variant: "destructive",
      });
      return;
    }

    if (!signer) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to decrypt balances.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!token) {
        throw new Error("Selected token not found");
      }

      // Show decryption started toast
      toast({
        title: "Decrypting Balance",
        description: "Please wait while we decrypt your balance...",
      });

      await decrypt(
        BigInt(tokenBalance.rawBalance),
        token.address as `0x${string}`
      );

      // Show success toast after decryption
      toast({
        title: "Balance Decrypted",
        description:
          "Your confidential balance has been decrypted successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Confidential decrypt error:", error);
      toast({
        title: "Decrypt Failed",
        description: (error as Error).message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <NetworkWarning
        isOnSepolia={isOnSepolia}
        switchNetwork={switchNetwork}
        chainId={sepolia.id}
      />

      <div className="space-y-2">
        <Label htmlFor="token">Confidential Token</Label>
        <Select
          value={selectedTokenId}
          onValueChange={setSelectedTokenId}
          disabled={isPending || !isOnSepolia}
        >
          <SelectTrigger id="token" className="w-full">
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            {confidentialTokens.map((token) => (
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
                      <span className="text-xs">
                        {token.symbol.slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <span>{token.symbol}</span>
                  <span className="text-muted-foreground text-xs">
                    {token.isDecrypted ? token.balance : "Encrypted"}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipient">Recipient Address</Label>
        <Input
          id="recipient"
          placeholder="0x..."
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          disabled={isPending || !isOnSepolia}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="amount">Amount</Label>
          {selectedTokenId && (
            <span className="text-xs text-muted-foreground">
              {!confidentialTokens.find((t) => t.id === selectedTokenId)
                ?.isDecrypted && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-auto py-0 px-1"
                  onClick={() => handleDecrypt(selectedTokenId)}
                  disabled={isDecrypting}
                >
                  {isDecrypting ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
                      Decrypting...
                    </>
                  ) : (
                    "Decrypt Balance"
                  )}
                </Button>
              )}
              {isDecrypting ? (
                <span className="animate-pulse">Decrypting...</span>
              ) : (
                decryptedBalance
              )}
            </span>
          )}
        </div>
        <div className="relative">
          <Input
            id="amount"
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isPending || !isOnSepolia}
            className="pr-16"
            step="any"
          />
          {selectedTokenId && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-muted-foreground">
                {
                  confidentialTokens.find((t) => t.id === selectedTokenId)
                    ?.symbol
                }
              </span>
            </div>
          )}
        </div>
      </div>

      <TransferFormError message={formError} />

      <TransactionStatus hash={undefined} isConfirmed={false} />

      <Button
        type="submit"
        disabled={isPending || !isOnSepolia}
        className="w-full group"
      >
        {isPending ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
            Processing Transfer...
          </>
        ) : (
          <>
            Send Confidential Tokens
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </Button>

      {!isOnSepolia && (
        <div className="text-center text-sm text-muted-foreground">
          You need to switch to Sepolia testnet to send confidential tokens.
        </div>
      )}
    </motion.form>
  );
};

// Need to import here to avoid circular dependency
import { useToast } from "@/hooks/use-toast";
import { useSigner } from "@/hooks/useSigner";
import { useEncryptedBalance } from "@/hooks/token/useEncryptedBalance";
import { useAccount } from "wagmi";
import { useWallet } from "@/hooks/useWallet";

export default ConfidentialTransferFormFields;
