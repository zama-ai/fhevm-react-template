import { Token } from '@/types/tokenTypes';

interface ValidateFormParams {
  isSepoliaChain: boolean;
  sourceToken: Token | null;
  targetToken: Token | null;
  amount: string;
  tokenBalance: { isLoading: boolean; balance: string };
  setFormError: (error: string) => void;
}

export const validateForm = ({
  isSepoliaChain,
  sourceToken,
  targetToken,
  amount,
  tokenBalance,
  setFormError,
}: ValidateFormParams): boolean => {
  if (!isSepoliaChain) {
    setFormError('Confidential tokens are only available on Sepolia testnet');
    return false;
  }

  if (!sourceToken) {
    setFormError('Please select a token to wrap');
    return false;
  }

  if (!targetToken) {
    setFormError('No confidential version available for this token');
    return false;
  }

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    setFormError('Please enter a valid amount');
    return false;
  }

  const currentBalance = !tokenBalance.isLoading
    ? tokenBalance.balance
    : sourceToken.balance;

  if (Number(amount) > Number(currentBalance)) {
    setFormError(
      `Insufficient balance. You have ${currentBalance} ${sourceToken.symbol}`,
    );
    return false;
  }

  setFormError('');
  return true;
};