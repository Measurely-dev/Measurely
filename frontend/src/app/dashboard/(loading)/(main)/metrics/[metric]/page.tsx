'use client';
import DashboardContentContainer from '@/components/dashboard/container';
import { MetricDatePicker } from '@/components/dashboard/date-picker';
import EditMetricDialogContent from '@/components/dashboard/edit-metric-dialog-content';
import { AreaChart, TooltipProps } from '@/components/ui/area-chart';
import { BarChart } from '@/components/ui/bar-chart';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ProjectsContext, UserContext } from '@/dash-context';
import { cn } from '@/lib/utils';
import { Metric, MetricType } from '@/types';
import {
  calculateTrend,
  fetchDailySummary,
  fetchNextEvent,
  INTERVAL,
  fetchChartData,
} from '@/utils';
import { Dialog } from '@radix-ui/react-dialog';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronsUpDown,
  Copy,
  Edit,
  Loader,
  Sliders,
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';

type AllowedColors =
  | 'blue'
  | 'red'
  | 'green'
  | 'pink'
  | 'amber'
  | 'black'
  | 'gray'
  | 'fuchsia'
  | 'cyan'
  | 'violet'
  | 'lime';

interface ChartColors {
  blue: string;
  red: string;
  green: string;
  pink: string;
  amber: string;
  black: string;
  gray: string;
  fuchsia: string;
}
interface DualMetricChartColors {
  default: {
    positive: AllowedColors;
    negative: AllowedColors;
  };
  cool: {
    positive: AllowedColors;
    negative: AllowedColors;
  };
  warm: {
    positive: AllowedColors;
    negative: AllowedColors;
  };
  contrast: {
    positive: AllowedColors;
    negative: AllowedColors;
  };
  soft: {
    positive: AllowedColors;
    negative: AllowedColors;
  };
  vibrant: {
    positive: AllowedColors;
    negative: AllowedColors;
  };
  neutral: {
    positive: AllowedColors;
    negative: AllowedColors;
  };
}

const dualMetricChartColors: DualMetricChartColors = {
  default: {
    positive: 'green',
    negative: 'red',
  },
  cool: {
    positive: 'cyan',
    negative: 'violet',
  },
  warm: {
    positive: 'amber',
    negative: 'red',
  },
  contrast: {
    positive: 'lime',
    negative: 'black',
  },
  soft: {
    positive: 'pink',
    negative: 'gray',
  },
  vibrant: {
    positive: 'fuchsia',
    negative: 'blue',
  },
  neutral: {
    positive: 'gray',
    negative: 'black',
  },
};

function getDualMetricChartColors(
  colorsConfig: DualMetricChartColors,
  theme: keyof DualMetricChartColors,
): AllowedColors[] {
  const selectedColors = colorsConfig[theme];
  return [selectedColors.positive, selectedColors.negative];
}

const valueFormatter = (number: number) => {
  return Intl.NumberFormat('us').format(number).toString();
};

