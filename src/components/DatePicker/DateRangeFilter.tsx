import ButtonDatePicker from "./ButtonDatePicker";

export interface DateRange {
  from: string | undefined;
  to: string | undefined;
}

const DateRangeFilter = ({
  dateRange,
  handleDateRangeChange,
}: {
  dateRange: DateRange;
  handleDateRangeChange: (range: DateRange) => void;
}) => {
  const handleFromChange = (date: string) => {
    const next = { ...dateRange, from: date };
    console.log("Date range changed:", next);
    handleDateRangeChange(next);
  };

  const handleToChange = (date: string) => {
    const next = { ...dateRange, to: date };
    console.log("Date range changed:", next);
    handleDateRangeChange(next);
  };

  return (
    <div className="flex items-center gap-x-2">
      <span className="text-xs text-neutral-default uppercase font-semibold tracking-wider">
        From
      </span>
      <ButtonDatePicker
        date={dateRange.from}
        handleDateChange={handleFromChange}
        placeholder="Start date"
      />
      <span className="text-xs text-neutral-default uppercase font-semibold tracking-wider">
        To
      </span>
      <ButtonDatePicker
        date={dateRange.to}
        handleDateChange={handleToChange}
        placeholder="End date"
      />
    </div>
  );
};

export default DateRangeFilter;
