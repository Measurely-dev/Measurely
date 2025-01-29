"use client";

import { cn } from "@/lib/utils";
import {
  DateFieldProps,
  DateField as DateFieldRac,
  DateInputProps as DateInputPropsRac,
  DateInput as DateInputRac,
  DateSegmentProps,
  DateSegment as DateSegmentRac,
  DateValue as DateValueRac,
  TimeFieldProps,
  TimeField as TimeFieldRac,
  TimeValue as TimeValueRac,
  composeRenderProps,
} from "react-aria-components";

// DateField Component
const DateField = <T extends DateValueRac>({
  className,
  children,
  onChange, // Add onChange prop
  ...props
}: DateFieldProps<T> & { onChange?: (value: T) => void }) => {
  return (
    <DateFieldRac
      className={composeRenderProps(className, (className) => cn("space-y-2", className))}
      onChange={onChange} // Pass onChange to DateFieldRac
      {...props}
    >
      {children}
    </DateFieldRac>
  );
};

// TimeField Component
const TimeField = <T extends TimeValueRac>({
  className,
  children,
  ...props
}: TimeFieldProps<T>) => {
  return (
    <TimeFieldRac
      className={composeRenderProps(className, (className) => cn("space-y-2", className))}
      {...props}
    >
      {children}
    </TimeFieldRac>
  );
};

// DateSegment Component
const DateSegment = ({ className, segment, ...props }: DateSegmentProps) => {
  return (
    <DateSegmentRac
      className={composeRenderProps(className, (className) =>
        cn(
          "inline rounded p-0.5 text-foreground caret-transparent outline outline-0 data-[disabled]:cursor-not-allowed data-[focused]:bg-accent data-[invalid]:data-[focused]:bg-destructive data-[type=literal]:px-0 data-[focused]:data-[placeholder]:text-foreground data-[focused]:text-foreground data-[invalid]:data-[focused]:data-[placeholder]:text-destructive-foreground data-[invalid]:data-[focused]:text-destructive-foreground data-[invalid]:data-[placeholder]:text-destructive data-[invalid]:text-destructive data-[placeholder]:text-muted-foreground/70 data-[type=literal]:text-muted-foreground/70 data-[disabled]:opacity-50",
          className,
        ),
      )}
      segment={segment}
      {...props}
    />
  );
};

// DateInput Styles
const dateInputStyle =
  "relative inline-flex h-[34px] min-h-[34px] max-h-[34px] w-full items-center overflow-hidden whitespace-nowrap rounded-lg border border-input bg-background px-3 text-sm shadow-sm shadow-black/5 transition-shadow data-[focus-within]:border-ring data-[disabled]:opacity-50 data-[focus-within]:outline-none data-[focus-within]:ring-[3px] data-[focus-within]:ring-ring/20";

// DateInput Props
interface DateInputProps extends Omit<DateInputPropsRac, "children"> {
  className?: string;
  unstyled?: boolean;
}

// DateInput Component
const DateInput = ({ className, unstyled = false, ...props }: DateInputProps) => {
  return (
    <DateInputRac
      className={composeRenderProps(className, (className) =>
        cn(!unstyled && dateInputStyle, className),
      )}
      {...props}
    >
      {(segment) => <DateSegment segment={segment} />}
    </DateInputRac>
  );
};

export { DateField, DateInput, DateSegment, TimeField, dateInputStyle };
export type { DateInputProps };