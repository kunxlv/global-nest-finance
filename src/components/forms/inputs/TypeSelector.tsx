import { cn } from "@/lib/utils";
import { 
  Banknote, 
  TrendingUp, 
  Bitcoin, 
  Coins, 
  Building2, 
  Package,
  CreditCard,
  Home,
  FileText,
  Receipt,
  Tv,
  Shield,
  Zap,
  DoorOpen,
  PiggyBank,
  MoreHorizontal
} from "lucide-react";

type AssetType = "CASH" | "EQUITY" | "CRYPTO" | "GOLD" | "REAL_ESTATE" | "OTHER";
type LiabilityType = "LOAN" | "MORTGAGE" | "CREDIT_CARD" | "OTHER";
type PaymentCategory = "SIP" | "CREDIT_CARD_BILL" | "LOAN_INSTALLMENT" | "SUBSCRIPTION" | "INSURANCE" | "UTILITY" | "RENT" | "OTHER";

interface TypeOption<T> {
  value: T;
  label: string;
  icon: React.ReactNode;
}

const assetTypes: TypeOption<AssetType>[] = [
  { value: "CASH", label: "Cash", icon: <Banknote className="h-5 w-5" /> },
  { value: "EQUITY", label: "Equity", icon: <TrendingUp className="h-5 w-5" /> },
  { value: "CRYPTO", label: "Crypto", icon: <Bitcoin className="h-5 w-5" /> },
  { value: "GOLD", label: "Gold", icon: <Coins className="h-5 w-5" /> },
  { value: "REAL_ESTATE", label: "Property", icon: <Building2 className="h-5 w-5" /> },
  { value: "OTHER", label: "Other", icon: <Package className="h-5 w-5" /> },
];

const liabilityTypes: TypeOption<LiabilityType>[] = [
  { value: "LOAN", label: "Loan", icon: <FileText className="h-5 w-5" /> },
  { value: "MORTGAGE", label: "Mortgage", icon: <Home className="h-5 w-5" /> },
  { value: "CREDIT_CARD", label: "Credit Card", icon: <CreditCard className="h-5 w-5" /> },
  { value: "OTHER", label: "Other", icon: <Package className="h-5 w-5" /> },
];

const paymentCategories: TypeOption<PaymentCategory>[] = [
  { value: "SIP", label: "SIP", icon: <PiggyBank className="h-5 w-5" /> },
  { value: "CREDIT_CARD_BILL", label: "Card Bill", icon: <CreditCard className="h-5 w-5" /> },
  { value: "LOAN_INSTALLMENT", label: "Loan EMI", icon: <FileText className="h-5 w-5" /> },
  { value: "SUBSCRIPTION", label: "Subscription", icon: <Tv className="h-5 w-5" /> },
  { value: "INSURANCE", label: "Insurance", icon: <Shield className="h-5 w-5" /> },
  { value: "UTILITY", label: "Utility", icon: <Zap className="h-5 w-5" /> },
  { value: "RENT", label: "Rent", icon: <DoorOpen className="h-5 w-5" /> },
  { value: "OTHER", label: "Other", icon: <MoreHorizontal className="h-5 w-5" /> },
];

interface TypeSelectorProps<T extends string> {
  type: "asset" | "liability" | "payment";
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function TypeSelector<T extends string>({ 
  type, 
  value, 
  onChange,
  className 
}: TypeSelectorProps<T>) {
  const options = type === "asset" 
    ? assetTypes 
    : type === "liability" 
      ? liabilityTypes 
      : paymentCategories;

  const gridCols = type === "payment" ? "grid-cols-4" : "grid-cols-3";

  return (
    <div className={cn("grid gap-2", gridCols, className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value as T)}
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
            "hover:border-foreground/20 hover:bg-muted/50",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            value === option.value
              ? "border-foreground bg-foreground text-background shadow-md"
              : "border-border bg-background text-muted-foreground"
          )}
        >
          <span className={cn(
            "transition-transform duration-200",
            value === option.value && "scale-110"
          )}>
            {option.icon}
          </span>
          <span className="text-xs font-medium">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
