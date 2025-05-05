import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { useWallet } from '../../useWallet';
import { erc20Abi } from '@/utils/erc20Abi';
import { parseUnits } from 'viem';
import { useChain } from '../../useChain';

interface UseTokenTransferProps {
  onSuccess?: () => void;
}

export const useTokenTransfer = ({ onSuccess }: UseTokenTransferProps = {}) => {
  const { address } = useWallet();
  const { chain } = useChain();
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

  const transfer = async (
    contractAddress: `0x${string}`,
    amount: string,
    recipientAddress: `0x${string}`,
    tokenDecimals?: number,
  ) => {
    if (!amount || !address) return;

    // Convert the amount to the correct decimal representation
    const parsedAmount = parseUnits(amount, tokenDecimals || 18);

    try {
      writeContract({
        address: contractAddress,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [recipientAddress, parsedAmount],
        account: address as `0x${string}`,
        chain: chain,
      });

      toast.info('Confidential Transfer Initiated', {
        description:
          'Processing encrypted transaction. This may take longer than regular transfers.',
      });

      return true;
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error('Transfer failed', {
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
      return false;
    }
  };

  return {
    transfer,
    isConfirming,
    isConfirmed,
    hash,
    isPending,
    isError,
    error,
    isSuccess,
    resetTransfer: reset,
  };
};
