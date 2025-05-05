import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LockIcon } from "lucide-react";

const NoConfidentialTokensMessage = () => {
  return (
    <Card className="w-full border bg-card/60 backdrop-blur-xs">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <LockIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium">No Confidential Tokens</h3>
          <p className="text-muted-foreground max-w-xs">
            You don't have any confidential tokens. You can swap regular tokens
            for confidential tokens in the Swap page.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => (window.location.href = "/swap")}
          >
            Go to Swap
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoConfidentialTokensMessage;
