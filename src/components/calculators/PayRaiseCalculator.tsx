import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import CalculatorShell from "./CalculatorShell";
import { useCalculatorData } from "@/hooks/useCalculatorData";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function PayRaiseCalculator() {
  const { incomeStreams } = useCalculatorData();
  const { formatCurrency } = useCurrency();
  const [salary, setSalary] = useState("");
  const [raisePercent, setRaisePercent] = useState("5");
  const [result, setResult] = useState<{ newSalary: number; increase: number; monthly: number; weekly: number; hourly: number } | null>(null);

  useEffect(() => {
    const primary = incomeStreams.find(i => i.frequency === 'monthly');
    if (primary) setSalary(String(Math.round(Number(primary.amount) * 12)));
  }, [incomeStreams]);

  const calculate = () => {
    const s = parseFloat(salary), r = parseFloat(raisePercent);
    if ([s, r].some(isNaN) || s <= 0) return;
    const increase = s * (r / 100);
    const newSalary = s + increase;
    setResult({ newSalary, increase, monthly: newSalary / 12, weekly: newSalary / 52, hourly: newSalary / 2080 });
  };

  return (
    <CalculatorShell title="Pay Raise Calculator" description="Calculate your pay increase and see how earnings change."
      result={result ? (
        <div className="space-y-4">
          <div><p className="text-sm text-muted-foreground">New Annual Salary</p><p className="text-2xl font-bold text-primary">{formatCurrency(result.newSalary)}</p></div>
          <div><p className="text-sm text-muted-foreground">Annual Increase</p><p className="text-lg text-green-600">+{formatCurrency(result.increase)}</p></div>
          <div className="grid grid-cols-3 gap-4">
            <div><p className="text-xs text-muted-foreground">Monthly</p><p className="font-semibold">{formatCurrency(result.monthly)}</p></div>
            <div><p className="text-xs text-muted-foreground">Weekly</p><p className="font-semibold">{formatCurrency(result.weekly)}</p></div>
            <div><p className="text-xs text-muted-foreground">Hourly</p><p className="font-semibold">{formatCurrency(result.hourly)}</p></div>
          </div>
        </div>
      ) : undefined}
    >
      {incomeStreams.length > 0 && (
        <div>
          <Label>Pre-fill from income stream</Label>
          <Select onValueChange={(v) => {
            const inc = incomeStreams[parseInt(v)];
            const annual = inc.frequency === 'monthly' ? Number(inc.amount) * 12 : inc.frequency === 'weekly' ? Number(inc.amount) * 52 : Number(inc.amount);
            setSalary(String(Math.round(annual)));
          }}>
            <SelectTrigger><SelectValue placeholder="Select income" /></SelectTrigger>
            <SelectContent>{incomeStreams.map((inc, i) => <SelectItem key={i} value={String(i)}>{inc.name} ({formatCurrency(Number(inc.amount))}/{inc.frequency})</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}
      <div><Label>Current Annual Salary</Label><Input type="number" value={salary} onChange={e => setSalary(e.target.value)} placeholder="60000" /></div>
      <div><Label>Raise Percentage (%)</Label><Input type="number" value={raisePercent} onChange={e => setRaisePercent(e.target.value)} placeholder="5" /></div>
      <Button onClick={calculate} className="w-full">Calculate</Button>
    </CalculatorShell>
  );
}
