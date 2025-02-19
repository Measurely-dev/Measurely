"use client";

// Import required React and UI components
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useMemo,
  useState,
  useEffect,
} from "react";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { ProjectsContext } from "@/dash-context";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AreaChart } from "@/components/ui/area-chart";
import {
  AreaChartData,
  BarChartData,
  BarListData,
  ComboChartData,
  PieChartData,
  RadarChartData,
} from "@/components/global/blocks-fake-data";
import { ComboChart } from "@/components/ui/combo-chart";
import { BarChart } from "@/components/ui/bar-chart";
import { BarList } from "@/components/ui/bar-list";
import {
  DialogStack,
  DialogStackBody,
  DialogStackContent,
  DialogStackContext,
  DialogStackDescription,
  DialogStackFooter,
  DialogStackNext,
  DialogStackOverlay,
  DialogStackPrevious,
  DialogStackTitle,
  DialogStackTrigger,
} from "@/components/ui/dialog-stack";
import { Input } from "@/components/ui/input";
import { MetricSelect } from "@/components/ui/metric-select";
import { Popover, PopoverContent } from "@/components/ui/popover";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  Label as RechartLabel,
} from "recharts";
import { Label } from "@/components/ui/label";
import {
  Block,
  BlockType,
  ChartType,
  chartTypeMetricLimits,
  Metric,
} from "@/types";
import { toast } from "sonner";
import { generateString } from "@/utils";
import { LabelSelect } from "@/components/ui/label-select";
import { FilterCategorySelect } from "@/components/ui/filter-category-select";
import { useRouter } from "next/navigation";

// Interface for block showcase items
interface BlockShowcaseType {
  name: string;
  value: number;
  description: string;
  chart: ReactNode;
}

// Chart configuration objects
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "blue",
  },
} satisfies ChartConfig;

const pieChartConfig = {
  visitors: { label: "Visitors" },
  chrome: { label: "Chrome", color: "blue" },
  safari: { label: "Safari", color: "lightblue" },
  firefox: { label: "Firefox", color: "purple" },
  edge: { label: "Edge", color: "violet" },
  other: { label: "Other", color: "pink" },
} satisfies ChartConfig;

// Wide block type configurations
const blockWideType: BlockShowcaseType[] = [
  {
    name: "Area Chart",
    value: ChartType.Area,
    description:
      "Visualizes data trends over time with shaded areas, highlighting volume or changes.",
    chart: (
      <AreaChart
        className="h-40"
        data={AreaChartData}
        colors={["violet", "blue"]}
        index="date"
        categories={["SolarPanels", "Inverters"]}
        valueFormatter={(number: number) =>
          `$${Intl.NumberFormat("us").format(number).toString()}`
        }
        showYAxis={false}
      />
    ),
  },
  {
    name: "Bar Chart",
    value: ChartType.Bar,
    description:
      "Represents data in a horizontal bar format, best for ranking and side-by-side comparisons.",
    chart: (
      <BarChart
        className="h-40"
        data={BarChartData}
        colors={["violet", "blue"]}
        index="date"
        categories={["SolarPanels", "Inverters"]}
        valueFormatter={(number: number) =>
          `$${Intl.NumberFormat("us").format(number).toString()}`
        }
        showYAxis={false}
      />
    ),
  },
  {
    name: "Combo Chart",
    value: ChartType.Combo,
    description:
      "Combines a bar chart and line chart in one, great for comparing totals and trends simultaneously.",
    chart: (
      <ComboChart
        className="h-40"
        data={ComboChartData}
        index="date"
        enableBiaxial={true}
        barSeries={{
          categories: ["SolarPanels"],
          showYAxis: false,
          colors: ["blue"],
        }}
        lineSeries={{
          categories: ["Inverters"],
          showYAxis: false,
          colors: ["fuchsia"],
        }}
      />
    ),
  },
];

// Compact block type configurations
const blockCompactType: BlockShowcaseType[] = [
  {
    name: "Pie Chart",
    value: ChartType.Pie,
    description:
      "Shows proportions of a whole using a pie chart, perfect for visualizing percentages or ratios.",
    chart: (
      <ChartContainer
        config={pieChartConfig}
        className="mx-auto h-[250px] w-full"
      >
        <PieChart>
          <Pie
            data={PieChartData}
            dataKey="visitors"
            nameKey="browser"
            innerRadius={60}
            strokeWidth={5}
          >
            <RechartLabel
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        1000
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        Visitors
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    ),
  },
  {
    name: "Radar Chart",
    value: ChartType.Radar,
    description:
      "Shows data distribution across multiple axes, perfect for comparing categories or metrics in a visually intuitive and informative way.",
    chart: (
      <ChartContainer config={chartConfig} className="mx-auto h-[250px] w-full">
        <RadarChart data={RadarChartData}>
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <PolarGrid className="fill-[blue] opacity-20" gridType="polygon" />
          <PolarAngleAxis dataKey="month" />
          <Radar
            dataKey="desktop"
            fill="var(--color-desktop)"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ChartContainer>
    ),
  },
  {
    name: "Bar List",
    value: ChartType.BarList,
    description:
      "Displays data in a vertical bar chart format, ideal for comparing multiple categories.",
    chart: <BarList data={BarListData} />,
  },
];

