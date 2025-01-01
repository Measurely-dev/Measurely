'use client';

import {
  ArrowUpDown,
  ArrowUpFromDot,
  BoxIcon,
  Check,
  ChevronsUpDown,
  CircleOff,
  CurlyBraces,
  Info,
  Link2Icon,
  Shapes,
} from 'lucide-react';
import { AreaChart } from '@/components/ui/area-chart';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useContext, useEffect, useMemo, useState } from 'react';
import { AppsContext } from '@/dash-context';
import {
  calculateTrend,
  fetchDailySummary,
  INTERVAL_LONG,
  loadChartData,
} from '@/utils';
import { Metric, MetricType } from '@/types';
import MetricStats from './metric-stats';
import { Skeleton } from '../ui/skeleton';
import { TopMetricCard } from './top-metric-card';
import { EmptyState } from '../ui/empty-state';
import { useRouter } from 'next/navigation';
const valueFormatter = (number: number) => {
  return Intl.NumberFormat('us').format(number).toString();
};
export function ChartsCard() {
  const { applications, activeApp, setApplications } = useContext(AppsContext);
  const [activeMetric, setActiveMetric] = useState(0);
  const router = useRouter();
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const metricData = applications[activeApp].metrics?.[activeMetric] ?? null;
    if (!metricData) return;
    const from = new Date();
    from.setDate(1);
    const nbrDaysInMonth = new Date(
      from.getFullYear(),
      from.getMonth() + 1,
      0,
    ).getDate();
    const to = new Date(from);
    to.setDate(to.getDate() + nbrDaysInMonth);

    const data = await loadChartData(
      from,
      nbrDaysInMonth,
      metricData,
      metricData.appid,
      'trend',
    );

    setChartData(data);
    setLoading(false);
  };

  const loadDailyUpdate = async () => {
    const metricData = applications[activeApp].metrics?.[activeMetric] ?? null;
    if (!metricData) return;

    const { relativetotalpos, relativetotalneg, results } =
      await fetchDailySummary(metricData.appid ?? '', metricData.id ?? '');

    if (
      (metricData.totalpos !== relativetotalpos ||
        metricData.totalneg !== relativetotalneg) &&
      results !== 0
    ) {
      setApplications(
        applications.map((app, i) =>
          i === activeApp
            ? Object.assign({}, app, {
              metrics: app.metrics?.map((m, j) =>
                j === activeMetric
                  ? Object.assign({}, m, {
                    totalpos: relativetotalpos,
                    totalneg: relativetotalneg,
                  })
                  : m,
              ),
            })
            : app,
        ),
      );
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData();
    const interval = setInterval(() => {
      loadData();
      loadDailyUpdate();
    }, INTERVAL_LONG);
    return () => {
      clearInterval(interval);
    };
  }, [activeMetric]);

  const metric = useMemo(() => {
    return applications[activeApp].metrics?.[activeMetric] ?? null;
  }, [activeMetric, applications]);

  useEffect(() => {
    const new_index =
      applications[activeApp].metrics === null
        ? 0
        : applications[activeApp].metrics.length === 0
          ? 0
          : applications[activeApp].metrics.length - 1;

    if (activeMetric > new_index) {
      setActiveMetric(new_index);
    }
  }, [activeApp]);

  return (
    <Card className='mb-20 rounded-t-none border-input'>
      <MetricStats
        stats={[
          {
            title: 'Metric used',
            description: 'Across this application',
            value: applications[activeApp].metrics?.length,
          },
          {
            title: 'Number of dual metric',
            description: 'Across this application',
            value: applications[activeApp].metrics?.filter(
              (m) => m.type === MetricType.Dual,
            ).length,
          },
          {
            title: 'Number of basic metric',
            description: 'Across this application',
            value: applications[activeApp].metrics?.filter(
              (m) => m.type === MetricType.Base,
            ).length,
          },
          {
            title: 'Team members',
            description: 'Coming soon',
            value: 'N/A',
          },
        ]}
      />
      {applications[activeApp].metrics !== undefined &&
        applications[activeApp].metrics?.length! > 0 ? (
        <>
          <Header
            activeMetric={activeMetric}
            setActiveMetric={setActiveMetric}
            metrics={applications[activeApp].metrics ?? []}
          />
          <CardContent className='flex flex-col'>
            {(metric?.totalpos ?? 0) - (metric?.totalneg ?? 0) === 0 ? (
              <EmptyState
                className='py-14'
                title='Nothing Here Yet. Check Back Soon!'
                description='This chart is empty for now. Check back when new data is collected.'
                icons={[Info, CircleOff, Shapes]}
              />
            ) : (
              <>
                {loading || metric === null ? (
                  <>
                    <Skeleton className='h-60 min-h-60 w-full rounded-[12px]' />
                  </>
                ) : (
                  <div className='w-full'>
                    <div className='flex w-full flex-row gap-5'>
                      <div className='w-full rounded-[12px] bg-accent p-5'>
                        <AreaChart
                          className='h-60 min-h-60 w-full'
                          data={calculateTrend(
                            chartData,
                            metric,
                            metric?.totalpos ?? 0,
                            metric?.totalneg ?? 0,
                          )}
                          index='date'
                          color='blue'
                          categories={['Total']}
                          valueFormatter={(number: number) =>
                            `${Intl.NumberFormat('us').format(number).toString()}`
                          }
                          onValueChange={() => { }}
                          xAxisLabel='Date'
                          yAxisLabel='Total'
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <TopMetricCard />
          </CardContent>
        </>
      ) : (
        <EmptyState
          className='w-full rounded-b-[16px] rounded-t-none border-none'
          title='No Metric Created'
          description='You can create a new metric to start tracking values.'
          icons={[CurlyBraces, BoxIcon, Link2Icon]}
          action={{
            label: 'Create metric',
            onClick: () => router.push('/dashboard/new-metric'),
          }}
        />
      )}
    </Card>
  );
}

function Header(props: {
  activeMetric: number;
  setActiveMetric: React.Dispatch<React.SetStateAction<number>>;
  metrics: Metric[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <CardHeader className='flex flex-row justify-between max-sm:flex-col max-sm:gap-3'>
      <div className='flex flex-col gap-1'>
        <CardTitle>
          {valueFormatter(
            props.metrics[props.activeMetric].totalpos -
            props.metrics[props.activeMetric].totalneg,
          )}{' '}
          {props.metrics[props.activeMetric]?.name}
        </CardTitle>
        <CardDescription>Trend of the last month</CardDescription>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='w-fit min-w-[200px] justify-between rounded-[12px]'
          >
            {props.metrics.length > 0
              ? props.metrics.find((_, i) => i === props.activeMetric)?.name
              : 'Select metric...'}
            <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[240px] overflow-hidden rounded-[12px] border p-0 shadow-md'>
          <Command>
            <CommandInput placeholder='Search metric...' />
            <CommandList>
              <CommandEmpty>No metric found.</CommandEmpty>
              <CommandGroup>
                {props.metrics
                  .sort(
                    (a, b) =>
                      b.totalpos - b.totalneg - (a.totalpos - a.totalneg),
                  )
                  .map((metric, i) => (
                    <CommandItem
                      key={metric.id}
                      className='truncate rounded-[10px]'
                      onSelect={() => {
                        props.setActiveMetric(i);
                        setOpen(false);
                      }}
                    >
                      {i === props.activeMetric ? (
                        <Check className={cn('mr-2 size-4 stroke-[3px]')} />
                      ) : metric.type === MetricType.Dual ? (
                        <ArrowUpDown className={cn('mr-2 size-4')} />
                      ) : (
                        <ArrowUpFromDot className={cn('mr-2 size-4')} />
                      )}
                      <div className='w-full truncate'>{metric.name}</div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </CardHeader>
  );
}
