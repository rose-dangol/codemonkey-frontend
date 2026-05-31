import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { ArrowDownIcon } from "@/assets/Icons/Icons";
import { format } from "date-fns";
import Calendar from "../ui/calendar";

const ButtonDatePicker = ({
  date,
  handleDateChange,
  placeholder = "Select date",
}: {
  date: string | undefined;
  handleDateChange: (date: string) => void;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={(isOpen) => setOpen(isOpen)}>
      <PopoverTrigger asChild>
        <Button
          variant="filter"
          className={cn(
            open ? "bg-[#b7b8b4] text-secondary-50" : "text-neutral-default",
            "uppercase hover:bg-[#b7b8b4] [&_svg]:size-auto",
          )}
          size="xs"
        >
          {date ? format(new Date(date), "d MMM, yyyy") : placeholder}
          <ArrowDownIcon style={open ? "rotate-180" : ""} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
        <Calendar
          fromDate={new Date(2020, 6, 1)}
          minYear={2020}
          mode="single"
          className="rounded-2xl"
          selected={date ? new Date(date) : undefined}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              handleDateChange(format(selectedDate, "yyyy-MM-dd"));
            }
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default ButtonDatePicker;
