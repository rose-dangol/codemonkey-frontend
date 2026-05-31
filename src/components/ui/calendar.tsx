import { DayPicker } from "@daypicker/react";

interface CalendarProps {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  fromDate?: Date;
  className?: string;
  initialFocus?: boolean;
  minYear?: number;
}

const Calendar = ({
  mode = "single",
  selected,
  onSelect,
  fromDate,
  className,
}: CalendarProps) => {
  return (
    <div className={className}>
      <DayPicker
        mode={mode}
        selected={selected}
        onSelect={onSelect}
        disabled={fromDate ? { before: fromDate } : undefined}
        classNames={{
          root: "p-3",
          months: "flex flex-col",
          month: "space-y-2",
          month_caption: "flex items-center justify-between px-1 mb-2",
          caption_label: "text-sm font-semibold text-neutral-700",
          nav: "flex items-center gap-1",
          button_previous:
            "h-6 w-6 flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700 transition-colors",
          button_next:
            "h-6 w-6 flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700 transition-colors",
          month_grid: "w-full border-collapse",
          weekdays: "flex",
          weekday:
            "w-8 h-7 flex items-center justify-center text-[11px] font-medium text-neutral-400",
          weeks: "flex flex-col gap-0.5",
          week: "flex",
          day: "w-8 h-8 flex items-center justify-center",
          day_button:
            "w-8 h-8 rounded-md text-xs font-medium text-neutral-200 hover:bg-neutral-700 hover:text-neutral-50 transition-colors",
          selected:
            "[&>button]:bg-neutral-default [&>button]:text-neutral-900 [&>button]:hover:bg-tertiary-400",
          today:
            "[&>button]:text-tertiary-default [&>button]:font-bold [&>button]:hover:text-tertiary-300",
          outside: "[&>button]:text-neutral-600",
          disabled:
            "[&>button]:text-neutral-700 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent",
        }}
      />
    </div>
  );
};

export default Calendar;
