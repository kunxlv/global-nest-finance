import { Button } from "@/components/ui/button";

export function SalaryCountdownWidget() {
  return (
    <div className="h-full flex flex-col justify-center">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-6xl font-bold">19</span>
          <span className="text-sm sm:text-xl">days until the next salary...</span>
        </div>
        <Button variant="link" className="underline text-sm self-start sm:self-auto">
          Manage Budget
        </Button>
      </div>
    </div>
  );
}