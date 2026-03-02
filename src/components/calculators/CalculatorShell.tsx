import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
  title: string;
  description: string;
  children: ReactNode;
  result?: ReactNode;
}

export default function CalculatorShell({ title, description, children, result }: Props) {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/calculators')} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back to Calculators
      </Button>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-4">{children}</CardContent>
        </Card>
        {result && (
          <Card>
            <CardHeader><CardTitle>Results</CardTitle></CardHeader>
            <CardContent>{result}</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
