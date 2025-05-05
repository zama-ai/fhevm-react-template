
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bid } from "@/types/bidTypes";
import { format, formatDistanceToNow } from "date-fns";

interface BidHistoryProps {
  bids: Bid[];
  tokenName: string;
  paymentTokenSymbol: string;
}

const BidHistory = ({ bids, tokenName, paymentTokenSymbol }: BidHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Recent Bids</CardTitle>
      </CardHeader>
      <CardContent>
        {bids.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bidder</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...bids].reverse().map((bid, index) => (
                <TableRow key={index}>
                  <TableCell>{bid.address}</TableCell>
                  <TableCell>{/*bid.amount*/}(encrypted) {paymentTokenSymbol}</TableCell>
                  <TableCell>{/*bid.tokens*/}(encrypted) {tokenName}</TableCell>
                  <TableCell><time dateTime={format(bid.timestamp, 'yyyy-MM-dd')}>{formatDistanceToNow(bid.timestamp, { addSuffix: true })}</time></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>No bids yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BidHistory;
