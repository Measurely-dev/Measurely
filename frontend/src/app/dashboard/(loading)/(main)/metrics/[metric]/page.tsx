'use client';

import DashboardContentContainer from '@/components/dashboard/container';
import EditMetricDialogContent from '@/components/dashboard/edit-metric-dialog-content';
import { AreaChart } from '@/components/ui/area-chart';
import { BarChart } from '@/components/ui/bar-chart';
import { RangeValue } from '@react-types/shared';
import { CalendarDate } from '@internationalized/date';
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
import customTooltip from '@/components/ui/custom-tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ProjectsContext, UserContext } from '@/dash-context';
import { cn } from '@/lib/utils';
import {
  AllowedColors,
  ChartColors,
  DualMetricChartColors,
  Metric,
  MetricType,
  UserRole,
} from '@/types';
import {
  fetchNextEvent,
  INTERVAL,
  fetchChartData,
  fetchEventVariation,
  valueFormatter,
  calculateTrend,
} from '@/utils';
import { Dialog } from '@/components/ui/dialog';
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
  Sliders,
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import {
  cloneElement,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import FilterManagerDialog from './filter-manager';
import { PushValueDialog } from '../../push-value';
import { UnitCombobox } from '@/components/ui/unit-select';
import { RangeCalendar } from '@/components/ui/calendar-rac';
import { CalendarIcon } from '@radix-ui/react-icons';
import { DateInput, dateInputStyle } from '@/components/ui/datefield-rac';
import {
  DateRangePicker,
  Group,
  Popover as AriaPopover,
  Dialog as AriaDialog,
  Button as AriaButton,
  DateValue,
} from 'react-aria-components';
import Filters from './filters';
import AdvancedOptions from './advanced-options';
import { Separator } from '@/components/ui/separator';

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
    positive: 'fuchsia',
    negative: 'red',
  },
  contrast: {
    positive: 'lime',
    negative: 'gray',
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
    negative: 'gray',
  },
  pastel: {
    positive: 'rose',
    negative: 'teal',
  },
  sunset: {
    positive: 'orange',
    negative: 'violet',
  },
  ocean: {
    positive: 'emerald',
    negative: 'sky',
  },
  forest: {
    positive: 'green',
    negative: 'yellow',
  },
};

function getDualMetricChartColors(
  colorsConfig: DualMetricChartColors,
  theme: keyof DualMetricChartColors,
): AllowedColors[] {
  const selectedColors = colorsConfig[theme];
  return [selectedColors.positive, selectedColors.negative];
}

