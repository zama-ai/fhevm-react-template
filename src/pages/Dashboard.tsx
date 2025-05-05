import PageTransition from '@/components/layout/PageTransition';
import TokenList from '@/components/tokens/TokenList';
import { useWallet } from '@/hooks/useWallet';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WalletNotConnected from '@/components/wallet/WalletNotConnected';
import TransactionHistory from '@/components/transactions/TransactionHistory';

const Dashboard = () => {
  const { isConnected } = useWallet();

  return (
    <PageTransition>
      <div className="container mx-auto mt-10 px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 text-center"
        >
          <h1 className="font-medium text-4xl mb-4">Your Token Portfolio</h1>
          {/* <p className="text-muted-foreground text-md">
            View, manage, and transfer your tokens securely from a single
            dashboard.
          </p> */}
        </motion.div>

        {isConnected ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-8"
          >
            <Tabs defaultValue="tokens" className="w-full">
              <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-6">
                <TabsTrigger value="tokens" className="flex items-center gap-2">
                  <span>Tokens</span>
                </TabsTrigger>
                <TabsTrigger
                  value="transactions"
                  className="flex items-center gap-2"
                >
                  <span>Transactions</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tokens" className="mt-0">
                <TokenList />
              </TabsContent>

              <TabsContent value="transactions" className="mt-0">
                <TransactionHistory />
              </TabsContent>
            </Tabs>
          </motion.div>
        ) : (
          <WalletNotConnected />
        )}
      </div>
    </PageTransition>
  );
};

export default Dashboard;
