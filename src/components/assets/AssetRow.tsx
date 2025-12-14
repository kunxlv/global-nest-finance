import { useState } from "react";
import { Asset, RecurringPayment } from "@/lib/supabase";
import { formatCurrency, CurrencyCode } from "@/lib/currencyConversion";
import { useCurrency } from "@/contexts/CurrencyContext";
import { 
  Banknote, TrendingUp, Coins, Building2, Gem, Package, 
  ChevronDown, Pencil, Trash, Bell, Target, Calendar, User, MapPin 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

// Country flag mapping
const COUNTRY_FLAGS: Record<string, string> = {
  "India": "🇮🇳",
  "USA": "🇺🇸",
  "Ireland": "🇮🇪",
  "UAE": "🇦🇪",
  "UK": "🇬🇧",
  "Germany": "🇩🇪",
  "Singapore": "🇸🇬",
  "Australia": "🇦🇺",
  "Canada": "🇨🇦",
};

interface AssetRowProps {
  asset: Asset;
  linkedPayments?: RecurringPayment[];
  linkedGoal?: { id: string; title: string } | null;
  onEdit: () => void;
  onDelete: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function AssetRow({
  asset,
  linkedPayments = [],
  linkedGoal,
  onEdit,
  onDelete,
  isFirst,
  isLast
}: AssetRowProps) {
  const [expanded, setExpanded] = useState(false);
  const { convertToDisplayCurrency, formatCurrency: formatDisplayCurrency, displayCurrency } = useCurrency();
  
  const Icon = ASSET_ICONS[asset.type] || ASSET_ICONS.OTHER;
  const originalAmount = Number(asset.valuation);
  const convertedAmount = convertToDisplayCurrency(originalAmount, asset.currency as CurrencyCode);
  const showConverted = asset.currency !== displayCurrency;
  const countryFlag = asset.country ? COUNTRY_FLAGS[asset.country] || "🌍" : null;

  return (
    <div className={cn(
      "group",
      isFirst && "rounded-t-2xl",
      isLast && !expanded && "rounded-b-2xl",
      expanded && isLast && "rounded-b-none"
    )}>
      {/* Main Row - Collapsed State */}
      <div 
        className={cn(
          "flex items-center gap-3 px-4 py-3 cursor-pointer",
          "transition-colors duration-200",
          "hover:bg-muted/40",
          expanded && "bg-muted/30",
          isFirst && "rounded-t-2xl",
          !expanded && isLast && "rounded-b-2xl"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-card-foreground truncate">
            {asset.description}
          </p>
        </div>

        {/* Type Badge */}
        <Badge variant="secondary" className="hidden sm:flex text-xs font-medium shrink-0">
          {asset.type.replace("_", " ")}
        </Badge>

        {/* Country Tag */}
        {countryFlag && (
          <Badge variant="outline" className="hidden md:flex text-xs shrink-0 bg-transparent border-border/50">
            <span className="mr-1">{countryFlag}</span>
            <span className="text-muted-foreground">{asset.country}</span>
          </Badge>
        )}

        {/* Holder Tag */}
        {asset.holder && (
          <Badge variant="outline" className="hidden lg:flex text-xs shrink-0 bg-transparent border-border/50">
            <User className="w-3 h-3 mr-1 text-muted-foreground" />
            <span className="text-muted-foreground">{asset.holder}</span>
          </Badge>
        )}

        {/* Values */}
        <div className="text-right shrink-0 min-w-[120px]">
          <p className="font-semibold text-sm text-card-foreground">
            {formatCurrency(originalAmount, asset.currency as CurrencyCode)}
          </p>
          {showConverted && (
            <p className="text-xs text-muted-foreground">
              ≈ {formatDisplayCurrency(convertedAmount)}
            </p>
          )}
        </div>

        {/* Expand Chevron */}
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0",
            expanded && "rotate-180"
          )} 
        />
      </div>

      {/* Divider */}
      {!isLast && !expanded && (
        <div className="mx-4 border-b border-border/30" />
      )}

      {/* Expanded State */}
      {expanded && (
        <div className={cn(
          "bg-muted/20 border-t border-border/30 px-4 py-4",
          isLast && "rounded-b-2xl"
        )}>
          {/* Secondary Details */}
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
            {/* Mobile-only badges */}
            <Badge variant="secondary" className="sm:hidden text-xs font-medium">
              {asset.type.replace("_", " ")}
            </Badge>
            
            {countryFlag && (
              <div className="md:hidden flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span>{countryFlag} {asset.country}</span>
              </div>
            )}
            
            {asset.holder && (
              <div className="lg:hidden flex items-center gap-1 text-muted-foreground">
                <User className="w-3.5 h-3.5" />
                <span>{asset.holder}</span>
              </div>
            )}

            {asset.purchase_date && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>Purchased: {new Date(asset.purchase_date).toLocaleDateString()}</span>
              </div>
            )}

            {linkedGoal && (
              <Badge className="text-xs bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/20 border-0">
                <Target className="w-3 h-3 mr-1" />
                {linkedGoal.title}
              </Badge>
            )}

            {linkedPayments.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Bell className="w-3 h-3 mr-1" />
                {linkedPayments.length} linked payment{linkedPayments.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="h-8 text-xs"
            >
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/50"
            >
              <Trash className="w-3.5 h-3.5 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Divider after expanded */}
      {expanded && !isLast && (
        <div className="mx-4 border-b border-border/30" />
      )}
    </div>
  );
}