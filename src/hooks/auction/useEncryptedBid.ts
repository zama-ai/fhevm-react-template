import { useState } from 'react';
import { getInstance } from '@/lib/fhevm/fhevmjs';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { toHexString } from '@/lib/helper';
import { toast } from 'sonner';
import { Chain } from 'wagmi/chains';
import { VITE_PAYMENT_TOKEN_CONTRACT_ADDRESS } from '@/config/env';
import { auctionAbi } from '@/utils/auctionAbi';
import { confidentialErc20Abi } from '@/utils/confidentialErc20Abi';

const ptContractAddress = VITE_PAYMENT_TOKEN_CONTRACT_ADDRESS;

interface useEncryptedBidProps {
  contractAddress: `0x${string}`;
  userAddress?: `0x${string}`;
  chain: Chain; // Replace with proper chain type
}

export const useEncryptedBid = ({
  contractAddress,
  userAddress,
  chain,
}: useEncryptedBidProps) => {
  const [isEncrypting, setIsEncrypting] = useState(false);

  const {
    data: transferHash,
    error: transferError,
    isPending,
    writeContract,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: transferHash,
    });

  const bid = async (amount: string) => {
    if (!amount) return;

    setIsEncrypting(true);
    try {
      const instance = getInstance();

      const resultPt = await instance
        .createEncryptedInput(ptContractAddress, userAddress)
        .add64(BigInt('100'))
        .encrypt();

      const resultBid = await instance
        .createEncryptedInput(contractAddress, userAddress)
        .add64(BigInt(amount))
        .encrypt();

      // first, approve the transfer
      await writeContract({
        address: ptContractAddress,
        abi: confidentialErc20Abi,
        functionName: 'approve',
        args: [
          contractAddress, // spender
          toHexString(resultPt.handles[0]) as `0x${string}`, // encryptedAmount
          toHexString(resultPt.inputProof) as `0x${string}`, // inputProof
        ],
        account: userAddress,
        chain,
      });

      // then, bid
      await writeContract({
        address: contractAddress,
        abi: auctionAbi,
        functionName: 'bid',
        args: [
          toHexString(resultBid.handles[0]) as `0x${string}`,
          toHexString(resultBid.inputProof) as `0x${string}`,
        ],
        account: userAddress,
        chain,
      });

      toast.info('Confidential Transfer Initiated', {
        description:
          'Processing encrypted transaction. This may take longer than regular transfers.',
      });

      return true;
    } catch (error) {
      console.error('Transfer failed:', error);
      return false;
    } finally {
      setIsEncrypting(false);
    }
  };

  return {
    bid,
    isEncrypting,
    isPending,
    isConfirming,
    isConfirmed,
    transferHash,
    transferError,
  };
};
