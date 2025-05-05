
import { AlertCircle } from "lucide-react";

interface TransferFormErrorProps {
  message: string;
}

const TransferFormError = ({ message }: TransferFormErrorProps) => {
  if (!message) return null;
  
  return (
    <div className="flex items-center gap-2 text-sm text-destructive rounded-md p-2 bg-destructive/10">
      <AlertCircle className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
};

export default TransferFormError;
