import { useState } from "react";
import { Asset, RecurringPayment } from "@/lib/supabase";
import { formatCurrency, CurrencyCode } from "@/lib/currencyConversion";
import { useCurrency } from "@/contexts/CurrencyContext";
import { 
  Banknote, TrendingUp, Coins, Building2, Gem, Package, 
  ChevronDown, Pencil, Trash, Bell, Target, Calendar, User, MapPin,
  RefreshCw, Check, X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import AssetValueChart from "./AssetValueChart";

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
  onQuickUpdate?: (newValuation: number) => Promise<void>;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function AssetRow({
  asset,
  linkedPayments = [],
  linkedGoal,
  onEdit,
  onDelete,
  onQuickUpdate,
  isFirst,
  isLast
}: AssetRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [quickUpdateOpen, setQuickUpdateOpen] = useState(false);
  const [quickUpdateValue, setQuickUpdateValue] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { convertToDisplayCurrency, formatCurrency: formatDisplayCurrency, displayCurrency } = useCurrency();
  
  const Icon = ASSET_ICONS[asset.type] || ASSET_ICONS.OTHER;
  const originalAmount = Number(asset.valuation);
  const convertedAmount = convertToDisplayCurrency(originalAmount, asset.currency as CurrencyCode);
  const showConverted = asset.currency !== displayCurrency;
  const countryFlag = asset.country ? COUNTRY_FLAGS[asset.country] || "🌍" : null;

  const handleQuickUpdate = async () => {
    const newValue = parseFloat(quickUpdateValue);
    if (isNaN(newValue) || newValue < 0 || !onQuickUpdate) return;
    
    setIsUpdating(true);
    try {
      await onQuickUpdate(newValue);
      setQuickUpdateOpen(false);
      setQuickUpdateValue("");
    } finally {
      setIsUpdating(false);
    }
  };

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

          {/* Value History Chart */}
          <div className="mb-4">
            <AssetValueChart assetId={asset.id} assetCurrency={asset.currency} />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onQuickUpdate && (
              <Popover open={quickUpdateOpen} onOpenChange={setQuickUpdateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickUpdateValue(asset.valuation.toString());
                    }}
                    className="h-8 text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Quick Update
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-64 p-3" 
                  align="start"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Update Valuation</p>
                      <p className="text-xs text-muted-foreground">
                        Current: {formatCurrency(originalAmount, asset.currency as CurrencyCode)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{asset.currency}</span>
                      <Input
                        type="number"
                        value={quickUpdateValue}
                        onChange={(e) => setQuickUpdateValue(e.target.value)}
                        placeholder="New value"
                        className="h-8 text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="flex-1 h-8"
                        onClick={handleQuickUpdate}
                        disabled={isUpdating || !quickUpdateValue || parseFloat(quickUpdateValue) < 0}
                      >
                        {isUpdating ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => {
                          setQuickUpdateOpen(false);
                          setQuickUpdateValue("");
                        }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
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