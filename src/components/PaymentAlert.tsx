import { format, differenceInDays } from "date-fns";
import { 
  TrendingUp, 
  CreditCard, 
  Banknote, 
  Repeat, 
  Shield, 
  Zap, 
  Home, 
  CircleDollarSign,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PaymentHistory, RecurringPayment } from "@/lib/supabase";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PaymentAlertProps {
  payment: PaymentHistory & { recurring_payment: RecurringPayment };
  onMarkPaid?: (id: string) => void;
}

const categoryIcons = {
  SIP: TrendingUp,
  CREDIT_CARD_BILL: CreditCard,
  LOAN_INSTALLMENT: Banknote,
  SUBSCRIPTION: Repeat,
  INSURANCE: Shield,
  UTILITY: Zap,
  RENT: Home,
  OTHER: CircleDollarSign,
};

const categoryLabels = {
  SIP: "SIP",
  CREDIT_CARD_BILL: "Credit Card",
  LOAN_INSTALLMENT: "Loan EMI",
  SUBSCRIPTION: "Subscription",
  INSURANCE: "Insurance",
  UTILITY: "Utility",
  RENT: "Rent",
  OTHER: "Other",
};

export default function PaymentAlert({ payment, onMarkPaid }: PaymentAlertProps) {
  const Icon = categoryIcons[payment.recurring_payment.category as keyof typeof categoryIcons];
  const daysUntilDue = differenceInDays(new Date(payment.due_date), new Date());
  
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3;

  const urgencyConfig = isOverdue 
    ? { color: "bg-destructive", textColor: "text-destructive", label: "Overdue" }
    : isDueSoon 
    ? { color: "bg-[hsl(45,93%,47%)]", textColor: "text-[hsl(45,93%,47%)]", label: "Due Soon" }
    : { color: "bg-muted-foreground", textColor: "text-muted-foreground", label: "Upcoming" };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      INR: "₹",
      JPY: "¥",
      AUD: "A$",
      CAD: "C$",
    };
    return `${symbols[currency] || currency}${amount.toLocaleString()}`;
  };

  const getDueDateText = () => {
    if (isOverdue) {
      return `${Math.abs(daysUntilDue)}d overdue`;
    } else if (daysUntilDue === 0) {
      return "Today";
    } else if (daysUntilDue === 1) {
      return "Tomorrow";
    } else {
      return `${daysUntilDue}d left`;
    }
  };

  return (
    <div className="card-muted p-4">
      <div className="flex items-center gap-4">
        {/* Icon with urgency indicator */}
        <div className="relative shrink-0">
          <div className="p-2.5 rounded-2xl bg-card shadow-sm text-muted-foreground">
            <Icon className="w-5 h-5" />
          </div>
          {/* Urgency dot */}
          <div className={cn(
            "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-muted/50",
            urgencyConfig.color
          )} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-medium text-sm text-secondary-foreground truncate">
                {payment.recurring_payment.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {categoryLabels[payment.recurring_payment.category as keyof typeof categoryLabels]}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-sm text-secondary-foreground">
                {formatCurrency(Number(payment.amount), payment.currency)}
              </p>
              <p className={cn("text-xs font-medium mt-0.5", urgencyConfig.textColor)}>
                {getDueDateText()}
              </p>
            </div>
          </div>
        </div>

        {/* Action with tooltip */}
        {payment.status === "UPCOMING" && onMarkPaid && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0 h-8 w-8 rounded-2xl hover:bg-card"
                  onClick={() => onMarkPaid(payment.id)}
                >
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="bg-card text-card-foreground border border-border/30 shadow-lg px-3 py-1.5 text-xs font-medium rounded-xl"
              >
                Mark as Paid
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
