import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import CalculatorShell from "./CalculatorShell";
import { useCalculatorData } from "@/hooks/useCalculatorData";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function SalaryToHourlyCalculator() {
  const { incomeStreams } = useCalculatorData();
  const { formatCurrency } = useCurrency();
  const [salary, setSalary] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [weeksPerYear, setWeeksPerYear] = useState("52");
  const [result, setResult] = useState<{ hourly: number; daily: number; weekly: number; monthly: number } | null>(null);

  useEffect(() => {
    const primary = incomeStreams.find(i => i.frequency === 'monthly');
    if (primary) setSalary(String(Math.round(Number(primary.amount) * 12)));
  }, [incomeStreams]);

  const calculate = () => {
    const s = parseFloat(salary), h = parseFloat(hoursPerWeek), w = parseFloat(weeksPerYear);
    if ([s, h, w].some(isNaN) || s <= 0 || h <= 0 || w <= 0) return;
    const hourly = s / (h * w);
    setResult({ hourly, daily: hourly * (h / 5), weekly: s / w, monthly: s / 12 });
  };

  return (
    <CalculatorShell title="Salary to Hourly Calculator" description="Convert your annual salary to an hourly pay figure."
      result={result ? (
        <div className="space-y-4">
          <div><p className="text-sm text-muted-foreground">Hourly Rate</p><p className="text-3xl font-bold text-primary">{formatCurrency(result.hourly)}</p></div>
          <div className="grid grid-cols-3 gap-4">
            <div><p className="text-xs text-muted-foreground">Daily</p><p className="font-semibold">{formatCurrency(result.daily)}</p></div>
            <div><p className="text-xs text-muted-foreground">Weekly</p><p className="font-semibold">{formatCurrency(result.weekly)}</p></div>
            <div><p className="text-xs text-muted-foreground">Monthly</p><p className="font-semibold">{formatCurrency(result.monthly)}</p></div>
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
      <div><Label>Annual Salary</Label><Input type="number" value={salary} onChange={e => setSalary(e.target.value)} placeholder="60000" /></div>
      <div><Label>Hours per Week</Label><Input type="number" value={hoursPerWeek} onChange={e => setHoursPerWeek(e.target.value)} placeholder="40" /></div>
      <div><Label>Weeks per Year</Label><Input type="number" value={weeksPerYear} onChange={e => setWeeksPerYear(e.target.value)} placeholder="52" /></div>
      <Button onClick={calculate} className="w-full">Calculate</Button>
    </CalculatorShell>
  );
}
