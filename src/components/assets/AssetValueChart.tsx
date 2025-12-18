import { useAssetHistory } from "@/hooks/useAssetHistory";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CurrencyCode } from "@/lib/currencyConversion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssetValueChartProps {
  assetId: string;
  assetCurrency: string;
}

export default function AssetValueChart({ assetId, assetCurrency }: AssetValueChartProps) {
  const { valuations, isLoading, percentageChange, latestValue } = useAssetHistory(assetId);
  const { convertToDisplayCurrency, formatCurrency } = useCurrency();

  if (isLoading) {
    return (
      <div className="h-32 bg-muted/30 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-xs text-muted-foreground">Loading history...</span>
      </div>
    );
  }

  if (valuations.length < 2) {
    return (
      <div className="h-32 bg-muted/30 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Not enough data for chart</p>
          <p className="text-[10px] text-muted-foreground/70 mt-1">Update the asset to start tracking</p>
        </div>
      </div>
    );
  }

  const chartData = valuations.map((v) => ({
    date: new Date(v.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: Number(v.valuation),
    fullDate: new Date(v.recorded_at).toLocaleDateString()
  }));

  const isPositive = percentageChange !== null && percentageChange > 0;
  const isNegative = percentageChange !== null && percentageChange < 0;
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  const displayValue = latestValue 
    ? convertToDisplayCurrency(latestValue, assetCurrency as CurrencyCode)
    : 0;

  return (
    <div className="space-y-3">
      {/* Header with change indicator */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Value History</span>
        {percentageChange !== null && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
            isPositive && "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
            isNegative && "bg-destructive/10 text-destructive",
            !isPositive && !isNegative && "bg-muted text-muted-foreground"
          )}>
            <TrendIcon className="w-3 h-3" />
            <span>{isPositive ? "+" : ""}{percentageChange.toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${assetId}`} x1="0" y1="0" x2="0" y2="1">
                <stop 
                  offset="0%" 
                  stopColor={isNegative ? "hsl(var(--destructive))" : "hsl(var(--primary))"} 
                  stopOpacity={0.3} 
                />
                <stop 
                  offset="100%" 
                  stopColor={isNegative ? "hsl(var(--destructive))" : "hsl(var(--primary))"} 
                  stopOpacity={0} 
                />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              interval="preserveStartEnd"
            />
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                      <p className="text-xs text-muted-foreground">{data.fullDate}</p>
                      <p className="text-sm font-semibold text-popover-foreground">
                        {formatCurrency(convertToDisplayCurrency(data.value, assetCurrency as CurrencyCode))}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={isNegative ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
              strokeWidth={2}
              fill={`url(#gradient-${assetId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
