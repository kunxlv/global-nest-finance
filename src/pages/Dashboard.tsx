import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import GoalCard from "@/components/GoalCard";
import PaymentAlert from "@/components/PaymentAlert";
import PaymentNotificationBanner from "@/components/PaymentNotificationBanner";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";
import { supabase, PaymentHistory, RecurringPayment } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { differenceInDays } from "date-fns";
import { Link } from "react-router-dom";

type PaymentWithRecurring = PaymentHistory & {
  recurring_payment: RecurringPayment;
};

export default function Dashboard() {
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

  const overdueCount = upcomingPayments.filter(p => differenceInDays(new Date(p.due_date), new Date()) < 0).length;
  const dueTodayCount = upcomingPayments.filter(p => differenceInDays(new Date(p.due_date), new Date()) === 0).length;

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Dashboard.</h1>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              Widgets
            </Button>
            <Button variant="outline" size="sm">
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
        <div className="bg-white rounded-3xl p-6 relative">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4">
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-6xl font-bold">19</span>
              <span className="text-xl ml-2">days until the next salary...</span>
            </div>
            <Button variant="link" className="underline">
              Manage Budget
            </Button>
          </div>
        </div>

        {/* Gainers and Losers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 relative">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4">
              <X className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-bold mb-4">Top gainers</h2>
            <div className="flex justify-center items-center h-40">
              <div className="w-full max-w-xs h-32 bg-black rounded-2xl flex items-end p-4 relative">
                <svg className="w-full h-full absolute inset-0 p-4" viewBox="0 0 200 80">
                  <path 
                    d="M 0,60 Q 30,40 50,45 T 100,35 T 150,25 T 200,20" 
                    fill="none" 
                    stroke="hsl(var(--success))" 
                    strokeWidth="2"
                  />
                  <path 
                    d="M 0,60 Q 30,40 50,45 T 100,35 T 150,25 T 200,20 L 200,80 L 0,80 Z" 
                    fill="url(#greenGradient)" 
                    opacity="0.3"
                  />
                  <defs>
                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-white/60 text-xs absolute bottom-2 left-2">15 April - 21 April</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 relative">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4">
              <X className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-bold mb-4">Top losers</h2>
            <div className="flex justify-center items-center h-40">
              <div className="w-full max-w-xs h-32 bg-black rounded-2xl flex items-end p-4 relative">
                <svg className="w-full h-full absolute inset-0 p-4" viewBox="0 0 200 80">
                  <path 
                    d="M 0,20 Q 30,30 50,35 T 100,45 T 150,55 T 200,60" 
                    fill="none" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth="2"
                  />
                  <path 
                    d="M 0,20 Q 30,30 50,35 T 100,45 T 150,55 T 200,60 L 200,80 L 0,80 Z" 
                    fill="url(#redGradient)" 
                    opacity="0.3"
                  />
                  <defs>
                    <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-white/60 text-xs absolute bottom-2 left-2">15 April - 21 April</span>
              </div>
            </div>
          </div>
        </div>

        <PaymentNotificationBanner overdueCount={overdueCount} dueTodayCount={dueTodayCount} />

        <div className="bg-white rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Upcoming Payments</h2>
            <Link to="/payments">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          {upcomingPayments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No upcoming payments in the next 7 days</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingPayments.map((payment) => (
                <PaymentAlert key={payment.id} payment={payment} onMarkPaid={handleMarkAsPaid} />
              ))}
            </div>
          )}
        </div>

        {/* Goals */}
        <div className="bg-white rounded-3xl p-6 relative">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4">
            <X className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold mb-6">Goals</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GoalCard
              title="Travel Fund"
              target="$500"
              current="$345"
              progress={69}
            />
            <GoalCard
              title="Retirement Fund"
              target="$20,000"
              current="$2740"
              progress={14}
              timeframe="16 years"
              assetLinked
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
