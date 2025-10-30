import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  trend?: number;
  className?: string;
  variant?: "default" | "dark";
}

export default function StatCard({ 
  title, 
  value, 
  trend,
  className,
  variant = "dark"
}: StatCardProps) {
  return (
    <div 
      className={cn(
        "rounded-2xl p-5 relative overflow-hidden transition-all duration-200 hover:scale-[1.01]",
        variant === "dark" 
          ? "bg-card text-card-foreground shadow-sm border border-border" 
          : "bg-card shadow-sm border border-border",
        className
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className={cn(
            "text-xs font-medium uppercase tracking-wide",
            "text-muted-foreground"
          )}>
            {title}
          </p>
          {trend !== undefined && (
            <span className={cn(
              "text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium",
              trend > 0 
                ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" 
                : "bg-destructive/10 text-destructive"
            )}>
              {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
      </div>
    </div>
  );
}
