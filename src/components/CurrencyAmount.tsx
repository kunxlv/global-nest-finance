import { useCurrency } from '@/contexts/CurrencyContext';
import { CurrencyCode, CURRENCY_SYMBOLS } from '@/lib/currencyConversion';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CurrencyAmountProps {
  amount: number;
  originalCurrency: CurrencyCode;
  showOriginal?: boolean;
  className?: string;
}

export default function CurrencyAmount({
  amount,
  originalCurrency,
  showOriginal = false,
  className = '',
}: CurrencyAmountProps) {
  const { convertToDisplayCurrency, formatCurrency, displayCurrency, isLoading } = useCurrency();

  if (isLoading) {
    return <Skeleton className="h-6 w-24" />;
  }

  const convertedAmount = convertToDisplayCurrency(amount, originalCurrency);
  const displayText = formatCurrency(convertedAmount);

  // If showing original and currencies are different
  if (showOriginal && originalCurrency !== displayCurrency) {
    const originalSymbol = CURRENCY_SYMBOLS[originalCurrency];
    const originalFormatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
    const originalText = amount < 0 ? `-${originalSymbol}${originalFormatted}` : `${originalSymbol}${originalFormatted}`;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={className}>{displayText}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Original: {originalText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <span className={className}>{displayText}</span>;
}
