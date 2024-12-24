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
import { AppsContext, UserContext } from '@/dash-context';
import { Metric, MetricType } from '@/types';
import {
  combineTrends,
  fetchDailySummary,
  INTERVAL,
  loadChartData,
} from '@/utils';
import { Dialog } from '@radix-ui/react-dialog';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
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
  const { applications, activeApp } = useContext(AppsContext);
  const { user } = useContext(UserContext);
  const metricName = decodeURIComponent(useParams().metric as string);
  const [open, setOpen] = useState(false);
  const [metric, setMetric] = useState(() => {
    if (applications[activeApp]) {
      const index = applications[activeApp].metrics?.findIndex(
        (g) => g.name === metricName,
      );
      if (index !== undefined && index !== -1) {
        const metricData = applications[activeApp].metrics?.[index];

        if (index > user.plan.metric_per_app_limit - 1) {
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
    const { pos, neg } = await fetchDailySummary(metric.appid, metric.id);
    setPosDaily(pos);
    setNegDaily(neg);
  };

  useEffect(() => {
    const metricData = applications[activeApp].metrics?.filter(
      (g) => g.name === metricName,
    )[0];
    if (metricData === null || metricData === undefined) {
      router.push('/dashboard/metrics');
    } else {
      setMetric(metricData);
    }
  }, [activeApp, applications]);

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
              <div className='text-lg font-normal capitalize text-muted-foreground'>
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
                  toast.success('Succefully copied Metric ID');
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
                  metric={metric!}
                  setOpen={setOpen}
                  onUpdate={(new_name: string) => {
                    setMetric(Object.assign({}, metric, { name: new_name }));
                  }}
                />
              </Dialog>
            </div>
          </div>
          <OverviewChart metric={metric!} />
          <TrendChart metric={metric!} />
        </div>
      </TooltipProvider>
    </DashboardContentContainer>
  );
}

function OverviewChart(props: { metric: Metric }) {
  const [overviewChartType, setOverviewChartType] = useState<
    'stacked' | 'percent' | 'default'
  >('default');
  const [overviewChartColor, setOverviewChartColor] =
    useState<keyof ChartColors>('blue');
  const [dualMetricOverviewChartColor, setDualMetricOverviewChartColor] =
    useState<keyof DualMetricChartColors>('default');
  const dualMetricChartConfig = {
    colors: getDualMetricChartColors(
      dualMetricChartColors,
      dualMetricOverviewChartColor,
    ),
  };
  const [range, setRange] = useState<number>(0);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [chartData, setChartData] = useState<any[] | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingRight, setLoadingRight] = useState(false);
  const [loadingLeft, setLoadingLeft] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());

  const rangeSummary = useMemo(() => {
    if (chartData === null) return 0;
    let total = 0;

    for (let i = 0; i < chartData.length; i++) {
      if (props.metric.type === MetricType.Base) {
        total += chartData[i][props.metric.name] ?? 0;
      } else {
        total =
          total +
          ((chartData[i][props.metric.namepos] ?? 0) -
            (chartData[i][props.metric.nameneg] ?? 0));
      }
    }
    return total;
  }, [chartData]);

  const loadChart = async (from: Date) => {
    const data = await loadChartData(
      from,
      range === 0 ? 0 : range + 1,
      props.metric,
      props.metric.appid,
    );
    setChartData(data ?? []);
    setLoading(false);
    setLoadingLeft(false);
    setLoadingRight(false);
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
        to.setDate(date.from.getDate() - range);
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
  }, [date?.from, range, year]);

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
            chartName='overview'
            metricId={props.metric.id}
            metricType={props.metric.type}
            chartType={overviewChartType}
            chartColor={overviewChartColor}
            dualMetricChartColor={dualMetricOverviewChartColor}
            setChartColor={setOverviewChartColor}
            setChartType={setOverviewChartType}
            setDualMetricChartColor={
              props.metric.type === MetricType.Base
                ? undefined
                : setDualMetricOverviewChartColor
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
                const toRemove = range === 0 ? 1 : range;
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
                const toAdd = range === 0 ? 1 : range;
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
                const toAdd = range === 0 ? 1 : range;
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
                const toAdd = range === 0 ? 1 : range;
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
            {rangeSummary > 0 ? '+' : ''}
            {valueFormatter(rangeSummary)}
          </div>
          <Separator className='my-4' />
          <BarChart
            className='min-h-[40vh] w-full'
            data={chartData}
            customTooltip={customTooltip}
            index='date'
            type={overviewChartType}
            colors={
              props.metric.type === MetricType.Dual
                ? dualMetricChartConfig.colors
                : [overviewChartColor]
            }
            categories={
              props.metric.type === MetricType.Base
                ? [props.metric.name]
                : [props.metric.namepos, props.metric.nameneg]
            }
            valueFormatter={(number: number) =>
              `${Intl.NumberFormat('us').format(number).toString()}`
            }
            yAxisLabel='Total'
          />
        </div>
      )}
    </>
  );
}

