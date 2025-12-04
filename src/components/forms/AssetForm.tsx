import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase, Asset } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { TypeSelector, CurrencyAmountInput, CountrySelector, HolderToggle, DatePickerInput } from "./inputs";
import { Sparkles } from "lucide-react";

const assetSchema = z.object({
  valuation: z.string().min(1, "Valuation is required"),
  currency: z.string().min(1, "Currency is required"),
  type: z.string().min(1, "Type is required"),
  description: z.string().min(1, "Description is required"),
  country: z.string().optional(),
  holder: z.string().optional(),
  purchase_date: z.string().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

interface AssetFormProps {
  children?: React.ReactNode;
  asset?: Asset;
  onSuccess: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function AssetForm({ children, asset, onSuccess, open: controlledOpen, onOpenChange }: AssetFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (onOpenChange || (() => {})) : setInternalOpen;
  const { user } = useAuth();

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      valuation: asset?.valuation?.toString() || "",
      currency: asset?.currency || "USD",
      type: asset?.type || "",
      description: asset?.description || "",
      country: asset?.country || "",
      holder: asset?.holder || "",
      purchase_date: asset?.purchase_date || "",
    },
  });

  const onSubmit = async (data: AssetFormData) => {
    if (!user) return;

    const payload = {
      user_id: user.id,
      valuation: parseFloat(data.valuation),
      currency: data.currency as "USD" | "EUR" | "GBP" | "INR" | "JPY" | "AUD" | "CAD",
      type: data.type as "CASH" | "EQUITY" | "CRYPTO" | "GOLD" | "REAL_ESTATE" | "OTHER",
      description: data.description,
      country: data.country || null,
      holder: data.holder || null,
      purchase_date: data.purchase_date || null,
    };

    const { error } = asset
      ? await supabase.from("assets").update(payload).eq("id", asset.id)
      : await supabase.from("assets").insert(payload);

    if (error) {
      toast.error("Failed to save asset");
      console.error(error);
    } else {
      toast.success(asset ? "Asset updated successfully" : "Asset created successfully");
      setOpen(false);
      form.reset();
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-foreground" />
            {asset ? "Edit Asset" : "Add New Asset"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            {/* Asset Type Selection */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Asset Type
                  </FormLabel>
                  <FormControl>
                    <TypeSelector
                      type="asset"
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
                    Asset Name
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., ICICI Savings Account, Tesla Stock, Bitcoin..." 
                      className="h-12 rounded-xl border-2 text-base"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Valuation with Currency */}
            <FormField
              control={form.control}
              name="valuation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Current Value
                  </FormLabel>
                  <FormControl>
                    <CurrencyAmountInput
                      amount={field.value}
                      currency={form.watch("currency")}
                      onAmountChange={field.onChange}
                      onCurrencyChange={(value) => form.setValue("currency", value)}
                      placeholder="10,000"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Country & Holder Row */}
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
                      Owner
                    </FormLabel>
                    <FormControl>
                      <HolderToggle
                        value={field.value || "Self"}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Purchase Date */}
            <FormField
              control={form.control}
              name="purchase_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Purchase Date
                  </FormLabel>
                  <FormControl>
                    <DatePickerInput
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="When did you acquire this?"
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
                {asset ? "Update Asset" : "Add Asset"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
