import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RangeSelector() {
  return (
    <Select defaultValue="today">
      <SelectTrigger className="min-w-[180px] h-[34px] !ring-0">
        <SelectValue placeholder="Select a range" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectSeparator />
          <SelectItem value="7-days">Last 7 Days</SelectItem>
          <SelectItem value="15-days">Last 15 Days</SelectItem>
          <SelectItem value="30-days">Last 30 Days</SelectItem>
          <SelectItem value="12-months">Last 12 Months</SelectItem>
          <SelectSeparator />
          <SelectItem value="month-to-date">Month to Date</SelectItem>
          <SelectItem value="year-to-date">Year to Date</SelectItem>
          <SelectSeparator />
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
