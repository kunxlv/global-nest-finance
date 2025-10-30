import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase, Card } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const cardSchema = z.object({
  bank_name: z.string().min(1, "Bank name is required"),
  last_four: z.string().length(4, "Must be exactly 4 digits"),
  holder_name: z.string().min(1, "Cardholder name is required"),
  expiry: z.string().min(1, "Expiry date is required"),
  color_variant: z.string(),
});

type CardFormData = z.infer<typeof cardSchema>;

interface CardFormProps {
  children: React.ReactNode;
  card?: Card;
  onSuccess: () => void;
}

export default function CardForm({ children, card, onSuccess }: CardFormProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const form = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      bank_name: card?.bank_name || "",
      last_four: card?.last_four || "",
      holder_name: card?.holder_name || "",
      expiry: card?.expiry || "",
      color_variant: card?.color_variant || "purple",
    },
  });

  const onSubmit = async (data: CardFormData) => {
    if (!user) return;

    const payload = {
      user_id: user.id,
      bank_name: data.bank_name,
      last_four: data.last_four,
      holder_name: data.holder_name,
      expiry: data.expiry,
      color_variant: data.color_variant,
    };

    const { error } = card
      ? await supabase.from("cards").update(payload).eq("id", card.id)
      : await supabase.from("cards").insert(payload);

    if (error) {
      toast.error("Failed to save card");
      console.error(error);
    } else {
      toast.success(card ? "Card updated successfully" : "Card created successfully");
      setOpen(false);
      form.reset();
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{card ? "Edit Card" : "Add Card"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Chase" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_four"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last 4 Digits</FormLabel>
                    <FormControl>
                      <Input placeholder="1234" maxLength={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="holder_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cardholder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="JOHN DOE" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry (MM/YY)</FormLabel>
                    <FormControl>
                      <Input placeholder="12/28" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color_variant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Theme</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="black">Black</SelectItem>
                        <SelectItem value="pink">Pink</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{card ? "Update" : "Create"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
