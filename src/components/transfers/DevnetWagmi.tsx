import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Unlock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input.tsx';
import { sepolia } from 'wagmi/chains';
import { type BaseError } from 'wagmi';
import { VITE_PAYMENT_TOKEN_CONTRACT_ADDRESS } from '@/config/env';
import { useEncryptedBalance } from '@/hooks/token/useEncryptedBalance';
import { useConfidentialTransfer } from '@/hooks/token/transfer/useConfidentialTransfer';
import { useSigner } from '@/hooks/useSigner';
import { useAddressValidation } from '@/hooks/useAddressValidation';
import { useTokenBalance } from '@/hooks/token/useTokenBalance';
import { useWallet } from '@/hooks/useWallet';
import { motion, AnimatePresence } from 'framer-motion';
import TransferSuccessMessage from './TransferSuccessMessage';
import RecipientInputField from './RecipientInputField';
import TransferButton from './TransferButton';
import TransferFormError from './TransferFormError';
import AmountInputField from './AmountInputField2';
import { useFhevm } from '@/providers/FhevmProvider';

export const DevnetWagmi = () => {
  const { address } = useWallet();
  const { signer } = useSigner();
  const { instanceStatus } = useFhevm();

  const [transferAmount, setTransferAmount] = useState('');
  const [inputValueAddress, setInputValueAddress] = useState('');
  const [formError, setFormError] = useState<string>('');
  const { chosenAddress, errorMessage } =
    useAddressValidation(inputValueAddress);

  const tokenBalance = useTokenBalance({
    address,
    tokenAddress: VITE_PAYMENT_TOKEN_CONTRACT_ADDRESS,
    enabled: !!address,
    isConfidential: true,
  });

  const {
    transfer: confidentialTransfer,
    isEncrypting,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    isPending: confidentialIsPending,
    isError,
    error,
    isSuccess: confidentialIsSuccess,
    resetTransfer: confidentialResetTransfer,
  } = useConfidentialTransfer();

  const validateForm = (): boolean => {
    if (!VITE_PAYMENT_TOKEN_CONTRACT_ADDRESS) {
      setFormError('Please select contract address');
      return false;
    }

    if (!inputValueAddress || !/^0x[a-fA-F0-9]{40}$/.test(inputValueAddress)) {
      setFormError('Please enter a valid Ethereum address');
      return false;
    }

    if (
      !transferAmount ||
      isNaN(Number(transferAmount)) ||
      Number(transferAmount) <= 0
    ) {
      setFormError('Please enter a valid amount');
      return false;
    }

    // // Use the real-time balance from useTokenBalance if available
    // const currentBalance = tokenBalance?.balance;

    // if (Number(transferAmount) > Number(currentBalance)) {
    //   setFormError(
    //     `Insufficient balance. You have ${currentBalance} ${selectedToken.symbol}`,
    //   );
    //   return false;
    // }

    setFormError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await confidentialTransfer(
        VITE_PAYMENT_TOKEN_CONTRACT_ADDRESS,
        transferAmount,
        chosenAddress as `0x${string}`,
        6,
      );
    } catch (error) {
      console.error('Transfer error:', error);
      setFormError('Transfer failed. Please try again.');
    }
  };

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

  const handleReset = (clearTransfer?: () => void) => {
    setTransferAmount('');
    setInputValueAddress('');
    if (clearTransfer) {
      clearTransfer();
    }
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-1">
        {/* Encrypted Balance */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-xl">
                  {tokenBalance.balance
                    ? tokenBalance.balance.toString()
                    : '•••••'}{' '}
                  {tokenBalance.symbol}
                </div>
                <div className="pt-1 font-mono text-gray-600 text-xs max-w-56">
                  Last updated: {tokenBalance.lastUpdated}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleDecrypt}
                disabled={
                  tokenBalance.isDecrypting || instanceStatus !== 'ready'
                }
              >
                {tokenBalance.isDecrypting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Decrypting...
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    Decrypt
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transfer Section */}
        <Card>
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {confidentialIsSuccess ? (
                <TransferSuccessMessage
                  amount={transferAmount}
                  symbol={tokenBalance?.symbol || ''}
                  hash={hash}
                  isConfirmed={isConfirmed}
                  isConfirming={isConfirming}
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
                  {/* Form error */}
                  {formError && <TransferFormError message={formError} />}

                  {/* Transfer error */}
                  {isError && error && (
                    <TransferFormError
                      message={
                        (error as BaseError).shortMessage || 'Transfer failed'
                      }
                    />
                  )}

                  <RecipientInputField
                    recipient={inputValueAddress}
                    setRecipient={setInputValueAddress}
                    isPending={confidentialIsPending}
                  />

                  <AmountInputField
                    amount={transferAmount}
                    setAmount={setTransferAmount}
                    selectedToken={tokenBalance}
                    displayBalance={tokenBalance.balance}
                    isPending={confidentialIsPending}
                  />

                  <TransferButton
                    isEncrypting={isEncrypting}
                    isPending={confidentialIsPending}
                    selectedToken={tokenBalance}
                    transferAmount={transferAmount}
                    chosenAddress={chosenAddress}
                  />
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
