import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CalculatorShell from "./CalculatorShell";
import { useCalculatorData } from "@/hooks/useCalculatorData";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function SIPCalculator() {
  const { incomeStreams } = useCalculatorData();
  const { formatCurrency } = useCurrency();
  const [monthly, setMonthly] = useState("");
  const [rate, setRate] = useState("12");
  const [years, setYears] = useState("10");
  const [result, setResult] = useState<{ invested: number; returns: number; total: number } | null>(null);

  useEffect(() => {
    const primary = incomeStreams.find(i => i.frequency === 'monthly');
    if (primary) setMonthly(String(Math.round(Number(primary.amount) * 0.2)));
  }, [incomeStreams]);

  const calculate = () => {
    const p = parseFloat(monthly), r = parseFloat(rate) / 100 / 12, n = parseFloat(years) * 12;
    if ([p, r, n].some(isNaN) || p <= 0) return;
    const total = p * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const invested = p * n;
    setResult({ invested, returns: total - invested, total });
  };

  return (
    <CalculatorShell title="SIP Calculator" description="Work out returns from your Systematic Investment Plan."
      result={result ? (
        <div className="space-y-4">
          <div><p className="text-sm text-muted-foreground">Total Value</p><p className="text-2xl font-bold text-primary">{formatCurrency(result.total)}</p></div>
          <div><p className="text-sm text-muted-foreground">Total Invested</p><p className="text-lg">{formatCurrency(result.invested)}</p></div>
          <div><p className="text-sm text-muted-foreground">Estimated Returns</p><p className="text-lg font-semibold text-green-600">{formatCurrency(result.returns)}</p></div>
        </div>
      ) : undefined}
    >
      <div><Label>Monthly Investment</Label><Input type="number" value={monthly} onChange={e => setMonthly(e.target.value)} placeholder="5000" /></div>
      <div><Label>Expected Annual Return (%)</Label><Input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="12" /></div>
      <div><Label>Time Period (years)</Label><Input type="number" value={years} onChange={e => setYears(e.target.value)} placeholder="10" /></div>
      <Button onClick={calculate} className="w-full">Calculate</Button>
    </CalculatorShell>
  );
}
