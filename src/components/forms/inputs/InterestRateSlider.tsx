import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface InterestRateSliderProps {
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const presets = [
  { value: 3, label: "3%" },
  { value: 5, label: "5%" },
  { value: 8, label: "8%" },
  { value: 12, label: "12%" },
  { value: 18, label: "18%" },
];

export function InterestRateSlider({
  value,
  onChange,
  min = 0,
  max = 30,
  step = 0.25,
  className,
}: InterestRateSliderProps) {
  const numericValue = parseFloat(value) || 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Preset buttons */}
      <div className="flex gap-2 flex-wrap">
        {presets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange(preset.value.toString())}
            className={cn(
              "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200",
              "hover:border-foreground/30 hover:bg-muted/50",
              numericValue === preset.value
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-muted-foreground"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Slider with value display */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Slider
            value={[numericValue]}
            onValueChange={(values) => onChange(values[0].toString())}
            min={min}
            max={max}
            step={step}
            className="cursor-pointer"
          />
        </div>
        <div className="relative">
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            step={step}
            min={min}
            max={max}
            className="w-20 h-10 text-center pr-6 rounded-lg border-2"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            %
          </span>
        </div>
      </div>

      {/* Visual indicator */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}%</span>
        <span className={cn(
          "font-medium transition-colors",
          numericValue < 5 && "text-success",
          numericValue >= 5 && numericValue < 12 && "text-warning",
          numericValue >= 12 && "text-destructive"
        )}>
          {numericValue < 5 && "Low"}
          {numericValue >= 5 && numericValue < 12 && "Moderate"}
          {numericValue >= 12 && "High"}
        </span>
        <span>{max}%</span>
      </div>
    </div>
  );
}
