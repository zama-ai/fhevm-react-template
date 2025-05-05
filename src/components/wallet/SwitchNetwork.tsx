import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useWallet } from '@/hooks/useWallet';

const SwitchNetwork = () => {
  const { caipNetwork, switchNetwork, supportedNetworks } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (value: string) => {
    const selectedNetwork = supportedNetworks.find(
      (network) => network.id.toString() === value,
    );
    if (selectedNetwork && switchNetwork) {
      switchNetwork(selectedNetwork);
    } else {
      toast.error('Network switching not available');
    }
  };

  return (
    <Select
      value={caipNetwork?.id?.toString()}
      onValueChange={handleChange}
      disabled={!mounted}
    >
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Select Network" />
      </SelectTrigger>
      <SelectContent>
        {supportedNetworks.map((chain) => (
          <SelectItem key={chain.id} value={chain.id.toString()}>
            {chain.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SwitchNetwork;
