'use client';

import {
  ArrowUpDown,
  ArrowUpFromDot,
  BoxIcon,
  Check,
  ChevronsUpDown,
  CircleOff,
  CircleSlash,
  CurlyBraces,
  Link2Icon,
} from 'lucide-react';
import { AreaChart } from '@/components/ui/areaChart';

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
import { calculateTrend, loadChartData } from '@/utils';
import { Group, GroupType } from '@/types';
import MetricStats from './metric-stats';
import { Skeleton } from '../ui/skeleton';
import { TopMetricCard } from './top-metric-card';
import { EmptyState } from '../ui/empty-state';
import { useRouter } from 'next/navigation';

export function ChartsCard() {
  const { applications, activeApp } = useContext(AppsContext);
  const [activeGroup, setActiveGroup] = useState(0);
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const group = useMemo(() => {
    return applications[activeApp].groups?.[activeGroup];
  }, [activeApp, activeGroup]);

  const loadData = async () => {
    setLoading(true);
    if (applications[activeApp].groups !== null) {
      const group = applications[activeApp].groups[activeGroup];
      if (group != undefined) {
        let total = 0;
        if (group.type === GroupType.Base) total = group.metrics[0].total;
        else if (group.type === GroupType.Dual)
          total = group.metrics[0].total - group.metrics[1].total;
        setTotal(total);
        const from = new Date();
        from.setDate(0);

        const data = await loadChartData(
          from,
          30,
          group,
          applications[activeApp].id,
        );
        if (!data) {
          setData([]);
        } else {
          setData(data);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeGroup]);

  useEffect(() => {
    if (
      activeGroup >
      (applications[activeApp].groups === null
        ? 0
        : applications[activeApp].groups.length - 1)
    ) {
      setActiveGroup(
        applications[activeApp].groups === null
          ? 0
          : applications[activeApp].groups.length - 1,
      );
    }
  }, [activeApp]);

  return (
    <Card className='mb-20 rounded-t-none border-input'>
      <MetricStats
        stats={[
          {
            title: 'Metric used',
            description: 'Across this application',
            value: applications[activeApp].groups?.length,
          },
          {
            title: 'Number of dual metric',
            description: 'Across this application',
            value: applications[activeApp].groups?.filter(
              (g) => g.type === GroupType.Dual,
            ).length,
          },
          {
            title: 'Number of basic metric',
            description: 'Across this application',
            value: applications[activeApp].groups?.filter(
              (g) => g.type === GroupType.Base,
            ).length,
          },
          {
            title: 'Team members',
            description: 'Coming soon',
            value: 'N/A',
          },
        ]}
      />
      {applications[activeApp].groups !== undefined &&
      applications[activeApp].groups?.length! > 0 ? (
        <>
          <Header
            activeGroup={activeGroup}
            setActiveGroup={setActiveGroup}
            groups={applications[activeApp].groups ?? []}
            total={total}
          />
          <CardContent className='flex flex-col'>
            {total === 0 ? (
              <EmptyState
                className='py-14'
                title='Nothing Here Yet. Check Back Soon!'
                description='Theres no available data for this month.'
                icons={[CircleOff, CircleSlash]}
                action={{
                  label: 'Learn more',
                  onClick: () =>
                    router.push('/docs/getting-started/introduction'),
                }}
              />
            ) : (
              <>
                {loading ? (
                  <>
                    <Skeleton className='h-60 w-full rounded-[12px]' />
                  </>
                ) : (
                  <div className='w-full'>
                    <div className='flex w-full flex-row gap-5'>
                      <div className='w-full rounded-[12px] bg-accent p-5'>
                        <AreaChart
                          className='h-60 w-full'
                          data={calculateTrend(
                            data,
                            group?.metrics[0].total ?? 0,
                            group?.type ?? GroupType.Base,
                            group?.type === GroupType.Base
                              ? (group?.name ?? '')
                              : (group?.metrics[0].name ?? ''),
                            group?.type === GroupType.Base
                              ? ''
                              : (group?.metrics[1].name ?? ''),
                            group?.name ?? '',
                          )}
                          index='date'
                          color='blue'
                          categories={[
                            applications[activeApp].groups?.[activeGroup]
                              .name ?? '',
                          ]}
                          valueFormatter={(number: number) =>
                            `${Intl.NumberFormat('us').format(number).toString()}`
                          }
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
  activeGroup: number;
  setActiveGroup: React.Dispatch<React.SetStateAction<number>>;
  groups: Group[];
  total: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <CardHeader className='flex flex-row justify-between max-sm:flex-col max-sm:gap-3'>
      <div className='flex flex-col gap-1'>
        <CardTitle>
          {props.total} {props.groups[props.activeGroup]?.name}
        </CardTitle>
        <CardDescription>Trend of the last month</CardDescription>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='w-[200px] justify-between rounded-[12px]'
          >
            {props.groups.length > 0
              ? props.groups.find((_, i) => i === props.activeGroup)?.name
              : 'Select metric...'}
            <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[200px] overflow-hidden rounded-[12px] border p-0 shadow-md'>
          <Command>
            <CommandInput placeholder='Search metric...' />
            <CommandList>
              <CommandEmpty>No metric found.</CommandEmpty>
              <CommandGroup>
                {props.groups.map((group, i) => (
                  <CommandItem
                    key={group.id}
                    className='rounded-[10px]'
                    onSelect={() => {
                      props.setActiveGroup(i);
                      setOpen(false);
                    }}
                  >
                    {i === props.activeGroup ? (
                      <Check className={cn('mr-2 size-4 stroke-[3px]')} />
                    ) : group.type === 1 ? (
                      <ArrowUpDown className={cn('mr-2 size-4')} />
                    ) : (
                      <ArrowUpFromDot className={cn('mr-2 size-4')} />
                    )}

                    {group.name}
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
