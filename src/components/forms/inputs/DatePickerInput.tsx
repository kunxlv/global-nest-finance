import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
}: DatePickerInputProps) {
  const [open, setOpen] = React.useState(false);
  
  const parsedDate = value ? new Date(value) : undefined;
  const date = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : undefined;

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Format as YYYY-MM-DD for form compatibility
      const formatted = format(selectedDate, "yyyy-MM-dd");
      onChange(formatted);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-12 rounded-xl",
            "bg-muted border border-border/50 shadow-sm",
            "hover:bg-muted/80 hover:border-border transition-all duration-200",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          {date ? (
            <span className="text-card-foreground">{format(date, "PPP")}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-xl border border-border/50 bg-card shadow-xl" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
