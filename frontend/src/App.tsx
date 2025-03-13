import { useEffect, useState } from 'react';
import { Devnet } from '../components/Devnet/Devnet';
import { init } from './fhevmjs';
import { Connect } from '../components/Connect/Connect';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold tracking-tight">
              Confidential ERC20 dApp
            </CardTitle>
            <CardDescription>
              Securely manage and transfer your encrypted tokens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Connect>
              {(account, provider, readOnlyProvider) => (
                <Devnet
                  account={account}
                  provider={provider}
                  readOnlyProvider={readOnlyProvider}
                />
              )}
            </Connect>
          </CardContent>

          <CardFooter className="justify-center">
            <a
              href="https://docs.zama.ai/fhevm"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-2"
            >
              See the documentation
              <ExternalLink className="h-4 w-4" />
            </a>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default App;
