'use client';

import { Check, ChevronsUpDown } from 'lucide-react';

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
import { useContext, useEffect, useState } from 'react';
import { Box } from 'react-feather';
import { AppsContext } from '@/dash-context';
import { loadChartData, loadMetricsGroups } from '@/utils';
import { Group, GroupType } from '@/types';
import MetricStats from './metric-stats';
import Empty from './empty';
import { CubeIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';
import { BarChart } from '../ui/BarChart';
import { TopMetricCard } from './top-metric-card';

export function ChartsCard() {
  const { applications, setApplications, activeApp } = useContext(AppsContext);
  const [activeGroup, setActiveGroup] = useState(0);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (applications?.[activeApp].groups === null) {
      loadMetricsGroups(applications[activeApp].id).then((json) => {
        setApplications(
          applications.map((v, i) =>
            i === activeApp ? Object.assign({}, v, { groups: json }) : v,
          ),
        );
      });
      setActiveGroup(0);
    }
  }, [activeApp]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (applications?.[activeApp]?.groups !== null) {
        const group = applications?.[activeApp].groups[activeGroup];
        if (group != undefined && applications?.[activeApp] !== undefined) {
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
            applications?.[activeApp],
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
    load();
  }, [activeGroup]);

  return (
    <Card className='rounded-t-none border-input'>
      <MetricStats
        stats={[
          {
            title: 'Metric used',
            description: 'Across this application',
            value: applications?.[activeApp].groups?.length,
          },
          {
            title: 'Number of dual metric',
            description: 'Across this application',
            value: applications?.[activeApp].groups?.filter(
              (g) => g.type === GroupType.Dual,
            ).length,
          },
          {
            title: 'Number of basic metric',
            description: 'Across this application',
            value: applications?.[activeApp].groups?.filter(
              (g) => g.type === GroupType.Base,
            ).length,
          },
          {
            title: 'Team members',
            description: 'Coming soon',
            value: 'N/A',
          },
          // {
          //   title: 'Metric limit',
          //   description: 'Number of metric available',
          //   value: '2',
          // },
          // {
          //   title: 'Request limit',
          //   description: 'Allowed with this plan',
          //   value: '100 per minute',
          // },
        ]}
      />
      {applications?.[activeApp].groups !== undefined &&
      applications?.[activeApp].groups?.length! > 0 ? (
        <>
          <Header
            activeGroup={activeGroup}
            setActiveGroup={setActiveGroup}
            groups={applications?.[activeApp].groups ?? []}
            total={total}
          />
          <CardContent className='flex flex-row gap-5 max-md:flex-col'>
            {total === 0 ? (
              <div className='flex w-full flex-col items-center justify-center gap-2 rounded-[12px] bg-accent px-5 py-20'>
                <div className='text-3xl font-semibold'>No data</div>
                <div className='text-md text-center text-secondary max-sm:text-sm'>
                  Theres no available data for this month
                </div>
                <div className='flex flex-row items-center gap-4'>
                  <Link href={'/docs/getting-started/introduction'}>
                    <Button className='mt-2 rounded-[12px]'>Learn more</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {loading ? (
                  <>
                    <Skeleton className='h-[200px] w-full rounded-[12px]' />
                    <Skeleton className='h-[200px] w-full rounded-[12px]' />
                  </>
                ) : (
                  <>
                    {/* Chart 1 */}
                    {applications?.[activeApp].groups?.[activeGroup].type ===
                    GroupType.Base ? (
                      <>
                        {/* <BarChart
                            className='w-full'
                            data={basicData}
                            index='date'
                            color='blue'
                            categories={['TotalUsers']}
                            valueFormatter={(number: number) =>
                              `${Intl.NumberFormat('us').format(number).toString()}`
                            }
                            onValueChange={(v) => console.log(v)}
                            xAxisLabel='Month'
                            yAxisLabel='Total'
                          /> */}
                      </>
                    ) : (
                      <></>
                    )}
                  </>
                )}
              </>
            )}
          </CardContent>
        </>
      ) : (
        <Link href={'/dashboard/new-metric'}>
          <Empty className='rounded-t-none border-none'>
            <CubeIcon className='size-10' />
            <div className='flex flex-col items-center gap-3 text-center'>
              Create your first metric
            </div>
          </Empty>
        </Link>
      )}
      <TopMetricCard />
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
        <CardDescription>Metric tracked for the last month</CardDescription>
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
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
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
                      <Check className={cn('mr-2 h-4 w-4 stroke-[3px]')} />
                    ) : (
                      <Box className={cn('mr-2 h-4 w-4 text-blue-500')} />
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
