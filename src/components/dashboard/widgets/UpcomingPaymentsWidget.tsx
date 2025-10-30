import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import PaymentAlert from "@/components/PaymentAlert";
import { supabase, PaymentHistory, RecurringPayment } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type PaymentWithRecurring = PaymentHistory & {
  recurring_payment: RecurringPayment;
};

export function UpcomingPaymentsWidget() {
  const [upcomingPayments, setUpcomingPayments] = useState<PaymentWithRecurring[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    const fetchUpcoming = async () => {
      const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { data } = await supabase
        .from("payment_history")
        .select("*, recurring_payment:recurring_payments(*)")
        .eq("user_id", user.id)
        .eq("status", "UPCOMING")
        .lte("due_date", sevenDaysLater)
        .order("due_date", { ascending: true })
        .limit(3);

      if (data) setUpcomingPayments(data as PaymentWithRecurring[]);
    };

    fetchUpcoming();
  }, [user]);

  const handleMarkAsPaid = async (historyId: string) => {
    const { error } = await supabase
      .from("payment_history")
      .update({ status: "PAID", paid_date: new Date().toISOString().split('T')[0] })
      .eq("id", historyId);

    if (error) {
      toast.error("Failed to mark payment as paid");
    } else {
      toast.success("Payment marked as paid");
      setUpcomingPayments(prev => prev.filter(p => p.id !== historyId));
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold">Upcoming Payments</h2>
        <Link to="/payments">
          <Button variant="ghost" size="sm" className="text-xs hover:underline">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
      {upcomingPayments.length === 0 ? (
        <p className="text-muted-foreground text-sm">No upcoming payments in the next 7 days</p>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
          {upcomingPayments.map((payment) => (
            <PaymentAlert key={payment.id} payment={payment} onMarkPaid={handleMarkAsPaid} />
          ))}
        </div>
      )}
    </div>
  );
}