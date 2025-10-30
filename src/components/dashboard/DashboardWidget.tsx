import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WidgetType } from "./WidgetSelector";
import { UpcomingPaymentsWidget } from "./widgets/UpcomingPaymentsWidget";
import { TopGainersWidget } from "./widgets/TopGainersWidget";
import { TopLosersWidget } from "./widgets/TopLosersWidget";
import { GoalsWidget } from "./widgets/GoalsWidget";
import { NetWorthWidget } from "./widgets/NetWorthWidget";
import { SalaryCountdownWidget } from "./widgets/SalaryCountdownWidget";

interface DashboardWidgetProps {
  type: WidgetType;
  onRemove: () => void;
  isEditMode: boolean;
}

export function DashboardWidget({ type, onRemove, isEditMode }: DashboardWidgetProps) {
  const renderWidget = () => {
    switch (type) {
      case "upcoming-payments":
        return <UpcomingPaymentsWidget />;
      case "top-gainers":
        return <TopGainersWidget />;
      case "top-losers":
        return <TopLosersWidget />;
      case "goals":
        return <GoalsWidget />;
      case "net-worth":
        return <NetWorthWidget />;
      case "salary-countdown":
        return <SalaryCountdownWidget />;
      default:
        return <div>Unknown widget</div>;
    }
  };

  return (
    <div className={cn(
      "bg-white rounded-3xl p-5 relative h-full flex flex-col overflow-hidden transition-all duration-200",
      isEditMode && "ring-2 ring-primary/30 shadow-xl drag-handle cursor-grab active:cursor-grabbing hover:ring-primary/50"
    )}>
      {isEditMode && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg z-10 hover:scale-110 transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
      <div className="flex-1 min-h-0 overflow-hidden">
        {renderWidget()}
      </div>
    </div>
  );
}