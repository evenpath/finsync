// src/components/ui/calendar.tsx
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"
import { buttonVariants } from "./button"

export type CalendarProps = {
  mode?: 'single';
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  initialFocus?: boolean;
  className?: string;
}

function Calendar({
  className,
  selected,
  onSelect,
  initialFocus,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyCells = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const isSelected = (day: number) => {
    if (!selected) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === selected.toDateString();
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onSelect?.(date);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className={cn("p-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={goToPreviousMonth} className={cn(buttonVariants({ variant: "outline" }), "h-7 w-7 p-0")}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-medium">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <button onClick={goToNextMonth} className={cn(buttonVariants({ variant: "outline" }), "h-7 w-7 p-0")}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {emptyCells.map((_, index) => (
          <div key={index} className="h-9 w-9" />
        ))}
        {days.map((day) => (
          <button
            key={day}
            onClick={() => handleDateClick(day)}
            className={cn(
              "h-9 w-9 text-sm rounded-md hover:bg-accent transition-colors",
              isSelected(day) && "bg-primary text-primary-foreground hover:bg-primary"
            )}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }