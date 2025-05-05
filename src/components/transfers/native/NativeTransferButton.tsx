
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface NativeTransferButtonProps {
  isPending: boolean;
  isConfirming: boolean;
  symbol: string | undefined;
}

const NativeTransferButton = ({ 
  isPending, 
  isConfirming, 
  symbol 
}: NativeTransferButtonProps) => {
  return (
    <Button
      type="submit"
      disabled={isPending || isConfirming}
      className="w-full group"
    >
      {isPending ? (
        <>Preparing Transaction...</>
      ) : isConfirming ? (
        <>
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
          Confirming Transaction...
        </>
      ) : (
        <>
          Send {symbol}
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </>
      )}
    </Button>
  );
};

export default NativeTransferButton;
