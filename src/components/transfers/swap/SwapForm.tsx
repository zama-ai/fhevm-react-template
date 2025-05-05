import { useState, useEffect, useMemo } from 'react';
import { useTokens } from '@/hooks/token/useTokens';
import { useTokenBalance } from '@/hooks/token/useTokenBalance';
import { sepolia } from 'wagmi/chains';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowDownUp, AlertCircle, Lock, LockKeyhole } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TransactionStatus from '../TransactionStatus';
import { toast } from 'sonner';
import { useChainId, type BaseError } from 'wagmi';
import { useWrapSwap } from '@/hooks/token/wrap/useWrapSwap';
import SwapSuccessMessage from './SwapSuccessMessage';
import { useWallet } from '@/hooks/useWallet';
import { Token } from '@/types/tokenTypes';
import WrongNetworkMessage from '../../auction/WrongNetworkMessage';
import { useSearchParams } from 'react-router-dom';
import { getNativeToken } from '@/utils/tokenUtils';
import { validateForm } from '@/lib/utils/formValidation';
import SwapToFromSection from './SwapFromSection';
import { Card, CardContent } from '@/components/ui/card';
import SwapButton from './SwapButton';

// Define a mapping of token pairs to swap functions
const swapMapping: Record<
  string,
  { targetSymbol: string; action: 'wrap' | 'unwrap' }[]
> = {
  ETH: [{ targetSymbol: 'WETHc', action: 'wrap' }],
  WETHc: [{ targetSymbol: 'ETH', action: 'unwrap' }],
};

// Add this function before the SwapForm component
const getSwapAction = (sourceSymbol: string, targetSymbol: string) => {
  const mappings = swapMapping[sourceSymbol];
  if (!mappings) return null;

  return (
    mappings.find((mapping) => mapping.targetSymbol === targetSymbol) || null
  );
};

