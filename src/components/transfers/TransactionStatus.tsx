
interface TransactionStatusProps {
  hash?: `0x${string}`;
  isConfirmed: boolean;
}

const TransactionStatus = ({ hash, isConfirmed }: TransactionStatusProps) => {
  if (!hash || isConfirmed) return null;
  
  return (
    <div className="flex items-center gap-2 text-sm text-primary rounded-md p-2 bg-primary/10">
      <p>
        Transaction submitted: {hash.slice(0, 6)}...{hash.slice(-4)}
      </p>
    </div>
  );
};

export default TransactionStatus;