export default function DashboardMetricPage() {
  const router = useRouter();
  const { projects, activeProject, setProjects } = useContext(ProjectsContext);
  const { user } = useContext(UserContext);
  const metricName = decodeURIComponent(useParams().metric as string);
  const [open, setOpen] = useState(false);
  const [metric, setMetric] = useState(() => {
    if (projects[activeProject]) {
      const index = projects[activeProject].metrics?.findIndex(
        (g) => g.name === metricName,
      );
      if (index !== undefined && index !== -1) {
        const metricData = projects[activeProject].metrics?.[index];

        if (index > user.plan.metric_per_project_limit - 1) {
          toast.error(
            'You have exceeded your plan limits. Please upgrade to unlock your metrics.',
          );
        } else {
          if (metricData !== null) {
            return metricData;
          }
        }
      }
    }
    router.push('/dashboard/metrics');
    return null;
  });

  const [posDaily, setPosDaily] = useState<number>(0);
  const [negDaily, setNegDaily] = useState<number>(0);

  const loadDailyValues = async (metric: Metric) => {
    const { pos, neg, relativetotalpos, relativetotalneg, results } =
      await fetchDailySummary(metric.projectid, metric.id);
    setPosDaily(pos);
    setNegDaily(neg);

    if (
      (metric.totalpos !== relativetotalpos ||
        metric.totalneg !== relativetotalneg) &&
      results !== 0
    ) {
      setProjects(
        projects.map((v) =>
          v.id === metric.projectid
            ? Object.assign({}, v, {
              metrics: v.metrics?.map((m) =>
                m.id === metric.id
                  ? Object.assign({}, m, {
                    totalpos: relativetotalpos,
                    totalneg: relativetotalneg,
                  })
                  : m,
              ),
            })
            : v,
        ),
      );
      setMetric(
        Object.assign({}, metric, {
          totalpos: relativetotalpos,
          relativetotalneg,
        }),
      );
    }
  };

  useEffect(() => {
    loadDailyValues(metric!);
    const interval = setInterval(() => {
      loadDailyValues(metric!);
    }, INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    document.title = `${metric?.name} | Measurely`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        `Track and analyze ${metric?.name} in detail. Monitor its performance, explore trends, and gain insights to make informed decisions.`,
      );
    }
  }, []);

  return (
    <DashboardContentContainer className='mt-0 flex w-full pb-20 pt-[15px]'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink className='pointer-events-none'>
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbLink href='/dashboard/metrics'>
            <BreadcrumbPage className='capitalize'>Metrics</BreadcrumbPage>
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{metric?.name ?? 'Unknown'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <TooltipProvider>
        <div className='mt-5 flex h-full flex-col'>
          <div className='flex flex-row items-end justify-between max-sm:flex-col max-sm:items-start max-sm:gap-5'>
            <div className='flex flex-col gap-1 text-4xl font-semibold'>
              <div className='text-lg font-normal text-muted-foreground'>
                {metric?.name ?? 'Unknown'}
              </div>
              <div className='flex flex-row items-center gap-4 max-sm:flex-col max-sm:items-start'>
                {valueFormatter(
                  (metric?.totalpos ?? 0) - (metric?.totalneg ?? 0),
                )}
                {metric?.type === MetricType.Dual ? (
                  <>
                    <div className='flex flex-col gap-1'>
                      <div className='h-fit w-fit rounded-[6px] bg-green-500/10 px-1 py-0.5 font-mono text-sm text-green-500'>
                        +{valueFormatter(posDaily)}
                      </div>
                      <div className='h-fit w-fit rounded-[6px] bg-red-500/10 px-1 py-0.5 font-mono text-sm text-red-500'>
                        -{valueFormatter(negDaily)}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className='flex flex-col gap-1'>
                      <div className='h-fit w-fit rounded-[6px] bg-green-500/10 px-1 py-0.5 font-mono text-sm text-green-500'>
                        +{valueFormatter(posDaily)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className='flex flex-row gap-2'>
              <Button
                variant={'secondary'}
                size={'icon'}
                className='size-9 min-w-9 rounded-[12px] max-sm:w-full'
                onClick={() => {
                  navigator.clipboard.writeText(metric ? metric.id : '');
                  toast.success('Succefully copied metric ID');
                }}
              >
                <Copy className='size-4' />
              </Button>
              <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
                <DialogTrigger asChild>
                  <Button className='rounded-[12px] max-sm:w-full'>
                    <Edit className='mr-2 size-4' />
                    Edit
                  </Button>
                </DialogTrigger>
                <EditMetricDialogContent
                  metric={metric}
                  setOpen={setOpen}
                  onUpdate={(new_name: string) => {
                    setMetric(Object.assign({}, metric, { name: new_name }));
                  }}
                />
              </Dialog>
            </div>
          </div>
          <Chart metric={metric} type='overview' />
          <Chart metric={metric} type='trend' />
        </div>
      </TooltipProvider>
    </DashboardContentContainer>
  );
}

function Chart(props: {
  metric: Metric | null | undefined;
  type: 'trend' | 'overview';
}) {
  const [chartType, setChartType] = useState<'stacked' | 'percent' | 'default'>(
    'default',
  );
  const [chartColor, setChartColor] = useState<keyof ChartColors>('blue');
  const [dualMetricChartColor, setDualMetricChartColor] =
    useState<keyof DualMetricChartColors>('default');
  const dualMetricChartConfig = {
    colors: getDualMetricChartColors(
      dualMetricChartColors,
      dualMetricChartColor,
    ),
  };
  const [range, setRange] = useState<number>(1);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [chartData, setChartData] = useState<any[] | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingRight, setLoadingRight] = useState(false);
  const [loadingLeft, setLoadingLeft] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [filtersChecked, setFiltersChecked] = useState(false);
  const [activeFilterCategory, setActiveFilterCategory] = useState('');
  const [splitTrendChecked, setSplitTrendChecked] = useState(false);
  const [rangeSummary, setRangeSummary] = useState<{
    pos: number;
    neg: number;
  }>({ pos: 0, neg: 0 });

  function mergeArraysByDate(...arrays: any[]) {
    // Validate that arrays are of the same length
    const length = arrays[0].length;
    if (!arrays.every(arr => arr.length === length)) {
      throw new Error("All arrays must have the same length.");
    }

    // Merge objects with the same index
    return arrays[0].map((_: any, index: number) =>
      arrays.reduce((merged, currentArray) => ({
        ...merged,
        ...currentArray[index],
      }), {})
    );
  }



  const loadChart = async (from: Date) => {
    if (!props.metric) return;

    const data = await fetchChartData(
      from,
      range,
      props.metric,
      props.metric.projectid,
      props.type,
    );

    const { pos, neg } = await loadRangeSummary(data, props.metric);
    setRangeSummary({ pos, neg });

    if (filtersChecked) {
      const filters = props.metric.filters[activeFilterCategory];

      const filtersData = [];
      for (let i = 0; i < filters.length; i++) {
        const filterData = await fetchChartData(
          from,
          range,
          filters[i],
          filters[i].projectid,
          props.type,
        );

        if (props.type === 'trend') {
          const { pos, neg } = await loadRangeSummary(filterData, filters[i]);
          const trend = calculateTrend(filterData, filters[i], pos, neg);
          filtersData.push(trend)
        } else {
          filtersData.push(data)
        }
      }
      const merged = mergeArraysByDate(...filtersData)


      setChartData(merged)
    } else {
      if (props.type === 'trend') {
        const trend = calculateTrend(data, props.metric, pos, neg);
        setChartData(trend);
      } else {
        setChartData(data);
      }
    }

    setLoading(false);
    setLoadingLeft(false);
    setLoadingRight(false);
  };

  const loadRangeSummary = async (
    data: any[],
    metric: Metric
  ): Promise<{ pos: number; neg: number }> => {
    if (props.type === 'trend') {
      let pos = 0;
      let neg = 0;
      let found = false;
      for (let i = data.length - 1; i >= 0; i--) {
        if (
          data[i]['+' + metric.name] !== undefined &&
          data[i]['-' + metric.name] !== undefined
        ) {
          found = true;
          pos = data[i]['+' + metric.name];
          neg = data[i]['-' + metric.name];
          break;
        }
      }

      if (!found) {
        if (date?.from === undefined) return { pos: 0, neg: 0 };
        const end = new Date(date.from);
        end.setDate(end.getDate() + 1);
        end.setHours(0);
        end.setMinutes(0);
        end.setSeconds(0);

        const now = new Date();
        if (end.getTime() > now.getTime()) {
          return {
            pos: metric.totalpos,
            neg: metric.totalneg,
          };
        }

        const { relativetotalpos, relativetotalneg, pos, neg } =
          await fetchNextEvent(metric.projectid, metric.id, end);

        return {
          pos: relativetotalpos - pos,
          neg: relativetotalneg - neg,
        };
      }

      return { pos, neg };
    } else {
      if (chartData === null) return { pos: 0, neg: 0 };
      let totalpos = 0;
      let totalneg = 0;

      for (let i = 0; i < data.length; i++) {
        if (metric.type === MetricType.Base) {
          totalpos += data[i][metric.name] ?? 0;
        } else {
          totalpos += data[i][metric.namepos ?? ''] ?? 0;
          totalneg += data[i][metric.nameneg ?? ''] ?? 0;
        }
      }
      return { pos: totalpos, neg: totalneg };
    }
  };

  useEffect(() => {
    let interval: any;
    if (range >= 365) {
      const start = new Date(year, 1, 0);
      start.setDate(1);
      if (!loadingLeft && !loadingRight) {
        setLoading(true);
      }
      loadChart(start);
      interval = setInterval(() => {
        loadChart(start);
      }, INTERVAL);
    } else {
      if (date !== undefined && date.from !== undefined) {
        setYear(date.from.getFullYear());
        const to = new Date(date.from);
        to.setDate(date.from.getDate() - (range - 1));
        const now = new Date();
        if (now < to) {
          setDate({
            from: new Date(),
          });
        } else {
          if (!loadingLeft && !loadingRight) {
            setLoading(true);
          }
          loadChart(to);
          interval = setInterval(() => {
            loadChart(to);
          }, INTERVAL);
          setDate({
            from: date.from,
            to: to,
          });
        }
      }
    }

    return () => {
      clearInterval(interval);
    };
  }, [date?.from, range, year, filtersChecked]);
  return (
    <>
      <CardHeader className='mt-10 p-0'>
        <CardTitle>Overview</CardTitle>
        <CardDescription>
          Chart displaying an overview of this metric.
        </CardDescription>
      </CardHeader>
      <div className='mt-5 flex w-fit flex-row items-center gap-2 rounded-[12px] bg-accent p-1 max-sm:flex-col max-sm:items-start'>
        <div className='flex gap-2'>
          <RangeSelector range={range} setRange={setRange} />
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className='h-[34px] rounded-[10px] !bg-background !text-primary hover:opacity-50'
                    size={'icon'}
                  >
                    <Calendar className='size-4' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className='w-auto rounded-[16px] p-0'
                  align='start'
                >
                  <MetricDatePicker
                    selected={date}
                    onSelect={setDate}
                    mode='range'
                    autoFocus
                    startMonth={new Date(1999, 11)}
                    endMonth={new Date()}
                    max={1}
                    disabled={range >= 365}
                  />
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent
              side='bottom'
              sideOffset={5}
              className='rounded-[6px] border bg-accent !p-0.5 !px-1 text-xs font-medium text-primary'
            >
              Starting point
            </TooltipContent>
          </Tooltip>
        </div>
        <Separator
          orientation='vertical'
          className='mx-2 h-[50%] max-sm:hidden'
        />
        <div className='flex h-full items-center gap-2 max-sm:w-full max-sm:justify-between'>
          <AdvancedOptions
            chartName={props.type}
            metricId={props.metric?.id ?? ''}
            metricType={props.metric?.type ?? MetricType.Base}
            splitTrendChecked={splitTrendChecked}
            setSplitTrendChecked={setSplitTrendChecked}
            filters={props.metric?.filters ?? {}}
            filtersChecked={filtersChecked}
            setFiltersChecked={setFiltersChecked}
            activeFilterCategory={activeFilterCategory}
            setActiveFilterCategory={setActiveFilterCategory}
            chartType={chartType}
            chartColor={chartColor}
            dualMetricChartColor={dualMetricChartColor}
            setChartColor={setChartColor}
            setChartType={setChartType}
            setDualMetricChartColor={
              props.metric?.type === MetricType.Base
                ? undefined
                : setDualMetricChartColor
            }
          >
            <Button className='h-[34px] rounded-[10px] !bg-background !text-primary hover:opacity-50'>
              <Sliders className='mr-2 size-4' />
              Advanced
            </Button>
          </AdvancedOptions>

          <Separator
            orientation='vertical'
            className='mx-2 h-[50%] max-sm:hidden'
          />
          <OffsetBtns
            onLeft={() => {
              if (range >= 365) {
                const new_year = new Date(year, 1, 0).getFullYear() - 1;
                if (new_year < 1999) {
                  return;
                }
                setYear(new_year);
                setLoadingLeft(true);
                return;
              }
              setDate((prev) => {
                if (
                  prev === undefined ||
                  prev.from === undefined ||
                  prev.to === undefined
                )
                  return prev;
                const from = new Date(prev.from);
                const to = new Date(prev.to);
                const toRemove = range;
                from.setDate(from.getDate() - toRemove);
                to.setDate(to.getDate() - toRemove);
                if (to.getFullYear() < 1999) {
                  return;
                }
                setLoadingLeft(true);
                return {
                  from: from,
                  to: prev.to,
                };
              });
            }}
            onRight={() => {
              if (range >= 365) {
                const new_year = new Date(year, 1, 0).getFullYear() + 1;
                const current_year = new Date().getFullYear();
                if (new_year > current_year) {
                  return;
                }
                setYear(new_year);
                setLoadingRight(true);
                return;
              }

              setDate((prev) => {
                if (
                  prev === undefined ||
                  prev.from === undefined ||
                  prev.to === undefined
                )
                  return prev;
                const from = new Date(prev.from);
                const to = new Date(prev.to);
                const toAdd = range;
                from.setDate(from.getDate() + toAdd);
                to.setDate(to.getDate() + toAdd);
                const now = new Date();
                if (now < to) {
                  return prev;
                }
                setLoadingRight(true);
                return {
                  from: from,
                  to: prev.to,
                };
              });
            }}
            isLoadingLeft={loadingLeft}
            isLoadingRight={loadingRight}
            isDisabledLeft={useMemo(() => {
              if (range >= 365) {
                const new_year = new Date(year, 1, 0).getFullYear() - 1;
                return new_year < 1999;
              } else {
                if (date === undefined || date.to === undefined) {
                  return false;
                }
                const to = new Date(date.to);
                const toAdd = range;
                to.setDate(to.getDate() - toAdd);
                const result = to.getFullYear() < 1999;
                return result;
              }
            }, [date, year])}
            isDisabledRight={useMemo(() => {
              if (range >= 365) {
                const new_year = new Date(year, 1, 0).getFullYear() + 1;
                const current_year = new Date().getFullYear();

                return new_year > current_year;
              } else {
                if (date === undefined || date.to === undefined) {
                  return false;
                }
                const now = new Date();
                const to = new Date(date.to);
                const toAdd = range;
                to.setDate(to.getDate() + toAdd);
                const result = now < to;
                return result;
              }
            }, [date, year])}
          />
          {loading ? (
            <div className='p-1'>
              <Loader className='size-4 animate-spin' />
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>

      {chartData === null ? (
        <Skeleton className='mt-2 h-[calc(40vh+125px)] w-full rounded-[12px] bg-accent' />
      ) : (
        <div className='mb-20 mt-2 w-full rounded-[12px] bg-accent p-5'>
          <div className='text-md text-secondary'>
            {range === 365 ? `Summary of ${year}` : 'Summary'}
          </div>
          <div className='text-xl font-medium'>
            {rangeSummary.pos - rangeSummary.neg > 0 ? '+' : ''}
            {valueFormatter(rangeSummary.pos - rangeSummary.neg)}
          </div>

          <Separator className='my-4' />
          {props.type === 'trend' ? (
            <AreaChart
              className='min-h-[40vh] w-full'
              data={chartData}
              index='date'
              customTooltip={customTooltip}
              colors={
                splitTrendChecked
                  ? dualMetricChartConfig.colors
                  : [chartColor]
              }
              categories={
                splitTrendChecked
                  ? (
                    filtersChecked ?
                      props.metric?.filters[activeFilterCategory].flatMap(filter => ['+' + filter.name, '-' + filter.name]) ?? []
                      :
                      ['+' + (props.metric?.name ?? ""), "-" + (props.metric?.name ?? "")]
                  )
                  : (
                    filtersChecked ?
                      props.metric?.filters[activeFilterCategory].map(filter => filter.name) ?? []
                      :
                      [props.metric?.name ?? ""]
                  )
              }
              valueFormatter={(number: number) => valueFormatter(number)}
              yAxisLabel='Total'
              onValueChange={() => { }}
            />
          ) : (
            <>
              <BarChart
                className='min-h-[40vh] w-full'
                data={chartData}
                customTooltip={customTooltip}
                index='date'
                tabIndex={0}
                type={chartType}
                colors={
                  props.metric?.type === MetricType.Dual
                    ? dualMetricChartConfig.colors
                    : [chartColor]
                }
                categories={
                  filtersChecked ?
                    (props.metric?.type === MetricType.Base
                      ? props.metric?.filters[activeFilterCategory].map(filter => filter.name) ?? []
                      : props.metric?.filters[activeFilterCategory].flatMap(filter => [filter.namepos, filter.nameneg]) ?? []
                    )
                    :
                    (props.metric?.type === MetricType.Base
                      ? [props.metric?.name ?? '']
                      : [
                        props.metric?.namepos ?? '',
                        props.metric?.nameneg ?? '',
                      ])

                }
                valueFormatter={(number: number) =>
                  `${Intl.NumberFormat('us').format(number).toString()}`
                }
                yAxisLabel='Total'
                onValueChange={() => { }}
              />
            </>
          )}
        </div >
      )
      }
    </>
  );
}

function AdvancedOptions(props: {
  chartName: string;
  metricId: string;
  metricType: MetricType;
  children: ReactNode;
  chartType: string;
  chartColor: string;
  filters: {
    [category: string]: Metric[];
  };
  activeFilterCategory: string;
  setActiveFilterCategory: Dispatch<SetStateAction<string>>;
  dualMetricChartColor?: string;
  filtersChecked: boolean;
  setFiltersChecked: Dispatch<SetStateAction<boolean>>;
  splitTrendChecked?: boolean;
  setChartType: Dispatch<SetStateAction<'stacked' | 'percent' | 'default'>>;
  setChartColor: Dispatch<SetStateAction<keyof ChartColors>>;
  setDualMetricChartColor?: Dispatch<
    SetStateAction<keyof DualMetricChartColors>
  >;
  setSplitTrendChecked?: Dispatch<SetStateAction<boolean>>;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('chartsettings') ?? '{}');
    let name = props.metricId + props.chartName;
    if (props.chartName === 'trend' && props.splitTrendChecked) {
      name += 'dual';
    }
    if (!settings[name]) return;
    if (settings[name].chartType) {
      props.setChartType(
        settings[name].chartType as 'stacked' | 'percent' | 'default',
      );
    }

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

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('chartsettings') ?? '{}');
    let name = props.metricId + props.chartName;
    if (props.chartName === 'trend' && props.splitTrendChecked) {
      name += 'dual';
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

    localStorage.setItem('chartsettings', JSON.stringify(settings));
  }, [
    props.chartType,
    props.chartColor,
    props.dualMetricChartColor,
    props.splitTrendChecked,
  ]);
  return (
    <Popover open={isOpen} onOpenChange={(e) => setIsOpen(e)}>
      <PopoverTrigger asChild>{props.children}</PopoverTrigger>
      <PopoverContent className='rounded-[12px] max-sm:px-2'>
        <div className='flex w-full flex-col gap-4'>
          {props.metricType === MetricType.Dual &&
            props.chartName !== 'trend' ? (
            <Label className='flex flex-col gap-2'>
              Chart type
              <Select
                value={props.chartType}
                onValueChange={(e) => {
                  props.setChartType(e as 'stacked' | 'percent' | 'default');
                  setIsOpen(false);
                }}
              >
                <SelectTrigger className='h-11 border'>
                  <SelectValue placeholder='Select chart type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={'default'}>Default</SelectItem>
                    <SelectItem value={'stacked'}>Stacked</SelectItem>
                    <SelectItem value={'percent'}>Percentage</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Label>
          ) : (
            <></>
          )}
          {(props.metricType === MetricType.Dual &&
            props.chartName !== 'trend') ||
            (props.chartName === 'trend' && props.splitTrendChecked) ? (
            <Label className='flex flex-col gap-2'>
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
                <SelectTrigger className='h-11 border'>
                  <SelectValue placeholder='Select chart color' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='default'>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='flex gap-1'>
                          <div className='size-2 rounded-full bg-green-500' />
                          <div className='size-2 rounded-full bg-red-500' />
                        </div>
                        Default
                      </div>
                    </SelectItem>

                    <SelectItem value='cool'>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='flex gap-1'>
                          <div className='size-2 rounded-full bg-cyan-500' />
                          <div className='size-2 rounded-full bg-violet-500' />
                        </div>
                        Cool
                      </div>
                    </SelectItem>

                    <SelectItem value='warm'>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='flex gap-1'>
                          <div className='size-2 rounded-full bg-amber-400' />
                          <div className='size-2 rounded-full bg-red-500' />
                        </div>
                        Warm
                      </div>
                    </SelectItem>

                    <SelectItem value='contrast'>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='flex gap-1'>
                          <div className='size-2 rounded-full bg-lime-500' />
                          <div className='size-2 rounded-full bg-black' />
                        </div>
                        Contrast
                      </div>
                    </SelectItem>

                    <SelectItem value='soft'>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='flex gap-1'>
                          <div className='size-2 rounded-full bg-pink-400' />
                          <div className='size-2 rounded-full bg-gray-500' />
                        </div>
                        Soft
                      </div>
                    </SelectItem>

                    <SelectItem value='vibrant'>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='flex gap-1'>
                          <div className='size-2 rounded-full bg-fuchsia-400' />
                          <div className='size-2 rounded-full bg-blue-500' />
                        </div>
                        Vibrant
                      </div>
                    </SelectItem>

                    <SelectItem value='neutral'>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='flex gap-1'>
                          <div className='size-2 rounded-full bg-gray-500' />
                          <div className='size-2 rounded-full bg-black' />
                        </div>
                        Neutral
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Label>
          ) : (
            <Label className='flex flex-col gap-2'>
              Chart color
              <Select
                value={props.chartColor}
                onValueChange={(e) => {
                  props.setChartColor(e as keyof ChartColors);
                  setIsOpen(false);
                }}
              >
                <SelectTrigger className='h-11 border'>
                  <SelectValue placeholder='Select chart color' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={'blue'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-blue-500' />
                        Default
                      </div>
                    </SelectItem>
                    <SelectItem value={'red'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-red-500' />
                        Red
                      </div>
                    </SelectItem>
                    <SelectItem value={'green'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-green-400' />
                        Green
                      </div>
                    </SelectItem>
                    <SelectItem value={'pink'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-pink-400' />
                        Pink
                      </div>
                    </SelectItem>
                    <SelectItem value={'amber'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-amber-400' />
                        Amber
                      </div>
                    </SelectItem>
                    <SelectItem value={'fuchsia'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-fuchsia-400' />
                        Fuchsia
                      </div>
                    </SelectItem>
                    <SelectItem value={'gray'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-zinc-400' />
                        Gray
                      </div>
                    </SelectItem>
                    <SelectItem value={'black'}>
                      <div className='flex flex-row items-center gap-2'>
                        <div className='size-2 rounded-full bg-black' />
                        Black
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Label>
          )}
          {props.chartName === 'trend' &&
            props.metricType === MetricType.Dual ? (
            <Label className='flex flex-row items-center justify-between gap-4'>
              <div className='flex flex-col gap-1'>
                Split trend lines
                <div className='text-xs font-normal text-secondary'>
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
          {
            Object.keys(props.filters).length > 0 ?
              <Label className='flex flex-row items-center justify-between gap-4'>
                <div className='flex flex-col gap-1'>
                  Activate filters
                  <div className='text-xs font-normal text-secondary'>
                    Change the value of the chart depending on filters
                  </div>
                </div>
                <Switch
                  checked={props.filtersChecked}
                  onCheckedChange={(e) => {
                    props.setFiltersChecked(e);
                    if (e === true) {
                      props.setActiveFilterCategory(Object.keys(props.filters)[0]);
                    }
                  }}
                />
              </Label>

              :
              <></>
          }
          {props.filtersChecked ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  className='w-full min-w-full justify-between rounded-[12px]'
                >
                  {Object.keys(props.filters).length > 0
                    ? props.activeFilterCategory
                    : 'Select filter...'}
                  <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[240px] overflow-hidden rounded-[12px] border p-0 shadow-md'>
                <Command>
                  <CommandInput placeholder='Search filters...' />
                  <CommandList>
                    <CommandEmpty>No filter found.</CommandEmpty>
                    <CommandGroup>
                      {Object.keys(props.filters).map(
                        (filterCategory: string, i: number) => {
                          return (
                            <CommandItem
                              key={i}
                              className='truncate rounded-[10px]'
                              onSelect={(value) => {
                                props.setActiveFilterCategory(value);
                              }}
                            >
                              {props.activeFilterCategory === filterCategory ? (
                                <Check
                                  className={cn('mr-2 size-4 stroke-[3px]')}
                                />
                              ) : (
                                <></>
                              )}
                              <div className='w-full truncate'>
                                {filterCategory}
                              </div>
                            </CommandItem>
                          );
                        },
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          ) : (
            <></>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function OffsetBtns(props: {
  onLeft: () => void;
  onRight: () => void;
  isLoadingLeft?: boolean | false;
  isLoadingRight?: boolean | false;
  isDisabledLeft?: boolean | false;
  isDisabledRight?: boolean | false;
}) {
  return (
    <div className='flex gap-2'>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            className='h-[34px] rounded-[10px] !bg-background !text-primary hover:opacity-50'
            size={'icon'}
            onClick={props.onLeft}
            disabled={props.isDisabledLeft}
          >
            {props.isLoadingLeft ? (
              <Loader className='size-4 animate-spin' />
            ) : (
              <ArrowLeft className='size-4' />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side='bottom'
          sideOffset={5}
          className='rounded-[6px] border bg-accent !p-0.5 !px-1 text-xs font-medium text-primary'
        >
          Offset left
        </TooltipContent>
      </Tooltip>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            className='h-[34px] rounded-[10px] !bg-background !text-primary hover:opacity-50'
            size={'icon'}
            onClick={props.onRight}
            disabled={props.isDisabledRight}
          >
            {props.isLoadingRight ? (
              <Loader className='size-4 animate-spin' />
            ) : (
              <ArrowRight className='size-4' />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side='bottom'
          sideOffset={5}
          className='rounded-[6px] border bg-accent !p-0.5 !px-1 text-xs font-medium text-primary'
        >
          Offset right
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function RangeSelector(props: {
  range: number;
  setRange: Dispatch<SetStateAction<number>>;
}) {
  const { user } = useContext(UserContext);
  return (
    <ToggleGroup
      type='single'
      defaultValue='0'
      size={'sm'}
      className='h-[34px] w-fit gap-1 rounded-[10px] bg-background !p-1'
      onValueChange={(e) => {
        const value = parseInt(e);
        if (value !== props.range) {
          props.setRange(value);
        }
      }}
      value={props.range.toString()}
    >
      <ToggleGroupItem
        value={'1'}
        className='h-[28px] rounded-[8px] data-[state=on]:pointer-events-none'
      >
        D
      </ToggleGroupItem>
      <ToggleGroupItem
        value='7'
        className='h-[28px] rounded-[8px] data-[state=on]:pointer-events-none'
      >
        7D
      </ToggleGroupItem>
      <ToggleGroupItem
        value='15'
        className='h-[28px] rounded-[8px] data-[state=on]:pointer-events-none'
      >
        15D
      </ToggleGroupItem>
      <ToggleGroupItem
        value='30'
        className='h-[28px] rounded-[8px] data-[state=on]:pointer-events-none'
      >
        30D
      </ToggleGroupItem>
      <div
        onClick={() => {
          if (user?.plan.identifier === 'starter') {
            toast.warning(
              'Your current plan allows viewing up to 30 days of data. Upgrade to unlock extended date ranges.',
            );
          }
        }}
      >
        <ToggleGroupItem
          value='365'
          disabled={user?.plan.identifier === 'starter' ? true : false}
          className='h-[28px] rounded-[8px] data-[state=on]:pointer-events-none'
        >
          12M
        </ToggleGroupItem>
      </div>
    </ToggleGroup>
  );
}

const customTooltip = ({ label, payload }: TooltipProps) => {
  if (!payload) return null;
  return (
    <>
      <div className='w-full rounded-md border border-gray-500/10 bg-black px-4 py-1.5 text-sm shadow-md dark:border-gray-400/20 dark:bg-gray-900'>
        <p className='flex w-full items-center justify-between gap-10'>
          <span className='text-gray-50 dark:text-gray-50'> Date </span>
          <span className='font-medium text-gray-50 dark:text-gray-50'>
            {payload.length > 0 ? payload[0].payload.tooltiplabel : label}
          </span>
        </p>
      </div>
      <div className='mt-1 w-full space-y-2 rounded-md border border-gray-500/10 bg-white px-4 py-2 text-sm shadow-md dark:border-gray-400/20 dark:bg-gray-900'>
        {payload.map((item, i) => {
          return (
            <div className='flex w-full justify-between gap-10' key={i}>
              <span className='flex items-center gap-2 capitalize text-gray-700 dark:text-gray-300'>
                <div
                  className='size-1.5 rounded-full'
                  style={{ backgroundColor: item.color }}
                />

                {item.category.charAt(0).toUpperCase() +
                  item.category.slice(1).toLowerCase()}
              </span>
              <div className='flex items-center space-x-1'>
                <span className='font-medium capitalize text-gray-900 dark:text-gray-50'>
                  {valueFormatter(item.value)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
