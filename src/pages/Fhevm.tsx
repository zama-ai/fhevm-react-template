// Update this page (the content is just a fallback if you fail to update the page)
import { DevnetWagmi } from "@/components/confidential/DevnetWagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/hooks/useWallet";
import { useAccount, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";

const Fhevm = () => {
  const { address } = useWallet();

  const chainId = useChainId();

  const isOnSepolia = chainId === sepolia.id;

  // If not on Sepolia, show switch chain message
  if (!isOnSepolia) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="w-full max-w-2xl space-y-4 p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Wrong Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p>This application only works on Sepolia testnet.</p>
                <p>Please switch your network to Sepolia to continue.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-2xl space-y-4 p-4">
        {address && <DevnetWagmi />}
      </div>
    </div>
  );
};

export default Fhevm;
