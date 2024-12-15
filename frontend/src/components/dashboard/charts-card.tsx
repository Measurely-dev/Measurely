'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
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
import { loadChartData, loadMetricsGroups, parseXAxis } from '@/utils';
import { Group, GroupType } from '@/types';
import MetricStats from './metric-stats';
import Empty from './empty';
import { CubeIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

export function ChartsCard() {
  const { applications, setApplications, activeApp } = useContext(AppsContext);
  const [activeGroup, setActiveGroup] = useState(0);

  const [data, setData] = useState<any[] | null>(null);
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
      if (applications?.[activeApp]?.groups !== null) {
        const group = applications?.[activeApp].groups[activeGroup];
        if (group != undefined && applications?.[activeApp] !== undefined) {
          if (group.type === GroupType.Base) setTotal(group.metrics[0].total);
          else if (group.type === GroupType.Dual)
            setTotal(group.metrics[0].total - group.metrics[1].total);
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
    };
    load();
  }, [activeGroup]);

  return (
    <Card className='rounded-t-none border-input'>
      <MetricStats
        stats={[
          {
            title: 'Number of metric',
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
                {/* Chart 1 */}
                {applications?.[activeApp].groups?.[activeGroup].type ===
                  GroupType.Base ? (
                  <>
                    <div className='flex w-[100%] flex-col gap-4 rounded-xl bg-accent p-5 pb-0 pt-5'>
                      <ChartContainer
                        config={{
                          positive: {
                            label:
                              applications?.[activeApp].groups?.[activeGroup]
                                ?.name ?? '',
                            color: 'hsl(var(--chart-1))',
                          },
                        }}
                      >
                        <BarChart accessibilityLayer data={data ?? []}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey='date'
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value: Date | string) =>
                              parseXAxis(value, 30)
                            }
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Bar
                            dataKey='positive'
                            fill='red'
                            fillOpacity={0.6}
                            stroke='red'
                            radius={8}
                          />
                        </BarChart>
                      </ChartContainer>
                    </div>
                    {/* Chart 2 */}
                    <div className='flex w-[100%] flex-col gap-4 rounded-xl bg-accent p-5 pb-0 pt-5'>
                      <ChartContainer
                        config={{
                          positive: {
                            label:
                              applications?.[activeApp].groups?.[activeGroup]?.name ?? '',
                            color: 'hsl(var(--chart-1))',
                          },
                        }}
                      >
                        <AreaChart
                          accessibilityLayer
                          data={data ?? []}
                          margin={{
                            left: 12,
                            right: 12,
                          }}
                        >
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey='date'
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value: Date | string) =>
                              parseXAxis(value, 30)
                            }
                          />
                          <ChartTooltip
                            cursor={false}
                            content={
                              <ChartTooltipContent indicator='dot' hideLabel />
                            }
                          />
                          <Area
                            dataKey='positive'
                            type='linear'
                            fill='blue'
                            fillOpacity={0.5}
                            stroke='blue'
                          />
                        </AreaChart>
                      </ChartContainer>
                    </div>
                  </>
                ) : (
                  <>
                    <div className='flex w-[100%] flex-col gap-4 rounded-xl bg-accent p-5 pb-0 pt-5'>
                      <ChartContainer
                        config={{
                          positive: {
                            label:
                              applications?.[activeApp].groups?.[activeGroup]
                                ?.metrics[0].name ?? '',
                            color: 'hsl(var(--chart-1))',
                          },
                          negative: {
                            label:
                              applications?.[activeApp].groups?.[activeGroup]
                                .metrics[1].name,
                            color: 'red',
                          },
                        }}
                      >
                        <BarChart accessibilityLayer data={data ?? []}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey='date'
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value: Date | string) =>
                              parseXAxis(value, 30)
                            }
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Bar
                            dataKey='positive'
                            fill='green'
                            fillOpacity={0.6}
                            stroke='green'
                            radius={8}
                          />
                          <Bar
                            dataKey='negative'
                            fill='red'
                            fillOpacity={0.6}
                            stroke='red'
                            radius={8}
                          />
                        </BarChart>
                      </ChartContainer>
                    </div>
                    {/* Chart 2 */}
                    <div className='flex w-[100%] flex-col gap-4 rounded-xl bg-accent p-5 pb-0 pt-5'>
                      <ChartContainer
                        config={{
                          positive: {
                            label:
                              applications?.[activeApp].groups?.[activeGroup]
                                ?.metrics[0].name ?? '',
                            color: 'hsl(var(--chart-1))',
                          },
                          negative: {
                            label:
                              applications?.[activeApp].groups?.[activeGroup]
                                .metrics[1].name,
                            color: 'red',
                          },
                        }}
                      >
                        <AreaChart
                          accessibilityLayer
                          data={data ?? []}
                          margin={{
                            left: 12,
                            right: 12,
                          }}
                        >
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey='date'
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value: Date | string) =>
                              parseXAxis(value, 30)
                            }
                          />
                          <ChartTooltip
                            cursor={false}
                            content={
                              <ChartTooltipContent indicator='dot' hideLabel />
                            }
                          />
                          <Area
                            dataKey='positive'
                            type='linear'
                            fill='blue'
                            fillOpacity={0.5}
                            stroke='blue'
                          />
                          <Area
                            dataKey='negative'
                            type='linear'
                            fill='red'
                            fillOpacity={0.2}
                            stroke='red'
                          />
                        </AreaChart>
                      </ChartContainer>
                    </div>
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
