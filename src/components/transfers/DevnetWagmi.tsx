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

export const DevnetWagmi = () => {
  const { address } = useWallet();
  const contractAddress = VITE_PAYMENT_TOKEN_CONTRACT_ADDRESS;
  const { signer } = useSigner();

  const [transferAmount, setTransferAmount] = useState('');
  const [inputValueAddress, setInputValueAddress] = useState('');
  const { chosenAddress, errorMessage } =
    useAddressValidation(inputValueAddress);

  const tokenBalance = useTokenBalance({
    address,
    tokenAddress: contractAddress || 'native',
    enabled: !!address,
  });

  // Use custom hooks
  const {
    decryptedBalance,
    lastUpdated,
    isDecrypting,
    decrypt: decryptBalance,
    error: decryptionError,
  } = useEncryptedBalance({
    signer,
  });

  const {
    transfer: confidentialTransfer,
    isEncrypting,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    isPending: confidentialIsPending,
    isError: confidentialIsError,
    error: transferError,
    isSuccess: confidentialIsSuccess,
    resetTransfer: confidentialResetTransfer,
  } = useConfidentialTransfer();

  const handleTransfer = async () => {
    await confidentialTransfer(
      contractAddress,
      transferAmount,
      chosenAddress as `0x${string}`,
      6,
    );
  };

  const handleDecrypt = async () => {
    if (!signer) {
      console.error('Signer not initialized - please connect your wallet');
      return;
    }
    try {
      await decryptBalance(tokenBalance.rawBalance, contractAddress);
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
                  {decryptedBalance ? decryptedBalance.toString() : '•••••'}{' '}
                  {tokenBalance.symbol}
                </div>
                <div className="pt-1 font-mono text-gray-600 text-sm">
                  Last updated: {lastUpdated}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleDecrypt}
                disabled={isDecrypting}
              >
                {isDecrypting ? (
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
                  onSubmit={handleTransfer}
                  className="space-y-6"
                >
                  <RecipientInputField
                    recipient={inputValueAddress}
                    setRecipient={setInputValueAddress}
                    isPending={confidentialIsPending}
                  />

                  <div className="space-y-2">
                    <label className="text-sm">Amount</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={transferAmount}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || parseFloat(value) >= 0) {
                            setTransferAmount(value);
                          }
                        }}
                        placeholder="0.0"
                      />
                    </div>
                  </div>

                  <div className="flex px-8  mt-6 justify-center items-center ">
                    <Button
                      className=""
                      size="lg"
                      onClick={handleTransfer}
                      disabled={
                        isPending ||
                        isEncrypting ||
                        !transferAmount ||
                        chosenAddress === '0x'
                      }
                    >
                      {isEncrypting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Encrypting amount...
                        </>
                      ) : isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Confirming transaction...
                        </>
                      ) : (
                        'Transfer Tokens'
                      )}
                    </Button>
                  </div>

                  {isConfirming && <div>Waiting for confirmation...</div>}
                  {isConfirmed && <div>Transaction confirmed.</div>}
                  {transferError && (
                    <div>
                      Error:{' '}
                      {(transferError as BaseError).shortMessage ||
                        transferError.message}
                    </div>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
