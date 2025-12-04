import { cn } from "@/lib/utils";
import { User, Users, UserCheck } from "lucide-react";

const holders = [
  { value: "Self", icon: User },
  { value: "Spouse", icon: UserCheck },
  { value: "Joint", icon: Users },
];

interface HolderToggleProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function HolderToggle({ value, onChange, className }: HolderToggleProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {holders.map((holder) => {
        const Icon = holder.icon;
        const isSelected = value === holder.value;
        
        return (
          <button
            key={holder.value}
            type="button"
            onClick={() => onChange(holder.value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all duration-200",
              "hover:border-foreground/20 hover:bg-muted/50",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              isSelected
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-muted-foreground"
            )}
          >
            <Icon className={cn("h-4 w-4", isSelected && "scale-110")} />
            <span className="text-sm font-medium">{holder.value}</span>
          </button>
        );
      })}
    </div>
  );
}
