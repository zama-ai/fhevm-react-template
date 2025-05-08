import { Token } from '@/types/tokenTypes';
import { VITE_CONF_TOKEN_ADDRESS } from '@/config/env';

interface ValidateFormParams {
  isSepoliaChain: boolean;
  recipient: string;
  amount: string;
  setFormError: (error: string) => void;
}

export const validateForm = ({
  isSepoliaChain,
  recipient,
  amount,
  setFormError,
}: ValidateFormParams): boolean => {
  if (!isSepoliaChain) {
    setFormError('Confidential tokens are only available on Sepolia testnet');
    return false;
  }

  if (!VITE_CONF_TOKEN_ADDRESS) {
    setFormError('Please select contract address');
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

  setFormError('');
  return true;
};
