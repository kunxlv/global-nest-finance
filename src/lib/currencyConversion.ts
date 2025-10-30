// Currency conversion utilities using Frankfurter API (free, no API key required)

export type CurrencyCode = 'USD' | 'EUR' | 'INR' | 'GBP' | 'JPY' | 'AUD' | 'CAD';

interface CachedRates {
  baseCurrency: string;
  rates: Record<string, number>;
  timestamp: number;
}

interface ExchangeRatesResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

const CACHE_KEY = 'exchange_rates_cache';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'INR', 'GBP', 'JPY', 'AUD', 'CAD'];

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  INR: '₹',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
};

export const CURRENCY_NAMES: Record<CurrencyCode, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  INR: 'Indian Rupee',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
};

export function getCachedRates(): CachedRates | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedRates = JSON.parse(cached);
    const now = Date.now();

    if (now - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading cached rates:', error);
    return null;
  }
}

function setCachedRates(baseCurrency: string, rates: Record<string, number>): void {
  try {
    const data: CachedRates = {
      baseCurrency,
      rates,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error caching rates:', error);
  }
}

export async function fetchExchangeRates(baseCurrency: CurrencyCode = 'USD'): Promise<Record<string, number>> {
  // Check cache first
  const cached = getCachedRates();
  if (cached && cached.baseCurrency === baseCurrency) {
    return cached.rates;
  }

  try {
    const targetCurrencies = SUPPORTED_CURRENCIES.filter(c => c !== baseCurrency).join(',');
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${baseCurrency}&to=${targetCurrencies}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
    }

    const data: ExchangeRatesResponse = await response.json();
    
    // Add the base currency with rate 1.0
    const rates = { ...data.rates, [baseCurrency]: 1.0 };
    
    setCachedRates(baseCurrency, rates);
    return rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // If cached rates exist (even for different base), try to use them
    if (cached) {
      console.warn('Using stale cached rates due to API error');
      return cached.rates;
    }
    
    // Return default rates (1:1) so the app still works
    const defaultRates: Record<string, number> = {};
    SUPPORTED_CURRENCIES.forEach(currency => {
      defaultRates[currency] = 1.0;
    });
    return defaultRates;
  }
}

export function convertAmount(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];

  if (!fromRate || !toRate) {
    console.warn(`Missing rate for ${fromCurrency} or ${toCurrency}`);
    return amount;
  }

  return (amount / fromRate) * toRate;
}

export function getCurrencySymbol(currencyCode: CurrencyCode): string {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
}

export function formatCurrency(amount: number, currencyCode: CurrencyCode): string {
  const symbol = getCurrencySymbol(currencyCode);
  
  // Format with proper thousand separators
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}
