
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins } from "lucide-react";

interface TokenInfoProps {
  tokenName: string;
  initialTokenSupply: number;
  currentTokenSupply: number;
  totalTokenSupply: number;
}

const TokenInfo = ({
  tokenName,
  initialTokenSupply,
  currentTokenSupply,
  totalTokenSupply,
}: TokenInfoProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Token Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
            <Coins className="h-8 w-8 text-purple-500 mb-2" />
            <h4 className="text-sm text-gray-500">Token Name</h4>
            <p className="text-xl font-bold">{tokenName}</p>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm text-gray-500">Auction initial Supply</h4>
            <p className="text-xl font-bold">{initialTokenSupply.toLocaleString()} {tokenName}</p>
            <p className="text-l text-gray-500">(total supply {totalTokenSupply.toLocaleString()} {tokenName})</p>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm text-gray-500">Remaining Supply</h4>
            <p className="text-xl font-bold">{currentTokenSupply.toLocaleString()} {tokenName}</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className="bg-purple-600 h-2.5 rounded-full" 
                style={{ width: `${(currentTokenSupply / initialTokenSupply) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenInfo;
