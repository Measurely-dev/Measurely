import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseXAxis } from "@/utils";
import { Dispatch, SetStateAction } from "react";

export interface RangeSelection {
  type:
    | "today"
    | "yesterday"
    | "7-days"
    | "15-days"
    | "30-days"
    | "12-months"
    | "month-to-date"
    | "year-to-date"
    | "custom"
    | "custom-day";
  date: Date;
  to?: Date;
}

export function RangeSelector(props: {
  value: RangeSelection;
  onChange: Dispatch<SetStateAction<RangeSelection>>;
}) {
  return (
    <Select
      defaultValue={"today"}
      value={props.value.type}
      onValueChange={(e) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        switch (e) {
          case "today":
            props.onChange({ type: "today", date: date });
            break;
          case "yesterday":
            date.setDate(date.getDate() - 1);
            props.onChange({
              type: "yesterday",
              date: date,
            });
            break;
          case "7-days":
            date.setDate(date.getDate() - 6);
            props.onChange({
              type: "7-days",
              date: date,
            });
            break;
          case "15-days":
            date.setDate(date.getDate() - 14);
            props.onChange({
              type: "15-days",
              date: date,
            });
            break;
          case "30-days":
            date.setDate(date.getDate() - 29);
            props.onChange({
              type: "30-days",
              date,
            });
            break;
          case "12-months":
            date.setMonth(date.getMonth() - 11);
            props.onChange({
              type: "12-months",
              date: date,
            });
            break;
          case "month-to-date":
            date.setDate(1);
            props.onChange({
              type: "month-to-date",
              date: date,
            });
            break;
          case "year-to-date":
            date.setDate(1);
            date.setMonth(0);
            props.onChange({ type: "year-to-date", date: date });
            break;
          case "custom":
            props.onChange({ type: "custom", date: new Date() });
            break;
        }
      }}
    >
      <SelectTrigger className="min-w-[180px] h-[34px] !ring-0">
        {props.value.type === "custom-day" ? (
          parseXAxis(props.value.date, "M") +
          " " +
          props.value.date.getFullYear()
        ) : (
          <SelectValue placeholder="Select a range" />
        )}
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
