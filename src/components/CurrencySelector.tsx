import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { SUPPORTED_CURRENCIES, CURRENCY_SYMBOLS, CURRENCY_NAMES, CurrencyCode } from "@/lib/currencyConversion";
import { toast } from "sonner";

export default function CurrencySelector() {
  const { displayCurrency, setDisplayCurrency, isLoading } = useCurrency();
  const { profile, updateProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleCurrencyChange = (currency: CurrencyCode) => {
    setDisplayCurrency(currency);
    toast.success(`Switched to ${CURRENCY_NAMES[currency]}`);
  };

  const handleSaveAsDefault = async () => {
    try {
      setIsSaving(true);
      const { error } = await updateProfile({ preferred_currency: displayCurrency });

      if (error) {
        toast.error("Failed to save currency preference");
      } else {
        toast.success(`${CURRENCY_NAMES[displayCurrency]} saved as default currency`);
      }
    } catch (error) {
      console.error("Error saving currency preference:", error);
      toast.error("Failed to save currency preference");
    } finally {
      setIsSaving(false);
    }
  };

  const isDefault = profile?.preferred_currency === displayCurrency;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-card border-border hover:secondary" disabled={isLoading}>
          {CURRENCY_SYMBOLS[displayCurrency]} {displayCurrency}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border-border z-50">
        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Select Currency</div>
        <DropdownMenuSeparator />
        {SUPPORTED_CURRENCIES.map((currency) => (
          <DropdownMenuItem key={currency} onClick={() => handleCurrencyChange(currency)} className="cursor-pointer">
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-2">
                <span className="text-base">{CURRENCY_SYMBOLS[currency]}</span>
                <span className="font-medium">{currency}</span>
                <span className="text-muted-foreground text-sm">{CURRENCY_NAMES[currency]}</span>
              </span>
              {displayCurrency === currency && <Check className="w-4 h-4 text-primary" />}
            </div>
          </DropdownMenuItem>
        ))}
        {!isDefault && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSaveAsDefault}
              disabled={isSaving}
              className="cursor-pointer font-medium text-primary"
            >
              {isSaving ? "Saving..." : "Save as Default"}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
