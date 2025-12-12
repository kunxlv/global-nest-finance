import { Asset } from "@/lib/supabase";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CurrencyCode } from "@/lib/currencyConversion";
import { Banknote, TrendingUp, Coins, Building2, Gem, Package, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
const ASSET_ICONS: Record<string, React.ElementType> = {
  CASH: Banknote,
  EQUITY: TrendingUp,
  CRYPTO: Coins,
  GOLD: Gem,
  REAL_ESTATE: Building2,
  OTHER: Package
};
const ASSET_COLORS: Record<string, string> = {
  CASH: "bg-primary",
  EQUITY: "bg-primary/80",
  CRYPTO: "bg-primary/60",
  GOLD: "bg-primary/45",
  REAL_ESTATE: "bg-primary/30",
  OTHER: "bg-primary/20"
};
interface AssetSummaryProps {
  assets: Asset[];
  isLoading: boolean;
}
export default function AssetSummary({
  assets,
  isLoading
}: AssetSummaryProps) {
  const {
    convertToDisplayCurrency,
    formatCurrency
  } = useCurrency();

  // Calculate totals
  const totalValue = assets.reduce((sum, asset) => {
    const converted = convertToDisplayCurrency(Number(asset.valuation), asset.currency as CurrencyCode);
    return sum + converted;
  }, 0);

  // Group by type
  const assetsByType = assets.reduce((acc, asset) => {
    const type = asset.type;
    if (!acc[type]) {
      acc[type] = {
        count: 0,
        value: 0
      };
    }
    acc[type].count += 1;
    acc[type].value += convertToDisplayCurrency(Number(asset.valuation), asset.currency as CurrencyCode);
    return acc;
  }, {} as Record<string, {
    count: number;
    value: number;
  }>);

  // Get distribution for chart
  const distribution = Object.entries(assetsByType).map(([type, data]) => ({
    type,
    value: data.value,
    count: data.count,
    percentage: totalValue > 0 ? data.value / totalValue * 100 : 0
  })).sort((a, b) => b.value - a.value);
  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => <div key={i} className="bg-card rounded-2xl p-6 border border-border/50 animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mb-3" />
            <div className="h-8 bg-muted rounded w-32" />
          </div>)}
      </div>;
  }
  return <div className="space-y-6 mb-8">
      {/* Main summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets Card */}
        <div className="bg-card rounded-3xl p-5 border border-border/50 col-span-1 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center">
              <Wallet className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total Assets</span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-secondary-foreground">
            {formatCurrency(totalValue)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {assets.length} asset{assets.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Top 3 asset types */}
        {distribution.slice(0, 3).map(item => {
        const Icon = ASSET_ICONS[item.type] || Package;
        return <div key={item.type} className="bg-card rounded-3xl p-5 border border-border/50 hover:border-border transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {item.type.replace("_", " ")}
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight text-secondary-foreground">
                {formatCurrency(item.value)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {item.percentage.toFixed(1)}% • {item.count} asset{item.count !== 1 ? "s" : ""}
              </p>
            </div>;
      })}
      </div>

      {/* Distribution bar */}
      {distribution.length > 0 && <div className="bg-card rounded-3xl p-5 border border-border/50">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Asset Distribution</h3>
          
          {/* Visual bar */}
          <div className="h-2.5 rounded-full overflow-hidden flex bg-muted mb-4">
            {distribution.map((item, index) => <div key={item.type} className={cn(ASSET_COLORS[item.type], "transition-all duration-500")} style={{
          width: `${item.percentage}%`
        }} title={`${item.type}: ${item.percentage.toFixed(1)}%`} />)}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4">
            {distribution.map(item => {
          return <div key={item.type} className="flex items-center gap-2">
                  <div className={cn("w-2.5 h-2.5 rounded-full", ASSET_COLORS[item.type])} />
                  <span className="text-sm text-muted-foreground">
                    {item.type.replace("_", " ")} ({item.percentage.toFixed(0)}%)
                  </span>
                </div>;
        })}
          </div>
        </div>}
    </div>;
}