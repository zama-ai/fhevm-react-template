import PageTransition from '@/components/layout/PageTransition';
import { useWallet } from '@/hooks/useWallet';
import { motion } from 'framer-motion';
import WalletNotConnected from '@/components/wallet/WalletNotConnected';
import UniversalTransferForm from '@/components/transfers/UniversalTransferForm';

const Transfer = () => {
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
          <h1 className="font-medium text-4xl mb-4">Send Assets</h1>
          {/* <p className="text-muted-foreground text-md">
            Transfer your assets to any address securely and easily.
          </p> */}
        </motion.div>

        {isConnected ? (
          <div className="mt-8 max-w-md mx-auto">
            <UniversalTransferForm />
          </div>
        ) : (
          <WalletNotConnected />
        )}
      </div>
    </PageTransition>
  );
};

export default Transfer;
