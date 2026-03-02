import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import CalculatorShell from "./CalculatorShell";
import { useCalculatorData } from "@/hooks/useCalculatorData";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function InterestRateCalculator() {
  const { liabilities } = useCalculatorData();
  const { formatCurrency } = useCurrency();
  const [loanAmount, setLoanAmount] = useState("");
  const [payment, setPayment] = useState("");
  const [termYears, setTermYears] = useState("");
  const [result, setResult] = useState<{ rate: number } | null>(null);

  useEffect(() => {
    if (liabilities.length > 0) {
      setLoanAmount(String(Math.round(Number(liabilities[0].valuation))));
    }
  }, [liabilities]);

  const calculate = () => {
    const p = parseFloat(loanAmount), m = parseFloat(payment), n = parseFloat(termYears) * 12;
    if ([p, m, n].some(isNaN) || p <= 0 || m <= 0) return;
    // Newton's method to find rate
    let r = 0.005; // initial guess 6% annual
    for (let i = 0; i < 100; i++) {
      const f = p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) - m;
      const df = p * (Math.pow(1 + r, n) * (1 + n * r) - 1) / Math.pow(Math.pow(1 + r, n) - 1, 2);
      if (Math.abs(df) < 1e-10) break;
      r = r - f / df;
      if (Math.abs(f) < 0.01) break;
    }
    setResult({ rate: r * 12 * 100 });
  };

  return (
    <CalculatorShell title="Interest Rate Calculator" description="Work out what interest rate you're paying on your loan."
      result={result ? (
        <div className="space-y-4">
          <div><p className="text-sm text-muted-foreground">Estimated Annual Interest Rate</p><p className="text-3xl font-bold text-primary">{result.rate.toFixed(2)}%</p></div>
          <div><p className="text-sm text-muted-foreground">Monthly Rate</p><p className="text-lg">{(result.rate / 12).toFixed(3)}%</p></div>
        </div>
      ) : undefined}
    >
      {liabilities.length > 0 && (
        <div>
          <Label>Pre-fill from liability</Label>
          <Select onValueChange={(v) => { setLoanAmount(String(liabilities[parseInt(v)].valuation)); }}>
            <SelectTrigger><SelectValue placeholder="Select liability" /></SelectTrigger>
            <SelectContent>{liabilities.map((l, i) => <SelectItem key={i} value={String(i)}>{l.description} ({formatCurrency(Number(l.valuation))})</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}
      <div><Label>Loan Amount</Label><Input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} placeholder="100000" /></div>
      <div><Label>Monthly Payment</Label><Input type="number" value={payment} onChange={e => setPayment(e.target.value)} placeholder="1500" /></div>
      <div><Label>Loan Term (years)</Label><Input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} placeholder="10" /></div>
      <Button onClick={calculate} className="w-full">Calculate</Button>
    </CalculatorShell>
  );
}
