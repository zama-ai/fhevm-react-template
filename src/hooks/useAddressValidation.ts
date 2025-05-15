import { useState, useEffect } from 'react';
import { isAddress } from 'viem';

export function useAddressValidation(inputAddress: string) {
  const [chosenAddress, setChosenAddress] = useState<`0x${string}`>(
    '0x' as `0x${string}`,
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const trimmedValue = inputAddress.trim().toLowerCase();
    if (trimmedValue === '') {
      setChosenAddress('0x');
      setErrorMessage('');
    } else if (isAddress(trimmedValue)) {
      setChosenAddress(trimmedValue as `0x${string}`);
      setErrorMessage('');
    } else {
      setChosenAddress('0x');
      setErrorMessage('Invalid Ethereum address.');
    }
  }, [inputAddress]);

  return { chosenAddress, errorMessage };
}
