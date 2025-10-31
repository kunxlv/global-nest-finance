import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import GoalCard from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash } from "lucide-react";
import GoalForm from "@/components/forms/GoalForm";
import { supabase, Goal } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, CurrencyCode } from "@/lib/currencyConversion";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchGoals = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load goals");
      console.error(error);
    } else {
      setGoals(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete goal");
    } else {
      toast.success("Goal deleted successfully");
      fetchGoals();
    }
  };


  const shortTermGoals = goals.filter((g) => !g.is_long_term);
  const longTermGoals = goals.filter((g) => g.is_long_term);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold">Goals.</h1>
          <GoalForm onSuccess={fetchGoals}>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </GoalForm>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading goals...</p>
          </div>
        ) : (
          <>
            {/* Short term goals */}
            <div className="bg-card rounded-lg p-6 border shadow-md">
              <h2 className="text-2xl font-bold mb-6">Short term goals</h2>
              {shortTermGoals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No short-term goals yet. Add one to start tracking!
                </p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {shortTermGoals.map((goal) => {
                    const progress = Math.round(
                      (Number(goal.current_amount) / Number(goal.target_amount)) * 100
                    );
                    return (
                      <div key={goal.id} className="relative">
                        <GoalCard
                          title={goal.title}
                          target={formatCurrency(Number(goal.target_amount), goal.currency as CurrencyCode)}
                          current={formatCurrency(Number(goal.current_amount), goal.currency as CurrencyCode)}
                          progress={progress}
                          timeframe={goal.timeframe || undefined}
                          assetLinked={goal.asset_linked}
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <GoalForm goal={goal} onSuccess={fetchGoals}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Pencil className="w-3 h-3" />
                            </Button>
                          </GoalForm>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Trash className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{goal.title}"? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(goal.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Long term goals */}
            <div className="bg-card rounded-lg p-6 border shadow-md">
              <h2 className="text-2xl font-bold mb-6">Long term goals</h2>
              {longTermGoals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No long-term goals yet. Add one to start tracking!
                </p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {longTermGoals.map((goal) => {
                    const progress = Math.round(
                      (Number(goal.current_amount) / Number(goal.target_amount)) * 100
                    );
                    return (
                      <div key={goal.id} className="relative">
                        <GoalCard
                          title={goal.title}
                          target={formatCurrency(Number(goal.target_amount), goal.currency as CurrencyCode)}
                          current={formatCurrency(Number(goal.current_amount), goal.currency as CurrencyCode)}
                          progress={progress}
                          timeframe={goal.timeframe || undefined}
                          assetLinked={goal.asset_linked}
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <GoalForm goal={goal} onSuccess={fetchGoals}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Pencil className="w-3 h-3" />
                            </Button>
                          </GoalForm>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Trash className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{goal.title}"? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(goal.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
