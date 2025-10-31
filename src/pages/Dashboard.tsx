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
import { ArrowRight } from "lucide-react";
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

    const fetchGoals = async () => {
      const { data } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setGoals(data);
    };

    fetchUpcoming();
    fetchGoals();
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

  const overdueCount = upcomingPayments.filter(p => differenceInDays(new Date(p.due_date), new Date()) < 0).length;
  const dueTodayCount = upcomingPayments.filter(p => differenceInDays(new Date(p.due_date), new Date()) === 0).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold">Dashboard.</h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <ConversionRate />
            <CurrencySelector />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="NET WORTH" 
            value={summaryLoading ? "Loading..." : formatCurrency(netWorth)}
          />
          <StatCard 
            title="ASSETS" 
            value={summaryLoading ? "Loading..." : formatCurrency(totalAssets)}
          />
          <StatCard 
            title="DEBT" 
            value={summaryLoading ? "Loading..." : formatCurrency(totalLiabilities)}
          />
          <div className="bg-accent rounded-lg p-6 text-accent-foreground flex flex-col justify-center items-center text-center shadow-md">
            <p className="text-sm mb-2 opacity-90">Get more features and strategies.</p>
            <Button variant="secondary" size="sm">
              GO PRO
            </Button>
          </div>
        </div>

        {/* Salary Countdown */}
        <div className="bg-card rounded-lg p-4 sm:p-6 border shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-6xl font-bold">19</span>
              <span className="text-sm sm:text-xl">days until the next salary...</span>
            </div>
            <Button variant="link" className="underline text-sm">
              Manage Budget
            </Button>
          </div>
        </div>

        <PaymentNotificationBanner overdueCount={overdueCount} dueTodayCount={dueTodayCount} />

        <div className="bg-card rounded-lg p-4 sm:p-6 border shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">Upcoming Payments</h2>
            <Link to="/payments">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          {upcomingPayments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No upcoming payments in the next 7 days</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {upcomingPayments.map((payment) => (
                <PaymentAlert key={payment.id} payment={payment} onMarkPaid={handleMarkAsPaid} />
              ))}
            </div>
          )}
        </div>

        {/* Goals */}
        <div className="bg-card rounded-lg p-6 border shadow-md">
          <h2 className="text-2xl font-bold mb-6">Goals</h2>
          {goals.length === 0 ? (
            <p className="text-muted-foreground text-sm">No goals set yet</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {goals.map((goal) => {
                const progress = goal.target_amount > 0 
                  ? Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100)
                  : 0;
                
                return (
                  <div key={goal.id} className="bg-card rounded-2xl p-5 shadow-sm border border-border transition-all duration-200 hover:shadow-md">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-card-foreground text-base">
                            {goal.title} {goal.timeframe && <span className="text-muted-foreground font-normal">· {goal.timeframe}</span>}
                          </h3>
                          <p className="text-3xl font-semibold tracking-tight mt-2">
                            <CurrencyAmount 
                              amount={Number(goal.current_amount)} 
                              originalCurrency={goal.currency as CurrencyCode}
                              showOriginal
                            />
                          </p>
                        </div>
                        {goal.asset_linked && (
                          <span className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] px-2 py-1 rounded-md text-xs font-medium shrink-0">
                            Asset Linked
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground font-medium">{progress}% complete</span>
                          <span className="text-muted-foreground font-medium">
                            <CurrencyAmount 
                              amount={Number(goal.target_amount)} 
                              originalCurrency={goal.currency as CurrencyCode}
                              showOriginal
                            />
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-[hsl(var(--success))] rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
