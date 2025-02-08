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
  ChartColors,
  colors,
  dualColors,
  DualMetricChartColors,
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
  chartColor: string;
  dualMetricChartColor?: string;
  splitTrendChecked?: boolean;
  setChartType: Dispatch<SetStateAction<"stacked" | "percent" | "default">>;
  setChartColor: Dispatch<SetStateAction<keyof ChartColors>>;
  setDualMetricChartColor?: Dispatch<
    SetStateAction<keyof DualMetricChartColors>
  >;
  setSplitTrendChecked?: Dispatch<SetStateAction<boolean>>;
}) {
  // Controls popover open state
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Load saved chart settings from localStorage on mount
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem("chartsettings") ?? "{}");
    let name = props.metricId + props.chartName;
    if (props.chartName === "trend" && props.splitTrendChecked) {
      name += "dual";
    }
    if (!settings[name]) return;

    // Apply saved chart type if exists
    if (settings[name].chartType) {
      props.setChartType(
        settings[name].chartType as "stacked" | "percent" | "default",
      );
    }

    // Apply saved color settings
    if (settings[name].chartColor) {
      if (props.dualMetricChartColor && props.setDualMetricChartColor) {
        props.setDualMetricChartColor(
          settings[name].chartColor as keyof DualMetricChartColors,
        );
      } else {
        props.setChartColor(settings[name].chartColor as keyof ChartColors);
      }
    }
  }, [props.splitTrendChecked]);

  // Save chart settings to localStorage when they change
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem("chartsettings") ?? "{}");
    let name = props.metricId + props.chartName;
    if (props.chartName === "trend" && props.splitTrendChecked) {
      name += "dual";
    }
    if (!settings[name])
      settings[name] = {
        chartType: undefined,
        chartColor: undefined,
      };

    settings[name].chartType = props.chartType;

    if (props.dualMetricChartColor && props.setDualMetricChartColor) {
      settings[name].chartColor = props.dualMetricChartColor;
    } else {
      settings[name].chartColor = props.chartColor;
    }

    localStorage.setItem("chartsettings", JSON.stringify(settings));
  }, [
    props.chartType,
    props.chartColor,
    props.dualMetricChartColor,
    props.splitTrendChecked,
  ]);

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
                <SelectContent>
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
          {(props.metricType === MetricType.Dual &&
            props.chartName !== "trend") ||
          (props.chartName === "trend" && props.splitTrendChecked) ? (
            <Label className="flex flex-col gap-2">
              Chart color
              <Select
                value={props.dualMetricChartColor}
                onValueChange={(e) => {
                  if (props.setDualMetricChartColor !== undefined) {
                    props.setDualMetricChartColor(
                      e as keyof DualMetricChartColors,
                    );
                  }
                  setIsOpen(false);
                }}
              >
                <SelectTrigger className="h-11 border">
                  <SelectValue placeholder="Select chart color" />
                </SelectTrigger>
                <SelectContent className="z-[120]">
                  <SelectGroup>
                    {dualColors.map((colors, i) => {
                      console.log(colors.indexes.toString());
                      return (
                        <SelectItem key={i} value={colors.indexes.toString()}>
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
                value={props.chartColor}
                onValueChange={(e) => {
                  props.setChartColor(e as keyof ChartColors);
                  setIsOpen(false);
                }}
              >
                <SelectTrigger className="h-11 border">
                  <SelectValue placeholder="Select chart color" />
                </SelectTrigger>
                <SelectContent className="z-[120]">
                  <SelectGroup>
                    {colors.map((color) => {
                      return (
                        <SelectItem
                          key={color.index}
                          value={color.index.toString()}
                        >
                          <div className="flex flex-row capitalize items-center gap-2">
                            <div className="flex gap-1">
                              <div
                                className="size-2 rounded-full"
                                style={{
                                  backgroundColor: `hsl(var(--chart-${color.index}))`,
                                }}
                              />
                            </div>
                            {color.name}
                          </div>
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

export default AdvancedOptions;
