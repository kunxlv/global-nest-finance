import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import CalculatorShell from "./CalculatorShell";
import { useCalculatorData } from "@/hooks/useCalculatorData";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function CAGRCalculator() {
  const { assets } = useCalculatorData();
  const { formatCurrency } = useCurrency();
  const [beginValue, setBeginValue] = useState("");
  const [endValue, setEndValue] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState<{ cagr: number } | null>(null);

  useEffect(() => {
    if (assets.length > 0) {
      setEndValue(String(Math.round(assets.reduce((s, a) => s + Number(a.valuation), 0))));
    }
  }, [assets]);

  const calculate = () => {
    const b = parseFloat(beginValue), e = parseFloat(endValue), y = parseFloat(years);
    if ([b, e, y].some(isNaN) || b <= 0 || y <= 0) return;
    const cagr = (Math.pow(e / b, 1 / y) - 1) * 100;
    setResult({ cagr });
  };

  return (
    <CalculatorShell title="CAGR Calculator" description="Work out the compound annual growth rate of an investment."
      result={result ? (
        <div className="space-y-4">
          <div><p className="text-sm text-muted-foreground">CAGR</p><p className="text-3xl font-bold text-primary">{result.cagr.toFixed(2)}%</p></div>
          <p className="text-sm text-muted-foreground">Your investment grew at an average annual rate of {result.cagr.toFixed(2)}% over the period.</p>
        </div>
      ) : undefined}
    >
      {assets.length > 0 && (
        <div>
          <Label>Pre-fill ending value from asset</Label>
          <Select onValueChange={(v) => setEndValue(v)}>
            <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
            <SelectContent>{assets.map((a, i) => <SelectItem key={i} value={String(a.valuation)}>{a.description} ({formatCurrency(Number(a.valuation))})</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}
      <div><Label>Beginning Value</Label><Input type="number" value={beginValue} onChange={e => setBeginValue(e.target.value)} placeholder="10000" /></div>
      <div><Label>Ending Value</Label><Input type="number" value={endValue} onChange={e => setEndValue(e.target.value)} placeholder="15000" /></div>
      <div><Label>Number of Years</Label><Input type="number" value={years} onChange={e => setYears(e.target.value)} placeholder="5" /></div>
      <Button onClick={calculate} className="w-full">Calculate</Button>
    </CalculatorShell>
  );
}
