import { useTokens, Token } from '@/hooks/token/useTokens';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import TokenRow from './TokenRow';

const TokenList = () => {
  const { tokens, isLoading } = useTokens();

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Native token skeleton */}
        <div className="h-[220px]">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>

        {/* Other tokens skeleton */}
        <div>
          <div className="mb-4">
            <Skeleton className="h-7 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[220px]">
                <Skeleton className="h-full w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium">No tokens found</h3>
        <p className="text-muted-foreground mt-2">
          Connect your wallet to view your tokens
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Native Currency Section */}
      {tokens.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-full overflow-hidden border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>24h</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((token) => (
                  <TokenRow key={token.address} token={token} />
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TokenList;
