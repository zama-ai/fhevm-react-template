import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Token } from '@/types/tokenTypes';

interface SwapButtonProps {
  isPending: boolean;
  isConfirming: boolean;
  sourceToken: Token | null;
  targetToken: Token | null;
  wrapHash: `0x${string}`;
}

const SwapButton = ({
  isPending,
  sourceToken,
  targetToken,
  isConfirming,
  wrapHash,
}: SwapButtonProps) => {
  return (
    <div className="flex px-8  mt-6 justify-center items-center ">
      <Button
        type="submit"
        disabled={isPending || !sourceToken || !targetToken}
        className="group px-5"
      >
        {isPending ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
            {isConfirming
              ? 'Encrypting transaction...'
              : wrapHash
                ? 'Waiting for confirmation...'
                : 'Preparing transaction...'}
          </>
        ) : (
          <>Wrap Confidential</>
        )}
      </Button>
    </div>
  );
};

export default SwapButton;
