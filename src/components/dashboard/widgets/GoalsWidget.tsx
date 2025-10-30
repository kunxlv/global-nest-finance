import { useEffect, useState } from "react";
import GoalCard from "@/components/GoalCard";
import { supabase, Goal } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function GoalsWidget() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    const fetchGoals = async () => {
      const { data } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(2);

      if (data) setGoals(data);
    };

    fetchGoals();
  }, [user]);

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

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 flex-shrink-0">Goals</h2>
      {goals.length === 0 ? (
        <p className="text-muted-foreground text-sm">No goals yet</p>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const progress = Math.round(
                (Number(goal.current_amount) / Number(goal.target_amount)) * 100
              );
              return (
                <GoalCard
                  key={goal.id}
                  title={goal.title}
                  target={formatCurrency(Number(goal.target_amount), goal.currency)}
                  current={formatCurrency(Number(goal.current_amount), goal.currency)}
                  progress={progress}
                  timeframe={goal.timeframe || undefined}
                  assetLinked={goal.asset_linked}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}