function TrendChart(props: { metric: Metric }) {
  const [trendChartType, setTrendChartType] = useState<
    'default' | 'percent' | 'stacked'
  >('default');
  const [trendChartColor, setTrendChartColor] =
    useState<keyof ChartColors>('blue');
  const [dualTrendChartColor, setDualTrendChartColor] =
    useState<keyof DualMetricChartColors>('default');
  const dualTrendChartConfig = {
    colors: getDualMetricChartColors(
      dualMetricChartColors,
      dualTrendChartColor,
    ),
  };

  const [range, setRange] = useState<number>(0);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [chartData, setChartData] = useState<any[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingRight, setLoadingRight] = useState(false);
  const [loadingLeft, setLoadingLeft] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [splitTrend, setSplitTrend] = useState(false);

  const loadChart = async (from: Date) => {
    const data =
      (await loadChartData(
        from,
        range === 0 ? 0 : range + 1,
        props.metric,
        props.metric.appid,
      )) ?? [];
    let totalValue = null;
    for (let i = data.length - 1; i > 0; i--) {
      if (data[i]['Positive Trend'] !== undefined && data[i]['Negative Trend']) {
        totalValue = data[i]['Positive Trend'] - data[i]['Negative Trend'];
        break;
      }
    }
    setTotal(totalValue ?? 0);
    setChartData(data ?? []);
    setLoading(false);
    setLoadingLeft(false);
    setLoadingRight(false);
  };
  console.log(chartData)
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
        to.setDate(date.from.getDate() - range);
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
  }, [date?.from, range, year]);

  return (
    <>
      <CardHeader className='mt-10 p-0'>
        <CardTitle>Trend</CardTitle>
        <CardDescription>
          See data shifts and trends at a glance.
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
            chartName='trend'
            metricId={props.metric.id}
            metricType={props.metric.type}
            chartType={trendChartType}
            chartColor={trendChartColor}
            checked={splitTrend}
            setChartColor={setTrendChartColor}
            setChartType={setTrendChartType}
            setChecked={setSplitTrend}
            dualMetricChartColor={dualTrendChartColor}
            setDualMetricChartColor={
              splitTrend ? setDualTrendChartColor : undefined
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
                const toRemove = range === 0 ? 1 : range;
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
                const toAdd = range === 0 ? 1 : range;
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
                const toAdd = range === 0 ? 1 : range;
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
                const toAdd = range === 0 ? 1 : range;
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
            {' '}
            {range === 365 ? `Total of ${year}` : 'Total'}
          </div>
          <div className='text-xl font-medium'>{valueFormatter(total)}</div>
          <Separator className='my-4' />

          {splitTrend ? (
            <AreaChart
              className='min-h-[40vh] w-full'
              data={chartData}
              index='date'
              customTooltip={customTooltip}
              colors={dualTrendChartConfig.colors}
              categories={['Positive Trend', 'Negative Trend']}
              valueFormatter={(number: number) => valueFormatter(number)}
              yAxisLabel='Total'
            />
          ) : (
            <AreaChart
              className='min-h-[40vh] w-full'
              data={combineTrends(chartData)}
              index='date'
              customTooltip={customTooltip}
              colors={[trendChartColor]}
              categories={['total']}
              valueFormatter={(number: number) => valueFormatter(number)}
              yAxisLabel='Total'
            />
          )}
        </div>
      )}
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
  dualMetricChartColor?: string;
  checked?: boolean;
  setChartType: Dispatch<SetStateAction<'stacked' | 'percent' | 'default'>>;
  setChartColor: Dispatch<SetStateAction<keyof ChartColors>>;
  setDualMetricChartColor?: Dispatch<
    SetStateAction<keyof DualMetricChartColors>
  >;
  setChecked?: Dispatch<SetStateAction<boolean>>;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('chartsettings') ?? '{}');
    let name = props.metricId + props.chartName;
    if (props.chartName === 'trend' && props.checked) {
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
  }, [props.checked]);

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('chartsettings') ?? '{}');
    let name = props.metricId + props.chartName;
    if (props.chartName === 'trend' && props.checked) {
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
    props.checked,
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
            (props.chartName === 'trend' && props.checked) ? (
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
          {props.chartName === 'trend' ? (
            <Label className='flex flex-row items-center justify-between gap-4'>
              <div className='flex flex-col gap-1'>
                Split trend lines
                <div className='text-xs font-normal text-secondary'>
                  Divide trend into separate positive and negative values
                </div>
              </div>
              <Switch
                checked={props.checked}
                onCheckedChange={(e) => {
                  if (props.setChecked) {
                    props.setChecked(e);
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
        value={'0'}
        className='h-[28px] rounded-[8px] data-[state=on]:pointer-events-none'
      >
        D
      </ToggleGroupItem>
      <ToggleGroupItem
        value='6'
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
            toast.warning('Upgrade plan to access the year view');
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
            {label}
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
