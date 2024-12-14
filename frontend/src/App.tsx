import { useEffect, useState } from 'react';
import { Devnet } from './components/Devnet';
import { init } from './fhevmjs';
import './App.css';
import { Connect } from './components/Connect';
import { motion } from 'framer-motion';
import { Election } from './components/Election/Election';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showElection, setShowElection] = useState(true);

  useEffect(() => {
    init()
      .then(() => {
        setIsInitialized(true);
      })
      .catch(() => setIsInitialized(false))
      .finally(() => setLoading(false));
  }, []);

  if (!isInitialized) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="app-container"
    >
      {showElection ? (
        <Election />
      ) : (
        <>
          <header className="app-header">
            <motion.h1
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              Transparent, Secure, and Universal Elections
            </motion.h1>
            <motion.p
              className="subtitle"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Revolutionizing voting with encrypted, decentralized, and
              verifiable elections for everyone.
            </motion.p>
          </header>

          {/* Main Section */}
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="main-content"
          >
            {/* Connect Wallet Section */}
            <Connect onConnectionSuccess={() => setShowElection(true)}>
              {(account, provider) => (
                <div className="devnet-container">
                  <Devnet account={account} provider={provider} />
                </div>
              )}
            </Connect>
          </motion.main>
        </>
      )}

      {/* Footer Section */}
      <footer className="app-footer">
        <p className="footer-highlight">
          "The future of democracy is <strong>secure</strong>, transparent, and
          <strong> universal</strong>."
        </p>
      </footer>
    </motion.div>
  );
}

export default App;

