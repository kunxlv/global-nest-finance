import { useState, useEffect } from "react";
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
import { TypeSelector, CurrencyAmountInput, FrequencySelector, DatePickerInput } from "./inputs";
import { cn } from "@/lib/utils";
import { 
  CalendarClock, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Bell, 
  Link2, 
  Wallet,
  CreditCard,
  Building,
  Landmark,
  FileText
} from "lucide-react";

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

const steps = [
  { id: 1, title: "Basic Info", icon: FileText },
  { id: 2, title: "Schedule", icon: CalendarClock },
  { id: 3, title: "Link", icon: Link2 },
  { id: 4, title: "Alerts", icon: Bell },
];

const daysOfWeek = [
  { value: "0", label: "Sun" },
  { value: "1", label: "Mon" },
  { value: "2", label: "Tue" },
  { value: "3", label: "Wed" },
  { value: "4", label: "Thu" },
  { value: "5", label: "Fri" },
  { value: "6", label: "Sat" },
];

export default function RecurringPaymentForm({ children, payment, onSuccess }: RecurringPaymentFormProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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

  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
    }
  }, [open]);

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

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return form.watch("name") && form.watch("category") && form.watch("amount");
      case 2:
        return form.watch("frequency") && form.watch("start_date");
      default:
        return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-border/20">
          <DialogTitle className="flex items-center gap-2 text-xl text-card-foreground">
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
            {payment ? "Edit" : "New"} Recurring Payment
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between py-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200",
                    isActive && "bg-card-foreground text-card shadow-md",
                    isCompleted && "bg-primary/10 text-primary",
                    !isActive && !isCompleted && "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-8 h-0.5 mx-1",
                    currentStep > step.id ? "bg-primary" : "bg-border/30"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Category
                      </FormLabel>
                      <FormControl>
                        <TypeSelector
                          type="payment"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Payment Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Netflix, Rent, SIP Investment..." 
                          className="h-12 text-base"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Amount
                      </FormLabel>
                      <FormControl>
                        <CurrencyAmountInput
                          amount={field.value}
                          currency={form.watch("currency")}
                          onAmountChange={field.onChange}
                          onCurrencyChange={(value) => form.setValue("currency", value)}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Notes (Optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any notes about this payment..." 
                          className="resize-none"
                          rows={2}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Schedule */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Repeat Frequency
                      </FormLabel>
                      <FormControl>
                        <FrequencySelector
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
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
                        <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Day of Week
                        </FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            {daysOfWeek.map((day) => (
                              <button
                                key={day.value}
                                type="button"
                                onClick={() => field.onChange(day.value)}
                                className={cn(
                                  "flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                  "border border-border/50 shadow-sm",
                                  "hover:shadow-md hover:border-border",
                                  field.value === day.value
                                    ? "bg-card-foreground text-card border-card-foreground shadow-md"
                                    : "bg-muted text-card-foreground"
                                )}
                              >
                                {day.label}
                              </button>
                            ))}
                          </div>
                        </FormControl>
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
                        <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Day of Month
                        </FormLabel>
                        <FormControl>
                          <div className="flex flex-wrap gap-2">
                            {[1, 5, 10, 15, 20, 25, 28].map((day) => (
                              <button
                                key={day}
                                type="button"
                                onClick={() => field.onChange(day.toString())}
                                className={cn(
                                  "w-12 h-12 rounded-xl text-sm font-medium transition-all duration-200",
                                  "border border-border/50 shadow-sm",
                                  "hover:shadow-md hover:border-border",
                                  field.value === day.toString()
                                    ? "bg-card-foreground text-card border-card-foreground shadow-md"
                                    : "bg-muted text-card-foreground"
                                )}
                              >
                                {day}
                              </button>
                            ))}
                            <Input 
                              type="number"
                              min="1"
                              max="31"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              placeholder="Other"
                              className="w-20 h-12 text-center"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Start Date
                        </FormLabel>
                        <FormControl>
                          <DatePickerInput
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="When does it start?"
                          />
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
                        <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          End Date (Optional)
                        </FormLabel>
                        <FormControl>
                          <DatePickerInput
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder="Leave empty for no end"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Link Entities */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-sm text-muted-foreground">
                  Link this payment to related financial entities (optional)
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="linked_asset_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <Wallet className="h-4 w-4" />
                          Asset
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "none"}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl border-2">
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover border shadow-lg">
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
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <FileText className="h-4 w-4" />
                          Liability
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "none"}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl border-2">
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover border shadow-lg">
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
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <CreditCard className="h-4 w-4" />
                          Card
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "none"}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl border-2">
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover border shadow-lg">
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
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <Landmark className="h-4 w-4" />
                          Bank Account
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "none"}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl border-2">
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover border shadow-lg">
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
            )}

            {/* Step 4: Notifications */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                <FormField
                  control={form.control}
                  name="notification_enabled"
                  render={({ field }) => (
                    <FormItem className={cn(
                      "flex items-center justify-between rounded-xl border-2 p-4 transition-all",
                      field.value && "border-foreground bg-foreground/5"
                    )}>
                      <div className="space-y-1">
                        <FormLabel className="text-base font-medium">Payment Reminders</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Get notified before payment is due
                        </p>
                      </div>
                      <FormControl>
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-foreground"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("notification_enabled") && (
                  <FormField
                    control={form.control}
                    name="notify_days_before"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          Remind me
                        </FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            {["1", "3", "5", "7"].map((days) => (
                              <button
                                key={days}
                                type="button"
                                onClick={() => field.onChange(days)}
                                className={cn(
                                  "flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all",
                                  field.value === days
                                    ? "border-foreground bg-foreground text-background"
                                    : "border-border hover:border-foreground/20"
                                )}
                              >
                                {days} day{parseInt(days) > 1 ? "s" : ""} before
                              </button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="auto_pay_enabled"
                  render={({ field }) => (
                    <FormItem className={cn(
                      "flex items-center justify-between rounded-xl border-2 p-4 transition-all",
                      field.value && "border-success bg-success/5"
                    )}>
                      <div className="space-y-1">
                        <FormLabel className="text-base font-medium">Auto-Pay</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Automatically mark as paid when due
                        </p>
                      </div>
                      <FormControl>
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-success"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t border-border/20">
              <Button
                type="button"
                variant="ghost"
                onClick={currentStep === 1 ? () => setOpen(false) : prevStep}
                className="rounded-xl px-6"
              >
                {currentStep === 1 ? (
                  "Cancel"
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </>
                )}
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="rounded-xl px-6 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="rounded-xl px-8 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {payment ? "Update" : "Create"} Payment
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
