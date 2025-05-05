import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTokens } from '@/hooks/token/useTokens';
import { useTokenBalance } from '@/hooks/token/useTokenBalance';
import { useChainId } from 'wagmi';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import TransactionStatus from './TransactionStatus';
import TransferFormError from './TransferFormError';
import TokenSelectField from './TokenSelectField';
import RecipientInputField from './RecipientInputField';
import AmountInputField from './AmountInputField';
import TransferButton from './TransferButton';
import TransferSuccessMessage from './TransferSuccessMessage';
import { type BaseError } from 'wagmi';
import { useWallet } from '@/hooks/useWallet';
import { getNativeToken } from '@/utils/tokenUtils';
import { useNativeTransfer } from '@/hooks/token/transfer/useNativeTransfer';
import { useTokenTransfer } from '@/hooks/token/transfer/useTokenTransfer';
import { useConfidentialTransfer } from '@/hooks/token/transfer/useConfidentialTransfer';
import { Token } from '@/types/tokenTypes';
import { useSigner } from '@/hooks/useSigner';

const UniversalTransferForm = () => {
  const [searchParams] = useSearchParams();
  const initialTokenId = searchParams.get('token');
  const { tokens } = useTokens();
  const { address } = useWallet();
  const { signer } = useSigner();

  const chainId = useChainId();
  const navigate = useNavigate();

  const [selectedTokenId, setSelectedTokenId] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [formError, setFormError] = useState<string>('');

  // Get native token data
  const nativeToken = getNativeToken(chainId);

  // Fetch real-time balance for the selected token
  const tokenBalance = useTokenBalance({
    address: address,
    tokenAddress: selectedToken?.address || 'native',
    enabled: !!address && !!selectedToken,
    isConfidential: selectedToken?.isEncrypted,
  });

  // Set initial token selection from URL params
  useEffect(() => {
    if (initialTokenId && tokens.some((t) => t.id === initialTokenId)) {
      setSelectedTokenId(initialTokenId);
    } else if (tokens.length > 0) {
      const firstToken = tokens.find((t) => !t.isEncrypted);
      if (firstToken) {
        setSelectedTokenId(firstToken.id);
      }
    }
  }, [initialTokenId, tokens]);

  // Update selected token when ID changes
  useEffect(() => {
    const token = tokens.find((t) => t.id === selectedTokenId) || nativeToken;
    setSelectedToken(token || null);
  }, [selectedTokenId, tokens, nativeToken]);

  const validateForm = (): boolean => {
    if (!selectedToken) {
      setFormError('Please select a token');
      return false;
    }

    if (!recipient || !/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      setFormError('Please enter a valid Ethereum address');
      return false;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setFormError('Please enter a valid amount');
      return false;
    }

    // Use the real-time balance from useTokenBalance if available
    const currentBalance = !tokenBalance.isLoading
      ? tokenBalance.balance
      : selectedToken.balance;

    if (Number(amount) > Number(currentBalance)) {
      setFormError(
        `Insufficient balance. You have ${currentBalance} ${selectedToken.symbol}`,
      );
      return false;
    }

    setFormError('');
    return true;
  };

  // Custom hook for Native transfer
  const {
    hash: nativeHash,
    error: nativeError,
    isPending: nativeIsPending,
    isConfirming: nativeIsConfirming,
    isConfirmed: nativeIsConfirmed,
    isSuccess: nativeIsSuccess,
    validateAndSendTransaction,
    resetTransfer: nativeResetTransfer,
  } = useNativeTransfer();

  const {
    transfer: tokenTransfer,
    isConfirming: tokenIsConfirming,
    isConfirmed: tokenIsConfirmed,
    hash: tokenHash,
    isPending: tokenIsPending,
    isError: tokenIsError,
    error: tokenError,
    isSuccess: tokenIsSuccess,
    resetTransfer: tokenResetTransfer,
  } = useTokenTransfer();

  const {
    transfer: confidentialTransfer,
    isPending: confidentialIsPendingTransfer,
    isEncrypting,
    isConfirming: confidentialisConfirming,
    isConfirmed: confidentialisConfirmed,
    hash: confidentialHash,
    isPending: confidentialIsPending,
    isError: confidentialIsError,
    error: confidentialError,
    isSuccess: confidentialIsSuccess,
    resetTransfer: confidentialResetTransfer,
  } = useConfidentialTransfer();

  const handleDecrypt = async () => {
    if (!signer) {
      console.error('Signer not initialized - please connect your wallet');
      return;
    }
    try {
      await tokenBalance.decrypt();
    } catch (error) {
      console.error('Failed to decrypt balance:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    console.log('selected token', selectedToken);

    try {
      if (selectedToken.address === 'native') {
        // Use native transfer logic
        await validateAndSendTransaction(
          recipient,
          amount,
          tokenBalance.balance,
        );
      } else if (selectedToken.isConfidential) {
        await confidentialTransfer(
          selectedToken.address as `0x${string}`,
          amount,
          recipient as `0x${string}`,
          selectedToken.decimals,
        );
      } else {
        // Use token transfer logic
        await tokenTransfer(
          selectedToken.address as `0x${string}`,
          amount,
          recipient as `0x${string}`,
          selectedToken.decimals,
        );
      }
    } catch (error) {
      console.error('Transfer error:', error);
      setFormError('Transfer failed. Please try again.');
    }
  };

  // Get the current balance to display - use tokenBalance hook data if available
  const displayBalance = !tokenBalance.isLoading
    ? tokenBalance.balance
    : selectedToken?.balance || '0';

  const handleReset = (clearTransfer?: () => void) => {
    setAmount('');
    setRecipient('');
    if (clearTransfer) {
      clearTransfer();
    }
    navigate('/transfer', { replace: true });
  };

  return (
    <Card className="w-full bg-card/60 backdrop-blur-xs">
      <CardContent className="p-8">
        <AnimatePresence mode="wait">
          {tokenIsSuccess ? (
            <TransferSuccessMessage
              amount={amount}
              symbol={selectedToken?.symbol || ''}
              hash={tokenHash}
              isConfirmed={tokenIsConfirmed}
              isConfirming={nativeIsConfirming}
              onReset={() => handleReset(tokenResetTransfer)}
            />
          ) : nativeIsSuccess ? (
            <TransferSuccessMessage
              amount={amount}
              symbol={selectedToken?.symbol || ''}
              hash={nativeHash}
              isConfirmed={nativeIsConfirmed}
              isConfirming={nativeIsConfirming}
              onReset={() => handleReset(nativeResetTransfer)}
            />
          ) : confidentialIsSuccess ? (
            <TransferSuccessMessage
              amount={amount}
              symbol={selectedToken?.symbol || ''}
              hash={confidentialHash}
              isConfirmed={confidentialisConfirmed}
              isConfirming={confidentialisConfirming}
              onReset={() => handleReset(confidentialResetTransfer)}
            />
          ) : (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {formError && <TransferFormError message={formError} />}

              {tokenIsError && tokenError && (
                <TransferFormError
                  message={
                    (tokenError as BaseError).shortMessage || 'Transfer failed'
                  }
                />
              )}

              {confidentialIsError && confidentialError && (
                <TransferFormError
                  message={
                    (confidentialError as BaseError).shortMessage ||
                    'Transfer failed'
                  }
                />
              )}

              {nativeError && (
                <TransferFormError
                  message={
                    (nativeError as BaseError).shortMessage || 'Transfer failed'
                  }
                />
              )}

              <TokenSelectField
                selectedTokenId={selectedTokenId}
                setSelectedTokenId={setSelectedTokenId}
                tokens={tokens}
                displayBalance={displayBalance}
                isPending={
                  tokenIsPending ||
                  nativeIsPending ||
                  confidentialIsPending ||
                  confidentialIsPendingTransfer
                }
              />

              <RecipientInputField
                recipient={recipient}
                setRecipient={setRecipient}
                isPending={
                  tokenIsPending ||
                  nativeIsPending ||
                  confidentialIsPending ||
                  confidentialIsPendingTransfer
                }
              />

              <AmountInputField
                amount={amount}
                setAmount={setAmount}
                selectedToken={selectedToken}
                displayBalance={displayBalance}
                handleDecrypt={handleDecrypt}
                isDecrypting={tokenBalance.isDecrypting}
                isPending={
                  tokenIsPending ||
                  nativeIsPending ||
                  confidentialIsPending ||
                  confidentialIsPendingTransfer
                }
              />

              <TransactionStatus
                hash={tokenHash}
                isConfirmed={tokenIsConfirmed}
              />
              <TransactionStatus
                hash={nativeHash}
                isConfirmed={nativeIsSuccess}
              />
              <TransactionStatus
                hash={confidentialHash}
                isConfirmed={confidentialIsSuccess}
              />

              <TransferButton
                isEncrypting={isEncrypting}
                isPending={
                  tokenIsPending ||
                  nativeIsPending ||
                  confidentialIsPending ||
                  confidentialIsPendingTransfer
                }
                selectedToken={selectedToken}
              />
            </motion.form>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default UniversalTransferForm;
