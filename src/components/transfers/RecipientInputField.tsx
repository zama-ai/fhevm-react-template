
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RecipientInputFieldProps {
  recipient: string;
  setRecipient: (value: string) => void;
  isPending: boolean;
}

const RecipientInputField = ({
  recipient,
  setRecipient,
  isPending
}: RecipientInputFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="recipient">Recipient Address</Label>
      <Input
        name="recipient"
        id="recipient"
        placeholder="0x..."
        value={recipient}
        onChange={e => setRecipient(e.target.value)}
        disabled={isPending}
      />
    </div>
  );
};

export default RecipientInputField;
