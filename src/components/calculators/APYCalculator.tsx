import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import CalculatorShell from "./CalculatorShell";
import { useCalculatorData } from "@/hooks/useCalculatorData";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function APYCalculator() {
  const { bankAccounts } = useCalculatorData();
  const { formatCurrency } = useCurrency();
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [compounds, setCompounds] = useState("12");
  const [years, setYears] = useState("1");
  const [result, setResult] = useState<{ finalAmount: number; interest: number; apy: number } | null>(null);

  useEffect(() => {
    if (bankAccounts.length > 0) {
      const total = bankAccounts.reduce((s, a) => s + Number(a.balance), 0);
      if (total > 0) setPrincipal(String(Math.round(total)));
    }
  }, [bankAccounts]);

  const calculate = () => {
    const p = parseFloat(principal), r = parseFloat(rate) / 100, n = parseFloat(compounds), t = parseFloat(years);
    if ([p, r, n, t].some(isNaN) || p <= 0) return;
    const finalAmount = p * Math.pow(1 + r / n, n * t);
    const apy = Math.pow(1 + r / n, n) - 1;
    setResult({ finalAmount, interest: finalAmount - p, apy: apy * 100 });
  };

  return (
    <CalculatorShell title="APY Calculator" description="Work out how much interest you might earn on your savings."
      result={result ? (
        <div className="space-y-4">
          <div><p className="text-sm text-muted-foreground">Final Amount</p><p className="text-2xl font-bold text-primary">{formatCurrency(result.finalAmount)}</p></div>
          <div><p className="text-sm text-muted-foreground">Interest Earned</p><p className="text-xl font-semibold text-green-600">{formatCurrency(result.interest)}</p></div>
          <div><p className="text-sm text-muted-foreground">Annual Percentage Yield (APY)</p><p className="text-xl font-semibold">{result.apy.toFixed(2)}%</p></div>
        </div>
      ) : undefined}
    >
      {bankAccounts.length > 0 && (
        <div>
          <Label>Pre-fill from account</Label>
          <Select onValueChange={(v) => setPrincipal(v)}>
            <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
            <SelectContent>{bankAccounts.map((a, i) => <SelectItem key={i} value={String(a.balance)}>{a.name} ({formatCurrency(Number(a.balance))})</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}
      <div><Label>Principal Amount</Label><Input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} placeholder="10000" /></div>
      <div><Label>Annual Interest Rate (%)</Label><Input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="5" /></div>
      <div><Label>Compounding Frequency</Label>
        <Select value={compounds} onValueChange={setCompounds}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Annually</SelectItem><SelectItem value="2">Semi-Annually</SelectItem>
            <SelectItem value="4">Quarterly</SelectItem><SelectItem value="12">Monthly</SelectItem>
            <SelectItem value="365">Daily</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div><Label>Time Period (years)</Label><Input type="number" value={years} onChange={e => setYears(e.target.value)} placeholder="1" /></div>
      <Button onClick={calculate} className="w-full">Calculate</Button>
    </CalculatorShell>
  );
}
