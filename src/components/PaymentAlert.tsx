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
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaymentHistory, RecurringPayment } from "@/lib/supabase";

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
  const isDueThisWeek = daysUntilDue > 3 && daysUntilDue <= 7;

  const urgencyColor = isOverdue 
    ? "text-destructive" 
    : isDueSoon 
    ? "text-[hsl(45,93%,47%)]" 
    : "text-muted-foreground";

  const bgColor = isOverdue
    ? "bg-destructive/5 border-destructive/20"
    : isDueSoon
    ? "bg-[hsl(45,93%,47%)]/5 border-[hsl(45,93%,47%)]/20"
    : "bg-muted/50 border-border";

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
    return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
  };

  const getDueDateText = () => {
    if (isOverdue) {
      return `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`;
    } else if (daysUntilDue === 0) {
      return "Due today";
    } else if (daysUntilDue === 1) {
      return "Due tomorrow";
    } else {
      return `Due in ${daysUntilDue} days`;
    }
  };

  return (
    <div className="bg-muted/50 rounded-2xl p-6 border border-border/30 shadow-md transition-all duration-200 hover:shadow-lg">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn("p-2.5 rounded-xl bg-card shadow-sm", urgencyColor)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-secondary-foreground line-clamp-1">
                {payment.recurring_payment.name}
              </h3>
              <Badge variant="secondary" className="text-xs mt-1 bg-secondary/50 text-muted-foreground border-0">
                {categoryLabels[payment.recurring_payment.category as keyof typeof categoryLabels]}
              </Badge>
            </div>
          </div>
        </div>

        {/* Amount - Large value */}
        <div>
          <p className="text-3xl font-semibold tracking-tight text-secondary-foreground">
            {formatCurrency(Number(payment.amount), payment.currency)}
          </p>
        </div>

        {/* Due Date Section */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <Clock className={cn("w-4 h-4", urgencyColor)} />
            <span className={cn("font-medium", urgencyColor)}>
              {getDueDateText()}
            </span>
          </div>
          <span className="font-medium text-muted-foreground">
            {format(new Date(payment.due_date), "MMM d, yyyy")}
          </span>
        </div>

        {payment.status === "UPCOMING" && onMarkPaid && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs rounded-xl"
            onClick={() => onMarkPaid(payment.id)}
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Mark as Paid
          </Button>
        )}
      </div>
    </div>
  );
}
