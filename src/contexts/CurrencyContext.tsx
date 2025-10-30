import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  fetchExchangeRates,
  convertAmount,
  formatCurrency as formatCurrencyUtil,
  getCachedRates,
  CurrencyCode,
} from '@/lib/currencyConversion';
import { toast } from 'sonner';

interface CurrencyContextType {
  displayCurrency: CurrencyCode;
  exchangeRates: Record<string, number> | null;
  isLoading: boolean;
  setDisplayCurrency: (currency: CurrencyCode) => void;
  convertToDisplayCurrency: (amount: number, originalCurrency: CurrencyCode) => number;
  formatCurrency: (amount: number, currency?: CurrencyCode) => string;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [displayCurrency, setDisplayCurrency] = useState<CurrencyCode>('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize display currency from user profile
  useEffect(() => {
    if (profile?.preferred_currency) {
      setDisplayCurrency(profile.preferred_currency as CurrencyCode);
    }
  }, [profile]);

  // Fetch exchange rates
  const loadExchangeRates = async (baseCurrency: CurrencyCode) => {
    try {
      setIsLoading(true);
      
      // Try to use cached rates first for instant display
      const cached = getCachedRates();
      if (cached) {
        setExchangeRates(cached.rates);
        setIsLoading(false);
      }

      // Fetch fresh rates in the background
      const rates = await fetchExchangeRates(baseCurrency);
      setExchangeRates(rates);
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      toast.error('Unable to fetch exchange rates. Showing original currencies.');
      
      // If we have cached rates, use them despite error
      const cached = getCachedRates();
      if (cached) {
        setExchangeRates(cached.rates);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load rates when display currency changes
  useEffect(() => {
    loadExchangeRates(displayCurrency);
  }, [displayCurrency]);

  const convertToDisplayCurrency = (amount: number, originalCurrency: CurrencyCode): number => {
    if (!exchangeRates) return amount;
    return convertAmount(amount, originalCurrency, displayCurrency, exchangeRates);
  };

  const formatCurrency = (amount: number, currency?: CurrencyCode): string => {
    return formatCurrencyUtil(amount, currency || displayCurrency);
  };

  const refreshRates = async () => {
    await loadExchangeRates(displayCurrency);
  };

  const value: CurrencyContextType = {
    displayCurrency,
    exchangeRates,
    isLoading,
    setDisplayCurrency,
    convertToDisplayCurrency,
    formatCurrency,
    refreshRates,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
