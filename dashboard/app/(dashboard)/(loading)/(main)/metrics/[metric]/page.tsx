"use client";

// Import necessary components and libraries
import DashboardContentContainer from "@/components/container";
import EditMetricDialogContent from "@/components/edit-metric-dialog-content";
import { RangeValue } from "@react-types/shared";
import { CalendarDate } from "@internationalized/date";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import customTooltip from "@/components/ui/custom-tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProjectsContext, UserContext } from "@/dash-context";
import {
  Metric,
  MetricEvent,
  MetricType,
  UserRole,
  colors,
  dualColors,
} from "@/types";
import {
  valueFormatter,
  getUnit,
  fetchMetricEvents,
  processMetricEvents,
  calculateEventUpdate,
  calculateAverageUpdate,
} from "@/utils";
import { Dialog } from "@/components/ui/dialog";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpCircle,
  Copy,
  Edit,
  ListFilter,
  Loader,
  Minus,
  Sliders,
  Split,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { cloneElement, useContext, useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import FilterManagerDialog from "./filter-manager";
import { PushValueDialog } from "../../push-value";
import { UnitCombobox } from "@/components/ui/unit-combobox";
import { DateValue } from "react-aria-components";
import Filters from "./filter-selector";
import AdvancedOptions from "./advanced-options";
import { Separator } from "@/components/ui/separator";
import { RangeSelector } from "./range-selector";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { BadgeColor, BadgeSign } from "@/components/ui/badge";

// Main component for the dashboard metric page
export default function DashboardMetricPage() {
  const router = useRouter();
  const { projects, activeProject, setProjects } = useContext(ProjectsContext);
  const { user } = useContext(UserContext);
  const [metricName, setMetricName] = useState(
    decodeURIComponent(useParams().metric as string),
  );
  const [open, setOpen] = useState(false);
  const [filterManagerOpen, setFilterManagerOpen] = useState(false);
  const [pushValueOpen, setPushValueOpen] = useState(false);

  // Fetch the metric data based on the active project and metric name
  const metric = useMemo(() => {
    if (!projects || !projects[activeProject]) {
      return null;
    }
    const index = projects[activeProject].metrics?.findIndex(
      (g) => g.name === metricName,
    );
    if (index !== undefined && index !== -1) {
      const metricData = projects[activeProject].metrics?.[index];
      if (metricData !== null && metricData !== undefined) {
        return metricData;
      }
    }
    router.push("/metrics");
    return null;
  }, [activeProject, projects, metricName]);

  const [dailyUpdate, setDailyUpdate] = useState<number>(0);
  const [value, setValue] = useState<number>(0);

  // Load daily values for the metric
  const loadDailyValues = async () => {
    if (!metric) return;

    const start = new Date();
    const end = new Date();

    const data = await fetchMetricEvents(start, end, metric, metric.project_id);

    if (metric.type === MetricType.Average) {
      setDailyUpdate(calculateAverageUpdate(data, metric));
      setValue(
        metric.event_count === 0 ? 0 : metric.total / metric.event_count,
      );
    } else {
      setDailyUpdate(calculateEventUpdate(data, metric));
      setValue(metric.total);
    }
  };

  // Load daily values on mount and set an interval to refresh them
  useEffect(() => {
    loadDailyValues();
  }, [metric]);

  // Update the document title and meta description based on the metric
  useEffect(() => {
    document.title = `${metric?.name} | Measurely`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        `Track and analyze ${metric?.name} in detail. Monitor its performance, explore trends, and gain insights to make informed decisions.`,
      );
    }
  }, [metric]);

  // Redirect to the metrics page if the metric is not found
  useEffect(() => {
    if (!projects[activeProject]?.metrics) return;

    const index = projects[activeProject].metrics.findIndex(
      (g) => g.name === metricName,
    );
    if (index === -1) {
      router.push("/metrics");
    }
  }, [activeProject, projects, metricName]);

  // Helper function to generate card styles based on color
  const cardStyle = (color: string) => ({
    borderColor: `${color}1A`,
    backgroundColor: `${color}0D`,
    color,
  });

  return (
    <DashboardContentContainer className="mt-0 flex w-full pb-20 pt-[15px]">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink className="pointer-events-none">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbLink href="/metrics">
            <BreadcrumbPage className="capitalize">Metrics</BreadcrumbPage>
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{metric?.name ?? "Unknown"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
        <EditMetricDialogContent
          metric={metric}
          setOpen={setOpen}
          onUpdate={(update) => {
            if (update.name !== metric?.name) {
              router.push(`/metrics/${update.name}`);
              setMetricName(update.name);
            }
            setProjects(
              projects.map((proj, i) =>
                i === activeProject
                  ? Object.assign({}, proj, {
                      metrics: proj.metrics?.map((m) =>
                        m.id === metric?.id ? Object.assign({}, m, update) : m,
                      ),
                    })
                  : proj,
              ),
            );
          }}
        />
      </Dialog>
      {metric && (
        <FilterManagerDialog
          metric={metric}
          open={filterManagerOpen}
          setOpen={setFilterManagerOpen}
        />
      )}
      <PushValueDialog
        metric={metric || ({} as Metric)}
        pushValueOpen={pushValueOpen}
        setPushValueOpen={setPushValueOpen}
      />
      <Card className="mt-5 rounded-[12px] border-none bg-background shadow-none">
        <CardContent className="p-0">
          <div className="grid grid-cols-4 gap-5 rounded-[10px] max-lg:grid-cols-2 max-md:grid-cols-1">
            {[
              {
                label: "Filter Manager",
                action: "Manage, create and edit the filters of this metric.",
                icon: <ListFilter className="size-8" />,
                color: "#3B82F6", // Blue
                onClick: () => setFilterManagerOpen(true),
              },
              {
                label: "Push Value",
                action: "Manually push a new event to the metric.",
                icon: <ArrowUpCircle className="size-8" />,
                color: "#10B981", // Green
                onClick: () => setPushValueOpen(true),
              },
              {
                label: "Edit Metric",
                action: "Edit the name of the metric.",
                icon: <Edit className="size-8" />,
                color: "#F59E0B", // Yellow
                onClick: () => {
                  setOpen(true);
                },
              },
              {
                label: "Copy Metric ID",
                action: "Copy the unique ID of this metric for use in the API.",
                icon: <Copy className="size-8" />,
                color: "#A855F7", // Purple
                onClick: () => {
                  navigator.clipboard.writeText(metric ? metric.id : "");
                  toast.success("Successfully copied metric ID");
                },
              },
            ].map(({ label, action, icon, color, onClick }, i) => {
              const styles = cardStyle(color);
              const isDisabled =
                user.user_role === UserRole.Guest ||
                (user.user_role === UserRole.Developer &&
                  label !== "Copy Metric ID");

              return (
                <div
                  key={i}
                  onClick={onClick}
                  style={{
                    borderColor: styles.borderColor,
                    backgroundColor: styles.backgroundColor,
                    opacity: isDisabled ? 0.5 : 1,
                    pointerEvents: isDisabled ? "none" : "auto",
                  }}
                  className={`group flex cursor-pointer select-none overflow-hidden rounded-[12px] border p-1 shadow-sm shadow-black/5 transition-all duration-150 active:scale-[.98]`}
                >
                  <div
                    style={{ backgroundColor: `${color}0F` }}
                    className="my-auto flex aspect-square h-full items-center justify-center rounded-[10px] p-4 max-xl:hidden max-lg:flex"
                  >
                    {cloneElement(icon, { style: { color: styles.color } })}
                  </div>
                  <div className="ml-5 flex flex-col gap-1 py-2 pr-1.5 max-xl:ml-0 max-xl:px-3 max-md:ml-5 max-md:px-0 max-md:pr-1.5">
                    <div
                      style={{ color: styles.color }}
                      className="flex items-center gap-2 text-sm font-semibold transition-all duration-200 group-hover:gap-3"
                    >
                      {label}
                      <ArrowRight
                        style={{ color: styles.color }}
                        className="size-4 transition-all duration-200"
                      />
                    </div>
                    <div className="text-xs" style={{ color: styles.color }}>
                      {action}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <TooltipProvider>
        <div className="mt-5 flex h-full flex-col">
          <div className="flex flex-row items-end justify-between max-sm:flex-col max-sm:items-start max-sm:gap-5">
            <div className="flex flex-col gap-1 text-4xl font-semibold">
              <div className="text-lg font-normal text-muted-foreground">
                {metric?.name ?? "Unknown"}
              </div>
              <div className="flex flex-row items-center gap-4 max-sm:flex-col max-sm:items-start">
                <div className="flex items-center gap-3">
                  {valueFormatter(value)}
                  <UnitCombobox
                    unit={metric?.unit}
                    customUnits={projects[activeProject]?.units}
                    onChange={(value) => {
                      fetch(`${process.env.NEXT_PUBLIC_API_URL}/metric-unit`, {
                        method: "PATCH",
                        credentials: "include",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          unit: value,
                          metric_id: metric?.id,
                          project_id: projects[activeProject].id,
                        }),
                      }).then((resp) => {
                        if (resp.ok) {
                          setProjects(
                            projects.map((proj, i) =>
                              i === activeProject
                                ? Object.assign({}, proj, {
                                    metrics: proj.metrics?.map((m) =>
                                      m.id === metric?.id
                                        ? Object.assign({}, m, {
                                            unit: value,
                                          })
                                        : m,
                                    ),
                                  })
                                : proj,
                            ),
                          );
                        } else {
                          resp.text().then((text) => {
                            toast.error(text);
                          });
                        }
                      });
                    }}
                  />
                  <Separator
                    orientation="vertical"
                    className="my-auto ml-1 h-4"
                  />
                </div>
                <div>
                  <div className="flex flex-wrap justify-center gap-4">
                    <span
                      className={`inline-flex items-center gap-x-1 rounded-md border px-2 py-1 text-sm font-semibold ${BadgeColor(dailyUpdate)}`}
                    >
                      {BadgeSign(dailyUpdate)}
                      {Math.abs(dailyUpdate)} %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Separator className="mb-8 mt-5" />
          <Chart metric={metric} type="event" />
          <Chart metric={metric} type="trend" />
        </div>
      </TooltipProvider>
    </DashboardContentContainer>
  );
}

// Chart component to display metric data
function Chart(props: {
  metric: Metric | null | undefined;
  type: "trend" | "event";
}) {
  const [chartType, setChartType] = useState<"stacked" | "percent" | "default">(
    "default",
  );
  const [chartColor, setChartColor] = useState<number>(0);
  const [range, setRange] = useState<number>(1);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const [metricEvents, setMetricEvents] = useState<MetricEvent[] | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingRight, setLoadingRight] = useState(false);
  const [loadingLeft, setLoadingLeft] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  const [splitTrendChecked, setSplitTrendChecked] = useState(false);
  const [rangeSummary, setRangeSummary] = useState(0);

  // Load chart data based on the selected date range and filter
  const loadMetricEvents = async () => {
    if (!props.metric || !date?.from || !date.to) return;

    const data = await fetchMetricEvents(
      date.from,
      date.to,
      props.metric,
      props.metric.project_id,
    );

    if (props.metric.type === MetricType.Average) {
      setRangeSummary(calculateRangeAverage(data));
    } else {
      setRangeSummary(calculateRangeTotal(data));
    }

    setMetricEvents(data);
    setLoading(false);
    setLoadingLeft(false);
    setLoadingRight(false);
  };

  const calculateRangeTotal = (events: MetricEvent[]): number => {
    let total = 0;
    events.forEach((event) => {
      total += event.value_pos - event.value_neg;
    });
    return total;
  };

  const calculateRangeAverage = (events: MetricEvent[]): number => {
    const event_count = events.length;
    let total = 0;
    events.forEach((event) => {
      total += event.value_pos - event.value_neg;
    });

    return event_count === 0 ? 0 : total / event_count;
  };

  // Load chart data when the date range, range, year, or active filter changes
  useEffect(() => {
    if (activeFilterId) {
      if (!Object.keys(props.metric?.filters ?? {}).includes(activeFilterId)) {
        setActiveFilterId(null);
        return;
      }
    }

    loadMetricEvents();
  }, [date, range, year, activeFilterId, props.metric]);

  const chartData = useMemo(() => {
    if (!date?.from || !date?.to || !metricEvents || !props.metric) return [];
    return processMetricEvents(
      activeFilterId,
      metricEvents,
      "D",
      date?.from,
      props.metric,
      props.type === "trend",
    );
  }, [metricEvents]);

  // Helper functions to convert between DateRange and RangeValue<DateValue>
  const toRangeValue = (
    dateRange: DateRange | undefined,
  ): RangeValue<DateValue> | null => {
    if (!dateRange?.from || !dateRange?.to) return null;

    const start = new CalendarDate(
      dateRange.from.getFullYear(),
      dateRange.from.getMonth() + 1,
      dateRange.from.getDate(),
    );

    const end = new CalendarDate(
      dateRange.to.getFullYear(),
      dateRange.to.getMonth() + 1,
      dateRange.to.getDate(),
    );

    return {
      start,
      end,
    };
  };

  const toDateRange = (
    rangeValue: RangeValue<DateValue> | null,
  ): DateRange | undefined => {
    if (!rangeValue?.start || !rangeValue?.end) return undefined;

    return {
      from: new Date(
        rangeValue.start.year,
        rangeValue.start.month - 1,
        rangeValue.start.day,
      ),
      to: new Date(
        rangeValue.end.year,
        rangeValue.end.month - 1,
        rangeValue.end.day,
      ),
    };
  };

  const config = useMemo(() => {
    if (props.metric?.type === MetricType.Dual) {
      return {
        [props.metric?.name ?? ""]: {
          label: props.metric?.name ?? "",
          color: `hsl(var(--chart-${dualColors[chartColor].indexes[0]}))`,
        },
        [props.metric?.name_pos ?? ""]: {
          label: props.metric?.name_pos ?? "",
          color: `hsl(var(--chart-${dualColors[chartColor].indexes[0]}))`,
        },
        [props.metric?.name_neg ?? ""]: {
          label: props.metric?.name_neg ?? "",
          color: `hsl(var(--chart-${dualColors[chartColor].indexes[1]}))`,
        },
      } satisfies ChartConfig;
    } else {
      return {
        [props.metric?.name ?? ""]: {
          label: props.metric?.name ?? "",
          color: `hsl(var(--chart-${colors[chartColor].index}))`,
        },
      } satisfies ChartConfig;
    }
  }, [chartColor]);

  return (
    <>
      <CardHeader className="p-0">
        <CardTitle className={props.type === "event" ? "" : "mt-5"}>
          {props.type === "event" ? "Events" : "Trend"}
        </CardTitle>
        <CardDescription>
          {props.type === "event"
            ? "Chart displaying the events of this metric."
            : "Chart displaying the trend of this metric"}
        </CardDescription>
      </CardHeader>
      <div className="mb-5 overflow-x-auto">
        <div className="mt-5 flex w-fit flex-row items-center gap-2">
          <div className="flex gap-2">
            <RangeSelector />
          </div>
          <div className="flex h-full items-center gap-2 max-sm:w-full max-sm:justify-between">
            <OffsetBtns
              onLeft={() => {
                if (range >= 365) {
                  const new_year = new Date(year, 1, 0).getFullYear() - 1;
                  if (new_year < 1999) return;
                  setYear(new_year);
                  setLoadingLeft(true);
                } else {
                  const newFrom = new Date(date?.from || new Date());
                  newFrom.setDate(newFrom.getDate() - range);
                  if (newFrom.getFullYear() < 1999) return;
                  setDate({ from: newFrom, to: date?.to });
                  setLoadingLeft(true);
                }
              }}
              onRight={() => {
                if (range >= 365) {
                  const new_year = new Date(year, 1, 0).getFullYear() + 1;
                  const current_year = new Date().getFullYear();
                  if (new_year > current_year) return;
                  setYear(new_year);
                  setLoadingRight(true);
                } else {
                  const newFrom = new Date(date?.from || new Date());
                  newFrom.setDate(newFrom.getDate() + range);
                  const now = new Date();
                  if (newFrom > now) return;
                  setDate({ from: newFrom, to: date?.to });
                  setLoadingRight(true);
                }
              }}
              isLoadingLeft={loadingLeft}
              isLoadingRight={loadingRight}
              isDisabledLeft={useMemo(() => {
                if (range >= 365) {
                  return new Date(year, 1, 0).getFullYear() - 1 < 1999;
                } else {
                  const newFrom = new Date(date?.from || new Date());
                  newFrom.setDate(newFrom.getDate() - range);
                  return newFrom.getFullYear() < 1999;
                }
              }, [date, year, range])}
              isDisabledRight={useMemo(() => {
                if (range >= 365) {
                  return (
                    new Date(year, 1, 0).getFullYear() + 1 >
                    new Date().getFullYear()
                  );
                } else {
                  const newFrom = new Date(date?.from || new Date());
                  newFrom.setDate(newFrom.getDate() + range);
                  return newFrom > new Date();
                }
              }, [date, year, range])}
            />
            <Tooltip delayDuration={300}>
              <AdvancedOptions
                chartName={props.type}
                metricId={props.metric?.id ?? ""}
                metricType={props.metric?.type ?? MetricType.Base}
                splitTrendChecked={splitTrendChecked}
                setSplitTrendChecked={setSplitTrendChecked}
                chartType={chartType}
                chartColor={chartColor}
                setChartColor={setChartColor}
                setChartType={setChartType}
              >
                <TooltipTrigger asChild>
                  <Button
                    size={"icon"}
                    className="h-[34px] rounded-[12px] border-input !bg-background !text-primary hover:opacity-50"
                  >
                    <Sliders className="size-4" />
                  </Button>
                </TooltipTrigger>
              </AdvancedOptions>
              <TooltipContent
                side="bottom"
                sideOffset={5}
                className="rounded-[6px] border bg-accent !p-0.5 !px-1 text-xs font-medium text-primary"
              >
                Advanced options
              </TooltipContent>
            </Tooltip>
            {loading ? (
              <div className="p-1">
                <Loader className="size-4 animate-spin" />
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>

        {metricEvents === null ? (
          <Skeleton className="mt-2 h-[calc(40vh+125px)] w-full min-w-[600px] rounded-lg bg-accent" />
        ) : (
          <div className="mt-2 w-full min-w-[600px] rounded-[12px] border bg-accent dark:bg-card p-5 shadow-sm shadow-black/5">
            <div className="flex w-full items-center justify-between gap-5">
              <div className="flex flex-col">
                <div className="text-md text-muted-foreground">
                  {range === 365 ? `Summary of ${year}` : "Summary"}
                </div>
                <div className="text-xl font-medium font-mono">
                  {valueFormatter(rangeSummary)}
                  <span className="text-lg ml-1 text-muted-foreground">
                    {getUnit(props.metric?.unit ?? "")}
                  </span>
                </div>
              </div>
              {props.metric ? (
                <Filters
                  metric={props.metric}
                  activeFilterId={activeFilterId}
                  setActiveFilterId={setActiveFilterId}
                  events={metricEvents}
                />
              ) : (
                <Skeleton className="mt-2 h-[calc(40vh+125px)] w-full min-w-[600px] rounded-lg bg-accent" />
              )}
            </div>

            <Separator className="my-4" />
            {props.type === "trend" ? (
              <ChartContainer
                config={config}
                className="min-h-[50vh] max-h-[50vh] w-full"
              >
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 12,
                    right: 12,
                    top: 25,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} tickMargin={10} axisLine={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
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
                                {getUnit(props.metric?.unit ?? "")}
                              </span>
                            </div>
                          </div>
                        )}
                      />
                    }
                  />

                  <Area
                    dataKey={
                      (props.metric?.type === MetricType.Dual &&
                      splitTrendChecked
                        ? props.metric?.name_pos
                        : props.metric?.name) ?? ""
                    }
                    type="linear"
                    fill={`hsl(var(--chart-${props.metric?.type === MetricType.Dual ? dualColors[chartColor].indexes[0] : colors[chartColor].index}))`}
                    fillOpacity={0.05}
                    stroke={`hsl(var(--chart-${props.metric?.type === MetricType.Dual ? dualColors[chartColor].indexes[0] : colors[chartColor].index}))`}
                  />

                  {props.metric?.type === MetricType.Dual &&
                    splitTrendChecked && (
                      <Area
                        dataKey={props.metric?.name_neg ?? ""}
                        type="linear"
                        fill={`hsl(var(--chart-${dualColors[chartColor].indexes[1]}))`}
                        fillOpacity={0.05}
                        stroke={`hsl(var(--chart-${dualColors[chartColor].indexes[1]}))`}
                      />
                    )}
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            ) : (
              <ChartContainer
                config={config}
                className="min-h-[50vh] max-h-[50vh] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    top: 25,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis tickLine={false} tickMargin={10} axisLine={false} />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
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
                                {getUnit(props.metric?.unit ?? "")}
                              </span>
                            </div>
                          </div>
                        )}
                      />
                    }
                  />

                  <Bar
                    dataKey={
                      (props.metric?.type === MetricType.Dual
                        ? props.metric?.name_pos
                        : props.metric?.name) ?? ""
                    }
                    fill={`hsl(var(--chart-${props.metric?.type === MetricType.Dual ? dualColors[chartColor].indexes[0] : colors[chartColor].index}))`}
                    radius={[4, 4, 0, 0]}
                  >
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={12}
                      formatter={(value: number) => (value === 0 ? "" : value)}
                    />
                  </Bar>

                  {props.metric?.type === MetricType.Dual && (
                    <Bar
                      dataKey={props.metric?.name_neg ?? ""}
                      fill={`hsl(var(--chart-${dualColors[chartColor].indexes[1]}))`}
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList
                        position="top"
                        offset={12}
                        className="fill-foreground"
                        fontSize={12}
                        formatter={(value: number) =>
                          value === 0 ? "" : value
                        }
                      />
                    </Bar>
                  )}

                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ChartContainer>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// Offset buttons component for navigating left and right in the chart
function OffsetBtns(props: {
  onLeft: () => void;
  onRight: () => void;
  isLoadingLeft?: boolean | false;
  isLoadingRight?: boolean | false;
  isDisabledLeft?: boolean | false;
  isDisabledRight?: boolean | false;
}) {
  return (
    <div className="flex gap-2">
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            className="h-[34px] rounded-[12px] border-input !bg-background !text-primary hover:opacity-50"
            size={"icon"}
            onClick={props.onLeft}
            disabled={props.isDisabledLeft}
          >
            {props.isLoadingLeft ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              <ArrowLeft className="size-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          sideOffset={5}
          className="rounded-[6px] border bg-accent !p-0.5 !px-1 text-xs font-medium text-primary"
        >
          Offset left
        </TooltipContent>
      </Tooltip>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            className="h-[34px] rounded-[12px] border-input !bg-background !text-primary hover:opacity-50"
            size={"icon"}
            onClick={props.onRight}
            disabled={props.isDisabledRight}
          >
            {props.isLoadingRight ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              <ArrowRight className="size-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          sideOffset={5}
          className="rounded-[6px] border bg-accent !p-0.5 !px-1 text-xs font-medium text-primary"
        >
          Offset right
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

// function RangeSelector(props: {
//   range: number;
//   setRange: Dispatch<SetStateAction<number>>;
// }) {
//   const { projects, activeProject } = useContext(ProjectsContext);

//   const handleRangeChange = (value: string) => {
//     const range = parseInt(value);

//     if (
//       range === 365 &&
//       projects[activeProject].plan.name.toLowerCase() === 'starter'
//     ) {
//       toast.warning(
//         'Your current plan allows viewing up to 30 days of data. Upgrade to unlock extended date ranges.',
//       );
//       return; // Prevent changing the range
//     }

//     if (range !== props.range) {
//       props.setRange(range);
//     }
//   };

//   return (
//     <ToggleGroup
//       type='single'
//       defaultValue='1'
//       size={'sm'}
//       className='h-[34px] max-h-[34px] w-fit gap-1 rounded-[12px] border bg-background !p-1'
//       onValueChange={handleRangeChange}
//       value={props.range.toString()}
//     >
//       <ToggleGroupItem
//         value={'1'}
//         className='h-[28px] rounded-[8px] data-[state=on]:pointer-events-none'
//       >
//         D
//       </ToggleGroupItem>
//       <ToggleGroupItem
//         value='7'
//         className='h-[28px] rounded-[8px] data-[state=on]:pointer-events-none'
//       >
//         7D
//       </ToggleGroupItem>
//       <ToggleGroupItem
//         value='15'
//         className='h-[28px] rounded-[8px] data-[state=on]:pointer-events-none'
//       >
//         15D
//       </ToggleGroupItem>
//       <ToggleGroupItem
//         value='30'
//         className='h-[28px] rounded-[8px] data-[state=on]:pointer-events-none'
//       >
//         30D
//       </ToggleGroupItem>
//       <ToggleGroupItem
//         value='365'
//         className='h-[28px] rounded-[8px] data-[state=on]:pointer-events-none'
//       >
//         12M
//       </ToggleGroupItem>
//     </ToggleGroup>
//   );
// }
