import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransferSuccessMessageProps {
  amount: string;
  symbol: string;
  hash?: `0x${string}`;
  isConfirming?: boolean;
  isConfirmed?: boolean;
  onReset: () => void;
}

const TransferSuccessMessage = ({
  amount,
  symbol,
  hash,
  isConfirming,
  isConfirmed,
  onReset,
}: TransferSuccessMessageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center py-10 text-center space-y-4"
    >
      <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
        <CheckCircle2
          className={`h-8 w-8 ${
            isConfirmed
              ? "text-green-600 dark:text-green-400"
              : "text-yellow-600 dark:text-yellow-400"
          }`}
        />
      </div>
      <h3 className="text-xl font-medium">
        {isConfirming ? "Processing Transfer" : "Transfer Successful"}
      </h3>
      <p className="text-muted-foreground">
        {isConfirming
          ? "Transaction is being confirmed..."
          : `${amount} ${symbol} has been sent to the recipient`}
      </p>
      {hash && (
        <a
          href={`https://sepolia.etherscan.io/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          View transaction
        </a>
      )}
      <Button variant="outline" onClick={onReset} className="mt-4">
        Make Another Transfer
      </Button>
    </motion.div>
  );
};

export default TransferSuccessMessage;
