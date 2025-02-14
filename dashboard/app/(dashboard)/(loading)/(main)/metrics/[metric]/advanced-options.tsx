// Import UI components and types
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  colors,
  dualColors,
  MetricType,
} from "@/types";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";

/**
 * AdvancedOptions component provides chart customization controls
 * Allows users to modify chart type, colors and trend line display
 */
function AdvancedOptions(props: {
  chartName: string;
  metricId: string;
  metricType: MetricType;
  children: ReactNode;
  chartType: string;
  chartColor: number;
  setChartColor: Dispatch<SetStateAction<number>>;
  splitTrendChecked?: boolean;
  setSplitTrendChecked?: Dispatch<SetStateAction<boolean>>;
  setChartType: Dispatch<SetStateAction<"stacked" | "percent" | "default">>;
}) {
  // Controls popover open state
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Load saved chart settings from localStorage on mount
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem("chartsettings") ?? "{}");
    const name = props.metricId + props.chartName;
    if (!settings[name]) return;
    // Apply saved chart type if exists
    if (settings[name].chartType) {
      props.setChartType(
        settings[name].chartType as "stacked" | "percent" | "default",
      );
    }

    // Apply saved color settings
    if (settings[name].chartColor) {
      props.setChartColor(settings[name].chartColor);
    }
  }, [props.splitTrendChecked]);

  // Save chart settings to localStorage when they change
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem("chartsettings") ?? "{}");
    const name = props.metricId + props.chartName;
    if (!settings[name])
      settings[name] = {
        chartType: undefined,
        chartColor: undefined,
      };

    settings[name].chartType = props.chartType;

    settings[name].chartColor = props.chartColor;

    localStorage.setItem("chartsettings", JSON.stringify(settings));
  }, [props.chartType, props.chartColor, props.splitTrendChecked]);

  return (
    <Popover open={isOpen} onOpenChange={(e) => setIsOpen(e)}>
      <PopoverTrigger asChild>{props.children}</PopoverTrigger>
      <PopoverContent className="rounded-[12px] max-sm:px-2">
        <div className="flex w-full flex-col gap-4">
          {/* Chart type selector for dual metrics */}
          {props.metricType === MetricType.Dual &&
          props.chartName !== "trend" ? (
            <Label className="flex flex-col gap-2">
              Chart type
              <Select
                value={props.chartType}
                onValueChange={(e) => {
                  props.setChartType(e as "stacked" | "percent" | "default");
                  setIsOpen(false);
                }}
              >
                <SelectTrigger className="h-11 border">
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent className="z-[120]">
                  <SelectGroup>
                    <SelectItem value={"default"}>Default</SelectItem>
                    <SelectItem value={"stacked"}>Stacked</SelectItem>
                    <SelectItem value={"percent"}>Percentage</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Label>
          ) : (
            <></>
          )}

          {/* Dual metric color selector */}
          {props.metricType === MetricType.Dual ? (
            <Label className="flex flex-col gap-2">
              Chart color
              <Select
                value={props.chartColor.toString()}
                onValueChange={(e) => {
                  props.setChartColor(parseInt(e));
                  setIsOpen(false);
                }}
              >
                <SelectTrigger className="h-11 border">
                  <SelectValue placeholder="Select chart color" />
                </SelectTrigger>
                <SelectContent className="z-[120]">
                  <SelectGroup>
                    {dualColors.map((colors, i) => {
                      return (
                        <SelectItem key={i} value={i.toString()}>
                          <div className="flex flex-row items-center gap-2">
                            <div className="flex gap-1">
                              <div
                                className="size-2 rounded-full"
                                style={{
                                  backgroundColor: `hsl(var(--chart-${colors.indexes[0]}))`,
                                }}
                              />
                              <div
                                className="size-2 rounded-full"
                                style={{
                                  backgroundColor: `hsl(var(--chart-${colors.indexes[1]}))`,
                                }}
                              />
                            </div>
                            {colors.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Label>
          ) : (
            <Label className="flex flex-col gap-2">
              Chart color
              <Select
                value={props.chartColor.toString()}
                onValueChange={(e) => {
                  props.setChartColor(parseInt(e));
                  setIsOpen(false);
                }}
              >
                <SelectTrigger className="h-11 border">
                  <ColorItem name={colors[props.chartColor].name} index={colors[props.chartColor].index}/>
                </SelectTrigger>
                <SelectContent className="z-[120]">
                  <SelectGroup>
                    {colors.map((color, i) => {
                      return (
                        <SelectItem
                          key={i}
                          value={i.toString()}
                        >
                          
                          <ColorItem name={color.name} index={color.index}/>
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Label>
          )}

          {/* Split trend lines toggle for dual metrics */}
          {props.chartName === "trend" &&
          props.metricType === MetricType.Dual ? (
            <Label className="flex flex-row items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                Split trend lines
                <div className="text-xs font-normal text-muted-foreground">
                  Divide trend into separate positive and negative values
                </div>
              </div>
              <Switch
                checked={props.splitTrendChecked}
                onCheckedChange={(e) => {
                  if (props.setSplitTrendChecked) {
                    props.setSplitTrendChecked(e);
                  }
                }}
              />
            </Label>
          ) : (
            <></>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}


function ColorItem(props : {name : string, index : number}) {
  
  return                   <div className="flex flex-row capitalize items-center gap-2">
                      <div className="flex gap-1">
                        <div
                          className="size-2 rounded-full"
                          style={{
                            backgroundColor: `hsl(var(--chart-${props.index.toString()}))`,
                          }}
                        />
                      </div>
                      {props.name}
                    </div>
}

export default AdvancedOptions;
