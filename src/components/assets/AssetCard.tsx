import { useState } from "react";
import { Asset, RecurringPayment } from "@/lib/supabase";
import { formatCurrency, CurrencyCode } from "@/lib/currencyConversion";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Banknote, TrendingUp, Coins, Building2, Gem, Package, ChevronDown, ChevronUp, MoreVertical, Pencil, Trash, Bell, Target, Calendar, User, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Asset type icons
const ASSET_ICONS: Record<string, React.ElementType> = {
  CASH: Banknote,
  EQUITY: TrendingUp,
  CRYPTO: Coins,
  GOLD: Gem,
  REAL_ESTATE: Building2,
  OTHER: Package
};
interface AssetCardProps {
  asset: Asset;
  linkedPayments?: RecurringPayment[];
  linkedGoal?: {
    id: string;
    title: string;
  } | null;
  onEdit: () => void;
  onDelete: () => void;
}
export default function AssetCard({
  asset,
  linkedPayments = [],
  linkedGoal,
  onEdit,
  onDelete
}: AssetCardProps) {
  const [expanded, setExpanded] = useState(false);
  const {
    convertToDisplayCurrency,
    formatCurrency: formatDisplayCurrency,
    displayCurrency
  } = useCurrency();
  const Icon = ASSET_ICONS[asset.type] || ASSET_ICONS.OTHER;
  const originalAmount = Number(asset.valuation);
  const convertedAmount = convertToDisplayCurrency(originalAmount, asset.currency as CurrencyCode);
  const showConverted = asset.currency !== displayCurrency;
  return <div className={cn("group relative bg-card rounded-3xl border border-border/50 shadow-xl overflow-hidden", "transition-all duration-300 ease-out", "hover:shadow-2xl hover:shadow-black/5 hover:border-border hover:-translate-y-0.5", expanded && "ring-1 ring-primary/10")}>
      <div className="p-5 rounded-3xl">
        {/* Main content row */}
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
            <Icon className="w-6 h-6 text-muted-foreground" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                {/* Asset name and country */}
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate text-secondary-foreground">{asset.description}</h3>
                </div>

                {/* Tags row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs font-medium">
                    {asset.type.replace("_", " ")}
                  </Badge>
                  {asset.holder && <Badge variant="outline" className="text-xs text-muted-foreground">
                      <User className="w-3 h-3 mr-1" />
                      {asset.holder}
                    </Badge>}
                  {linkedGoal && <Badge className="text-xs bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/20 border-0">
                      <Target className="w-3 h-3 mr-1" />
                      {linkedGoal.title}
                    </Badge>}
                  {linkedPayments.length > 0 && <Badge variant="secondary" className="text-xs">
                      <Bell className="w-3 h-3 mr-1" />
                      {linkedPayments.length} payment{linkedPayments.length !== 1 ? "s" : ""}
                    </Badge>}
                </div>

                {/* Valuation */}
                <div className="space-y-0.5">
                  <p className="text-2xl font-bold tracking-tight text-secondary-foreground">
                    {formatCurrency(originalAmount, asset.currency as CurrencyCode)}
                  </p>
                  {showConverted && <p className="text-sm text-muted-foreground">≈ {formatDisplayCurrency(convertedAmount)}</p>}
                </div>
              </div>

              {/* Actions menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>;
}