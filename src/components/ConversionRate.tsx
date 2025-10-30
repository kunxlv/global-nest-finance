import { useCurrency } from '@/contexts/CurrencyContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function ConversionRate() {
  const { displayCurrency, exchangeRates, isLoading } = useCurrency();

  if (isLoading || !exchangeRates) {
    return <Skeleton className="h-9 w-32" />;
  }

  // If already showing INR, show rate to USD instead
  if (displayCurrency === 'INR') {
    const rateToUSD = exchangeRates['USD'];
    const displayRate = rateToUSD ? (1 / rateToUSD).toFixed(2) : '1.00';
    
    return (
      <div className="text-xs sm:text-sm text-muted-foreground font-medium">
        1 INR = ${displayRate}
      </div>
    );
  }

  // Show conversion rate of selected currency to INR
  const rateToINR = exchangeRates['INR'];
  const rateFromBase = exchangeRates[displayCurrency] || 1;
  const conversionRate = rateToINR && rateFromBase ? (rateToINR / rateFromBase).toFixed(2) : '1.00';

  return (
    <div className="text-xs sm:text-sm text-muted-foreground font-medium">
      1 {displayCurrency} = ₹{conversionRate}
    </div>
  );
}
