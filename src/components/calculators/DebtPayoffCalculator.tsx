import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import CalculatorShell from "./CalculatorShell";
import { useCalculatorData } from "@/hooks/useCalculatorData";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function DebtPayoffCalculator() {
  const { liabilities } = useCalculatorData();
  const { formatCurrency } = useCurrency();
  const [balance, setBalance] = useState("");
  const [rate, setRate] = useState("");
  const [payment, setPayment] = useState("");
  const [result, setResult] = useState<{ months: number; totalInterest: number; totalPaid: number } | null>(null);

  useEffect(() => {
    if (liabilities.length > 0) {
      setBalance(String(Math.round(Number(liabilities[0].valuation))));
      if (liabilities[0].interest_rate) setRate(String(liabilities[0].interest_rate));
    }
  }, [liabilities]);

  const calculate = () => {
    const b = parseFloat(balance), r = parseFloat(rate) / 100 / 12, p = parseFloat(payment);
    if ([b, r, p].some(isNaN) || b <= 0 || p <= 0) return;
    if (p <= b * r) { setResult(null); return; }
    const months = Math.ceil(-Math.log(1 - (b * r) / p) / Math.log(1 + r));
    const totalPaid = p * months;
    setResult({ months, totalInterest: totalPaid - b, totalPaid });
  };

  return (
    <CalculatorShell title="Debt Payoff Calculator" description="See how long it might take to pay off your loan."
      result={result ? (
        <div className="space-y-4">
          <div><p className="text-sm text-muted-foreground">Time to Pay Off</p><p className="text-2xl font-bold text-primary">{Math.floor(result.months / 12)} years {result.months % 12} months</p></div>
          <div><p className="text-sm text-muted-foreground">Total Interest Paid</p><p className="text-lg text-destructive">{formatCurrency(result.totalInterest)}</p></div>
          <div><p className="text-sm text-muted-foreground">Total Amount Paid</p><p className="text-lg">{formatCurrency(result.totalPaid)}</p></div>
        </div>
      ) : undefined}
    >
      {liabilities.length > 0 && (
        <div>
          <Label>Pre-fill from liability</Label>
          <Select onValueChange={(v) => { const l = liabilities[parseInt(v)]; setBalance(String(l.valuation)); if (l.interest_rate) setRate(String(l.interest_rate)); }}>
            <SelectTrigger><SelectValue placeholder="Select liability" /></SelectTrigger>
            <SelectContent>{liabilities.map((l, i) => <SelectItem key={i} value={String(i)}>{l.description} ({formatCurrency(Number(l.valuation))})</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}
      <div><Label>Current Balance</Label><Input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="50000" /></div>
      <div><Label>Annual Interest Rate (%)</Label><Input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="8" /></div>
      <div><Label>Monthly Payment</Label><Input type="number" value={payment} onChange={e => setPayment(e.target.value)} placeholder="1000" /></div>
      <Button onClick={calculate} className="w-full">Calculate</Button>
    </CalculatorShell>
  );
}
