import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import GoalCard from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash, MoreVertical } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalAssetCounts, setGoalAssetCounts] = useState<Record<string, number>>({});
  const [goalAssetNames, setGoalAssetNames] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchGoals = async () => {
    if (!user) return;
    setLoading(true);
    
    // Fetch goals
    const { data: goalsData, error: goalsError } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (goalsError) {
      toast.error("Failed to load goals");
      console.error(goalsError);
      setLoading(false);
      return;
    }

    setGoals(goalsData || []);

    // Fetch linked asset counts and names for all goals
    if (goalsData && goalsData.length > 0) {
      const { data: goalAssetsData, error: goalAssetsError } = await supabase
        .from("goal_assets")
        .select("goal_id, assets(description)")
        .in("goal_id", goalsData.map(g => g.id));

      if (!goalAssetsError && goalAssetsData) {
        // Count assets per goal and collect names
        const counts: Record<string, number> = {};
        const names: Record<string, string[]> = {};
        
        goalAssetsData.forEach((ga: any) => {
          counts[ga.goal_id] = (counts[ga.goal_id] || 0) + 1;
          
          if (!names[ga.goal_id]) {
            names[ga.goal_id] = [];
          }
          if (ga.assets?.description) {
            names[ga.goal_id].push(ga.assets.description);
          }
        });
        
        setGoalAssetCounts(counts);
        setGoalAssetNames(names);
      }
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
                      <GoalCard
                        key={goal.id}
                        title={goal.title}
                        target={formatCurrency(Number(goal.target_amount), goal.currency as CurrencyCode)}
                        current={formatCurrency(Number(goal.current_amount), goal.currency as CurrencyCode)}
                        progress={progress}
                        timeframe={goal.timeframe || undefined}
                        assetLinkedCount={goalAssetCounts[goal.id] || 0}
                        assetNames={goalAssetNames[goal.id] || []}
                        actionsMenu={
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <GoalForm goal={goal} onSuccess={fetchGoals}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              </GoalForm>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
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
                            </DropdownMenuContent>
                          </DropdownMenu>
                        }
                      />
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
                      <GoalCard
                        key={goal.id}
                        title={goal.title}
                        target={formatCurrency(Number(goal.target_amount), goal.currency as CurrencyCode)}
                        current={formatCurrency(Number(goal.current_amount), goal.currency as CurrencyCode)}
                        progress={progress}
                        timeframe={goal.timeframe || undefined}
                        assetLinkedCount={goalAssetCounts[goal.id] || 0}
                        assetNames={goalAssetNames[goal.id] || []}
                        actionsMenu={
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <GoalForm goal={goal} onSuccess={fetchGoals}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              </GoalForm>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
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
                            </DropdownMenuContent>
                          </DropdownMenu>
                        }
                      />
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
