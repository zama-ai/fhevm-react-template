import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import { confidentialWETHAbi } from '@/utils/confidentialWETHAbi';
import { VITE_PAYMENT_TOKEN_CONTRACT_ADDRESS } from '@/config/env';
import { useWallet } from '../../useWallet';
import { useChain } from '../../useChain';
import { parseUnits } from 'viem';
import { parseEther } from 'viem';

export const useWrapSwap = () => {
  const { address: userAddress } = useWallet();
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

  const unwrap = async (amount: string, tokenDecimals?: number) => {
    if (!amount || !userAddress) return;

    // Convert the amount to the correct decimal representation
    const parsedAmount = parseUnits(amount, tokenDecimals || 6);

    try {
      await writeContract({
        address: VITE_PAYMENT_TOKEN_CONTRACT_ADDRESS,
        abi: confidentialWETHAbi,
        functionName: 'unwrap',
        args: [parsedAmount],
        account: userAddress as `0x${string}`,
        chain,
      });

      toast.info('Confidential unwrap Initiated', {
        description: 'Processing transaction.',
      });

      return true;
    } catch (error) {
      console.error('unwrap failed:', error);
      return false;
    }
  };

  const wrap = async (amount: string) => {
    if (!amount || !userAddress) return;

    const parsedAmount = parseEther(amount);

    try {
      await writeContract({
        address: VITE_PAYMENT_TOKEN_CONTRACT_ADDRESS,
        abi: confidentialWETHAbi,
        functionName: 'wrap',
        account: userAddress as `0x${string}`,
        chain,
        value: parsedAmount,
      });

      toast.info('Confidential wrap Initiated', {
        description: 'Processing transaction.',
      });

      return true;
    } catch (error) {
      console.error('wrap failed:', error);
      return false;
    }
  };

  return {
    wrap,
    unwrap,
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
