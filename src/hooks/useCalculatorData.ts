import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CalculatorData {
  assets: { description: string; valuation: number; currency: string; type: string }[];
  liabilities: { description: string; valuation: number; currency: string; type: string; interest_rate: number | null }[];
  incomeStreams: { name: string; amount: number; currency: string; frequency: string | null }[];
  bankAccounts: { name: string; balance: number; currency: string }[];
  isLoading: boolean;
}

export function useCalculatorData(): CalculatorData {
  const { user } = useAuth();
  const [data, setData] = useState<CalculatorData>({
    assets: [], liabilities: [], incomeStreams: [], bankAccounts: [], isLoading: true,
  });

  useEffect(() => {
    if (!user) { setData(prev => ({ ...prev, isLoading: false })); return; }

    const fetch = async () => {
      const [a, l, i, b] = await Promise.all([
        supabase.from('assets').select('description, valuation, currency, type').eq('user_id', user.id),
        supabase.from('liabilities').select('description, valuation, currency, type, interest_rate').eq('user_id', user.id),
        supabase.from('income_streams').select('name, amount, currency, frequency').eq('user_id', user.id),
        supabase.from('bank_accounts').select('name, balance, currency').eq('user_id', user.id),
      ]);
      setData({
        assets: a.data || [], liabilities: l.data || [],
        incomeStreams: i.data || [], bankAccounts: b.data || [], isLoading: false,
      });
    };
    fetch();
  }, [user]);

  return data;
}
