import { useEffect, useState } from 'react';
import './App.css';
import { Devnet } from './components/Devnet';
import { init, createFhevmInstance } from './fhevmjs';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  const startup = async () => {
    await init();
    await createFhevmInstance();
    setIsInitialized(true);
  };

  useEffect(() => {
    startup().catch((e) => console.log('init failed', e));
  }, []);

  if (!isInitialized) return null;

  return (
    <>
      <h1>fhevmjs</h1>
      <div className="card">
        <Devnet />
      </div>
      <p className="read-the-docs">
        <a href="https://docs.zama.ai/fhevm">See the documentation for more information</a>
      </p>
    </>
  );
}

export default App;
