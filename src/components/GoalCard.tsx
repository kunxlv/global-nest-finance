import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface GoalCardProps {
  title: string;
  target: string;
  current: string;
  progress: number;
  timeframe?: string;
  assetLinked?: boolean;
}

export default function GoalCard({ 
  title, 
  target, 
  current, 
  progress,
  timeframe,
  assetLinked 
}: GoalCardProps) {
  return (
    <div className="bg-[#2a2a2a] rounded-3xl p-6 text-white">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-white/90">
              {title} {timeframe && <span className="text-white/60">. {timeframe}</span>}
            </h3>
            <p className="text-3xl font-bold mt-2">{current}</p>
          </div>
          {assetLinked && (
            <Badge className="bg-[hsl(var(--success))]/20 text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/30">
              Asset Linked
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/90">{progress}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-[hsl(var(--success))] rounded-full transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
