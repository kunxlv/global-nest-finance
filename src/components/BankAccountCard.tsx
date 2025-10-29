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
      "rounded-3xl p-6 text-white min-w-[240px]",
      variantStyles[variant]
    )}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-lg">{name}</h3>
            <p className="text-sm text-white/70">{country}</p>
          </div>
          {isPrimary && (
            <Badge className="bg-[hsl(var(--success))]/20 text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/30">
              {isPrimary}
            </Badge>
          )}
        </div>
        <p className="text-3xl font-bold">{balance}</p>
      </div>
    </div>
  );
}
