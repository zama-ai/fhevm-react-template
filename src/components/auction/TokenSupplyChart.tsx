import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface TokenSupplyChartProps {
  data: Array<{ time: string; tokens: number }>;
  tokenName: string;
  initialTokenSupply: number;
}

const TokenSupplyChart = ({
  data,
  tokenName,
  initialTokenSupply,
}: TokenSupplyChartProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          Token Supply Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[430px] w-full">
          <ChartContainer
            config={{
              tokens: { color: "#4f46e5" },
            }}
          >
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis
                domain={[0, initialTokenSupply * 1.1]}
                tickFormatter={(value) => `${value} ${tokenName}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border rounded shadow-md">
                        <p className="text-sm">{`Time: ${payload[0].payload.time}`}</p>
                        <p className="text-sm font-semibold">{`Tokens: ${payload[0].value} ${tokenName}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="tokens"
                stroke="#4f46e5"
                fill="#4f46e5"
                fillOpacity={0.3}
                name={`Available ${tokenName}`}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenSupplyChart;
