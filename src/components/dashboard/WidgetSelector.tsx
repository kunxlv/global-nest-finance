import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Target, Bell, DollarSign, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export type WidgetType = 
  | "upcoming-payments"
  | "top-gainers"
  | "top-losers"
  | "goals"
  | "net-worth"
  | "salary-countdown";

interface WidgetMeta {
  type: WidgetType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultWidth: number;
  defaultHeight: number;
}

export const WIDGET_METADATA: Record<WidgetType, WidgetMeta> = {
  "net-worth": {
    type: "net-worth",
    name: "Net Worth",
    description: "Your total net worth summary",
    icon: DollarSign,
    defaultWidth: 2,
    defaultHeight: 2,
  },
  "salary-countdown": {
    type: "salary-countdown",
    name: "Salary Countdown",
    description: "Days until next salary",
    icon: CalendarDays,
    defaultWidth: 2,
    defaultHeight: 2,
  },
  "upcoming-payments": {
    type: "upcoming-payments",
    name: "Upcoming Payments",
    description: "View payments due in the next 7 days",
    icon: Bell,
    defaultWidth: 2,
    defaultHeight: 4,
  },
  "goals": {
    type: "goals",
    name: "Goals",
    description: "Track your financial goals",
    icon: Target,
    defaultWidth: 4,
    defaultHeight: 3,
  },
  "top-gainers": {
    type: "top-gainers",
    name: "Top Gainers",
    description: "Assets with highest growth",
    icon: TrendingUp,
    defaultWidth: 2,
    defaultHeight: 2,
  },
  "top-losers": {
    type: "top-losers",
    name: "Top Losers",
    description: "Assets with highest decline",
    icon: TrendingDown,
    defaultWidth: 2,
    defaultHeight: 2,
  },
};

interface WidgetSelectorProps {
  activeWidgets: WidgetType[];
  onAddWidget: (widgetType: WidgetType) => void;
  children: React.ReactNode;
}

export function WidgetSelector({ activeWidgets, onAddWidget, children }: WidgetSelectorProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add Widgets</SheetTitle>
          <SheetDescription>
            Select widgets to add to your dashboard
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          {Object.values(WIDGET_METADATA).map((widget) => {
            const Icon = widget.icon;
            const isActive = activeWidgets.includes(widget.type);
            
            return (
              <button
                key={widget.type}
                onClick={() => !isActive && onAddWidget(widget.type)}
                disabled={isActive}
                className={cn(
                  "w-full p-4 rounded-lg border-2 transition-all text-left",
                  isActive
                    ? "border-muted bg-muted cursor-not-allowed opacity-50"
                    : "border-border hover:border-primary hover:bg-accent"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{widget.name}</h3>
                    <p className="text-sm text-muted-foreground">{widget.description}</p>
                    {isActive && (
                      <p className="text-xs text-primary mt-1">Already added</p>
                    )}
                  </div>
                  {!isActive && (
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}