const SwapForm = () => {
  const [amount, setAmount] = useState<string>('');
  const [sourceToken, setSourceToken] = useState<Token | null>(null);
  const [sourceTokenId, setSourceTokenId] = useState<string>('');
  const [targetTokenId, setTargetTokenId] = useState<string>('');
  const [targetToken, setTargetToken] = useState<Token | null>(null);
  const [formError, setFormError] = useState<string>('');

  const chainId = useChainId();
  // Get native token data
  const nativeToken = getNativeToken(chainId);

  const { tokens } = useTokens();
  const { address, switchToSepolia, isSepoliaChain } = useWallet();
  const sourceTokenBalance = useTokenBalance({
    address: address,
    tokenAddress: sourceToken?.address || 'native',
    enabled: !!address && !!sourceToken,
    isConfidential: sourceToken?.isEncrypted,
  });

  const targetTokenBalance = useTokenBalance({
    address: address,
    tokenAddress: targetToken?.address || 'native',
    enabled: !!address && !!targetToken,
    isConfidential: targetToken?.isEncrypted,
  });

  const {
    wrap,
    unwrap,
    isPending: isPendingTransfer,
    isConfirming,
    isConfirmed,
    isSuccess,
    isError,
    hash: wrapHash,
    error,
    resetTransfer,
  } = useWrapSwap();

  // filter only tokens that are able to swap
  const eligibleTokens = tokens.filter(
    (token) =>
      Object.keys(swapMapping).includes(token.symbol) && chainId === sepolia.id,
  );

  // Update selected token when ID changes
  useEffect(() => {
    const token = tokens.find((t) => t.id === sourceTokenId) || nativeToken;
    setSourceToken(token || null);
    const tgtoken = tokens.find((t) => t.id === targetTokenId) || nativeToken;
    setTargetToken(tgtoken || null);
  }, [sourceTokenId, targetTokenId, tokens, nativeToken]);

  const eligibleToTokens = useMemo(() => {
    if (!sourceToken?.symbol) return [];
    const mappings = swapMapping[sourceToken.symbol] || [];
    return tokens.filter(
      (token) =>
        mappings.some((mapping) => mapping.targetSymbol === token.symbol) &&
        chainId === sepolia.id,
    );
  }, [sourceToken?.symbol, tokens, chainId]);

  const handleWrap = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateForm({
      isSepoliaChain,
      sourceToken,
      targetToken,
      amount,
      tokenBalance: sourceTokenBalance,
      setFormError,
    });

    if (!isValid) return;

    try {
      const swapAction = getSwapAction(
        sourceToken?.symbol || '',
        targetToken?.symbol || '',
      );

      if (swapAction) {
        const { action } = swapAction;

        if (action === 'wrap') {
          toast.info('Wrapping tokens...', {
            description: `Converting ${amount} ${sourceToken?.symbol} to ${targetToken?.symbol}`,
          });

          await wrap(amount);
        } else if (action === 'unwrap') {
          toast.info('Unwrapping tokens...', {
            description: `Converting ${amount} ${sourceToken?.symbol} to ${targetToken?.symbol}`,
          });

          await unwrap(amount);
        }
      } else {
        setFormError('Invalid token pair for swap');
        return;
      }

      // Add toast for transaction submission
      if (wrapHash) {
        toast.success('Transaction submitted', {
          description: 'Your transaction has been submitted to the network',
        });
      }
    } catch (error) {
      console.error('Swap error:', error);
      setFormError('Failed to swap tokens. Please try again.');

      // Add error toast
      toast.error('Transaction failed', {
        description: 'Failed to swap tokens. Please try again.',
      });
    }
  };

  const handleReset = () => {
    setAmount('');
    resetTransfer();
  };

  // Get the current balance to display
  const displaySourceBalance = !sourceTokenBalance.isLoading
    ? sourceTokenBalance.balance
    : sourceToken?.balance || '0';

  // Get the current balance to display
  const displayTargetBalance = !targetTokenBalance.isLoading
    ? targetTokenBalance.balance
    : targetToken?.balance || '0';

  const switchTargetandSource = () => {
    // Store current values
    const tempSourceId = sourceTokenId;
    const tempTargetId = targetTokenId;
    const tempAmount = amount;

    // Swap the tokens
    setSourceTokenId(tempTargetId);
    setTargetTokenId(tempSourceId);

    // Keep the amount if it's valid
    if (tempAmount) {
      setAmount(tempAmount);
    }
  };

  if (!isSepoliaChain) {
    return <WrongNetworkMessage onSwitchNetwork={switchToSepolia} />;
  }

  return (
    <div className="w-full backdrop-blur-xs">
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <Card className="w-full border bg-card/60 backdrop-blur-xs">
            <CardContent className="p-6">
              <SwapSuccessMessage
                amount={amount}
                sourceSymbol={sourceToken?.symbol || ''}
                targetSymbol={targetToken?.symbol || ''}
                isConfirming={isConfirming}
                isConfirmed={isConfirmed}
                hash={wrapHash}
                onReset={handleReset}
              />
            </CardContent>
          </Card>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleWrap}
          >
            {formError && (
              <div className="flex mb-5 items-center gap-2 text-sm text-destructive rounded-md p-2 bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <p>{formError}</p>
              </div>
            )}

            {isError && error && (
              <div className="flex mb-5 items-center gap-2 text-sm text-destructive rounded-md p-2 bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <p>{(error as BaseError).shortMessage || 'Wrap failed'}</p>
              </div>
            )}

            {/* From section */}
            <SwapToFromSection
              swapFrom={true}
              amount={amount}
              setAmount={setAmount}
              token={sourceToken}
              tokenId={sourceTokenId}
              setTokenId={setSourceTokenId}
              displayBalance={displaySourceBalance}
              isPendingTransfer={isPendingTransfer}
              eligibleTokens={eligibleTokens}
            />

            {/* Arrow */}
            <div className="flex justify-center -my-3 relative z-10">
              <Button
                variant="ghost"
                onClick={switchTargetandSource}
                className="bg-[#E8E8E8] border h-10 w-10 dark:bg-[#6E6E6E] p-2 hover:bg-[#DADADA] dark:hover:bg-[#8c8c8c]"
              >
                <ArrowDownUp className="h-5 w-5" />
              </Button>
            </div>

            {/* To Secgtion */}
            <SwapToFromSection
              swapFrom={false}
              amount={amount}
              setAmount={setAmount}
              token={targetToken}
              tokenId={targetTokenId}
              setTokenId={setTargetTokenId}
              displayBalance={displayTargetBalance}
              isPendingTransfer={isPendingTransfer}
              eligibleTokens={eligibleToTokens}
            />

            <TransactionStatus hash={wrapHash} isConfirmed={false} />

            <SwapButton
              isPending={isPendingTransfer}
              sourceToken={sourceToken}
              targetToken={targetToken}
              isConfirming={isConfirming}
              wrapHash={wrapHash}
            />

            {isPendingTransfer && (
              <div className="text-sm text-muted-foreground text-center">
                {isConfirming
                  ? 'Your transaction is being encrypted for privacy...'
                  : wrapHash
                    ? 'Transaction submitted. Waiting for network confirmation...'
                    : 'Please confirm the transaction in your wallet...'}
              </div>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SwapForm;
