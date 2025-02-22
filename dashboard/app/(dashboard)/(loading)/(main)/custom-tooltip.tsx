import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getUnit } from "@/utils";

export function CustomTooltipContent(config: any) {
  return (
    <ChartTooltipContent
      labelFormatter={(label, payload) => {
        return payload[0].payload.label;
      }}
      formatter={(value, name) => (
        <div className="flex min-w-[130px] items-center text-xs text-muted-foreground">
          <div
            className="size-2 rounded-[2px] mr-1.5"
            style={{
              backgroundColor: config[name]?.color || "grey",
            }}
          />
          {config[name]?.label || name}
          <div className="ml-auto flex items-baseline gap-1 font-mono font-medium tabular-nums text-foreground">
            {value}
            <span className="font-normal text-muted-foreground">
              {getUnit(config[name]?.unit)}
            </span>
          </div>
        </div>
      )}
    />
  );
}
