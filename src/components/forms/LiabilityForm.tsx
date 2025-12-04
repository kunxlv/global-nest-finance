import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase, Liability } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { TypeSelector, CurrencyAmountInput, CountrySelector, HolderToggle, DatePickerInput, InterestRateSlider } from "./inputs";
import { FileText } from "lucide-react";

const liabilitySchema = z.object({
  valuation: z.string().min(1, "Valuation is required"),
  currency: z.string().min(1, "Currency is required"),
  type: z.string().min(1, "Type is required"),
  description: z.string().min(1, "Description is required"),
  country: z.string().optional(),
  holder: z.string().optional(),
  start_date: z.string().optional(),
  interest_rate: z.string().optional(),
});

type LiabilityFormData = z.infer<typeof liabilitySchema>;

interface LiabilityFormProps {
  children: React.ReactNode;
  liability?: Liability;
  onSuccess: () => void;
}

export default function LiabilityForm({ children, liability, onSuccess }: LiabilityFormProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const form = useForm<LiabilityFormData>({
    resolver: zodResolver(liabilitySchema),
    defaultValues: {
      valuation: liability?.valuation?.toString() || "",
      currency: liability?.currency || "USD",
      type: liability?.type || "",
      description: liability?.description || "",
      country: liability?.country || "",
      holder: liability?.holder || "",
      start_date: liability?.start_date || "",
      interest_rate: liability?.interest_rate?.toString() || "",
    },
  });

  const onSubmit = async (data: LiabilityFormData) => {
    if (!user) return;

    const payload = {
      user_id: user.id,
      valuation: parseFloat(data.valuation),
      currency: data.currency as "USD" | "EUR" | "GBP" | "INR" | "JPY" | "AUD" | "CAD",
      type: data.type as "LOAN" | "MORTGAGE" | "CREDIT_CARD" | "OTHER",
      description: data.description,
      country: data.country || null,
      holder: data.holder || null,
      start_date: data.start_date || null,
      interest_rate: data.interest_rate ? parseFloat(data.interest_rate) : null,
    };

    const { error } = liability
      ? await supabase.from("liabilities").update(payload).eq("id", liability.id)
      : await supabase.from("liabilities").insert(payload);

    if (error) {
      toast.error("Failed to save liability");
      console.error(error);
    } else {
      toast.success(liability ? "Liability updated successfully" : "Liability created successfully");
      setOpen(false);
      form.reset();
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-foreground" />
            {liability ? "Edit Liability" : "Add New Liability"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            {/* Liability Type Selection */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Liability Type
                  </FormLabel>
                  <FormControl>
                    <TypeSelector
                      type="liability"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Car Loan, Home Mortgage, AMEX Card..." 
                      className="h-12 rounded-xl border-2 text-base"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount with Currency */}
            <FormField
              control={form.control}
              name="valuation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Outstanding Amount
                  </FormLabel>
                  <FormControl>
                    <CurrencyAmountInput
                      amount={field.value}
                      currency={form.watch("currency")}
                      onAmountChange={field.onChange}
                      onCurrencyChange={(value) => form.setValue("currency", value)}
                      placeholder="50,000"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Interest Rate Slider */}
            <FormField
              control={form.control}
              name="interest_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Interest Rate
                  </FormLabel>
                  <FormControl>
                    <InterestRateSlider
                      value={field.value || "0"}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Country & Lender Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Country
                    </FormLabel>
                    <FormControl>
                      <CountrySelector
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Select country"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="holder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Lender
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Chase Bank, SBI..." 
                        className="h-12 rounded-xl border-2"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Start Date */}
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
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="When did this liability start?"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setOpen(false)}
                className="rounded-xl px-6"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="rounded-xl px-8 bg-foreground text-background hover:bg-foreground/90"
              >
                {liability ? "Update Liability" : "Add Liability"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
