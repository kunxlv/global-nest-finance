import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ReactNode } from "react";
import { MoreVertical } from "lucide-react";

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
  actionsMenu
}: GoalCardProps) {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm border border-border transition-all duration-200 hover:shadow-md">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-card-foreground text-base">
                {title}
              </h3>
              {timeframe && <span className="text-muted-foreground text-sm">· {timeframe}</span>}
              {assetLinkedCount > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/20 border-0 cursor-help text-xs">
                        {assetLinkedCount} {assetLinkedCount === 1 ? 'Asset' : 'Assets'}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        {assetNames.map((name, index) => (
                          <p key={index} className="text-sm">{name}</p>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-3xl font-semibold tracking-tight mt-2">{current}</p>
          </div>
          {actionsMenu && (
            <div className="shrink-0">
              {actionsMenu}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">{progress}% complete</span>
            <span className="text-muted-foreground font-medium">{target}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-[hsl(var(--success))] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
