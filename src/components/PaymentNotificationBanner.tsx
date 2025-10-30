import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";

interface PaymentNotificationBannerProps {
  overdueCount: number;
  dueTodayCount: number;
}

export default function PaymentNotificationBanner({ 
  overdueCount, 
  dueTodayCount 
}: PaymentNotificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if ((overdueCount === 0 && dueTodayCount === 0) || dismissed) {
    return null;
  }

  const totalAlerts = overdueCount + dueTodayCount;

  return (
    <div className={cn(
      "mb-6 rounded-2xl border p-4 flex items-start gap-3",
      overdueCount > 0 
        ? "bg-destructive/5 border-destructive/20" 
        : "bg-[hsl(45,93%,47%)]/5 border-[hsl(45,93%,47%)]/20"
    )}>
      <AlertCircle className={cn(
        "w-5 h-5 mt-0.5",
        overdueCount > 0 ? "text-destructive" : "text-[hsl(45,93%,47%)]"
      )} />
      
      <div className="flex-1">
        <h3 className="font-semibold text-sm mb-1">
          {overdueCount > 0 ? "Payment Alerts" : "Upcoming Payments"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {overdueCount > 0 && (
            <span className="text-destructive font-medium">
              {overdueCount} overdue payment{overdueCount !== 1 ? 's' : ''}
            </span>
          )}
          {overdueCount > 0 && dueTodayCount > 0 && <span> and </span>}
          {dueTodayCount > 0 && (
            <span className="text-[hsl(45,93%,47%)] font-medium">
              {dueTodayCount} due today
            </span>
          )}
        </p>
        <Link to="/payments">
          <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">
            View All Payments
          </Button>
        </Link>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={() => setDismissed(true)}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
