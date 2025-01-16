'use client';
import DashboardContentContainer from '@/components/dashboard/container';
import { MetricDatePicker } from '@/components/dashboard/date-picker';
import EditMetricDialogContent from '@/components/dashboard/edit-metric-dialog-content';
import { AreaChart } from '@/components/ui/area-chart';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import customTooltip from '@/components/ui/custom-tooltip';
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
import { Metric, MetricType, UserRole } from '@/types';
import {
  calculateTrend,
  fetchNextEvent,
  INTERVAL,
  fetchChartData,
  fetchEventVariation,
} from '@/utils';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpCircle,
  Calendar,
  ChevronsUpDown,
  CircleOff,
  Copy,
  Edit,
  ListFilter,
  Loader,
  Sliders,
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import {
  cloneElement,
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

import FilterManagerDialog from './filter-manager';

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
  const [filterManagerOpen, setFilterManagerOpen] = useState(false);
  const [pushValueOpen, setPushValueOpen] = useState(false);
  const [pushValue, setPushValue] = useState<number | string>(0);
  const metric = useMemo(() => {
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
          if (metricData !== null && metricData !== undefined) {
            return metricData;
          }
        }
      }
    }
    router.push('/dashboard/metrics');
    return null;
  }, [activeProject, projects]);

  const [posDaily, setPosDaily] = useState<number>(0);
  const [negDaily, setNegDaily] = useState<number>(0);
  const [average, setAverage] = useState<number>(0);

  const loadDailyValues = async (metric: Metric) => {
    const variation = await fetchEventVariation(metric.projectid, metric.id);

    if (metric.type === MetricType.Average) {
      if (variation.results == 0) {
        variation.relativeeventcount = metric.eventcount;
        variation.relativetotalpos = metric.totalpos;
        variation.relativetotalneg = metric.totalneg;
      }

      if (variation.relativeeventcount === 0) {
        setAverage(0);
      } else {
        setAverage(
          (variation.relativetotalpos - variation.relativetotalneg) /
            variation.relativeeventcount,
        );
      }

      if (variation.averagepercentdiff >= 0) {
        setPosDaily(variation.averagepercentdiff);
      } else {
        setNegDaily(-variation.averagepercentdiff);
      }
    } else {
      setPosDaily(variation.pos);
      setNegDaily(variation.neg);
    }

    if (
      (metric.totalpos !== variation.relativetotalpos ||
        metric.totalneg !== variation.relativetotalneg ||
        metric.eventcount !== variation.relativeeventcount) &&
      variation.results !== 0
    ) {
      setProjects(
        projects.map((v) =>
          v.id === metric.projectid
            ? Object.assign({}, v, {
                metrics: v.metrics?.map((m) =>
                  m.id === metric.id
                    ? Object.assign({}, m, {
                        totalpos: variation.relativetotalpos,
                        totalneg: variation.relativetotalneg,
                        eventcount: variation.relativeeventcount,
                      })
                    : m,
                ),
              })
            : v,
        ),
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

  useEffect(() => {
    const index = projects[activeProject].metrics?.findIndex(
      (g) => g.name === metricName,
    );
    if (index === -1) {
      router.push('/dashboard/metrics');
    }
  }, [activeProject]);

  const cardStyle = (color: string) => ({
    borderColor: `${color}1A`,
    backgroundColor: `${color}0D`,
    color,
  });

  const handlePushValue = () => {
    if (
      pushValue !== null &&
      metric &&
      Number(pushValue) &&
      projects[activeProject].userrole !== UserRole.Guest
    ) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/event/v1/${metric.name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${projects[activeProject].apikey}`,
        },
        body: JSON.stringify({
          value: pushValue,
        }),
      }).then((resp) => {
        if (resp.ok) {
          toast.success('Successfully created new event');
        } else {
          resp.text().then((text) => {
            toast.error(text);
          });
        }
      });
      setPushValueOpen(false);
    } else {
      toast.error('Please enter a valid value');
    }
  };

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
      <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
        <EditMetricDialogContent
          metric={metric}
          setOpen={setOpen}
          onUpdate={(new_name: string) => {
            setProjects(
              projects.map((proj) =>
                proj.id === metric?.id
                  ? Object.assign({}, proj, {
                      metrics: proj.metrics?.map((m) =>
                        m.id === metric.id
                          ? Object.assign({}, m, {
                              name: new_name,
                            })
                          : m,
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
      <Dialog open={pushValueOpen} onOpenChange={setPushValueOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Push Value</DialogTitle>
            <DialogDescription>
              Enter the value you want to push to the metric.
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-col gap-2'>
            <Label>Value</Label>
            <Input
              type='number'
              min={0}
              max={1000000000}
              value={pushValue === 0 && !Number(pushValue) ? '' : pushValue}
              onChange={(e) =>
                setPushValue(
                  e.target.value === '' ? '' : Number(e.target.value),
                )
              }
              placeholder='Enter value...'
              className='h-11 rounded-[12px]'
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button className='w-fit rounded-[12px]' variant='secondary'>
                Cancel
              </Button>
            </DialogClose>
            <Button
              disabled={
                Number(pushValue) < 1000000000 && Number(pushValue)
                  ? false
                  : true
              }
              className='w-fit rounded-[12px]'
              onClick={handlePushValue}
            >
              Push
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Card className='mt-5 rounded-[12px] border-none bg-accent'>
        <CardHeader>
          <CardTitle className='text-2xl'>Quick Actions</CardTitle>
          <CardDescription>
            Quickly manage your metrics with easy-to-access actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-4 gap-5 rounded-[12px] bg-background p-2 max-lg:grid-cols-2 max-md:grid-cols-1'>
            {[
              {
                label: 'Filter Manager',
                action: 'Manage, create and edit the filters of this metric.',
                icon: <ListFilter className='size-8' />,
                color: '#3B82F6', // Blue
                onClick: () => setFilterManagerOpen(true),
              },
              {
                label: 'Push Value',
                action: 'Manually push a new event to the metric.',
                icon: <ArrowUpCircle className='size-8' />,
                color: '#10B981', // Green
                onClick: () => setPushValueOpen(true),
              },
              {
                label: 'Edit Metric',
                action: 'Edit the name of the metric.',
                icon: <Edit className='size-8' />,
                color: '#F59E0B', // Yellow
                onClick: () => {
                  setOpen(true);
                },
              },
              {
                label: 'Copy Metric ID',
                action: 'Copy the unique ID of this metric for use in the API.',
                icon: <Copy className='size-8' />,
                color: '#A855F7', // Purple
                onClick: () => {
                  navigator.clipboard.writeText(metric ? metric.id : '');
                  toast.success('Succefully copied metric ID');
                },
              },
            ].map(({ label, action, icon, color, onClick }, i) => {
              const styles = cardStyle(color);
              return (
                <div
                  key={i}
                  onClick={onClick}
                  style={{
                    borderColor: styles.borderColor,
                    backgroundColor: styles.backgroundColor,
                  }}
                  className={`group flex cursor-pointer select-none overflow-hidden rounded-[10px] border p-1 transition-all duration-150 active:scale-[.98]`}
                >
                  <div
                    style={{ backgroundColor: `${color}0F` }}
                    className='my-auto flex aspect-square h-full items-center justify-center rounded-[10px] p-4 max-xl:hidden max-lg:flex'
                  >
                    {cloneElement(icon, { style: { color: styles.color } })}
                  </div>
                  <div className='ml-5 flex flex-col gap-1 py-2 pr-1.5 max-xl:ml-0 max-xl:px-3 max-md:ml-5 max-md:px-0 max-md:pr-1.5'>
                    <div
                      style={{ color: styles.color }}
                      className='flex items-center gap-2 font-mono text-sm font-bold transition-all duration-200 group-hover:gap-3'
                    >
                      {label}
                      <ArrowRight
                        style={{ color: styles.color }}
                        className='size-4 transition-all duration-200'
                      />
                    </div>
                    <div className='text-xs' style={{ color: styles.color }}>
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
        <div className='mt-5 flex h-full flex-col'>
          <div className='flex flex-row items-end justify-between max-sm:flex-col max-sm:items-start max-sm:gap-5'>
            <div className='flex flex-col gap-1 text-4xl font-semibold'>
              <div className='text-lg font-normal text-muted-foreground'>
                {metric?.name ?? 'Unknown'}
              </div>
              <div className='flex flex-row items-center gap-4 max-sm:flex-col max-sm:items-start'>
                {metric?.type === MetricType.Average ? (
                  <>{valueFormatter(average)}</>
                ) : (
                  <>
                    {valueFormatter(
                      (metric?.totalpos ?? 0) - (metric?.totalneg ?? 0),
                    )}
                  </>
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
                        {metric?.type === MetricType.Average ? (
                          <>
                            {posDaily - negDaily >= 0 ? '+' : '-'}
                            {valueFormatter(posDaily - negDaily)}%
                          </>
                        ) : (
                          <>+{valueFormatter(posDaily)}</>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <Separator className='mb-8 mt-5' />
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
  const [activeFilter, setActiveFilter] = useState<Metric | null>(null);
  const [splitTrendChecked, setSplitTrendChecked] = useState(false);
  const [rangeSummary, setRangeSummary] = useState<{
    pos: number;
    neg: number;
    average: number;
    averagepercentdiff: number;
  }>({ pos: 0, neg: 0, average: 0, averagepercentdiff: 0 });

  const loadChart = async (from: Date) => {
    if (!props.metric) return;
    let data = [];

    if (activeFilter !== null) {
      data = await fetchChartData(
        from,
        range,
        activeFilter,
        activeFilter.projectid,
        props.type,
      );

      const { pos, neg, average, averagepercentdiff } = await loadRangeSummary(
        data,
        activeFilter,
      );
      setRangeSummary({ pos, neg, average, averagepercentdiff });
      if (props.type === 'trend') {
        data = calculateTrend(data, activeFilter, pos, neg, average);
      }
    } else {
      data = await fetchChartData(
        from,
        range,
        props.metric,
        props.metric.projectid,
        props.type,
      );

      const { pos, neg, average, averagepercentdiff } = await loadRangeSummary(
        data,
        props.metric,
      );
      setRangeSummary({ pos, neg, average, averagepercentdiff });
      if (props.type === 'trend') {
        data = calculateTrend(data, props.metric, pos, neg, average);
      }
    }

    setChartData(data);
    setLoading(false);
    setLoadingLeft(false);
    setLoadingRight(false);
  };

  const loadRangeSummary = async (
    data: any[],
    metric: Metric,
  ): Promise<{
    pos: number;
    neg: number;
    average: number;
    averagepercentdiff: number;
  }> => {
    if (props.type === 'trend') {
      let pos = 0;
      let neg = 0;
      let average = 0;
      let found = false;
      for (let i = data.length - 1; i >= 0; i--) {
        if (
          data[i]['Positive Trend'] !== undefined &&
          data[i]['Negative Trend'] !== undefined &&
          data[i]['Average Trend']
        ) {
          found = true;
          pos = data[i]['Positive Trend'];
          neg = data[i]['Negative Trend'];
          average = data[i]['Average Trend'];
          break;
        }
      }

      if (!found) {
        if (date?.from === undefined)
          return { pos: 0, neg: 0, average: 0, averagepercentdiff: 0 };
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
            average:
              metric.eventcount === 0
                ? 0
                : (metric.totalpos - metric.totalneg) / metric.eventcount,
            averagepercentdiff: 0,
          };
        }

        const {
          relativetotalpos,
          relativetotalneg,
          relativeeventcount,
          pos,
          neg,
          eventcount,
          results,
        } = await fetchNextEvent(metric.projectid, metric.id, end);

        if (results === 0) {
          return {
            pos: metric.totalpos,
            neg: metric.totalneg,
            average:
              metric.eventcount === 0
                ? 0
                : (metric.totalpos - metric.totalneg) / metric.eventcount,
            averagepercentdiff: 0,
          };
        } else {
          const previousEventCount = relativeeventcount - eventcount;
          return {
            pos: relativetotalpos - pos,
            neg: relativetotalneg - neg,
            average:
              previousEventCount === 0
                ? 0
                : (relativetotalpos - pos - (relativetotalneg - neg)) /
                  previousEventCount,
            averagepercentdiff: 0,
          };
        }
      }

      return { pos, neg, average, averagepercentdiff: 0 };
    } else {
      let totalpos = 0;
      let totalneg = 0;
      let eventcount = 0;
      let averagepercentdiff = 0;

      for (let i = 0; i < data.length; i++) {
        if (metric.type === MetricType.Base) {
          totalpos += data[i][metric.name] ?? 0;
        } else if (metric.type === MetricType.Dual) {
          totalpos += data[i][metric.namepos ?? ''] ?? 0;
          totalneg += data[i][metric.nameneg ?? ''] ?? 0;
        } else if (metric.type === MetricType.Average) {
          totalpos += data[i]['+'] ?? 0;
          totalneg += data[i]['-'] ?? 0;
        }

        eventcount += data[i]['Event Count'] ?? 0;
      }

      if (metric.type === MetricType.Average) {
        let latestDatapoint = undefined;
        for (let i = data.length - 1; i >= 0; i--) {
          if (
            data[i]['Positive Trend'] !== undefined &&
            data[i]['Negative Trend'] !== undefined
          ) {
            latestDatapoint = data[i];
            break;
          }
        }

        if (latestDatapoint !== undefined) {
          let lastAverage =
            (latestDatapoint['Positive Trend'] -
              latestDatapoint['Negative Trend']) /
            latestDatapoint['Event Trend'];
          if (latestDatapoint['Event Trend'] === 0) lastAverage = 0;

          let firstAverage =
            (latestDatapoint['Positive Trend'] -
              totalpos -
              (latestDatapoint['Negative Trend'] - totalneg)) /
            (latestDatapoint['Event Trend'] - eventcount);
          if (latestDatapoint['Event Trend'] - eventcount === 0)
            firstAverage = 0;

          const diff = lastAverage - firstAverage;

          if (diff !== 0 && firstAverage === 0) {
            if (diff < 0) {
              averagepercentdiff = -100;
            } else {
              averagepercentdiff = 100;
            }
          } else if (firstAverage !== 0) {
            averagepercentdiff = (diff / firstAverage) * 100;
          }
        }
      }

      return {
        pos: totalpos,
        neg: totalneg,
        average: 0,
        averagepercentdiff: averagepercentdiff,
      };
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
  }, [date?.from, range, year, activeFilter, props.metric]);
  return (
    <>
      <CardHeader className='p-0'>
        <CardTitle>
          {props.type === 'overview' ? 'Overview' : 'Trend'}
        </CardTitle>
        <CardDescription>
          {props.type === 'overview'
            ? 'Chart displaying an overview of this metric.'
            : 'Chart displaying the trend of this metric'}
        </CardDescription>
      </CardHeader>
      <div className='mb-5 overflow-x-auto'>
        <div className='mt-5 flex w-fit flex-row items-center gap-2 rounded-[12px] bg-accent p-1'>
          <div className='flex gap-2'>
            <RangeSelector range={range} setRange={setRange} />
            <Tooltip delayDuration={300}>
              <Popover>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      className='h-[34px] rounded-[10px] !bg-background !text-primary hover:opacity-50'
                      size={'icon'}
                    >
                      <Calendar className='size-4' />
                    </Button>
                  </TooltipTrigger>
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
              <TooltipContent
                side='bottom'
                sideOffset={5}
                className='rounded-[6px] border bg-accent !p-0.5 !px-1 text-xs font-medium text-primary'
              >
                Starting point
              </TooltipContent>
            </Tooltip>
          </div>
          <div className='flex h-full items-center gap-2 max-sm:w-full max-sm:justify-between'>
            <Tooltip delayDuration={300}>
              <AdvancedOptions
                chartName={props.type}
                metricId={props.metric?.id ?? ''}
                metricType={props.metric?.type ?? MetricType.Base}
                splitTrendChecked={splitTrendChecked}
                setSplitTrendChecked={setSplitTrendChecked}
                filters={props.metric?.filters ?? {}}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
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
                <TooltipTrigger asChild>
                  <Button
                    size={'icon'}
                    className='h-[34px] rounded-[10px] !bg-background !text-primary hover:opacity-50'
                  >
                    <Sliders className='size-4' />
                  </Button>
                </TooltipTrigger>
              </AdvancedOptions>
              <TooltipContent
                side='bottom'
                sideOffset={5}
                className='rounded-[6px] border bg-accent !p-0.5 !px-1 text-xs font-medium text-primary'
              >
                Advanced options
              </TooltipContent>
            </Tooltip>

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
          <Skeleton className='mt-2 h-[calc(40vh+125px)] w-full min-w-[600px] rounded-lg bg-accent' />
        ) : (
          <div className='mt-2 w-full min-w-[600px] rounded-lg bg-accent p-5'>
            <div className='flex w-full items-center justify-between gap-5'>
              <div className='flex flex-col'>
                <div className='text-md text-secondary'>
                  {range === 365 ? `Summary of ${year}` : 'Summary'}
                </div>
                <div className='text-xl font-medium'>
                  {props.metric?.type === MetricType.Average ? (
                    <>
                      {rangeSummary.averagepercentdiff > 0 &&
                      props.type === 'overview'
                        ? '+'
                        : ''}
                      {props.type === 'overview' ? (
                        <>{valueFormatter(rangeSummary.averagepercentdiff)}%</>
                      ) : (
                        <>{valueFormatter(rangeSummary.average)}</>
                      )}
                    </>
                  ) : (
                    <>
                      {rangeSummary.pos - rangeSummary.neg > 0 &&
                      props.type === 'overview'
                        ? '+'
                        : ''}
                      {valueFormatter(rangeSummary.pos - rangeSummary.neg)}
                    </>
                  )}
                </div>
              </div>
              <Filters
                metric={props.metric}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                range={range}
                start={date?.to ?? new Date()}
              />
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
                    ? ['Positive Trend', 'Negative Trend']
                    : activeFilter !== null
                      ? [activeFilter.name ?? '']
                      : [props.metric?.name ?? '']
                }
                valueFormatter={(number: number) => valueFormatter(number)}
                yAxisLabel='Total'
                onValueChange={() => {}}
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
                    props.metric?.type !== MetricType.Dual
                      ? [
                          activeFilter !== null
                            ? activeFilter.name
                            : (props.metric?.name ?? ''),
                        ]
                      : [
                          props.metric?.namepos ?? '',
                          props.metric?.nameneg ?? '',
                        ]
                  }
                  valueFormatter={(number: number) =>
                    `${Intl.NumberFormat('us').format(number).toString()}`
                  }
                  yAxisLabel='Total'
                  onValueChange={
                    props.metric?.type === MetricType.Dual
                      ? () => {}
                      : undefined
                  }
                />
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function Filters(props: {
  metric: Metric | null | undefined;
  activeFilter: Metric | null;
  setActiveFilter: Dispatch<SetStateAction<Metric | null>>;
  range: number;
  start: Date;
}) {
  const [filters, setFilters] = useState<{ [category: string]: any[] }>({});

  const updateFilters = async () => {
    const end = new Date(props.start);
    end.setDate(end.getDate() + (props.range - 1));
    const categories = Object.keys(props.metric?.filters ?? []);

    const finalFilters: { [category: string]: any[] } = {};

    await Promise.all(
      categories.map(async (category) => {
        const filters = props.metric?.filters[category] ?? [];
        const updatedFilters = await Promise.all(
          filters.map(async (filter: any) => {
            const { pos, neg } = await fetchEventVariation(
              filter.projectid,
              filter.id,
              props.start,
              end,
            );

            return {
              ...filter,
              summary: pos - neg,
            };
          }),
        );

        finalFilters[category] = updatedFilters.sort(
          (a, b) => b.summary - a.summary,
        );
      }),
    );

    setFilters(finalFilters);
  };

  useEffect(() => {
    updateFilters();
  }, [props.metric, props.range, props.start]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          className='w-[250px] justify-between rounded-[12px] border bg-background hover:bg-background/70'
        >
          {props.activeFilter !== null
            ? props.activeFilter.name.charAt(0).toUpperCase() +
              props.activeFilter.name.slice(1).toLowerCase()
            : 'Select a filter'}
          <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='mr-10 w-fit min-w-[340px] max-w-[500px] overflow-hidden rounded-[12px] border p-0 shadow-md'>
        <Command>
          <CommandInput placeholder='Search filters...' />
          <CommandList>
            <CommandEmpty className='flex w-full flex-col items-center justify-center py-5'>
              <div className='relative mb-2 grid size-12 place-items-center rounded-xl bg-background shadow-lg ring-1 ring-border transition duration-500'>
                <CircleOff className='h-6 w-6 text-muted-foreground' />
              </div>
              <h2 className='mt-3 max-w-[80%] text-center text-sm font-normal text-muted-foreground'>
                No filter to show at the moment
                <br />
                <a
                  href='/docs/features/filters'
                  className='cursor-pointer text-blue-500 underline'
                >
                  How to create one
                </a>
              </h2>
            </CommandEmpty>
            {props.metric?.filters ? (
              <CommandGroup>
                <CommandItem
                  className='truncate rounded-[10px]'
                  onSelect={() => props.setActiveFilter(null)}
                >
                  {!props.activeFilter ? (
                    <div
                      className={cn(
                        'mr-1.5 size-3 min-w-3 rounded-full border bg-black',
                      )}
                    />
                  ) : (
                    <div
                      className={cn(
                        'mr-1.5 size-3 min-w-3 rounded-full border bg-accent',
                      )}
                    />
                  )}
                  None
                </CommandItem>
              </CommandGroup>
            ) : null}

            {Object.keys(filters).map((filterCategory: string) => {
              return (
                <>
                  <CommandGroup
                    key={filterCategory}
                    heading={
                      filterCategory.charAt(0).toUpperCase() +
                      filterCategory.slice(1).toLowerCase()
                    }
                  >
                    {filters[filterCategory].map((filter) => {
                      return (
                        <CommandItem
                          key={filter.id}
                          className='truncate rounded-[10px]'
                          value={filter.name}
                          onSelect={(value) => {
                            if (props.activeFilter?.id === filter.id) {
                              props.setActiveFilter(null);
                            } else {
                              const metric = props.metric?.filters[
                                filterCategory
                              ].find((m) => m.name === value);
                              props.setActiveFilter(metric ?? null);
                            }
                          }}
                        >
                          {props.activeFilter?.id === filter.id ? (
                            <div
                              className={cn(
                                'mr-1.5 size-3 min-w-3 rounded-full border bg-black',
                              )}
                            />
                          ) : (
                            <div
                              className={cn(
                                'mr-1.5 size-3 min-w-3 rounded-full border bg-accent',
                              )}
                            />
                          )}
                          <div className='text-medium flex w-full gap-1 truncate capitalize'>
                            {filter.summary === 0 ? (
                              <div className='h-fit w-fit rounded-[6px] bg-zinc-500/10 px-2 py-0.5 font-mono text-xs text-zinc-500'>
                                0
                              </div>
                            ) : filter.summary > 0 ? (
                              <div className='h-fit w-fit rounded-[6px] bg-green-500/10 px-1 py-0.5 font-mono text-xs text-green-500'>
                                +{valueFormatter(filter.summary)}
                              </div>
                            ) : (
                              <div className='h-fit w-fit rounded-[6px] bg-red-500/10 px-1 py-0.5 font-mono text-xs text-red-500'>
                                -{valueFormatter(filter.summary)}
                              </div>
                            )}

                            <div className='w-full truncate'>{filter.name}</div>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
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
  activeFilter: Metric | null;
  setActiveFilter: Dispatch<SetStateAction<Metric | null>>;
  dualMetricChartColor?: string;
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
