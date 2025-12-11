import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ReactNode } from "react";

interface GoalCardProps {
  title: string;
  target: string | ReactNode;
  current: string | ReactNode;
  progress: number;
  timeframe?: string;
  assetLinkedCount?: number;
  assetNames?: string[];
  actionsMenu?: ReactNode;
}

export default function GoalCard({
  title,
  target,
  current,
  progress,
  timeframe,
  assetLinkedCount = 0,
  assetNames = [],
  actionsMenu,
}: GoalCardProps) {
  return (
    <div className="bg-card text-card-foreground rounded-2xl p-6 border border-border/50 shadow-md transition-all duration-200 hover:shadow-lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground text-lg">{title}</h3>
            {timeframe && (
              <span className="text-muted-foreground text-sm">· {timeframe}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {assetLinkedCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/20 border-0 cursor-help text-xs font-medium px-3 py-1">
                      Asset Linked
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      {assetNames.map((name, index) => (
                        <p key={index} className="text-sm">
                          {name}
                        </p>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {actionsMenu && <div className="shrink-0">{actionsMenu}</div>}
          </div>
        </div>

        {/* Current Amount - Large muted value */}
        <div>
          <p className="text-3xl font-semibold text-muted-foreground tracking-tight">
            {current}
          </p>
        </div>

        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">{progress}% complete</span>
            <span className="text-foreground font-medium">{target}</span>
          </div>
          {/* Two-tone progress bar */}
          <div className="w-full h-2.5 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
            <div
              className="h-full bg-card-foreground"
              style={{ width: `${100 - Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}