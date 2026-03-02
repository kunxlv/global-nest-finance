import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import CalculatorShell from "./CalculatorShell";
import { useCalculatorData } from "@/hooks/useCalculatorData";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function CreditCardPaymentCalculator() {
  const { liabilities } = useCalculatorData();
  const { formatCurrency } = useCurrency();
  const [balance, setBalance] = useState("");
  const [apr, setApr] = useState("18");
  const [payment, setPayment] = useState("");
  const [result, setResult] = useState<{ months: number; totalInterest: number; totalPaid: number; minPayment: number } | null>(null);

  const ccDebts = liabilities.filter(l => l.type === 'CREDIT_CARD');

  useEffect(() => {
    if (ccDebts.length > 0) {
      setBalance(String(Math.round(Number(ccDebts[0].valuation))));
      if (ccDebts[0].interest_rate) setApr(String(ccDebts[0].interest_rate));
    }
  }, [liabilities]);

  const calculate = () => {
    const b = parseFloat(balance), r = parseFloat(apr) / 100 / 12, p = parseFloat(payment);
    if ([b, r, p].some(isNaN) || b <= 0 || p <= 0) return;
    if (p <= b * r) { setResult(null); return; }
    const months = Math.ceil(-Math.log(1 - (b * r) / p) / Math.log(1 + r));
    const totalPaid = p * months;
    const minPayment = b * 0.02 > 25 ? b * 0.02 : 25;
    setResult({ months, totalInterest: totalPaid - b, totalPaid, minPayment });
  };

  return (
    <CalculatorShell title="Credit Card Payment Calculator" description="Work out strategies for paying off your credit card debt."
      result={result ? (
        <div className="space-y-4">
          <div><p className="text-sm text-muted-foreground">Payoff Time</p><p className="text-2xl font-bold text-primary">{Math.floor(result.months / 12)} years {result.months % 12} months</p></div>
          <div><p className="text-sm text-muted-foreground">Total Interest</p><p className="text-lg text-destructive">{formatCurrency(result.totalInterest)}</p></div>
          <div><p className="text-sm text-muted-foreground">Suggested Minimum Payment</p><p className="text-lg">{formatCurrency(result.minPayment)}</p></div>
        </div>
      ) : undefined}
    >
      {ccDebts.length > 0 && (
        <div>
          <Label>Pre-fill from credit card</Label>
          <Select onValueChange={(v) => { const l = ccDebts[parseInt(v)]; setBalance(String(l.valuation)); if (l.interest_rate) setApr(String(l.interest_rate)); }}>
            <SelectTrigger><SelectValue placeholder="Select credit card" /></SelectTrigger>
            <SelectContent>{ccDebts.map((l, i) => <SelectItem key={i} value={String(i)}>{l.description} ({formatCurrency(Number(l.valuation))})</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}
      <div><Label>Current Balance</Label><Input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="5000" /></div>
      <div><Label>APR (%)</Label><Input type="number" value={apr} onChange={e => setApr(e.target.value)} placeholder="18" /></div>
      <div><Label>Monthly Payment</Label><Input type="number" value={payment} onChange={e => setPayment(e.target.value)} placeholder="200" /></div>
      <Button onClick={calculate} className="w-full">Calculate</Button>
    </CalculatorShell>
  );
}
