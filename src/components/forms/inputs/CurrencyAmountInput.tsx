import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
];

interface CurrencyAmountInputProps {
  amount: string;
  currency: string;
  onAmountChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CurrencyAmountInput({
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  placeholder = "0.00",
  className,
  disabled = false,
}: CurrencyAmountInputProps) {
  const selectedCurrency = currencies.find(c => c.code === currency);

  return (
    <div className={cn(
      "flex items-center rounded-xl border-2 border-input bg-background transition-all duration-200",
      "focus-within:border-foreground focus-within:ring-2 focus-within:ring-ring/20",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}>
      <Select value={currency} onValueChange={onCurrencyChange} disabled={disabled}>
        <SelectTrigger className="w-[100px] border-0 rounded-l-xl rounded-r-none bg-muted/50 focus:ring-0 h-12">
          <SelectValue>
            <span className="flex items-center gap-1.5">
              <span className="text-lg font-semibold">{selectedCurrency?.symbol}</span>
              <span className="text-xs text-muted-foreground">{currency}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-popover border shadow-lg">
          {currencies.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              <span className="flex items-center gap-2">
                <span className="font-semibold w-6">{c.symbol}</span>
                <span>{c.code}</span>
                <span className="text-muted-foreground text-xs">· {c.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="border-0 rounded-l-none rounded-r-xl h-12 text-lg font-medium focus-visible:ring-0 bg-transparent"
      />
    </div>
  );
}
