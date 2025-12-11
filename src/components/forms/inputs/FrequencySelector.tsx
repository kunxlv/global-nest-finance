import { cn } from "@/lib/utils";

type Frequency = "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "YEARLY";

const frequencies: { value: Frequency; label: string; short: string }[] = [
  { value: "DAILY", label: "Daily", short: "Day" },
  { value: "WEEKLY", label: "Weekly", short: "Week" },
  { value: "BIWEEKLY", label: "Biweekly", short: "2 Wks" },
  { value: "MONTHLY", label: "Monthly", short: "Month" },
  { value: "QUARTERLY", label: "Quarterly", short: "3 Mo" },
  { value: "HALF_YEARLY", label: "Half-Yearly", short: "6 Mo" },
  { value: "YEARLY", label: "Yearly", short: "Year" },
];

interface FrequencySelectorProps {
  value: Frequency;
  onChange: (value: Frequency) => void;
  className?: string;
}

export function FrequencySelector({ value, onChange, className }: FrequencySelectorProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {frequencies.map((freq) => {
        const isSelected = value === freq.value;
        
        return (
          <button
            key={freq.value}
            type="button"
            onClick={() => onChange(freq.value)}
            className={cn(
              "px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
              "border border-border/30 shadow-sm",
              "hover:shadow-md hover:border-border/50 hover:bg-muted/50",
              "focus:outline-none focus:ring-2 focus:ring-primary/20",
              isSelected
                ? "bg-card-foreground text-card border-card-foreground shadow-md"
                : "bg-muted/30 text-muted-foreground"
            )}
          >
            <span className="hidden sm:inline">{freq.label}</span>
            <span className="sm:hidden">{freq.short}</span>
          </button>
        );
      })}
    </div>
  );
}
