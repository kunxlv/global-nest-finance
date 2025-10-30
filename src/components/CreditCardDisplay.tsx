import { cn } from "@/lib/utils";

interface CreditCardDisplayProps {
  bankName: string;
  last4: string;
  holderName: string;
  expiry: string;
  variant?: "purple" | "black" | "pink" | "blue";
}

const variantStyles = {
  purple: "bg-gradient-to-br from-purple-600 to-purple-800",
  black: "bg-gradient-to-br from-gray-900 to-black",
  pink: "bg-gradient-to-br from-pink-600 to-pink-800",
  blue: "bg-gradient-to-br from-blue-600 to-blue-800",
};

export default function CreditCardDisplay({ 
  bankName, 
  last4, 
  holderName, 
  expiry,
  variant = "purple" 
}: CreditCardDisplayProps) {
  return (
    <div className={cn(
      "rounded-3xl p-6 text-white w-[280px] h-[180px] flex flex-col justify-between relative overflow-hidden shadow-lg transition-all duration-200 hover:scale-[1.02]",
      variantStyles[variant]
    )}>
      {/* Card chip */}
      <div className="flex justify-between items-start">
        <div className="w-12 h-10 rounded-lg bg-gradient-to-br from-yellow-200 to-yellow-400 shadow-md" />
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-white/60" />
        </div>
      </div>

      {/* Card number */}
      <div>
        <p className="text-xl font-mono tracking-wider mb-4">
          •••• •••• •••• {last4}
        </p>
        
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-white/70 mb-1 uppercase tracking-wide">Card Holder</p>
            <p className="text-sm font-semibold uppercase tracking-wide">{holderName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/70 mb-1 uppercase tracking-wide">Expires</p>
            <p className="text-sm font-semibold">{expiry}</p>
          </div>
        </div>
      </div>

      {/* Mastercard circles */}
      <div className="absolute bottom-4 right-6 flex">
        <div className="w-8 h-8 rounded-full bg-red-500/90 shadow-lg" />
        <div className="w-8 h-8 rounded-full bg-yellow-500/90 -ml-3 shadow-lg" />
      </div>
      
      <div className="absolute top-6 right-6">
        <p className="text-xs font-semibold tracking-wide">{bankName}</p>
      </div>
    </div>
  );
}