export default function DashboardMetricPage() {
  const router = useRouter();
  const { projects, activeProject, setProjects } = useContext(ProjectsContext);
  const { user } = useContext(UserContext);
  const metricName = decodeURIComponent(useParams().metric as string);
  const [open, setOpen] = useState(false);
  const [filterManagerOpen, setFilterManagerOpen] = useState(false);
  const [pushValueOpen, setPushValueOpen] = useState(false);

  const metric = useMemo(() => {
    if (projects[activeProject]) {
      const index = projects[activeProject].metrics?.findIndex(
        (g) => g.name === metricName,
      );
      if (index !== undefined && index !== -1) {
        const metricData = projects[activeProject].metrics?.[index];

        if (metricData !== null && metricData !== undefined) {
          return metricData;
        }
      }
    }
    router.push('/dashboard/metrics');
    return null;
  }, [activeProject, projects]);

  const [daily, setDaily] = useState<number>(0);
  const [average, setAverage] = useState<number>(0);

  const loadDailyValues = async (metric: Metric) => {
    if (metric === undefined) return;
    const variation = await fetchEventVariation(metric.project_id, metric.id);

    if (metric.type === MetricType.Average) {
      if (variation.results == 0) {
        variation.relative_event_count = metric.event_count;
        variation.relative_total_pos = metric.total_pos;
        variation.relative_total_neg = metric.total_neg;
      }

      if (variation.relative_event_count === 0) {
        setAverage(0);
      } else {
        setAverage(
          (variation.relative_total_pos - variation.relative_total_neg) /
            variation.relative_event_count,
        );
      }

      if (variation.averagepercentdiff >= 0) {
        setDaily(variation.averagepercentdiff);
      }
    } else {
      let dailyValue;
      const previousTotal =
        variation.relative_total_pos -
        variation.relative_total_neg -
        (variation.pos - variation.neg);
      const variationValue = variation.pos - variation.neg;
      if (variationValue === 0) dailyValue = 0;
      else if (previousTotal === 0)
        dailyValue = variationValue < 0 ? -100 : 100;
      else dailyValue = (variationValue / previousTotal) * 100;
      setDaily(dailyValue);
    }

    if (
      (metric.total_pos !== variation.relative_total_pos ||
        metric.total_neg !== variation.relative_total_neg ||
        metric.event_count !== variation.relative_event_count) &&
      variation.results !== 0
    ) {
      setProjects(
        projects.map((v) =>
          v.id === metric.project_id
            ? Object.assign({}, v, {
                metrics: v.metrics?.map((m) =>
                  m.id === metric.id
                    ? Object.assign({}, m, {
                        total_pos: variation.relative_total_pos,
                        total_neg: variation.relative_total_neg,
                        event_count: variation.relative_event_count,
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
      <PushValueDialog
        metric={metric || ({} as Metric)}
        pushValueOpen={pushValueOpen}
        setPushValueOpen={setPushValueOpen}
      />
      <Card className='mt-5 rounded-[12px] border-none bg-background shadow-none'>
        <CardContent className='p-0'>
          <div className='grid grid-cols-4 gap-5 rounded-[10px] max-lg:grid-cols-2 max-md:grid-cols-1'>
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
                  toast.success('Successfully copied metric ID');
                },
              },
            ].map(({ label, action, icon, color, onClick }, i) => {
              const styles = cardStyle(color);
              const isDisabled =
                user.user_role === UserRole.Guest ||
                (user.user_role === UserRole.Developer &&
                  label !== 'Copy Metric ID');

              return (
                <div
                  key={i}
                  onClick={onClick}
                  style={{
                    borderColor: styles.borderColor,
                    backgroundColor: styles.backgroundColor,
                    opacity: isDisabled ? 0.5 : 1,
                    pointerEvents: isDisabled ? 'none' : 'auto',
                  }}
                  className={`group flex cursor-pointer select-none overflow-hidden rounded-[12px] border p-1 shadow-sm shadow-black/5 transition-all duration-150 active:scale-[.98]`}
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
                      className='flex items-center gap-2 text-sm font-semibold transition-all duration-200 group-hover:gap-3'
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
                <div className='flex items-center gap-3'>
                  {metric?.type === MetricType.Average ? (
                    <>{valueFormatter(average)}</>
                  ) : (
                    <>
                      {valueFormatter(
                        (metric?.total_pos ?? 0) - (metric?.total_neg ?? 0),
                      )}
                    </>
                  )}
                  <UnitCombobox
                    unit={metric?.unit}
                    customUnits={projects[activeProject].units}
                    onChange={(value) => {
                      fetch(`${process.env.NEXT_PUBLIC_API_URL}/metric-unit`, {
                        method: 'PATCH',
                        credentials: 'include',
                        headers: {
                          'Content-Type': 'application/json',
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
                    orientation='vertical'
                    className='my-auto ml-1 h-4'
                  />
                </div>
                <div>
                  <div className='flex flex-wrap justify-center gap-4'>
                    {daily < 0 ? (
                      <span className='inline-flex items-center gap-x-1 rounded-md border border-red-200 bg-red-100 px-2 py-1 text-sm font-semibold text-red-600'>
                        <ArrowDown
                          className='-ml-0.5 size-4'
                          aria-hidden={true}
                        />
                        {daily}%
                      </span>
                    ) : (
                      <span className='inline-flex items-center gap-x-1 rounded-md border border-green-200 bg-green-100 px-2 py-1 text-sm font-semibold text-green-600'>
                        <ArrowUp
                          className='-ml-0.5 size-4'
                          aria-hidden={true}
                        />
                        {daily}%
                      </span>
                    )}
                  </div>
                </div>
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
  }>({ pos: 0, neg: 0, average: 0 });

  const loadChart = async (from: Date) => {
    if (!props.metric) return;
    let data = [];

    if (activeFilter !== null) {
      data = await fetchChartData(
        from,
        range,
        activeFilter,
        activeFilter.project_id,
        props.type,
      );

      const { pos, neg, average } = await loadRangeSummary(data, activeFilter);
      setRangeSummary({ pos, neg, average });
      if (props.type === 'trend') {
        data = calculateTrend(data, activeFilter, pos, neg, average);
      }
    } else {
      data = await fetchChartData(
        from,
        range,
        props.metric,
        props.metric.project_id,
        props.type,
      );

      const { pos, neg, average } = await loadRangeSummary(data, props.metric);
      setRangeSummary({ pos, neg, average });
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
        if (date?.from === undefined) return { pos: 0, neg: 0, average: 0 };
        const end = new Date(date.from);
        end.setDate(end.getDate() + 1);
        end.setHours(0);
        end.setMinutes(0);
        end.setSeconds(0);

        const now = new Date();
        if (end.getTime() > now.getTime()) {
          return {
            pos: metric.total_pos,
            neg: metric.total_neg,
            average:
              metric.event_count === 0
                ? 0
                : (metric.total_pos - metric.total_neg) / metric.event_count,
          };
        }

        const {
          relative_total_pos,
          relative_total_neg,
          relative_event_count,
          pos,
          neg,
          event_count,
          results,
        } = await fetchNextEvent(metric.project_id, metric.id, end);

        if (results === 0) {
          return {
            pos: metric.total_pos,
            neg: metric.total_neg,
            average:
              metric.event_count === 0
                ? 0
                : (metric.total_pos - metric.total_neg) / metric.event_count,
          };
        } else {
          const previousEventCount = relative_event_count - event_count;
          return {
            pos: relative_total_pos - pos,
            neg: relative_total_neg - neg,
            average:
              previousEventCount === 0
                ? 0
                : (relative_total_pos - pos - (relative_total_neg - neg)) /
                  previousEventCount,
          };
        }
      }

      return { pos, neg, average };
    } else {
      let totalpos = 0;
      let totalneg = 0;
      let eventcount = 0;
      let average = 0;

      for (let i = 0; i < data.length; i++) {
        if (metric.type === MetricType.Base) {
          totalpos += data[i][metric.name] ?? 0;
        } else if (metric.type === MetricType.Dual) {
          totalpos += data[i][metric.name_pos ?? ''] ?? 0;
          totalneg += data[i][metric.name_neg ?? ''] ?? 0;
        } else if (metric.type === MetricType.Average) {
          totalpos += data[i]['+'] ?? 0;
          totalneg += data[i]['-'] ?? 0;
        }

        eventcount += data[i]['Event Count'] ?? 0;
      }

      if (metric.type === MetricType.Average) {
        const total = totalpos - totalneg;

        if (eventcount == 0 || total == 0) {
          average = 0;
        } else {
          average = total / eventcount;
        }
      }

      return {
        pos: totalpos,
        neg: totalneg,
        average,
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

  const toRangeValue = (
    dateRange: DateRange | undefined,
  ): RangeValue<DateValue> | null => {
    if (!dateRange?.from || !dateRange?.to) return null;

    // Convert Date to CalendarDate
    const start = new CalendarDate(
      dateRange.from.getFullYear(),
      dateRange.from.getMonth() + 1, // Months are 0-indexed in JavaScript Date
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
        <div className='mt-5 flex w-fit flex-row items-center gap-2'>
          <div className='flex gap-2'>
            <RangeSelector range={range} setRange={setRange} />
            <DateRangePicker
              className='h-[34px] w-fit space-y-2'
              value={toRangeValue(date)}
              onChange={(rangeValue) => {
                const newDateRange = toDateRange(rangeValue);
                setDate(newDateRange);
                if (newDateRange?.from) {
                  loadChart(newDateRange.from);
                }
              }}
            >
              <div className='flex'>
                <Group
                  className={cn(
                    dateInputStyle,
                    '!h-full !rounded-[12px] pe-9 shadow-sm shadow-black/5',
                  )}
                >
                  <DateInput slot='start' unstyled />
                  <span
                    aria-hidden='true'
                    className='px-2 text-muted-foreground/70'
                  >
                    -
                  </span>
                  <DateInput slot='end' unstyled />
                </Group>
                <AriaButton className='z-10 -me-px -ms-9 flex w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus-visible:outline-none data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-ring/70'>
                  <CalendarIcon className='size-5' strokeWidth={2} />
                </AriaButton>
              </div>
              <AriaPopover
                placement='bottom'
                className='z-50 rounded-[12px] border border-border bg-background text-popover-foreground shadow-lg shadow-black/5 outline-none data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2'
                offset={3}
              >
                <AriaDialog className='max-h-[inherit] overflow-auto p-2'>
                  <RangeCalendar
                    value={toRangeValue(date)}
                    onChange={(rangeValue) => {
                      const newDateRange = toDateRange(rangeValue);
                      setDate(newDateRange);
                    }}
                  />
                </AriaDialog>
              </AriaPopover>
            </DateRangePicker>
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
                    className='h-[34px] rounded-[12px] border-input !bg-background !text-primary hover:opacity-50'
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
                  if (new_year < 1999) return;
                  setYear(new_year);
                  setLoadingLeft(true);
                  loadChart(new Date(new_year, 0, 1));
                } else {
                  const newFrom = new Date(date?.from || new Date());
                  newFrom.setDate(newFrom.getDate() - range);
                  if (newFrom.getFullYear() < 1999) return;
                  setDate({ from: newFrom, to: date?.to });
                  setLoadingLeft(true);
                  loadChart(newFrom);
                }
              }}
              onRight={() => {
                if (range >= 365) {
                  const new_year = new Date(year, 1, 0).getFullYear() + 1;
                  const current_year = new Date().getFullYear();
                  if (new_year > current_year) return;
                  setYear(new_year);
                  setLoadingRight(true);
                  loadChart(new Date(new_year, 0, 1));
                } else {
                  const newFrom = new Date(date?.from || new Date());
                  newFrom.setDate(newFrom.getDate() + range);
                  const now = new Date();
                  if (newFrom > now) return;
                  setDate({ from: newFrom, to: date?.to });
                  setLoadingRight(true);
                  loadChart(newFrom);
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
          <div className='mt-2 w-full min-w-[600px] rounded-[12px] border bg-accent p-5 shadow-sm shadow-black/5'>
            <div className='flex w-full items-center justify-between gap-5'>
              <div className='flex flex-col'>
                <div className='text-md text-secondary'>
                  {range === 365 ? `Summary of ${year}` : 'Summary'}
                </div>
                <div className='text-xl font-medium'>
                  {props.metric?.type === MetricType.Average ? (
                    <>{valueFormatter(rangeSummary.average)}</>
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
                setActiveFilter={(filter) => {
                  setActiveFilter(filter);
                }}
                range={range}
                start={date?.to || new Date()}
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
                        props.metric?.name_pos ?? '',
                        props.metric?.name_neg ?? '',
                      ]
                }
                valueFormatter={(number: number) =>
                  `${Intl.NumberFormat('us').format(number).toString()}`
                }
                yAxisLabel='Total'
                onValueChange={
                  props.metric?.type === MetricType.Dual ? () => {} : undefined
                }
              />
            )}
          </div>
        )}
      </div>
    </>
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
            className='h-[34px] rounded-[12px] border-input !bg-background !text-primary hover:opacity-50'
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
            className='h-[34px] rounded-[12px] border-input !bg-background !text-primary hover:opacity-50'
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
  const { projects, activeProject } = useContext(ProjectsContext);

  const handleRangeChange = (value: string) => {
    const range = parseInt(value);

    // Check if the user is trying to select the 12M option and is on the Starter plan
    if (
      range === 365 &&
      projects[activeProject].plan.name.toLowerCase() === 'starter'
    ) {
      toast.warning(
        'Your current plan allows viewing up to 30 days of data. Upgrade to unlock extended date ranges.',
      );
      return; // Prevent changing the range
    }

    // Update the range if it's different from the current range
    if (range !== props.range) {
      props.setRange(range);
    }
  };

  return (
    <ToggleGroup
      type='single'
      defaultValue='1' // Set to a valid default value
      size={'sm'}
      className='h-[34px] max-h-[34px] w-fit gap-1 rounded-[12px] border bg-background !p-1'
      onValueChange={handleRangeChange}
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
      <ToggleGroupItem
        value='365'
        className='h-[28px] rounded-[8px] data-[state=on]:pointer-events-none'
      >
        12M
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
