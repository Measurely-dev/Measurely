'use client';
import DashboardContentContainer from '@/components/dashboard/container';
import { MetricDatePicker } from '@/components/dashboard/date-picker';
import EditMetricDialogContent from '@/components/dashboard/edit-metric-dialog-content';
import { AreaChart, TooltipProps } from '@/components/ui/areaChart';
import { BarChart } from '@/components/ui/BarChart';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AppsContext } from '@/dash-context';
import { Group, GroupType } from '@/types';
import { calculateTrend, fetchDailySummary, loadChartData } from '@/utils';
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
  const metricName = decodeURIComponent(useParams().metric as string);
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState(() => {
    if (applications[activeApp]) {
      const groupData = applications[activeApp].groups?.filter(
        (g) => g.name === metricName,
      )[0];
      if (groupData !== null) {
        return groupData;
      }
    }
    router.push('/dashboard/metrics');
    return null;
  });

  const [posDaily, setPosDaily] = useState<number>(0);
  const [negDaily, setNegDaily] = useState<number>(0);

  const loadDailyValues = async (group: Group) => {
    setPosDaily(
      await fetchDailySummary(group.appid, group.id, group.metrics[0].id),
    );
    if (group.type === GroupType.Dual) {
      setNegDaily(
        await fetchDailySummary(group.appid, group.id, group.metrics[1].id),
      );
    }
  };

  useEffect(() => {
    const groupData = applications[activeApp].groups?.filter(
      (g) => g.name === metricName,
    )[0];
    if (groupData === null || groupData === undefined) {
      router.push('/dashboard/metrics');
    }
  }, [activeApp]);

  useEffect(() => {
    loadDailyValues(group!);
  }, []);

  useEffect(() => {
    document.title = `${group?.name} | Measurely`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        `Track and analyze ${group?.name} in detail. Monitor its performance, explore trends, and gain insights to make informed decisions.`,
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
            <BreadcrumbPage>{group?.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <TooltipProvider>
        <div className='mt-5 flex h-full flex-col'>
          <div className='flex flex-row items-end justify-between max-sm:flex-col max-sm:items-start max-sm:gap-5'>
            <div className='flex flex-col gap-1 text-4xl font-semibold'>
              <div className='text-lg font-normal capitalize text-muted-foreground'>
                {group?.name}
              </div>
              <div className='flex flex-row items-center gap-4 max-sm:flex-col max-sm:items-start'>
                {group?.type === GroupType.Dual ? (
                  <>
                    {valueFormatter(
                      group?.metrics[0].total - group?.metrics[1].total,
                    )}
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
                    {valueFormatter(group?.metrics[0].total ?? 0)}
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
              {group?.type === GroupType.Dual ? (
                <MoreDropdown group={group}>
                  <Button
                    variant={'secondary'}
                    size={'icon'}
                    className='size-9 min-w-9 rounded-[12px] max-sm:w-full'
                  >
                    <Copy className='size-4' />
                  </Button>
                </MoreDropdown>
              ) : (
                <Button
                  variant={'secondary'}
                  size={'icon'}
                  className='size-9 min-w-9 rounded-[12px] max-sm:w-full'
                  onClick={() => {
                    navigator.clipboard.writeText(
                      group ? group?.metrics[0].id : '',
                    );
                    toast.success('Succefully copied Metric ID');
                  }}
                >
                  <Copy className='size-4' />
                </Button>
              )}
              <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
                <DialogTrigger asChild>
                  <Button className='rounded-[12px] max-sm:w-full'>
                    <Edit className='mr-2 size-4' />
                    Edit
                  </Button>
                </DialogTrigger>
                <EditMetricDialogContent
                  group={group!}
                  setOpen={setOpen}
                  onUpdate={(new_name: string) => {
                    setGroup(Object.assign({}, group, { name: new_name }));
                  }}
                />
              </Dialog>
            </div>
          </div>
          <OverviewChart group={group!} />
          <TrendChart group={group!} />
        </div>
      </TooltipProvider>
    </DashboardContentContainer>
  );
}

function OverviewChart(props: { group: Group }) {
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

  const loadChart = async () => {
    if (!loadingLeft && !loadingRight) {
      setLoading(true);
    }
    if (date !== undefined && date.from !== undefined) {
      setChartData(
        (await loadChartData(
          date.from,
          range,
          props.group,
          props.group.appid,
        )) ?? [],
      );
    }
    setLoading(false);
    setLoadingLeft(false);
    setLoadingRight(false);
  };

  useEffect(() => {
    setDate((prev) => {
      if (prev === undefined || prev.from === undefined) return prev;
      const to = new Date(prev.from);
      to.setDate(prev.from.getDate() + range);
      const now = new Date();
      if (now < prev.from) {
        return {
          from: new Date(),
        };
      }
      return {
        from: prev.from,
        to: to,
      };
    });

    loadChart();
  }, [date?.from, range]);

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
            groupId={props.group.id}
            metricType={props.group.type}
            chartType={overviewChartType}
            chartColor={overviewChartColor}
            dualMetricChartColor={dualMetricOverviewChartColor}
            setChartColor={setOverviewChartColor}
            setChartType={setOverviewChartType}
            setDualMetricChartColor={
              props.group.type === GroupType.Base
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
              setDate((prev) => {
                if (prev === undefined || prev.from === undefined) return prev;
                const from = new Date(prev.from);
                const toRemove = range === 0 ? 1 : range;
                from.setDate(from.getDate() - toRemove);
                setLoadingLeft(true);
                return {
                  from: from,
                  to: prev.to,
                };
              });
            }}
            onRight={() => {
              setDate((prev) => {
                if (prev === undefined || prev.from === undefined) return prev;
                const from = new Date(prev.from);
                const toAdd = range === 0 ? 1 : range;
                from.setDate(from.getDate() + toAdd);
                const now = new Date();
                if (now < from) {
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
            isDisabled={useMemo(() => {
              if (date === undefined || date.from === undefined) {
                return false;
              }
              const now = new Date();
              const from = new Date(date.from);
              const toAdd = range === 0 ? 1 : range;
              from.setDate(from.getDate() + toAdd)
              const result = now < from;
              return result;
            }, [date])}
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
        <Skeleton className='mt-2 h-[40vh] w-full rounded-[12px] bg-accent' />
      ) : (
        <BarChart
          className='mt-2 min-h-[40vh] w-full rounded-[12px] bg-accent p-5'
          data={chartData}
          customTooltip={customTooltip}
          index='date'
          type={overviewChartType}
          colors={
            props.group.type === GroupType.Dual
              ? dualMetricChartConfig.colors
              : [overviewChartColor]
          }
          categories={
            props.group.type === GroupType.Base
              ? [props.group.name]
              : [props.group.metrics[0].name, props.group.metrics[1].name]
          }
          valueFormatter={(number: number) =>
            `${Intl.NumberFormat('us').format(number).toString()}`
          }
          xAxisLabel='Date'
          yAxisLabel='Total'
        />
      )}
    </>
  );
}

function TrendChart(props: { group: Group }) {
  const [trendChartType, setTrendChartType] = useState<
    'default' | 'percent' | 'stacked'
  >('default');
  const [trendChartColor, setTrendChartColor] =
    useState<keyof ChartColors>('blue');

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



  const loadChart = async () => {
    if (!loadingLeft && !loadingRight) {
      setLoading(true)
    }
    if (date !== undefined && date.from !== undefined) {
      const to = new Date(date.from);
      const now = new Date();
      if (range === 0) {
        to.setHours(to.getHours() + 24);
      } else {
        to.setDate(to.getDate() + range);
      }

      const timeDiff = now.getTime() - to.getTime();

      const daysDiff = Math.round(timeDiff / (1000 * 3600 * 24));

      let total =
        props.group.type === GroupType.Base
          ? props.group.metrics[0].total
          : props.group.metrics[0].total - props.group.metrics[1].total;
      let pos = 0;
      let neg = 0;

      if (daysDiff > 0) {
        const futurValues =
          (await loadChartData(to, daysDiff, props.group, props.group.appid)) ??
          [];

        for (let i = 0; i < futurValues.length; i++) {
          if (props.group.type === GroupType.Base) {
            pos += futurValues[i][props.group.name];
          } else {
            pos += futurValues[i][props.group.metrics[0].name];
            neg += futurValues[i][props.group.metrics[1].name];
          }
        }
      }

      total -= pos;
      total += neg;

      const data = await loadChartData(
        date.from,
        range,
        props.group,
        props.group.appid,
      );

      setChartData(data ?? []);
      setTotal(total);
    }

    setLoading(false)
    setLoadingLeft(false)
    setLoadingRight(false)
  };

  useEffect(() => {
    setDate((prev) => {
      if (prev === undefined || prev.from === undefined) return prev;
      const to = new Date(prev.from);
      to.setDate(prev.from.getDate() + range);
      const now = new Date();
      if (now < prev.from) {
        return {
          from: new Date(),
        };
      }
      return {
        from: prev.from,
        to: to,
      };
    });

    loadChart();
  }, [date?.from, range]);
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
            groupId={props.group.id}
            metricType={props.group.type}
            chartType={trendChartType}
            chartColor={trendChartColor}
            setChartColor={setTrendChartColor}
            setChartType={setTrendChartType}
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
              setDate((prev) => {
                if (prev === undefined || prev.from === undefined) return prev;
                const from = new Date(prev.from);
                const toRemove = range === 0 ? 1 : range;
                from.setDate(from.getDate() - toRemove);
                setLoadingLeft(true);
                return {
                  from: from,
                  to: prev.to,
                };
              });
            }}
            onRight={() => {
              setDate((prev) => {
                if (prev === undefined || prev.from === undefined) return prev;
                const from = new Date(prev.from);
                const toAdd = range === 0 ? 1 : range;
                from.setDate(from.getDate() + toAdd);
                const now = new Date();
                if (now < from) {
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
            isDisabled={useMemo(() => {
              if (date === undefined || date.from === undefined) {
                return false;
              }
              const now = new Date();
              const from = new Date(date.from);
              const toAdd = range === 0 ? 1 : range;
              from.setDate(from.getDate() + toAdd)
              const result = now < from;
              return result;
            }, [date])}
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
        <Skeleton className='mt-2 h-[40vh] w-full rounded-[12px] bg-accent' />
      ) : (
        <AreaChart
          className='mb-20 mt-2 min-h-[40vh] w-full rounded-[12px] bg-accent p-5'
          data={calculateTrend(
            chartData,
            total,
            props.group.type,
            props.group.type === GroupType.Base
              ? props.group.name
              : props.group.metrics[0].name,
            props.group.type === GroupType.Dual
              ? props.group.metrics[1].name
              : '',
            props.group.name,
          )}
          index='date'
          customTooltip={customTooltip}
          colors={[trendChartColor]}
          categories={[props.group.name]}
          valueFormatter={(number: number) => valueFormatter(number)}
          xAxisLabel='Date'
          yAxisLabel='Total'
        />
      )}
    </>
  );
}

function AdvancedOptions(props: {
  chartName: string;
  groupId: string;
  metricType: GroupType;
  children: ReactNode;
  chartType: string;
  chartColor: string;
  dualMetricChartColor?: string;
  setChartType: Dispatch<SetStateAction<'stacked' | 'percent' | 'default'>>;
  setChartColor: Dispatch<SetStateAction<keyof ChartColors>>;
  setDualMetricChartColor?: Dispatch<
    SetStateAction<keyof DualMetricChartColors>
  >;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('chartsettings') ?? '{}');
    const name = props.groupId + props.chartName;
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
  }, []);

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('chartsettings') ?? '{}');
    const name = props.groupId + props.chartName;
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
  }, [props.chartType, props.chartColor, props.dualMetricChartColor]);
  return (
    <Popover open={isOpen} onOpenChange={(e) => setIsOpen(e)}>
      <PopoverTrigger asChild>{props.children}</PopoverTrigger>
      <PopoverContent className='rounded-[12px] max-sm:px-2'>
        <div className='flex w-full flex-col gap-4'>
          {props.metricType === GroupType.Dual &&
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
          {props.metricType === GroupType.Dual &&
            props.chartName !== 'trend' ? (
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
  isDisabled?: boolean | false;
}) {
  return (
    <div className='flex gap-2'>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            className='h-[34px] rounded-[10px] !bg-background !text-primary hover:opacity-50'
            size={'icon'}
            onClick={props.onLeft}
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
            disabled={props.isDisabled}
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
                {item.category}
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

function MoreDropdown(props: {
  children: any;
  group: Group | null | undefined;
}) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
        <DropdownMenuContent className='relative right-[20px] w-[150px] shadow-sm'>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(
                props.group ? props.group?.metrics[0].id : '',
              );
              toast.success('Succefully copied positive variable ID');
            }}
          >
            Copy positive ID
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(
                props.group ? props.group?.metrics[1].id : '',
              );
              toast.success('Succefully copied degative variable ID');
            }}
          >
            Copy negative ID
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
