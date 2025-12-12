import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import GoalCard from "@/components/GoalCard";
import PaymentAlert from "@/components/PaymentAlert";
import PaymentNotificationBanner from "@/components/PaymentNotificationBanner";
import CurrencySelector from "@/components/CurrencySelector";
import CurrencyAmount from "@/components/CurrencyAmount";
import ConversionRate from "@/components/ConversionRate";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bell, Target } from "lucide-react";
import { supabase, PaymentHistory, RecurringPayment, Goal } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useFinancialSummary } from "@/hooks/useFinancialSummary";
import { toast } from "sonner";
import { differenceInDays } from "date-fns";
import { Link } from "react-router-dom";
import { CurrencyCode } from "@/lib/currencyConversion";
type PaymentWithRecurring = PaymentHistory & {
  recurring_payment: RecurringPayment;
};
export default function Dashboard() {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const { totalAssets, totalLiabilities, netWorth, isLoading: summaryLoading } = useFinancialSummary();
  const [upcomingPayments, setUpcomingPayments] = useState<PaymentWithRecurring[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  useEffect(() => {
    if (!user) return;
    const fetchUpcoming = async () => {
      const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const { data } = await supabase
        .from("payment_history")
        .select("*, recurring_payment:recurring_payments(*)")
        .eq("user_id", user.id)
        .eq("status", "UPCOMING")
        .lte("due_date", sevenDaysLater)
        .order("due_date", {
          ascending: true,
        })
        .limit(3);
      if (data) setUpcomingPayments(data as PaymentWithRecurring[]);
    };
    const fetchGoals = async () => {
      const { data } = await supabase.from("goals").select("*").eq("user_id", user.id).order("created_at", {
        ascending: false,
      });
      if (data) setGoals(data);
    };
    fetchUpcoming();
    fetchGoals();
  }, [user]);
  const handleMarkAsPaid = async (historyId: string) => {
    const { error } = await supabase
      .from("payment_history")
      .update({
        status: "PAID",
        paid_date: new Date().toISOString().split("T")[0],
      })
      .eq("id", historyId);
    if (error) {
      toast.error("Failed to mark payment as paid");
    } else {
      toast.success("Payment marked as paid");
      setUpcomingPayments((prev) => prev.filter((p) => p.id !== historyId));
    }
  };
  const overdueCount = upcomingPayments.filter((p) => differenceInDays(new Date(p.due_date), new Date()) < 0).length;
  const dueTodayCount = upcomingPayments.filter((p) => differenceInDays(new Date(p.due_date), new Date()) === 0).length;
  return (
    <Layout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Dashboard.</h1>
          <div className="flex items-center gap-3">
            <ConversionRate />
            <CurrencySelector />
          </div>
        </div>

        {/* Balance Section */}
        <div className="card-section">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8 shadow-none">
            <h2 className="text-2xl sm:text-3xl font-semibold text-card-foreground">Balance</h2>

            <Button variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              View Alerts
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Net Worth Card */}
            <div className="card-muted p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-medium tracking-widest text-muted-foreground">NET WORTH</p>
                {/* <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium">NET WORTH</span> */}
              </div>
              <p className="text-4xl sm:text-5xl font-bold text-card-foreground tracking-tight">
                {summaryLoading ? "..." : formatCurrency(netWorth)}
              </p>

              <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium tracking-widest text-muted-foreground mb-1">ASSETS</p>
                  <p className="text-xl font-semibold text-card-foreground">
                    {summaryLoading ? "..." : formatCurrency(totalAssets)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium tracking-widest text-muted-foreground mb-1">LIABILITIES</p>
                  <p className="text-xl font-semibold text-card-foreground">
                    {summaryLoading ? "..." : formatCurrency(totalLiabilities)}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="space-y-4">
              <div className="card-muted p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Target className="w-4 h-4 text-accent" />
                  </div>
                  <h3 className="font-semibold text-card-foreground">Account Details</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Goals</span>
                    <span className="text-sm font-medium text-card-foreground">{goals.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Upcoming Payments</span>
                    <span className="text-sm font-medium text-card-foreground">{upcomingPayments.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Assets</span>
                    <span className="text-sm font-medium text-card-foreground">{goals.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Liabilities</span>
                    <span className="text-sm font-medium text-card-foreground">{upcomingPayments.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <PaymentNotificationBanner overdueCount={overdueCount} dueTodayCount={dueTodayCount} />

        {/* Transactions / Upcoming Payments */}
        <div className="card-section">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-card-foreground">Upcoming Payments</h2>
            <Link to="/payments">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <p className="text-xs font-medium tracking-widest text-muted-foreground mb-4">PENDING</p>

          {upcomingPayments.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No upcoming payments in the next 7 days</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {upcomingPayments.map((payment) => (
                <PaymentAlert key={payment.id} payment={payment} onMarkPaid={handleMarkAsPaid} />
              ))}
            </div>
          )}
        </div>

        {/* Goals */}
        <div className="card-section">
          <h2 className="text-xl sm:text-2xl font-semibold text-card-foreground mb-6">Goals</h2>
          {goals.length === 0 ? (
            <p className="text-muted-foreground text-sm">No goals set yet</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {goals.map((goal) => {
                const progress =
                  goal.target_amount > 0
                    ? Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100)
                    : 0;
                return (
                  <GoalCard
                    key={goal.id}
                    title={goal.title}
                    timeframe={goal.timeframe || undefined}
                    current={
                      <CurrencyAmount
                        amount={Number(goal.current_amount)}
                        originalCurrency={goal.currency as CurrencyCode}
                        showOriginal
                      />
                    }
                    target={
                      <CurrencyAmount
                        amount={Number(goal.target_amount)}
                        originalCurrency={goal.currency as CurrencyCode}
                        showOriginal
                      />
                    }
                    progress={progress}
                    assetLinkedCount={goal.asset_linked ? 1 : 0}
                    className="bg-[#f4f4f6] rounded-xl shadow-xl"
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
