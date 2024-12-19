'use client';
import DashboardContentContainer from '@/components/dashboard/container';
import { MetricDatePicker } from '@/components/dashboard/date-picker';
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Dialog } from '@radix-ui/react-dialog';
import { addDays } from 'date-fns';
import { ArrowLeft, ArrowRight, Calendar, Edit, Sliders } from 'lucide-react';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { DateRange } from 'react-day-picker';

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
const chartdata = [
  { date: 'Jan 23', TotalUsers: 5000 },
  { date: 'Feb 23', TotalUsers: 5200 },
  { date: 'Mar 23', TotalUsers: 5400 },
  { date: 'Apr 23', TotalUsers: 5600 },
  { date: 'May 23', TotalUsers: 5800 },
  { date: 'Jun 23', TotalUsers: 6000 },
  { date: 'Jul 23', TotalUsers: 6200 },
  { date: 'Aug 23', TotalUsers: 6400 },
  { date: 'Sep 23', TotalUsers: 6600 },
  { date: 'Oct 23', TotalUsers: 6800 },
  { date: 'Nov 23', TotalUsers: 7000 },
  { date: 'Dec 23', TotalUsers: 7200 },
];
const dualData = [
  { date: 'Jan 23', AccountsCreated: 500, AccountsDeleted: 120 },
  { date: 'Feb 23', AccountsCreated: 480, AccountsDeleted: 100 },
  { date: 'Mar 23', AccountsCreated: 520, AccountsDeleted: 130 },
  { date: 'Apr 23', AccountsCreated: 550, AccountsDeleted: 140 },
  { date: 'May 23', AccountsCreated: 530, AccountsDeleted: 150 },
  { date: 'Jun 23', AccountsCreated: 510, AccountsDeleted: 125 },
  { date: 'Jul 23', AccountsCreated: 560, AccountsDeleted: 110 },
  { date: 'Aug 23', AccountsCreated: 540, AccountsDeleted: 105 },
  { date: 'Sep 23', AccountsCreated: 490, AccountsDeleted: 115 },
  { date: 'Oct 23', AccountsCreated: 505, AccountsDeleted: 120 },
  { date: 'Nov 23', AccountsCreated: 520, AccountsDeleted: 130 },
  { date: 'Dec 23', AccountsCreated: 580, AccountsDeleted: 140 },
];

