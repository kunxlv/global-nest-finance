import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import CalculatorShell from "./CalculatorShell";
import { useCalculatorData } from "@/hooks/useCalculatorData";
import { useCurrency } from "@/contexts/CurrencyContext";

interface AmortRow { month: number; payment: number; principal: number; interest: number; balance: number; }

export default function AmortizationCalculator() {
  const { liabilities } = useCalculatorData();
  const { formatCurrency } = useCurrency();
  const [loanAmount, setLoanAmount] = useState("");
  const [rate, setRate] = useState("");
  const [termYears, setTermYears] = useState("20");
  const [result, setResult] = useState<{ monthlyPayment: number; totalInterest: number; schedule: AmortRow[] } | null>(null);

  const mortgages = liabilities.filter(l => l.type === 'MORTGAGE' || l.type === 'LOAN');

  useEffect(() => {
    if (mortgages.length > 0) {
      setLoanAmount(String(Math.round(Number(mortgages[0].valuation))));
      if (mortgages[0].interest_rate) setRate(String(mortgages[0].interest_rate));
    }
  }, [liabilities]);

  const calculate = () => {
    const p = parseFloat(loanAmount), r = parseFloat(rate) / 100 / 12, n = parseFloat(termYears) * 12;
    if ([p, r, n].some(isNaN) || p <= 0 || r <= 0) return;
    const payment = p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    let balance = p;
    const schedule: AmortRow[] = [];
    for (let m = 1; m <= n && m <= 360; m++) {
      const interest = balance * r;
      const princ = payment - interest;
      balance = Math.max(0, balance - princ);
      schedule.push({ month: m, payment, principal: princ, interest, balance });
    }
    setResult({ monthlyPayment: payment, totalInterest: payment * n - p, schedule });
  };

  return (
    <CalculatorShell title="Amortization Calculator" description="See your schedule of monthly repayments with principal and interest split."
      result={result ? (
        <div className="space-y-4">
          <div><p className="text-sm text-muted-foreground">Monthly Payment</p><p className="text-2xl font-bold text-primary">{formatCurrency(result.monthlyPayment)}</p></div>
          <div><p className="text-sm text-muted-foreground">Total Interest</p><p className="text-lg text-destructive">{formatCurrency(result.totalInterest)}</p></div>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader><TableRow><TableHead>Month</TableHead><TableHead>Payment</TableHead><TableHead>Principal</TableHead><TableHead>Interest</TableHead><TableHead>Balance</TableHead></TableRow></TableHeader>
              <TableBody>
                {result.schedule.filter((_, i) => i % 12 === 0 || i < 12).map(r => (
                  <TableRow key={r.month}>
                    <TableCell>{r.month}</TableCell><TableCell>{formatCurrency(r.payment)}</TableCell>
                    <TableCell>{formatCurrency(r.principal)}</TableCell><TableCell>{formatCurrency(r.interest)}</TableCell>
                    <TableCell>{formatCurrency(r.balance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      ) : undefined}
    >
      {mortgages.length > 0 && (
        <div>
          <Label>Pre-fill from liability</Label>
          <Select onValueChange={(v) => { const l = mortgages[parseInt(v)]; setLoanAmount(String(l.valuation)); if (l.interest_rate) setRate(String(l.interest_rate)); }}>
            <SelectTrigger><SelectValue placeholder="Select loan/mortgage" /></SelectTrigger>
            <SelectContent>{mortgages.map((l, i) => <SelectItem key={i} value={String(i)}>{l.description} ({formatCurrency(Number(l.valuation))})</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}
      <div><Label>Loan Amount</Label><Input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} placeholder="250000" /></div>
      <div><Label>Annual Interest Rate (%)</Label><Input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="6.5" /></div>
      <div><Label>Loan Term (years)</Label><Input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} placeholder="20" /></div>
      <Button onClick={calculate} className="w-full">Calculate</Button>
    </CalculatorShell>
  );
}
