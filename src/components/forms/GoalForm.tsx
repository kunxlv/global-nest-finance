import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { supabase, Goal, Asset } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatCurrency, CurrencyCode } from "@/lib/currencyConversion";
import { CurrencyAmountInput, DatePickerInput } from "./inputs";
import { Target, TrendingUp, Clock, Banknote, Building2, Bitcoin, Coins, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  target_amount: z.string().min(1, "Target amount is required"),
  current_amount: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  timeframe: z.string().optional(),
  is_long_term: z.boolean(),
  linked_assets: z.array(z.string()).optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalFormProps {
  children: React.ReactNode;
  goal?: Goal;
  onSuccess: () => void;
}

const assetTypeIcons: Record<string, React.ReactNode> = {
  CASH: <Banknote className="h-4 w-4" />,
  EQUITY: <TrendingUp className="h-4 w-4" />,
  CRYPTO: <Bitcoin className="h-4 w-4" />,
  GOLD: <Coins className="h-4 w-4" />,
  REAL_ESTATE: <Building2 className="h-4 w-4" />,
  OTHER: <Package className="h-4 w-4" />,
};

export default function GoalForm({ children, goal, onSuccess }: GoalFormProps) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [linkedAssetIds, setLinkedAssetIds] = useState<string[]>([]);
  const [unavailableAssets, setUnavailableAssets] = useState<Map<string, string>>(new Map());
  const { user } = useAuth();

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: goal?.title || "",
      target_amount: goal?.target_amount?.toString() || "",
      current_amount: goal?.current_amount?.toString() || "0",
      currency: goal?.currency || "USD",
      timeframe: goal?.timeframe || "",
      is_long_term: goal?.is_long_term || false,
      linked_assets: [],
    },
  });

  const watchedLinkedAssets = form.watch("linked_assets") || [];
  const watchedTargetAmount = form.watch("target_amount");
  const watchedCurrency = form.watch("currency");

  // Calculate current amount from linked assets
  const calculatedCurrentAmount = assets
    .filter(asset => watchedLinkedAssets.includes(asset.id))
    .reduce((sum, asset) => sum + Number(asset.valuation), 0);

  const progressPercentage = watchedTargetAmount 
    ? Math.min((calculatedCurrentAmount / parseFloat(watchedTargetAmount)) * 100, 100)
    : 0;

  // Fetch user's assets
  useEffect(() => {
    const fetchAssets = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setAssets(data);
      }
    };

    const fetchLinkedAssets = async () => {
      if (!goal?.id) return;
      const { data, error } = await supabase
        .from("goal_assets")
        .select("asset_id")
        .eq("goal_id", goal.id);
      
      if (!error && data) {
        const assetIds = data.map(ga => ga.asset_id);
        setLinkedAssetIds(assetIds);
        form.setValue("linked_assets", assetIds);
      }
    };

    const fetchUnavailableAssets = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("goal_assets")
        .select("asset_id, goals(title)")
        .eq("user_id", user.id)
        .neq("goal_id", goal?.id || "none");
      
      if (!error && data) {
        const unavailable = new Map<string, string>();
        data.forEach((ga: any) => {
          if (ga.goals) {
            unavailable.set(ga.asset_id, ga.goals.title);
          }
        });
        setUnavailableAssets(unavailable);
      }
    };

    if (open) {
      fetchAssets();
      fetchUnavailableAssets();
      if (goal) {
        fetchLinkedAssets();
      }
    }
  }, [open, user, goal, form]);

  const onSubmit = async (data: GoalFormData) => {
    if (!user) return;

    // Calculate current_amount from linked assets
    let calculatedCurrentAmount = 0;
    if (data.linked_assets && data.linked_assets.length > 0) {
      const linkedAssets = assets.filter(asset => data.linked_assets?.includes(asset.id));
      
      const { fetchExchangeRates, convertAmount } = await import("@/lib/currencyConversion");
      const rates = await fetchExchangeRates(data.currency as CurrencyCode);
      
      calculatedCurrentAmount = linkedAssets.reduce((sum, asset) => {
        const convertedValue = convertAmount(
          Number(asset.valuation),
          asset.currency as CurrencyCode,
          data.currency as CurrencyCode,
          rates
        );
        return sum + convertedValue;
      }, 0);
    }

    const payload = {
      user_id: user.id,
      title: data.title,
      target_amount: parseFloat(data.target_amount),
      current_amount: calculatedCurrentAmount,
      currency: data.currency as "USD" | "EUR" | "GBP" | "INR" | "JPY" | "AUD" | "CAD",
      timeframe: data.timeframe || null,
      is_long_term: data.is_long_term,
      asset_linked: (data.linked_assets && data.linked_assets.length > 0) || false,
    };

    const { data: goalData, error: goalError } = goal
      ? await supabase.from("goals").update(payload).eq("id", goal.id).select().single()
      : await supabase.from("goals").insert(payload).select().single();

    if (goalError) {
      toast.error("Failed to save goal");
      console.error(goalError);
      return;
    }

    const goalId = goal?.id || goalData.id;
    
    await supabase.from("goal_assets").delete().eq("goal_id", goalId);

    if (data.linked_assets && data.linked_assets.length > 0) {
      const goalAssetLinks = data.linked_assets.map(assetId => ({
        goal_id: goalId,
        asset_id: assetId,
        user_id: user.id,
      }));

      const { error: linkError } = await supabase.from("goal_assets").insert(goalAssetLinks);

      if (linkError) {
        toast.error("Failed to link assets");
        console.error(linkError);
        return;
      }
    }

    toast.success(goal ? "Goal updated successfully" : "Goal created successfully");
    setOpen(false);
    form.reset();
    setLinkedAssetIds([]);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Target className="h-5 w-5 text-foreground" />
            {goal ? "Edit Goal" : "Create New Goal"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            {/* Goal Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Goal Name
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Emergency Fund, Dream Vacation, Retirement..." 
                      className="h-12 rounded-xl border-2 text-base"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target Amount */}
            <FormField
              control={form.control}
              name="target_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Target Amount
                  </FormLabel>
                  <FormControl>
                    <CurrencyAmountInput
                      amount={field.value}
                      currency={watchedCurrency}
                      onAmountChange={field.onChange}
                      onCurrencyChange={(value) => form.setValue("currency", value)}
                      placeholder="100,000"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Live Progress Preview */}
            {watchedTargetAmount && parseFloat(watchedTargetAmount) > 0 && (
              <div className="p-4 rounded-xl bg-muted/50 border-2 border-dashed space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress Preview</span>
                  <span className="font-semibold">{progressPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {formatCurrency(calculatedCurrentAmount, watchedCurrency as CurrencyCode)} saved
                  </span>
                  <span>
                    {formatCurrency(parseFloat(watchedTargetAmount), watchedCurrency as CurrencyCode)} target
                  </span>
                </div>
              </div>
            )}

            {/* Timeframe & Long-term Toggle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="timeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Target Date
                    </FormLabel>
                    <FormControl>
                      <DatePickerInput
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="When do you want to achieve this?"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_long_term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Goal Type
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => field.onChange(false)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all duration-200",
                            !field.value
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border/50 bg-muted text-card-foreground hover:border-border"
                          )}
                        >
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">Short-term</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange(true)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all duration-200",
                            field.value
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border/50 bg-muted text-card-foreground hover:border-border"
                          )}
                        >
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm font-medium">Long-term</span>
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Linked Assets Section */}
            {assets.length > 0 && (
              <FormField
                control={form.control}
                name="linked_assets"
                render={() => (
                  <FormItem>
                    <div className="mb-3">
                      <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Link Assets
                      </FormLabel>
                      <p className="text-xs text-muted-foreground mt-1">
                        Select assets that contribute to this goal
                      </p>
                    </div>
                    <ScrollArea className="h-[200px] rounded-xl border-2 p-3">
                      <div className="space-y-2">
                        {assets.map((asset) => {
                          const isUnavailable = unavailableAssets.has(asset.id);
                          const linkedGoalTitle = unavailableAssets.get(asset.id);
                          
                          return (
                            <FormField
                              key={asset.id}
                              control={form.control}
                              name="linked_assets"
                              render={({ field }) => {
                                const isChecked = field.value?.includes(asset.id);
                                return (
                                  <FormItem
                                    key={asset.id}
                                    className={cn(
                                      "flex items-center gap-3 rounded-xl border-2 p-3 transition-all duration-200",
                                      isUnavailable 
                                        ? 'bg-muted/30 border-dashed cursor-not-allowed opacity-60' 
                                        : isChecked
                                          ? 'bg-foreground/5 border-foreground'
                                          : 'hover:bg-muted/50 hover:border-muted-foreground/30'
                                    )}
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={isChecked}
                                        disabled={isUnavailable}
                                        onCheckedChange={(checked) => {
                                          const currentValue = field.value || [];
                                          return checked
                                            ? field.onChange([...currentValue, asset.id])
                                            : field.onChange(
                                                currentValue.filter((value) => value !== asset.id)
                                              );
                                        }}
                                        className="h-5 w-5"
                                      />
                                    </FormControl>
                                    <div className={cn(
                                      "p-2 rounded-lg",
                                      isChecked ? "bg-foreground text-background" : "bg-muted"
                                    )}>
                                      {assetTypeIcons[asset.type]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={cn(
                                        "text-sm font-medium truncate",
                                        isUnavailable && "text-muted-foreground"
                                      )}>
                                        {asset.description}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatCurrency(Number(asset.valuation), asset.currency as CurrencyCode)}
                                        {isUnavailable && (
                                          <span className="ml-2 text-warning">
                                            → Linked to "{linkedGoalTitle}"
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </FormItem>
                                );
                              }}
                            />
                          );
                        })}
                      </div>
                    </ScrollArea>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setOpen(false)}
                className="rounded-xl px-6 text-muted-foreground hover:text-card-foreground"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="rounded-xl px-8 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {goal ? "Update Goal" : "Create Goal"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
