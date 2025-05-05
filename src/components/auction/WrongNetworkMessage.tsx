import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sepolia } from 'wagmi/chains';

interface WrongNetworkMessageProps {
  onSwitchNetwork: () => Promise<void>;
}

const WrongNetworkMessage: React.FC<WrongNetworkMessageProps> = ({
  onSwitchNetwork,
}) => {
  return (
    <>
      <Card className="w-full bg-card/60 backdrop-blur-xs">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-xl font-medium">Network Not Supported</h3>
            <p className="text-muted-foreground max-w-md">
              Confidential transactions are only available on the Sepolia
              testnet. Please switch your network to continue.
            </p>
            <Button onClick={onSwitchNetwork} variant="outline">
              Switch to {sepolia.name}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default WrongNetworkMessage;