// Main dialog component for block selection
export default function BlocksDialog(props: {
  children?: ReactNode;
  type: "compact" | "wide";
  groupkey?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [value, setValue] = useState<number>(-1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { projects, activeProject } = useContext(ProjectsContext);
  const router = useRouter();

  // Handle dialog open/close
  const handleOpenChange = (open: boolean) => {
    if (open && props.type === "compact") {
      const project = projects[activeProject];
      const hasMetricWithFilters = project.metrics?.some(
        (metric) => Object.keys(metric.filters || {}).length > 0,
      );

      if (!hasMetricWithFilters) {
        toast.warning("You need at least one metric with a filter", {
          action: {
            label: "How to?",
            onClick: () => router.push("/docs/features/filters/"),
          },
        });
        return;
      }
    }
    setIsDialogOpen(open);
    if (props.onOpenChange) {
      props.onOpenChange(open);
    }
  };

  useEffect(() => {
    if (props.open !== undefined) {
      setIsDialogOpen(props.open);
    }
  }, [props.open]);

  return (
    <DialogStack>
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogOverlay />
        <DialogTrigger asChild className="max-sm:w-full">
          {props.children}
        </DialogTrigger>
        <DialogContent className="flex h-[80vh] max-h-[650px] w-[95%] max-w-[700px] flex-col gap-0 p-0 max-sm:w-[100%]">
          <DialogHeader className="px-5 py-5 max-sm:text-start">
            <DialogTitle>Select Block</DialogTitle>
            <DialogDescription>
              Custom components to showcase or compare metric data on your
              overview page.
            </DialogDescription>
          </DialogHeader>
          <div className="flex h-full flex-col gap-5 overflow-y-auto border-t px-5 pb-5 pt-3">
            {props.type === "wide" ? (
              <div className="grid grid-cols-1 gap-5">
                {blockWideType.map((block, i) => (
                  <BlockItem
                    key={i}
                    description={block.description}
                    name={block.name}
                    value={block.value}
                    state={value}
                    setState={setValue}
                    chart={block.chart}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                {blockCompactType.map((block, i) => (
                  <BlockItem
                    key={i}
                    description={block.description}
                    name={block.name}
                    value={block.value}
                    state={value}
                    setState={setValue}
                    chart={block.chart}
                  />
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="border-t p-5">
            <DialogClose asChild onClick={() => setValue(0)}>
              <Button className="rounded-[12px]" variant={"secondary"}>
                Cancel
              </Button>
            </DialogClose>
            <BlocksDialogStack
              setIsDialogOpen={setIsDialogOpen}
              type={value}
              groupKey={props.groupkey}
            >
              <Button
                className="w-fit rounded-[12px] max-md:mb-2"
                disabled={value === -1}
              >
                Next
              </Button>
            </BlocksDialogStack>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DialogStack>
  );
}

// Individual block item component
function BlockItem(props: {
  name: string;
  value: number;
  description: string;
  chart?: ReactNode;
  state: any;
  setState: Dispatch<SetStateAction<number>>;
}) {
  const { projects, activeProject } = useContext(ProjectsContext);
  const blockSelected = useMemo(
    () => findBlockByValue(props.value),
    [props.value],
  );

  const chartLimits = blockSelected
    ? chartTypeMetricLimits[blockSelected.value as ChartType]
    : { min: 0, max: 0 };
  const min = chartLimits.min;

  // Handle block selection
  const handleClick = () => {
    const project = projects[activeProject];
    const totalMetrics = project.metrics?.length || 0;

    if (totalMetrics < min) {
      toast.warning(
        `You need at least ${min} metrics to create a ${props.name}`,
      );
      return;
    }

    props.setState(props.state !== props.value ? props.value : 0);
  };

  return (
    <div
      className={`flex w-full select-none flex-col gap-1 rounded-xl border p-3 transition-all duration-150 ${
        props.state === props.value
          ? "cursor-pointer bg-blue-500/10 ring-2 ring-blue-500/70"
          : "cursor-pointer hover:bg-accent/50"
      }`}
      onClick={handleClick}
    >
      <div className="text-sm font-medium">{props.name}</div>
      <div className="text-xs font-light text-muted-foreground">
        {props.description}
      </div>
      {props.value === ChartType.BarList ? (
        <BarList className="mt-4" data={BarListData} />
      ) : (
        <div className="pointer-events-none mx-auto mt-4 flex w-full select-none items-center justify-center">
          {props.chart}
        </div>
      )}
    </div>
  );
}

// Helper function to find block configuration by value
const findBlockByValue = (value: number) => {
  for (const block of blockWideType) {
    if (block.value === value) return block;
  }
  for (const block of blockCompactType) {
    if (block.value === value) return block;
  }
  return null;
};

// Dialog stack component for block configuration
function BlocksDialogStack(props: {
  children: ReactNode;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  type: number;
  groupKey?: string;
}) {
  const blockSelected = useMemo(
    () => findBlockByValue(props.type),
    [props.type],
  );

  const chartLimits =
    blockSelected?.value !== undefined
      ? chartTypeMetricLimits[blockSelected.value as ChartType]
      : chartTypeMetricLimits[ChartType.Area];

  const min = chartLimits.min;
  const max = chartLimits.max;

  const [nameInputValue, setNameInputValue] = useState<string>("");
  const dialogStackContext = useContext(DialogStackContext);
  const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const [selectFilterCategory, setSelectFilterCategory] = useState<string>("");
  const { projects, activeProject, setProjects } = useContext(ProjectsContext);

  const isCompactType = blockCompactType.some(
    (block) => block.value === props.type,
  );

  if (!dialogStackContext) return null;

  const { closeDialog } = dialogStackContext;

  return (
    <>
      <DialogStackOverlay
        onClick={() => {
          setNameInputValue("");
          setSelectedLabel("");
          setSelectedMetrics([]);
          closeDialog();
        }}
      />
      <DialogStackTrigger asChild>{props.children}</DialogStackTrigger>
      <DialogStackBody className="z-[110] my-auto h-fit">
        <DialogStackContent className="relative">
          <DialogHeader>
            <DialogStackTitle>
              Choose{" "}
              <span className="text-purple-500">{blockSelected?.name}</span>{" "}
              Name
            </DialogStackTitle>
            <DialogStackDescription>
              Choose a descriptive and concise name that reflects the data the
              block will display.
            </DialogStackDescription>
          </DialogHeader>
          <div className="my-4 mb-0 flex flex-col gap-2">
            <Popover open={true}>
              <PopoverContent asChild>
                <div className="hidden" />
              </PopoverContent>
            </Popover>
            <Label>Choose block name</Label>
            <Input
              placeholder="Block name..."
              className="z-50 h-11 rounded-[12px]"
              value={nameInputValue}
              onChange={(e) => setNameInputValue(e.target.value)}
              maxLength={25}
            />
          </div>
          <DialogStackFooter className="mt-5">
            <Button
              onClick={() => {
                setNameInputValue("");
                setSelectedLabel("");
                setSelectedMetrics([]);
                closeDialog();
              }}
              className="rounded-[12px]"
              variant={"secondary"}
            >
              Cancel
            </Button>
            <DialogStackNext asChild>
              <Button className="rounded-[12px]" disabled={!nameInputValue}>
                Next
              </Button>
            </DialogStackNext>
          </DialogStackFooter>
        </DialogStackContent>

        <DialogStackContent>
          <DialogHeader>
            <DialogStackTitle>Select block label</DialogStackTitle>
            <DialogStackDescription>
              The block label will be used to identify the data visualization
              and help you organize your metrics.
            </DialogStackDescription>
          </DialogHeader>
          <div className="my-4 mb-0">
            <div className="flex flex-col gap-2">
              <Label>Block label</Label>
              <LabelSelect
                selectedLabel={selectedLabel}
                setSelectedLabel={setSelectedLabel}
              />
            </div>
          </div>
          <DialogStackFooter>
            <DialogStackPrevious asChild>
              <Button className="rounded-[12px]" variant={"secondary"}>
                Previous
              </Button>
            </DialogStackPrevious>
            <DialogStackNext asChild>
              <Button
                className="rounded-[12px]"
                disabled={selectedLabel === ""}
              >
                Next
              </Button>
            </DialogStackNext>
          </DialogStackFooter>
        </DialogStackContent>

        <DialogStackContent>
          <DialogHeader>
            <DialogStackTitle>Select metric(s)</DialogStackTitle>
            <DialogStackDescription>
              You can select multiple metrics or a single one, to compare or
              track various data points.
            </DialogStackDescription>
          </DialogHeader>
          <div className="my-4 mb-0 flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <Label>
                {isCompactType &&
                selectedMetrics.length > 0 &&
                Object.keys(selectedMetrics[0].filters || {}).length === 0 ? (
                  <span className="text-red-500">
                    Please select a metric that has filters
                  </span>
                ) : (
                  <>
                    {`Select ${selectedMetrics.length} of ${max} metrics`}
                    <span
                      className={`ml-2 ${
                        selectedMetrics.length < min ||
                        selectedMetrics.length > max
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {selectedMetrics.length < min
                        ? `(${min - selectedMetrics.length} more required)`
                        : selectedMetrics.length > max
                          ? `(${selectedMetrics.length - max} too many)`
                          : ""}
                    </span>
                  </>
                )}
              </Label>
              <MetricSelect
                min={min}
                max={max}
                setSelectFilterCategories={() => {}}
                selectedMetrics={selectedMetrics}
                setSelectedMetrics={setSelectedMetrics}
              />
            </div>
            {isCompactType &&
              selectedMetrics.length > 0 &&
              Object.keys(selectedMetrics[0].filters || {}).length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                  <Label>Select filter category</Label>
                  <FilterCategorySelect
                    metric={selectedMetrics[0]}
                    selectedFilterCategory={selectFilterCategory}
                    setSelectedFilterCategory={setSelectFilterCategory}
                  />
                </div>
              )}
          </div>
          <DialogStackFooter>
            <DialogStackPrevious asChild>
              <Button className="rounded-[12px]" variant={"secondary"}>
                Previous
              </Button>
            </DialogStackPrevious>
            <Button
              className="rounded-[12px]"
              disabled={
                selectedMetrics.length < min ||
                selectedMetrics.length > max ||
                (isCompactType &&
                  selectedMetrics.length > 0 &&
                  Object.keys(selectedMetrics[0].filters || {}).length === 0) ||
                (isCompactType && selectFilterCategory === "")
              }
              onClick={() => {
                props.setIsDialogOpen(false);
                setNameInputValue("");
                setSelectedLabel("");
                setSelectedMetrics([]);
                closeDialog();
                const project = projects[activeProject];
                const labelIndex =
                  project.blocks?.labels.findIndex(
                    (l) => l.name === selectedLabel,
                  ) ?? -1;
                if (labelIndex === -1) {
                  return;
                }
                const color =
                  project.blocks?.labels[labelIndex].default_color ?? "";
                const newBlock: Block = {
                  id: 0,
                  unique_key: generateString(10),
                  name: nameInputValue,
                  type:
                    props.groupKey === undefined
                      ? BlockType.Default
                      : BlockType.Nested,
                  chart_type: props.type,
                  label: selectedLabel,
                  metric_ids: selectedMetrics.map((metric) => metric.id),
                  filter_categories: [],
                  color: color,
                };
                if (props.groupKey !== undefined) {
                  const layout =
                    project.blocks?.layout.filter(
                      (l) => l.unique_key === props.groupKey,
                    ) ?? [];
                  if (layout.length === 0) {
                    toast.error("Block does not exist");
                    return;
                  }
                  const length = layout[0].nested ? layout[0].nested.length : 0;
                  if ((length ?? 0) >= 3) {
                    toast.error("Cannot have more than 3 blocks in a group");
                    return;
                  }

                  newBlock.filter_categories = [selectFilterCategory];
                  newBlock.id = length + 1;
                  setProjects(
                    projects.map((proj, i) =>
                      i === activeProject
                        ? Object.assign({}, proj, {
                            blocks: Object.assign({}, proj.blocks, {
                              layout: proj.blocks?.layout.map((l) =>
                                l.unique_key === props.groupKey
                                  ? Object.assign({}, l, {
                                      nested: [
                                        ...(l.nested ? l.nested : []),
                                        newBlock,
                                      ],
                                    })
                                  : l,
                              ),
                            }),
                          })
                        : proj,
                    ),
                  );
                } else {
                  newBlock.id =
                    project.blocks === null
                      ? 1
                      : project.blocks.layout.length + 1;

                  let layoutCopy = project.blocks?.layout;
                  if (layoutCopy === undefined) layoutCopy = [];
                  layoutCopy.unshift(newBlock);
                  for (let i = 0; i < layoutCopy.length; i++) {
                    layoutCopy[i].id = i;
                  }
                  setProjects(
                    projects.map((proj, i) =>
                      i === activeProject
                        ? Object.assign({}, proj, {
                            blocks: Object.assign({}, proj.blocks, {
                              layout: layoutCopy,
                            }),
                          })
                        : proj,
                    ),
                  );
                }
              }}
            >
              Create block
            </Button>
          </DialogStackFooter>
        </DialogStackContent>
      </DialogStackBody>
    </>
  );
}
