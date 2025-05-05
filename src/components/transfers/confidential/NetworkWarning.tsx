
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface NetworkWarningProps {
  isOnSepolia: boolean;
  switchNetwork?: (chainId: number) => void;
  chainId: number;
}

const NetworkWarning = ({ isOnSepolia, switchNetwork, chainId }: NetworkWarningProps) => {
  if (isOnSepolia) return null;
  
  return (
    <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-md flex items-center gap-2">
      <AlertCircle className="h-4 w-4" />
      <div className="flex-1 text-sm">
        Confidential tokens are only available on Sepolia testnet.
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => switchNetwork && switchNetwork(chainId)}
        className="text-xs border-amber-300 dark:border-amber-700"
      >
        Switch to Sepolia
      </Button>
    </div>
  );
};

export default NetworkWarning;
