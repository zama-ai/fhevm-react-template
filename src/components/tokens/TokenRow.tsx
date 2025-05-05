import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  LockKeyhole,
  UnlockKeyhole,
  Loader2,
} from 'lucide-react';
import { useSigner } from '@/hooks/useSigner';
import { useTokenBalance } from '@/hooks/token/useTokenBalance';
import { useAccount } from 'wagmi';
import { useWallet } from '@/hooks/useWallet';
import { Token } from '@/types/tokenTypes';

const TokenRow = ({ token }: { token: Token }) => {
  const { signer } = useSigner();
  const { address } = useWallet();

  // Use the token balance hook to get real-time balance
  const tokenBalance = useTokenBalance({
    address: address,
    tokenAddress: token.address || 'native',
    isConfidential: token.isConfidential,
    enabled: !!address,
  });

  //   const { decryptedBalance, lastUpdated, isDecrypting, decrypt, error } =
  //     useEncryptedBalance({
  //       signer,
  //     });

  // Use the fetched balance if available, otherwise use the token's balance
  const displayBalance = !tokenBalance.isLoading
    ? tokenBalance.balance
    : token.balance;
  const displaySymbol = tokenBalance.symbol || token.symbol;
  const displayValue = !tokenBalance.isLoading
    ? tokenBalance.value
    : token.value;

  const formatValue = (value: number | string) => {
    if (typeof value === 'string') return value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const handleDecrypt = async () => {
    if (!signer) {
      console.error('Signer not initialized - please connect your wallet');
      return;
    }
    try {
      await tokenBalance.decrypt();
    } catch (error) {
      console.error('Failed to decrypt balance:', error);
    }
  };

  return (
    <TableRow className="hover:bg-muted/20">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {token.logo ? (
              <img
                src={token.logo}
                alt={token.name}
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span className="text-sm font-semibold">
                {token.symbol.slice(0, 2)}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium">{token.name}</p>
            <p className="text-xs text-muted-foreground">{token.symbol}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>{`${displayBalance} ${displaySymbol}`}</TableCell>
      <TableCell>{`${formatValue(displayValue)}`}</TableCell>
      <TableCell>
        <span
          className={`text-xs px-1.5 py-0.5 rounded-md ${
            token.change24h >= 0
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {token.change24h >= 0 ? '+' : ''}
          {token.change24h.toFixed(2)}%
        </span>
      </TableCell>
      <TableCell>
        {(!token.isEncrypted || token.isDecrypted) && (
          <Link to={`/transfer?token=${token.id}`}>
            <Button variant="outline" className="w-full gap-1 group">
              Transfer
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
          </Link>
        )}

        {token.isEncrypted && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleDecrypt}
            className="w-full gap-1 group"
            disabled={token.isDecrypted || tokenBalance.isDecrypting}
          >
            {tokenBalance.isDecrypting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : token.isDecrypted ? (
              <UnlockKeyhole className="h-4 w-4" />
            ) : (
              <>
                Decrypt <LockKeyhole className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default TokenRow;
