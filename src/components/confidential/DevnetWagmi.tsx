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
    hash: transferHash,
    error: transferError,
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

  return (
    <>
      <div className="grid gap-4 md:grid-cols-1">
        {/* Encrypted Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Encrypted Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="font-mono text-xl">
                  {decryptedBalance?.toString()} {tokenBalance.symbol}
                </div>
                <div className="font-mono text-gray-600 text-sm">
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
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Transfer Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Recepient Address</label>
              <Input
                type="text"
                value={inputValueAddress}
                onChange={(e) => setInputValueAddress(e.target.value)}
                placeholder="0x...."
              />
              {errorMessage && (
                <div style={{ color: 'red' }}>
                  <p>{errorMessage}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-600">Amount</label>
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
                  placeholder="Enter amount to transfer"
                />
              </div>
            </div>

            <div>
              <Button
                className="w-full"
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
            {transferHash && <div>Transaction Hash: {transferHash}</div>}
            {isConfirming && <div>Waiting for confirmation...</div>}
            {isConfirmed && <div>Transaction confirmed.</div>}
            {transferError && (
              <div>
                Error:{' '}
                {(transferError as BaseError).shortMessage ||
                  transferError.message}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
