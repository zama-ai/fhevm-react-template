import React from 'react';
import { motion } from 'framer-motion';

interface ErrorComponentProps {
  errorMessage: string;
  onInstallMetamask: () => void;
}

export const ErrorComponent: React.FC<ErrorComponentProps> = ({
  errorMessage,
  onInstallMetamask,
}) => {
  return (
    <div className="Connect__error">
      <motion.p
        initial={{ x: 0 }}
        animate={{
          x: [0, -10, 10, -10, 10, 0],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 5,
        }}
        className="no-wallet"
      >
        {errorMessage}
      </motion.p>
      <motion.button
        initial={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        className="Connect__metamask-button"
        onClick={onInstallMetamask}
      >
        Connect Metamask
      </motion.button>
    </div>
  );
};
