'use client';

import { Check, ChevronsUpDown, TrendingUp } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { AppsContext } from '@/dashContext';
import { loadMetricsGroups, mapToArray, multiMapsToArray } from '@/utils';
import { Group, GroupType } from '@/types';
import { toast } from 'sonner';
import MetricStats from './metricStats';

export function ChartsCard() {
  const { applications, setApplications, activeApp } = useContext(AppsContext);
  const [activeGroup, setActiveGroup] = useState(0);

  const [dataOne, setDataOne] = useState<Map<Date, number> | null>(null);
  const [dataTwo, setDataTwo] = useState<Map<Date, number> | null>(null);

  const [total, setTotal] = useState(0);

  const loadData = async (group: Group) => {
    let map2 = new Map<Date, number>();
    let map1 = new Map<Date, number>();
    const from = new Date();
    const to = new Date(from);
    to.setMonth(from.getMonth() - 1);
    let total = 0;

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events?groupid=${group.id}&metricid=${group.metrics[0].id}&appid=${applications?.[activeApp].id}&start=${from.toUTCString()}&end=${to.toUTCString()}`,
      { method: 'GET', credentials: 'include' },
    )
      .then((resp) => {
        if (!resp.ok) {
          resp.text().then((text) => {
            toast.error(text);
          });
        } else {
          return resp.json();
        }
      })
      .then((json) => {
        if (json === null || json === undefined) {
          map1.set(from ?? new Date(), 0);
          map1.set(to ?? new Date(), 0);
        } else {
          for (let i = 0; i < json.length; i++) {
            const eventDate = new Date(json.date);
            if (map1.get(eventDate)) {
              map1.set(eventDate, map1.get(eventDate) + json.value);
            } else {
              map1.set(eventDate, json.value);
            }
            total += json.value;
          }
        }

        setDataOne(map1);
      });
    if (group.type === GroupType.Dual) {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events?groupid=${group.id}&metricid=${group.metrics[1].id}&appid=${applications?.[activeApp].id}&start=${from.toUTCString()}&end=${to.toUTCString()}`,
        { method: 'GET', credentials: 'include' },
      )
        .then((resp) => {
          if (!resp.ok) {
            resp.text().then((text) => {
              toast.error(text);
            });
          } else {
            return resp.json();
          }
        })
        .then((json) => {
          if (json === null || json === undefined) {
            map2.set(from ?? new Date(), 0);
            map2.set(to ?? new Date(), 0);
          } else {
            for (let i = 0; i < json.length; i++) {
              const eventDate = new Date(json.date);
              if (map2.get(eventDate)) {
                map2.set(eventDate, map2.get(eventDate) + json.value);
              } else {
                map2.set(eventDate, json.value);
              }
              total += 1;
            }
          }

          setDataTwo(map2);
        });
    }

    setTotal(total);
  };

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

  const arrangeData = (
    map1: Map<Date, number>,
    map2: Map<Date, number> | null,
  ) => {
    let array = [];
    let finalArray: any[] = [{ value: 0 }];
    if (map2 !== null) {
      array = multiMapsToArray(map1, map2);
    } else array = mapToArray(map1);

    let nbr = 0;
    for (let i = 0; i < array.length; i++) {
      if (map2 === null) {
        finalArray[finalArray.length - 1].value += array[i].value;
      } else {
        finalArray[finalArray.length - 1].value +=
          array[i].positive - array[i].negative;
      }
      if (nbr === 0) {
        finalArray[finalArray.length - 1].from = array[i].date;
      } else if (nbr === 7) {
        finalArray[finalArray.length - 1].to = array[i].date;
        finalArray.push({ value: 0 });
      }

      nbr++;
    }

    let total = 0;
    for (let i = 0; i < finalArray.length; i++) {
      total += finalArray[i].value;
    }

    return finalArray;
  };

  useEffect(() => {
    if (applications?.[activeApp]?.groups !== null) {
      const group = applications?.[activeApp].groups[activeGroup];
      if (group != undefined) {
        loadData(group);
      }
    }
  }, [activeGroup]);

  return (
    <Card className='rounded-t-none border-t-0 border-input'>
      <MetricStats
        className='mt-5'
        stats={[
          {
            title: 'Number of metric',
            description: 'Across this application',
            value: applications?.[activeApp].groups?.length,
          },
          {
            title: 'Number of dual metric',
            description: 'Across this application',
            value: applications?.[activeApp].groups?.filter(g => g.type === GroupType.Dual).length,
          },
          {
            title: 'Number of basic metric',
            description: 'Across this application',
            value: applications?.[activeApp].groups?.filter(g => g.type === GroupType.Base).length,
          },
          {
            title: 'Team members - UPCOMING',
            description: 'Accros this application',
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
            {/* Chart 1 */}
            <div className='flex w-[100%] flex-col gap-4 rounded-xl bg-accent p-5 pb-0 pt-5'>
              <ChartContainer
                config={{
                  value: {
                    label: applications?.[activeGroup].name,
                    color: 'hsl(var(--chart-1))',
                  },
                }}
              >
                <BarChart
                  accessibilityLayer
                  data={arrangeData(dataOne ?? new Map(), dataTwo)}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey='date'
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar
                    dataKey='value'
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
                  value: {
                    label: applications?.[activeGroup].name,
                    color: 'hsl(var(--chart-1))',
                  },
                }}
              >
                <AreaChart
                  accessibilityLayer
                  data={arrangeData(dataOne ?? new Map(), dataTwo)}
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
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator='dot' hideLabel />}
                  />
                  <Area
                    dataKey='value'
                    type='linear'
                    fill='blue'
                    fillOpacity={0.5}
                    stroke='blue'
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </>
      ) : (
        <>Create your first metric</>
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
        <CardTitle>0 {props.groups[props.activeGroup]?.name}</CardTitle>
        <CardDescription>Metric value for the last month</CardDescription>
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
