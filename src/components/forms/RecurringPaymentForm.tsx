import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase, RecurringPayment, Asset, Liability, Card, BankAccount } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().default("USD"),
  category: z.enum(["SIP", "CREDIT_CARD_BILL", "LOAN_INSTALLMENT", "SUBSCRIPTION", "INSURANCE", "UTILITY", "RENT", "OTHER"]),
  frequency: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "HALF_YEARLY", "YEARLY"]),
  day_of_month: z.string().optional(),
  day_of_week: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  linked_asset_id: z.string().optional(),
  linked_liability_id: z.string().optional(),
  linked_card_id: z.string().optional(),
  linked_bank_account_id: z.string().optional(),
  auto_pay_enabled: z.boolean().default(false),
  notify_days_before: z.string().default("3"),
  notification_enabled: z.boolean().default(true),
});

interface RecurringPaymentFormProps {
  children: React.ReactNode;
  payment?: RecurringPayment;
  onSuccess?: () => void;
}

export default function RecurringPaymentForm({ children, payment, onSuccess }: RecurringPaymentFormProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: payment?.name || "",
      description: payment?.description || "",
      amount: payment?.amount?.toString() || "",
      currency: payment?.currency || "USD",
      category: payment?.category || "SUBSCRIPTION",
      frequency: payment?.frequency || "MONTHLY",
      day_of_month: payment?.day_of_month?.toString() || "1",
      day_of_week: payment?.day_of_week?.toString() || "1",
      start_date: payment?.start_date || new Date().toISOString().split('T')[0],
      end_date: payment?.end_date || "",
      linked_asset_id: payment?.linked_asset_id || "",
      linked_liability_id: payment?.linked_liability_id || "",
      linked_card_id: payment?.linked_card_id || "",
      linked_bank_account_id: payment?.linked_bank_account_id || "",
      auto_pay_enabled: payment?.auto_pay_enabled || false,
      notify_days_before: payment?.notify_days_before?.toString() || "3",
      notification_enabled: payment?.notification_enabled ?? true,
    },
  });

  useEffect(() => {
    if (open && user) {
      Promise.all([
        supabase.from("assets").select("*").eq("user_id", user.id),
        supabase.from("liabilities").select("*").eq("user_id", user.id),
        supabase.from("cards").select("*").eq("user_id", user.id),
        supabase.from("bank_accounts").select("*").eq("user_id", user.id),
      ]).then(([assetsRes, liabilitiesRes, cardsRes, bankAccountsRes]) => {
        if (assetsRes.data) setAssets(assetsRes.data);
        if (liabilitiesRes.data) setLiabilities(liabilitiesRes.data);
        if (cardsRes.data) setCards(cardsRes.data);
        if (bankAccountsRes.data) setBankAccounts(bankAccountsRes.data);
      });
    }
  }, [open, user]);

  const calculateNextDueDate = (startDate: string, frequency: string, dayOfMonth?: number, dayOfWeek?: number) => {
    const start = new Date(startDate);
    const today = new Date();
    
    if (start > today) return startDate;
    
    switch (frequency) {
      case "DAILY":
        return new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0];
      case "WEEKLY":
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + ((7 + (dayOfWeek || 1) - today.getDay()) % 7 || 7));
        return nextWeek.toISOString().split('T')[0];
      case "BIWEEKLY":
        return new Date(today.setDate(today.getDate() + 14)).toISOString().split('T')[0];
      case "MONTHLY":
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, dayOfMonth || 1);
        return nextMonth.toISOString().split('T')[0];
      case "QUARTERLY":
        const nextQuarter = new Date(today.getFullYear(), today.getMonth() + 3, dayOfMonth || 1);
        return nextQuarter.toISOString().split('T')[0];
      case "HALF_YEARLY":
        const nextHalf = new Date(today.getFullYear(), today.getMonth() + 6, dayOfMonth || 1);
        return nextHalf.toISOString().split('T')[0];
      case "YEARLY":
        const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), dayOfMonth || 1);
        return nextYear.toISOString().split('T')[0];
      default:
        return startDate;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;

    const nextDueDate = calculateNextDueDate(
      values.start_date,
      values.frequency,
      values.day_of_month ? parseInt(values.day_of_month) : undefined,
      values.day_of_week ? parseInt(values.day_of_week) : undefined
    );

    const paymentData = {
      user_id: user.id,
      name: values.name,
      description: values.description || null,
      amount: parseFloat(values.amount),
      currency: values.currency as any,
      category: values.category as any,
      frequency: values.frequency as any,
      day_of_month: values.day_of_month ? parseInt(values.day_of_month) : null,
      day_of_week: values.day_of_week ? parseInt(values.day_of_week) : null,
      start_date: values.start_date,
      end_date: values.end_date || null,
      next_due_date: nextDueDate,
      linked_asset_id: values.linked_asset_id && values.linked_asset_id !== "none" ? values.linked_asset_id : null,
      linked_liability_id: values.linked_liability_id && values.linked_liability_id !== "none" ? values.linked_liability_id : null,
      linked_card_id: values.linked_card_id && values.linked_card_id !== "none" ? values.linked_card_id : null,
      linked_bank_account_id: values.linked_bank_account_id && values.linked_bank_account_id !== "none" ? values.linked_bank_account_id : null,
      auto_pay_enabled: values.auto_pay_enabled,
      notify_days_before: parseInt(values.notify_days_before),
      notification_enabled: values.notification_enabled,
      is_active: true,
    };

    if (payment) {
      const { error } = await supabase
        .from("recurring_payments")
        .update(paymentData)
        .eq("id", payment.id);

      if (error) {
        toast.error("Failed to update payment");
        console.error(error);
      } else {
        toast.success("Payment updated successfully");
        setOpen(false);
        form.reset();
        onSuccess?.();
      }
    } else {
      const { data: newPayment, error } = await supabase
        .from("recurring_payments")
        .insert(paymentData)
        .select()
        .single();

      if (error) {
        toast.error("Failed to create payment");
        console.error(error);
      } else {
        await supabase.from("payment_history").insert({
          user_id: user.id,
          recurring_payment_id: newPayment.id,
          due_date: nextDueDate,
          amount: parseFloat(values.amount),
          currency: values.currency as any,
          status: "UPCOMING" as any,
        });

        toast.success("Payment created successfully");
        setOpen(false);
        form.reset();
        onSuccess?.();
      }
    }
  };

  const frequency = form.watch("frequency");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{payment ? "Edit" : "Add"} Recurring Payment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Netflix Subscription" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SIP">SIP</SelectItem>
                        <SelectItem value="CREDIT_CARD_BILL">Credit Card Bill</SelectItem>
                        <SelectItem value="LOAN_INSTALLMENT">Loan Installment</SelectItem>
                        <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                        <SelectItem value="INSURANCE">Insurance</SelectItem>
                        <SelectItem value="UTILITY">Utility</SelectItem>
                        <SelectItem value="RENT">Rent</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="99.99" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="BIWEEKLY">Biweekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                        <SelectItem value="HALF_YEARLY">Half-Yearly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {frequency === "WEEKLY" && (
                <FormField
                  control={form.control}
                  name="day_of_week"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day of Week</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Sunday</SelectItem>
                          <SelectItem value="1">Monday</SelectItem>
                          <SelectItem value="2">Tuesday</SelectItem>
                          <SelectItem value="3">Wednesday</SelectItem>
                          <SelectItem value="4">Thursday</SelectItem>
                          <SelectItem value="5">Friday</SelectItem>
                          <SelectItem value="6">Saturday</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {["MONTHLY", "QUARTERLY", "HALF_YEARLY", "YEARLY"].includes(frequency) && (
                <FormField
                  control={form.control}
                  name="day_of_month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day of Month</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="31" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-medium">Link to Entity (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="linked_asset_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "none"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {assets.map((asset) => (
                            <SelectItem key={asset.id} value={asset.id}>
                              {asset.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linked_liability_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Liability</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "none"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {liabilities.map((liability) => (
                            <SelectItem key={liability.id} value={liability.id}>
                              {liability.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linked_card_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "none"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {cards.map((card) => (
                            <SelectItem key={card.id} value={card.id}>
                              {card.bank_name} ****{card.last_four}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linked_bank_account_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Account</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "none"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {bankAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-medium">Notification Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="notification_enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Enable Notifications</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notify_days_before"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notify Days Before</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="30" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="auto_pay_enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Enable Auto-Pay</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{payment ? "Update" : "Create"} Payment</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
