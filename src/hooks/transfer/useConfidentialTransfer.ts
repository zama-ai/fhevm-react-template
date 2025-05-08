import { useEffect, useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { toHexString } from '@/lib/helper';
import { toast } from 'sonner';
import { useChain } from '@/hooks/wallet/useChain';
import { useWallet } from '@/hooks/wallet/useWallet';
import { parseUnits } from 'viem';
import { useEncrypt } from '@/hooks/fhevm/useEncrypt';

export const useConfidentialTransfer = () => {
  const { address } = useWallet();
  const { chain } = useChain();
  const [recipientAddress, setRecipientAddress] = useState<`0x${string}`>(null);
  const [contractAddress, setContractAddress] = useState<`0x${string}`>(null);
  const { encryptAmount, isEncrypting, encryptedAmount, resetEncrypt } =
    useEncrypt();
  const {
    data: hash,
    isPending,
    isError,
    error,
    isSuccess,
    writeContract,
    reset,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  function transfer(
    contractAddress: `0x${string}`,
    amount: string,
    recipientAddress: `0x${string}`,
    tokenDecimals?: number,
  ) {
    if (!amount || !address) return;

    // Convert the amount to the correct decimal representation
    const parsedAmount = parseUnits(amount, tokenDecimals || 6);
    setRecipientAddress(recipientAddress);
    setContractAddress(contractAddress);
    encryptAmount(contractAddress, address as `0x${string}`, parsedAmount);
  }

  function resetTransfer() {
    reset();
    setRecipientAddress(null);
    setContractAddress(null);
    resetEncrypt();
    toast.dismiss();
  }

  useEffect(() => {
    if (!encryptedAmount || !recipientAddress || !contractAddress) return;
    try {
      writeContract({
        address: contractAddress,
        abi: [
          {
            name: 'transfer',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'handle', type: 'bytes32' },
              { name: 'proof', type: 'bytes' },
            ],
            outputs: [{ name: '', type: 'bool' }],
          },
        ],
        functionName: 'transfer',
        args: [
          recipientAddress,
          toHexString(encryptedAmount.handles[0]) as `0x${string}`,
          toHexString(encryptedAmount.inputProof) as `0x${string}`,
        ],
        account: address as `0x${string}`,
        chain,
      });

      toast.info('Confidential Transfer Initiated', {
        description:
          'Processing encrypted transaction. This may take longer than regular transfers.',
      });

      resetEncrypt();
    } catch (error) {
      console.error('Transfer failed:', error);
      toast.error('Transfer failed. Please try again.');
    }
  }, [
    encryptedAmount,
    recipientAddress,
    contractAddress,
    writeContract,
    address,
    chain,
    resetEncrypt,
  ]);

  return {
    transfer,
    isEncrypting,
    isConfirming,
    isConfirmed,
    hash,
    isPending,
    isError,
    error,
    isSuccess,
    resetTransfer,
  };
};
