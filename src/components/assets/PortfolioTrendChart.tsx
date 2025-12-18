import { useState } from "react";
import { usePortfolioHistory } from "@/hooks/useAssetHistory";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown, Minus, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PERIODS = ["1M", "3M", "6M", "1Y", "ALL"] as const;
type Period = typeof PERIODS[number];

export default function PortfolioTrendChart() {
  const [period, setPeriod] = useState<Period>("ALL");
  const { dataPoints, isLoading, error } = usePortfolioHistory(period);
  const { formatCurrency } = useCurrency();

  // Calculate percentage change
  const firstValue = dataPoints.length > 0 ? dataPoints[0].value : null;
  const lastValue = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].value : null;
  const percentageChange = firstValue && lastValue && firstValue !== 0
    ? ((lastValue - firstValue) / firstValue) * 100
    : null;

  const isPositive = percentageChange !== null && percentageChange > 0;
  const isNegative = percentageChange !== null && percentageChange < 0;
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  if (isLoading) {
    return (
      <div className="bg-card rounded-3xl p-5 border border-border/50">
        <div className="h-48 animate-pulse bg-muted/30 rounded-xl" />
      </div>
    );
  }

  if (error || dataPoints.length < 2) {
    return (
      <div className="bg-card rounded-3xl p-5 border border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center">
            <LineChart className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Portfolio Value Over Time</span>
        </div>
        <div className="h-32 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Not enough historical data</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Update your assets to start tracking portfolio trends
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl p-5 border border-border/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center">
            <LineChart className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Portfolio Value Over Time</span>
            {percentageChange !== null && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium mt-0.5",
                isPositive && "text-[hsl(var(--success))]",
                isNegative && "text-destructive",
                !isPositive && !isNegative && "text-muted-foreground"
              )}>
                <TrendIcon className="w-3 h-3" />
                <span>{isPositive ? "+" : ""}{percentageChange.toFixed(1)}% over period</span>
              </div>
            )}
          </div>
        </div>

        {/* Period selector */}
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
          {PERIODS.map((p) => (
            <Button
              key={p}
              variant="ghost"
              size="sm"
              onClick={() => setPeriod(p)}
              className={cn(
                "h-7 px-2.5 text-xs rounded-lg",
                period === p 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dataPoints} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
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
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                return value.toString();
              }}
              width={45}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                      <p className="text-xs text-muted-foreground">{data.date}</p>
                      <p className="text-sm font-semibold text-popover-foreground">
                        {formatCurrency(data.value)}
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
              fill="url(#portfolioGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
