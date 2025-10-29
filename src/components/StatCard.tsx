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
        "rounded-3xl p-6 relative overflow-hidden",
        variant === "dark" ? "bg-[#2a2a2a] text-white" : "bg-card",
        className
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className={cn(
            "text-sm font-medium",
            variant === "dark" ? "text-white/70" : "text-muted-foreground"
          )}>
            {title}
          </p>
          {trend !== undefined && (
            <span className={cn(
              "text-xs px-2 py-1 rounded-full flex items-center gap-1",
              trend > 0 
                ? "bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]" 
                : "bg-destructive/20 text-destructive"
            )}>
              {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
}
