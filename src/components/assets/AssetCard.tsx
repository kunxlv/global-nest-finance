import { useState } from "react";
import { Asset, RecurringPayment } from "@/lib/supabase";
import { formatCurrency, CurrencyCode } from "@/lib/currencyConversion";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Banknote,
  TrendingUp,
  Coins,
  Building2,
  Gem,
  Package,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Pencil,
  Trash,
  Bell,
  Target,
  Calendar,
  User,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Country flag mapping
const COUNTRY_FLAGS: Record<string, string> = {
  India: "🇮🇳",
  USA: "🇺🇸",
  Ireland: "🇮🇪",
  UAE: "🇦🇪",
  UK: "🇬🇧",
  Germany: "🇩🇪",
  France: "🇫🇷",
  Japan: "🇯🇵",
  Australia: "🇦🇺",
  Canada: "🇨🇦",
  Singapore: "🇸🇬",
  Switzerland: "🇨🇭",
};

// Asset type icons and colors
const ASSET_CONFIG: Record<string, { icon: React.ElementType; gradient: string; bgColor: string }> = {
  CASH: {
    icon: Banknote,
    gradient: "from-emerald-500/20 to-emerald-600/10",
    bgColor: "bg-emerald-500/10",
  },
  EQUITY: {
    icon: TrendingUp,
    gradient: "from-blue-500/20 to-blue-600/10",
    bgColor: "bg-blue-500/10",
  },
  CRYPTO: {
    icon: Coins,
    gradient: "from-orange-500/20 to-amber-600/10",
    bgColor: "bg-orange-500/10",
  },
  GOLD: {
    icon: Gem,
    gradient: "from-yellow-500/20 to-yellow-600/10",
    bgColor: "bg-yellow-500/10",
  },
  REAL_ESTATE: {
    icon: Building2,
    gradient: "from-violet-500/20 to-purple-600/10",
    bgColor: "bg-violet-500/10",
  },
  OTHER: {
    icon: Package,
    gradient: "from-slate-500/20 to-slate-600/10",
    bgColor: "bg-slate-500/10",
  },
};

interface AssetCardProps {
  asset: Asset;
  linkedPayments?: RecurringPayment[];
  linkedGoal?: { id: string; title: string } | null;
  onEdit: () => void;
  onDelete: () => void;
}

export default function AssetCard({ asset, linkedPayments = [], linkedGoal, onEdit, onDelete }: AssetCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { convertToDisplayCurrency, formatCurrency: formatDisplayCurrency, displayCurrency } = useCurrency();

  const config = ASSET_CONFIG[asset.type] || ASSET_CONFIG.OTHER;
  const Icon = config.icon;
  const countryFlag = asset.country ? COUNTRY_FLAGS[asset.country] || "🌍" : null;

  const originalAmount = Number(asset.valuation);
  const convertedAmount = convertToDisplayCurrency(originalAmount, asset.currency as CurrencyCode);
  const showConverted = asset.currency !== displayCurrency;

  return (
    <div
      className={cn(
        "group relative bg-card rounded-2xl border border-border/50 overflow-hidden",
        "transition-all duration-300 ease-out",
        "hover:shadow-xl hover:shadow-black/5 hover:border-border hover:-translate-y-0.5",
        expanded && "ring-1 ring-primary/10",
      )}
    >
      {/* Gradient accent bar */}

      <div className="p-5">
        {/* Main content row */}
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn("flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center", config.bgColor)}>
            <Icon className="w-6 h-6 text-foreground/80" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                {/* Asset name and country */}
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">{asset.description}</h3>
                </div>

                {/* Tags row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs font-medium">
                    {asset.type.replace("_", " ")}
                  </Badge>
                  {asset.holder && (
                    <Badge variant="outline" className="text-xs">
                      <User className="w-3 h-3 mr-1" />
                      {asset.holder}
                    </Badge>
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
                      {linkedPayments.length} payment{linkedPayments.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>

                {/* Valuation */}
                <div className="space-y-0.5">
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {formatCurrency(originalAmount, asset.currency as CurrencyCode)}
                  </p>
                  {showConverted && (
                    <p className="text-sm text-muted-foreground">≈ {formatDisplayCurrency(convertedAmount)}</p>
                  )}
                </div>
              </div>

              {/* Actions menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
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

        {/* Expand button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show details
            </>
          )}
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-3 animate-fade-in">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {asset.purchase_date && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Purchased: {new Date(asset.purchase_date).toLocaleDateString()}</span>
                </div>
              )}
              {asset.country && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{asset.country}</span>
                </div>
              )}
            </div>

            {linkedPayments.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">Linked Payments</p>
                <div className="space-y-1">
                  {linkedPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between text-sm bg-muted/30 rounded-lg px-3 py-2"
                    >
                      <span>{payment.name}</span>
                      <span className="font-medium">
                        {formatCurrency(Number(payment.amount), payment.currency as CurrencyCode)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
