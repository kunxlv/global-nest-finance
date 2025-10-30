import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BankAccountCardProps {
  name: string;
  country: string;
  balance: string;
  variant?: "purple" | "blue" | "black" | "pink";
  isPrimary?: string;
}

const variantStyles = {
  purple: "bg-gradient-to-br from-purple-600 to-purple-800",
  blue: "bg-gradient-to-br from-blue-600 to-blue-800",
  black: "bg-gradient-to-br from-gray-900 to-black",
  pink: "bg-gradient-to-br from-pink-600 to-pink-800",
};

export default function BankAccountCard({ 
  name, 
  country, 
  balance, 
  variant = "purple",
  isPrimary 
}: BankAccountCardProps) {
  return (
    <div className={cn(
      "rounded-2xl p-5 text-white min-w-[240px] transition-all duration-200 hover:scale-[1.02] shadow-lg",
      variantStyles[variant]
    )}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg tracking-tight">{name}</h3>
            <p className="text-sm text-white/70 mt-0.5">{country}</p>
          </div>
          {isPrimary && (
            <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-0 shrink-0">
              {isPrimary}
            </Badge>
          )}
        </div>
        <p className="text-3xl font-semibold tracking-tight">{balance}</p>
      </div>
    </div>
  );
}
