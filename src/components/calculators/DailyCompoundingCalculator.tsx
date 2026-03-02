import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import CalculatorShell from "./CalculatorShell";
import { useCalculatorData } from "@/hooks/useCalculatorData";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function DailyCompoundingCalculator() {
  const { bankAccounts } = useCalculatorData();
  const { formatCurrency } = useCurrency();
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("5");
  const [days, setDays] = useState("365");
  const [result, setResult] = useState<{ finalAmount: number; interest: number } | null>(null);

  useEffect(() => {
    if (bankAccounts.length > 0) {
      setPrincipal(String(Math.round(bankAccounts.reduce((s, a) => s + Number(a.balance), 0))));
    }
  }, [bankAccounts]);

  const calculate = () => {
    const p = parseFloat(principal), r = parseFloat(rate) / 100, d = parseFloat(days);
    if ([p, r, d].some(isNaN) || p <= 0) return;
    const finalAmount = p * Math.pow(1 + r / 365, d);
    setResult({ finalAmount, interest: finalAmount - p });
  };

  return (
    <CalculatorShell title="Daily Compounding Calculator" description="Calculate the daily compound interest on your investment."
      result={result ? (
        <div className="space-y-4">
          <div><p className="text-sm text-muted-foreground">Final Amount</p><p className="text-2xl font-bold text-primary">{formatCurrency(result.finalAmount)}</p></div>
          <div><p className="text-sm text-muted-foreground">Interest Earned</p><p className="text-xl font-semibold text-green-600">{formatCurrency(result.interest)}</p></div>
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
      <div><Label>Number of Days</Label><Input type="number" value={days} onChange={e => setDays(e.target.value)} placeholder="365" /></div>
      <Button onClick={calculate} className="w-full">Calculate</Button>
    </CalculatorShell>
  );
}
