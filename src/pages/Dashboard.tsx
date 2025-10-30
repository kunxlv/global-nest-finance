import { useEffect, useState, useRef } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase, PaymentHistory, RecurringPayment } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Grip } from "lucide-react";
import { Responsive, WidthProvider, Layout as GridLayout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { WidgetSelector, WidgetType, WIDGET_METADATA } from "@/components/dashboard/WidgetSelector";
import { DashboardWidget } from "@/components/dashboard/DashboardWidget";
import PaymentNotificationBanner from "@/components/PaymentNotificationBanner";
import { differenceInDays } from "date-fns";

const ResponsiveGridLayout = WidthProvider(Responsive);

const MAX_ROWS = 12;
const ROW_HEIGHT = 100;
const GRID_GAP = 16;

interface DashboardWidgetData {
  id: string;
  widget_type: WidgetType;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
}

type PaymentWithRecurring = PaymentHistory & {
  recurring_payment: RecurringPayment;
};

const DEFAULT_WIDGETS: WidgetType[] = ["net-worth", "salary-countdown", "upcoming-payments", "goals"];

const getDefaultPosition = (type: WidgetType, index: number) => {
  switch(type) {
    case "net-worth":
      return { x: 0, y: 0 };
    case "salary-countdown":
      return { x: 2, y: 0 };
    case "upcoming-payments":
      return { x: 0, y: 2 };
    case "goals":
      return { x: 0, y: 5 };
    default:
      return { x: 0, y: index * 2 };
  }
};

export default function Dashboard() {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [widgets, setWidgets] = useState<DashboardWidgetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [upcomingPayments, setUpcomingPayments] = useState<PaymentWithRecurring[]>([]);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchWidgets();
    fetchUpcomingPayments();
  }, [user]);

  const fetchUpcomingPayments = async () => {
    if (!user) return;
    
    const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const { data } = await supabase
      .from("payment_history")
      .select("*, recurring_payment:recurring_payments(*)")
      .eq("user_id", user.id)
      .eq("status", "UPCOMING")
      .lte("due_date", sevenDaysLater)
      .order("due_date", { ascending: true });

    if (data) setUpcomingPayments(data as PaymentWithRecurring[]);
  };

  const fetchWidgets = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("dashboard_widgets")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_visible", true)
      .order("position_y")
      .order("position_x");

    if (error) {
      console.error("Error fetching widgets:", error);
    } else if (data && data.length > 0) {
      setWidgets(data as DashboardWidgetData[]);
    } else {
      // Initialize with default widgets
      await initializeDefaultWidgets();
    }

    setLoading(false);
  };

  const initializeDefaultWidgets = async () => {
    if (!user) return;

    const defaultWidgetData = DEFAULT_WIDGETS.map((type, index) => {
      const pos = getDefaultPosition(type, index);
      return {
        user_id: user.id,
        widget_type: type,
        position_x: pos.x,
        position_y: pos.y,
        width: WIDGET_METADATA[type].defaultWidth,
        height: WIDGET_METADATA[type].defaultHeight,
        is_visible: true,
      };
    });

    const { data, error } = await supabase
      .from("dashboard_widgets")
      .insert(defaultWidgetData)
      .select();

    if (error) {
      toast.error("Failed to initialize dashboard");
      console.error(error);
    } else if (data) {
      setWidgets(data as DashboardWidgetData[]);
    }
  };

  const handleAddWidget = async (widgetType: WidgetType) => {
    if (!user) return;

    const meta = WIDGET_METADATA[widgetType];
    const maxY = widgets.reduce((max, w) => Math.max(max, w.position_y + w.height), 0);

    const { data, error } = await supabase
      .from("dashboard_widgets")
      .insert({
        user_id: user.id,
        widget_type: widgetType,
        position_x: 0,
        position_y: maxY,
        width: meta.defaultWidth,
        height: meta.defaultHeight,
        is_visible: true,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add widget");
    } else {
      setWidgets([...widgets, data as DashboardWidgetData]);
      toast.success("Widget added");
    }
  };

  const handleRemoveWidget = async (id: string) => {
    const { error } = await supabase
      .from("dashboard_widgets")
      .update({ is_visible: false })
      .eq("id", id);

    if (error) {
      toast.error("Failed to remove widget");
    } else {
      setWidgets(widgets.filter((w) => w.id !== id));
      toast.success("Widget removed");
    }
  };

  const handleLayoutChange = async (layout: GridLayout[]) => {
    if (!isEditMode || layout.length === 0) return;

    const updates = layout.map((item) => {
      const widget = widgets.find((w) => w.id === item.i);
      if (!widget) return null;

      return {
        id: widget.id,
        position_x: item.x,
        position_y: item.y,
        width: item.w,
        height: item.h,
      };
    }).filter(Boolean);

    // Update local state immediately for smooth UI
    setWidgets((prev) =>
      prev.map((widget) => {
        const update = updates.find((u) => u?.id === widget.id);
        return update ? { ...widget, ...update } : widget;
      })
    );
  };

  const handleLayoutChangeEnd = async (layout: GridLayout[]) => {
    if (!isEditMode || layout.length === 0) return;

    const updates = layout.map((item) => {
      const widget = widgets.find((w) => w.id === item.i);
      if (!widget) return null;

      return {
        id: widget.id,
        position_x: item.x,
        position_y: item.y,
        width: item.w,
        height: item.h,
      };
    }).filter(Boolean);

    // Batch update to database
    for (const update of updates) {
      if (!update) continue;
      const { id, ...data } = update;
      await supabase
        .from("dashboard_widgets")
        .update(data)
        .eq("id", id);
    }
  };

  const generateLayout = (): GridLayout[] => {
    return widgets.map((widget) => {
      const meta = WIDGET_METADATA[widget.widget_type];
      return {
        i: widget.id,
        x: widget.position_x,
        y: widget.position_y,
        w: widget.width,
        h: widget.height,
        minW: meta.defaultWidth,
        minH: meta.defaultHeight,
      };
    });
  };

  const activeWidgetTypes = widgets.map((w) => w.widget_type);

  const overdueCount = upcomingPayments.filter(p => differenceInDays(new Date(p.due_date), new Date()) < 0).length;
  const dueTodayCount = upcomingPayments.filter(p => differenceInDays(new Date(p.due_date), new Date()) === 0).length;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold">Dashboard.</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="edit-mode"
                checked={isEditMode}
                onCheckedChange={setIsEditMode}
              />
              <Label htmlFor="edit-mode" className="text-sm cursor-pointer">
                {isEditMode ? (
                  <span className="flex items-center gap-1">
                    <Grip className="w-4 h-4" />
                    Edit Mode
                  </span>
                ) : (
                  "Edit Mode"
                )}
              </Label>
            </div>
            <WidgetSelector
              activeWidgets={activeWidgetTypes}
              onAddWidget={handleAddWidget}
            >
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                Widgets
              </Button>
            </WidgetSelector>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              $ USD
            </Button>
          </div>
        </div>

        <PaymentNotificationBanner overdueCount={overdueCount} dueTodayCount={dueTodayCount} />

        {/* Widget Grid */}
        {widgets.length === 0 ? (
          <div className="text-center py-12 bg-muted/50 rounded-2xl">
            <p className="text-muted-foreground mb-4">
              No widgets added yet. Click "Widgets" to add some!
            </p>
          </div>
        ) : (
          <div ref={gridContainerRef}>
            <ResponsiveGridLayout
              className="layout"
              layouts={{ lg: generateLayout() }}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
              cols={{ lg: 4, md: 3, sm: 2, xs: 1 }}
              rowHeight={ROW_HEIGHT}
              isDraggable={isEditMode}
              isResizable={false}
              onLayoutChange={handleLayoutChange}
              onDragStop={handleLayoutChangeEnd}
              compactType="vertical"
              margin={[GRID_GAP, GRID_GAP]}
              containerPadding={[0, 0]}
              preventCollision={false}
              useCSSTransforms={true}
              draggableHandle=".drag-handle"
            >
              {widgets.map((widget) => (
                <div key={widget.id}>
                  <DashboardWidget
                    type={widget.widget_type}
                    onRemove={() => handleRemoveWidget(widget.id)}
                    isEditMode={isEditMode}
                  />
                </div>
              ))}
            </ResponsiveGridLayout>
          </div>
        )}
      </div>
    </Layout>
  );
}