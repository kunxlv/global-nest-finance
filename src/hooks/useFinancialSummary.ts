import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { CurrencyCode } from '@/lib/currencyConversion';

interface FinancialSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  totalBankBalance: number;
  isLoading: boolean;
  error: string | null;
}

export function useFinancialSummary(): FinancialSummary {
  const { user } = useAuth();
  const { convertToDisplayCurrency, exchangeRates } = useCurrency();
  const [summary, setSummary] = useState<FinancialSummary>({
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0,
    totalBankBalance: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!user || !exchangeRates) {
      setSummary(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchFinancialData = async () => {
      try {
        setSummary(prev => ({ ...prev, isLoading: true, error: null }));

        // Fetch all financial data in parallel
        const [assetsResult, liabilitiesResult, bankAccountsResult] = await Promise.all([
          supabase
            .from('assets')
            .select('valuation, currency')
            .eq('user_id', user.id),
          supabase
            .from('liabilities')
            .select('valuation, currency')
            .eq('user_id', user.id),
          supabase
            .from('bank_accounts')
            .select('balance, currency')
            .eq('user_id', user.id),
        ]);

        if (assetsResult.error) throw assetsResult.error;
        if (liabilitiesResult.error) throw liabilitiesResult.error;
        if (bankAccountsResult.error) throw bankAccountsResult.error;

        // Calculate total assets (converted to display currency)
        const totalAssets = (assetsResult.data || []).reduce((sum, asset) => {
          const converted = convertToDisplayCurrency(
            Number(asset.valuation),
            asset.currency as CurrencyCode
          );
          return sum + converted;
        }, 0);

        // Calculate total liabilities (converted to display currency)
        const totalLiabilities = (liabilitiesResult.data || []).reduce((sum, liability) => {
          const converted = convertToDisplayCurrency(
            Number(liability.valuation),
            liability.currency as CurrencyCode
          );
          return sum + converted;
        }, 0);

        // Calculate total bank balance (converted to display currency)
        const totalBankBalance = (bankAccountsResult.data || []).reduce((sum, account) => {
          const converted = convertToDisplayCurrency(
            Number(account.balance),
            account.currency as CurrencyCode
          );
          return sum + converted;
        }, 0);

        const netWorth = totalAssets - totalLiabilities;

        setSummary({
          totalAssets,
          totalLiabilities,
          netWorth,
          totalBankBalance,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching financial summary:', error);
        setSummary(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load financial data',
        }));
      }
    };

    fetchFinancialData();
  }, [user, exchangeRates, convertToDisplayCurrency]);

  return summary;
}
