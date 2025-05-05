import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SwapSuccessMessageProps {
  amount: string;
  sourceSymbol: string;
  targetSymbol: string;
  hash?: `0x${string}`;
  isConfirming?: boolean;
  isConfirmed?: boolean;
  onReset: () => void;
}

const SwapSuccessMessage = ({
  amount,
  sourceSymbol,
  targetSymbol,
  hash,
  isConfirming,
  isConfirmed,
  onReset,
}: SwapSuccessMessageProps) => {
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
              ? 'text-green-600 dark:text-green-400'
              : 'text-yellow-600 dark:text-yellow-400'
          }`}
        />
      </div>
      <h3 className="text-xl font-medium">
        {isConfirming ? 'Processing Swap' : 'Swap Successful'}
      </h3>{' '}
      <p className="text-muted-foreground">
        {amount} {sourceSymbol} has been un/wrapped to {targetSymbol}
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
        Wrap More Tokens
      </Button>
    </motion.div>
  );
};

export default SwapSuccessMessage;
