import { Button } from "@/components/ui/button";

export function SalaryCountdownWidget() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-5xl sm:text-6xl font-bold">19</span>
          <span className="text-sm">days until the next salary...</span>
        </div>
        <Button variant="link" className="underline text-sm self-start sm:self-auto whitespace-nowrap">
          Manage Budget
        </Button>
      </div>
    </div>
  );
}