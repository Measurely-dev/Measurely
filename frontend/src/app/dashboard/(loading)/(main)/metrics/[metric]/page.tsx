'use client';
import DashboardContentContainer from '@/components/dashboard/container';
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
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Edit,
  Sliders,
} from 'lucide-react';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from 'react';

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

const valueFormatter = (number: number) => {
  return Intl.NumberFormat('us').format(number).toString();
};
const metricName = 'Accounts';
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
                <div className='flex flex-col gap-1'>
                  <div className='h-fit w-fit rounded-[6px] bg-green-500/10 px-1 py-0.5 font-mono text-sm text-green-500'>
                    +{valueFormatter(29483234)}
                  </div>
                  <div className='h-fit w-fit rounded-[6px] bg-red-500/10 px-1 py-0.5 font-mono text-sm text-red-500'>
                    -{valueFormatter(9093824)}
                  </div>
                </div>
              </div>
            </div>
            <Button className='rounded-[12px] max-sm:w-full'>
              <Edit className='mr-2 size-4' />
              Edit
            </Button>
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
    'stacked' | 'percent'
  >('stacked');
  const [overviewChartColor, setOverviewChartColor] =
    useState<keyof ChartColors>('blue');
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
            metricName='Accounts'
            chartType={overviewChartType}
            chartColor={overviewChartColor}
            setChartColor={setOverviewChartColor}
            setChartType={setOverviewChartType}
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
        onValueChange={(v) => console.log(v)}
        xAxisLabel='Date'
        yAxisLabel='Total'
      />
    </>
  );
}

function TrendChart() {
  const [trendChartType, setTrendChartType] = useState<'stacked' | 'percent'>(
    'stacked',
  );
  const [trendChartColor, setTrendChartColor] =
    useState<keyof ChartColors>('blue');
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
            chartName='trend'
            metricName='Accounts'
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
  setChartType: Dispatch<SetStateAction<'stacked' | 'percent'>>;
  setChartColor: Dispatch<SetStateAction<keyof ChartColors>>;
  //   groupType: number;
  //   setIsTrendActive: Dispatch<SetStateAction<boolean>>;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  useEffect(() => {
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
  }, []);

  useEffect(() => {
    localStorage.setItem(
      props.metricName.charAt(0).toUpperCase() +
        props.metricName.slice(1) +
        props.chartName.charAt(0).toUpperCase() +
        props.chartName.slice(1) +
        'ChartColor',
      props.chartColor,
    );
  }, [props.chartColor]);
  return (
    <Popover open={isOpen} onOpenChange={(e) => setIsOpen(e)}>
      <PopoverTrigger asChild>{props.children}</PopoverTrigger>
      <PopoverContent className='rounded-[12px] max-sm:px-2'>
        <div className='flex w-full flex-col gap-4'>
          {/* {props.groupType === 0 ? (
              <></>
            ) : (
              <Label className='flex flex-col gap-2'>
                Chart type
                <Select
                  value={props.chartType}
                  onValueChange={(e) =>
                    props.setChartType(e as 'stacked' | 'percent')
                  }
                >
                  <SelectTrigger className='h-11 border'>
                    <SelectValue placeholder='Select chart type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={'stacked'}>Stacked</SelectItem>
                      <SelectItem value={'percent'}>Percentage</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <div className='w-full text-sm text-secondary'>
                  Select chart type{' '}
                  <Link
                    className='text-primary underline'
                    href={'/docs/features/advanced-options'}
                    target='_blank'
                  >
                    learn more
                  </Link>
                </div>
              </Label>
            )} */}
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
  if (!active || !payload) return null;
  const categoryPayload = payload[0];
  if (!categoryPayload) return null;
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
      <div className='mt-1 w-full space-y-1 rounded-md border border-gray-500/10 bg-white px-4 py-2 text-sm shadow-md dark:border-gray-400/20 dark:bg-gray-900'>
        <div className='flex w-full justify-between gap-10'>
          <span className='text-gray-700 dark:text-gray-300'>
            {categoryPayload.category}
          </span>
          <div className='flex items-center space-x-1'>
            <span className='font-medium text-gray-900 dark:text-gray-50'>
              {valueFormatter(categoryPayload.value)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
