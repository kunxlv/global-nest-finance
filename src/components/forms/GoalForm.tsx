import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase, Goal, Asset } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatCurrency, CurrencyCode } from "@/lib/currencyConversion";

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
      
      // Fetch assets linked to OTHER goals (not the current one being edited)
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

    const payload = {
      user_id: user.id,
      title: data.title,
      target_amount: parseFloat(data.target_amount),
      current_amount: data.current_amount ? parseFloat(data.current_amount) : 0,
      currency: data.currency as "USD" | "EUR" | "GBP" | "INR" | "JPY" | "AUD" | "CAD",
      timeframe: data.timeframe || null,
      is_long_term: data.is_long_term,
      asset_linked: (data.linked_assets && data.linked_assets.length > 0) || false,
    };

    // Save or update the goal
    const { data: goalData, error: goalError } = goal
      ? await supabase.from("goals").update(payload).eq("id", goal.id).select().single()
      : await supabase.from("goals").insert(payload).select().single();

    if (goalError) {
      toast.error("Failed to save goal");
      console.error(goalError);
      return;
    }

    // Handle linked assets
    const goalId = goal?.id || goalData.id;
    
    // Delete existing links
    await supabase.from("goal_assets").delete().eq("goal_id", goalId);

    // Insert new links
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{goal ? "Edit Goal" : "Add Goal"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Travel Fund" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="target_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="current_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="JPY">JPY</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeframe (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="12 months" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="is_long_term"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Long-term goal</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Linked Assets Section */}
            {assets.length > 0 && (
              <FormField
                control={form.control}
                name="linked_assets"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Link Assets to Goal</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Select assets that contribute to this goal
                      </p>
                    </div>
                    <ScrollArea className="h-[200px] rounded-md border p-4">
                      <div className="space-y-3">
                        {assets.map((asset) => {
                          const isUnavailable = unavailableAssets.has(asset.id);
                          const linkedGoalTitle = unavailableAssets.get(asset.id);
                          
                          return (
                            <FormField
                              key={asset.id}
                              control={form.control}
                              name="linked_assets"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={asset.id}
                                    className={`flex items-start space-x-3 space-y-0 rounded-lg border p-3 transition-colors ${
                                      isUnavailable 
                                        ? 'bg-muted/50 cursor-not-allowed' 
                                        : 'hover:bg-accent/50'
                                    }`}
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(asset.id)}
                                        disabled={isUnavailable}
                                        onCheckedChange={(checked) => {
                                          const currentValue = field.value || [];
                                          return checked
                                            ? field.onChange([...currentValue, asset.id])
                                            : field.onChange(
                                                currentValue.filter((value) => value !== asset.id)
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <div className="flex-1 space-y-1 leading-none">
                                      <FormLabel className={`text-sm font-medium ${isUnavailable ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                        {asset.description}
                                      </FormLabel>
                                      <p className="text-xs text-muted-foreground">
                                        {formatCurrency(Number(asset.valuation), asset.currency as CurrencyCode)} · {asset.type}
                                        {isUnavailable && (
                                          <span className="ml-2 text-[hsl(var(--warning))] font-medium">
                                            → {linkedGoalTitle}
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

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{goal ? "Update" : "Create"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
