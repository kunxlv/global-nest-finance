import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import GoalCard from "@/components/GoalCard";
import PaymentAlert from "@/components/PaymentAlert";
import PaymentNotificationBanner from "@/components/PaymentNotificationBanner";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { supabase, PaymentHistory, RecurringPayment, Goal } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { differenceInDays } from "date-fns";
import { Link } from "react-router-dom";

type PaymentWithRecurring = PaymentHistory & {
  recurring_payment: RecurringPayment;
};

export default function Dashboard() {
  const [upcomingPayments, setUpcomingPayments] = useState<PaymentWithRecurring[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
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
          <div className="flex gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              Widgets
            </Button>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              $ USD
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="NET WORTH" 
            value="$ 37,457.4" 
            trend={11.9}
          />
          <StatCard 
            title="ASSETS" 
            value="$ 52,257.2" 
            trend={29.1}
          />
          <StatCard 
            title="DEBT" 
            value="$ 14,799.8" 
          />
          <div className="bg-[#2a2a2a] rounded-3xl p-6 text-white flex flex-col justify-center items-center text-center">
            <p className="text-sm mb-2 text-white/70">Get more features and strategies.</p>
            <Button variant="secondary" size="sm" className="bg-white text-black hover:bg-white/90">
              GO PRO
            </Button>
          </div>
        </div>

        {/* Salary Countdown */}
        <div className="bg-white rounded-3xl p-4 sm:p-6">
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

        <div className="bg-white rounded-3xl p-4 sm:p-6">
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
        <div className="bg-white rounded-3xl p-6">
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
                  <GoalCard
                    key={goal.id}
                    title={goal.title}
                    target={`${goal.currency} ${Number(goal.target_amount).toFixed(2)}`}
                    current={`${goal.currency} ${Number(goal.current_amount).toFixed(2)}`}
                    progress={progress}
                    timeframe={goal.timeframe || undefined}
                    assetLinked={goal.asset_linked || false}
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
