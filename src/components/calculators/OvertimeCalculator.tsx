import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import CalculatorShell from "./CalculatorShell";
import { useCalculatorData } from "@/hooks/useCalculatorData";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function OvertimeCalculator() {
  const { incomeStreams } = useCalculatorData();
  const { formatCurrency } = useCurrency();
  const [hourlyRate, setHourlyRate] = useState("");
  const [overtimeHours, setOvertimeHours] = useState("10");
  const [multiplier, setMultiplier] = useState("1.5");
  const [result, setResult] = useState<{ overtimePay: number; overtimeRate: number; regularWeekly: number; totalWeekly: number } | null>(null);

  useEffect(() => {
    const primary = incomeStreams.find(i => i.frequency === 'monthly');
    if (primary) setHourlyRate(String((Number(primary.amount) * 12 / 2080).toFixed(2)));
  }, [incomeStreams]);

  const calculate = () => {
    const r = parseFloat(hourlyRate), h = parseFloat(overtimeHours), m = parseFloat(multiplier);
    if ([r, h, m].some(isNaN) || r <= 0) return;
    const overtimeRate = r * m;
    const overtimePay = overtimeRate * h;
    setResult({ overtimePay, overtimeRate, regularWeekly: r * 40, totalWeekly: r * 40 + overtimePay });
  };

  return (
    <CalculatorShell title="Overtime Calculator" description="Calculate your overtime pay for additional hours worked."
      result={result ? (
        <div className="space-y-4">
          <div><p className="text-sm text-muted-foreground">Overtime Pay</p><p className="text-2xl font-bold text-primary">{formatCurrency(result.overtimePay)}</p></div>
          <div><p className="text-sm text-muted-foreground">Overtime Hourly Rate</p><p className="text-lg">{formatCurrency(result.overtimeRate)}/hr</p></div>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-muted-foreground">Regular Weekly</p><p className="font-semibold">{formatCurrency(result.regularWeekly)}</p></div>
            <div><p className="text-xs text-muted-foreground">Total Weekly</p><p className="font-semibold text-green-600">{formatCurrency(result.totalWeekly)}</p></div>
          </div>
        </div>
      ) : undefined}
    >
      <div><Label>Hourly Rate</Label><Input type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="25" /></div>
      <div><Label>Overtime Hours</Label><Input type="number" value={overtimeHours} onChange={e => setOvertimeHours(e.target.value)} placeholder="10" /></div>
      <div><Label>Overtime Multiplier</Label>
        <Select value={multiplier} onValueChange={setMultiplier}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1.25">1.25x</SelectItem><SelectItem value="1.5">1.5x (Standard)</SelectItem>
            <SelectItem value="2">2x (Double Time)</SelectItem><SelectItem value="2.5">2.5x</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={calculate} className="w-full">Calculate</Button>
    </CalculatorShell>
  );
}