const valueFormatter = (number: number) => {
  return Intl.NumberFormat('us').format(number).toString();
};
const metricType = 'dual';
const url = window.location.pathname.replace(/\/$/, '');
const segments = url.split('/');
const metricName = segments[segments.length - 1];
export default function DashboardMetricPage() {
  useEffect(() => {
    document.title = `${metricName} | Measurely`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        `Track and analyze ${metricName} in detail. Monitor its performance, explore trends, and gain insights to make informed decisions.`,
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
            <BreadcrumbPage>{metricName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <TooltipProvider>
        <div className='mt-5 flex h-full flex-col'>
          <div className='flex flex-row items-end justify-between max-sm:flex-col max-sm:items-start max-sm:gap-5'>
            <div className='flex flex-col gap-1 text-4xl font-semibold'>
              <div className='text-lg font-normal capitalize text-muted-foreground'>
                {metricName}
              </div>
              <div className='flex flex-row items-center gap-4 max-sm:flex-col max-sm:items-start'>
                {valueFormatter(21934810792)}
                {metricType === 'dual' ? (
                  <div className='flex flex-col gap-1'>
                    <div className='h-fit w-fit rounded-[6px] bg-green-500/10 px-1 py-0.5 font-mono text-sm text-green-500'>
                      +{valueFormatter(29483234)}
                    </div>
                    <div className='h-fit w-fit rounded-[6px] bg-red-500/10 px-1 py-0.5 font-mono text-sm text-red-500'>
                      -{valueFormatter(9093824)}
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className='rounded-[12px] max-sm:w-full'>
                  <Edit className='mr-2 size-4' />
                  Edit
                </Button>
              </DialogTrigger>
              {/* <EditMetricDialogContent group={{} as Group} setOpen={Boolean} total={0} /> */}
            </Dialog>
          </div>
          <OverviewChart />
          <TrendChart />
        </div>
      </TooltipProvider>
    </DashboardContentContainer>
  );
}

function OverviewChart() {
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
          <RangeSelector />
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                className='h-[34px] rounded-[10px] !bg-background !text-primary hover:opacity-50'
                size={'icon'}
              >
                <Calendar className='size-4' />
              </Button>
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
            metricName={metricName}
            chartType={overviewChartType}
            chartColor={overviewChartColor}
            dualMetricChartColor={dualMetricOverviewChartColor}
            setChartColor={setOverviewChartColor}
            setChartType={setOverviewChartType}
            setDualMetricChartColor={setDualMetricOverviewChartColor}
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
          <OffsetBtns />
        </div>
      </div>
      {metricType === 'dual' ? (
        <BarChart
          className='mt-2 min-h-[40vh] w-full rounded-[12px] bg-accent p-5'
          data={dualData}
          customTooltip={customTooltip}
          index='date'
          type={overviewChartType}
          colors={dualMetricChartConfig.colors}
          categories={['AccountsCreated', 'AccountsDeleted']}
          valueFormatter={(number: number) =>
            `${Intl.NumberFormat('us').format(number).toString()}`
          }
          xAxisLabel='Date'
          yAxisLabel='Total'
        />
      ) : (
        <BarChart
          className='mt-2 min-h-[40vh] w-full rounded-[12px] bg-accent p-5'
          data={chartdata}
          customTooltip={customTooltip}
          index='date'
          colors={[`${overviewChartColor}`]}
          categories={['TotalUsers']}
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

function TrendChart() {
  const [trendChartType, setTrendChartType] = useState<
    'default' | 'percent' | 'stacked'
  >('default');
  const [trendChartColor, setTrendChartColor] =
    useState<keyof ChartColors>('blue');
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -20),
    to: new Date(),
  });
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
          <RangeSelector />
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
            metricName={metricName}
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
          <OffsetBtns />
        </div>
      </div>
      <AreaChart
        className='mb-20 mt-2 min-h-[40vh] w-full rounded-[12px] bg-accent p-5'
        data={chartdata}
        index='date'
        customTooltip={customTooltip}
        colors={[`${trendChartColor}`]}
        categories={['TotalUsers']}
        valueFormatter={(number: number) => valueFormatter(number)}
        xAxisLabel='Date'
        yAxisLabel='Total'
      />
    </>
  );
}

function AdvancedOptions(props: {
  chartName: string;
  metricName: string;
  children: ReactNode;
  chartType: string;
  chartColor: string;
  dualMetricChartColor?: string;
  setChartType: Dispatch<SetStateAction<'stacked' | 'percent' | 'default'>>;
  setChartColor: Dispatch<SetStateAction<keyof ChartColors>>;
  setDualMetricChartColor?: Dispatch<
    SetStateAction<keyof DualMetricChartColors>
  >;
  //   groupType: number;
  //   setIsTrendActive: Dispatch<SetStateAction<boolean>>;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  useEffect(() => {
    const storedChartType = localStorage.getItem(
      props.metricName.charAt(0).toUpperCase() +
        props.metricName.slice(1) +
        props.chartName.charAt(0).toUpperCase() +
        props.chartName.slice(1) +
        'ChartType',
    );
    if (storedChartType) {
      props.setChartType(storedChartType as 'stacked' | 'percent' | 'default');
    }

    const storedChartColor = localStorage.getItem(
      props.metricName.charAt(0).toUpperCase() +
        props.metricName.slice(1) +
        props.chartName.charAt(0).toUpperCase() +
        props.chartName.slice(1) +
        'ChartColor',
    );
    if (storedChartColor) {
      props.setChartColor(storedChartColor as keyof ChartColors);
    }

    if (props.dualMetricChartColor && props.setDualMetricChartColor) {
      const storedDualMetricChartColor = localStorage.getItem(
        props.metricName.charAt(0).toUpperCase() +
          props.metricName.slice(1) +
          props.chartName.charAt(0).toUpperCase() +
          props.chartName.slice(1) +
          'ChartDualColor',
      );
      if (storedDualMetricChartColor) {
        props.setDualMetricChartColor(
          storedDualMetricChartColor as keyof DualMetricChartColors,
        );
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      props.metricName.charAt(0).toUpperCase() +
        props.metricName.slice(1) +
        props.chartName.charAt(0).toUpperCase() +
        props.chartName.slice(1) +
        'ChartType',
      props.chartType,
    );

    localStorage.setItem(
      props.metricName.charAt(0).toUpperCase() +
        props.metricName.slice(1) +
        props.chartName.charAt(0).toUpperCase() +
        props.chartName.slice(1) +
        'ChartColor',
      props.chartColor,
    );

    if (props.dualMetricChartColor && props.setDualMetricChartColor) {
      localStorage.setItem(
        props.metricName.charAt(0).toUpperCase() +
          props.metricName.slice(1) +
          props.chartName.charAt(0).toUpperCase() +
          props.chartName.slice(1) +
          'ChartDualColor',
        props.dualMetricChartColor,
      );
    }
  }, [props.chartType, props.chartColor, props.dualMetricChartColor]);
  return (
    <Popover open={isOpen} onOpenChange={(e) => setIsOpen(e)}>
      <PopoverTrigger asChild>{props.children}</PopoverTrigger>
      <PopoverContent className='rounded-[12px] max-sm:px-2'>
        <div className='flex w-full flex-col gap-4'>
          {metricType === 'dual' && props.chartName !== 'trend' ? (
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
          {metricType === 'dual' && props.chartName !== 'trend' ? (
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

function OffsetBtns() {
  return (
    <div className='flex gap-2'>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            className='h-[34px] rounded-[10px] !bg-background !text-primary hover:opacity-50'
            size={'icon'}
          >
            <ArrowLeft className='size-4' />
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
          >
            <ArrowRight className='size-4' />
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

function RangeSelector() {
  return (
    <ToggleGroup
      type='single'
      defaultValue='0'
      size={'sm'}
      className='h-[34px] w-fit gap-1 rounded-[10px] bg-background !p-1'
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

const customTooltip = ({ active, label, payload }: TooltipProps) => {
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
