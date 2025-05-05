import { useState, useEffect } from 'react';
import { parseEther } from 'viem';
import { toast } from 'sonner';
import {
  useSendTransaction,
  useTransactionReceipt,
  type BaseError,
} from 'wagmi';

export const useNativeTransfer = () => {
  const [formError, setFormError] = useState<string>('');

  // Wagmi hooks for transactions
  const {
    data: hash,
    error,
    isPending,
    sendTransaction,
    isSuccess,
    reset,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useTransactionReceipt({
      hash,
    });

  // Show error in toast
  useEffect(() => {
    if (error) {
      const errorMessage = (error as BaseError).shortMessage || error.message;
      toast.error('Transfer failed', {
        description: errorMessage,
      });
    }
  }, [error]);

  const validateAndSendTransaction = (
    recipient: string,
    amount: string,
    balance: string,
  ) => {
    // Validate address format
    if (!recipient || !/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      setFormError('Please enter a valid Ethereum address');
      return false;
    }

    // Validate amount
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setFormError('Please enter a valid amount');
      return false;
    }

    // Validate sufficient balance
    if (Number(amount) > Number(balance)) {
      setFormError(`Insufficient balance. You have ${balance}`);
      return false;
    }

    setFormError('');

    // Send the transaction
    try {
      sendTransaction({
        to: recipient as `0x${string}`,
        value: parseEther(amount),
      });
      return true;
    } catch (error) {
      console.error('Transfer error:', error);
      setFormError('Transfer failed. Please try again.');
      return false;
    }
  };

  const resetTransfer = () => {
    reset();
    setFormError('');
  };

  return {
    hash,
    error,
    formError,
    setFormError,
    isPending,
    isConfirming,
    isConfirmed,
    isSuccess,
    validateAndSendTransaction,
    resetTransfer,
  };
};
