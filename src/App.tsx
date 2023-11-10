import { useEffect, useState } from 'react';
import { Devnet } from './components/Devnet';
import { init } from './fhevmjs';
import './App.css';
import { Connect } from './components/Connect';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    init()
      .then(() => {
        setIsInitialized(true);
      })
      .catch(() => setIsInitialized(false));
  }, []);

  if (!isInitialized) return null;

  return (
    <>
      <h1>fhevmjs</h1>
      <Connect>{(account, provider) => <Devnet />}</Connect>
      <p className="read-the-docs">
        <a href="https://docs.zama.ai/fhevm">See the documentation for more information</a>
      </p>
    </>
  );
}

export default App;
