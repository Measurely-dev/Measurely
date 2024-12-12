import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { Sliders, X } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Group, GroupType } from '@/types';
import { AppsContext } from '@/dash-context';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { dateToXAxis, mapToArray, multiMapsToArray } from '@/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import AdvancedOptionsMetricDialog from '@/components/dashboard/advanced-options-metric-dialog';

export default function MetricInformations(props: {
  children: ReactNode;
  group: Group;
  total: number;
}) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getTime()),
    to: new Date(new Date().getTime()),
  });
  const [dataOne, setDataOne] = useState<Map<Date, number> | null>(null);
  const [dataTwo, setDataTwo] = useState<Map<Date, number> | null>(null);
  const { applications, activeApp } = useContext(AppsContext);

  const loadData = () => {
    let map2 = new Map<Date, number>();
    let map1 = new Map<Date, number>();
    if (!date?.from || !date.to) {
      return;
    }

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events?groupid=${props.group.id}&metricid=${props.group.metrics[0].id}&appid=${applications?.[activeApp].id}&start=${date?.from?.toUTCString()}&end=${date?.to?.toUTCString()}`,
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
          map1.set(date.from ?? new Date(), 0);
          map1.set(date.to ?? new Date(), 0);
        } else {
          for (let i = 0; i < json.length; i++) {
            const eventDate = new Date(json.date);
            if (map1.get(eventDate)) {
              map1.set(eventDate, map1.get(eventDate) + json.value);
            } else {
              map1.set(eventDate, json.value);
            }
          }
        }

        setDataOne(map1);
      });
    if (props.group.type === GroupType.Dual) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events?groupid=${props.group.id}&metricid=${props.group.metrics[1].id}&appid=${applications?.[activeApp].id}&start=${date?.from?.toUTCString()}&end=${date?.to?.toUTCString()}`,
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
            map2.set(date.from ?? new Date(), 0);
            map2.set(date.to ?? new Date(), 0);
          } else {
            for (let i = 0; i < json.length; i++) {
              const eventDate = new Date(json.date);
              if (map2.get(eventDate)) {
                map2.set(eventDate, map2.get(eventDate) + json.value);
              } else {
                map2.set(eventDate, json.value);
              }
            }
          }

          setDataTwo(map2);
        });
    }
  };

  useEffect(() => {
    loadData();
  }, [date]);

  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className='min-w-[70%] rounded-[16px] p-4 shadow-none ring ring-input max-lg:max-w-[90%] max-md:max-w-[95%] max-sm:max-w-[100%] max-sm:rounded-[0px] max-sm:p-2 max-sm:pt-4 max-sm:ring-0'>
        <div className='flex flex-row items-center justify-between max-sm:flex-col max-sm:items-start max-sm:justify-start max-sm:gap-2'>
          <DialogTitle className='flex flex-col items-start gap-1 text-start !text-lg font-medium'>
            {props.group.name}
          </DialogTitle>
          <div className='sm:hidden'>
            <div className='flex flex-row items-center font-mono text-xl'>
              {props.total}
              {props.group.type === 0 ? (
                <></>
              ) : (
                <>
                  <div className='ml-2 h-fit rounded-[6px] bg-green-500/10 px-1 py-0.5 font-mono text-sm text-green-500'>
                    +{props.total}
                  </div>
                  <div className='ml-2 h-fit rounded-[6px] bg-red-500/10 px-1 py-0.5 font-mono text-sm text-red-500'>
                    -{props.total}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className='flex flex-row items-center gap-2 max-sm:w-full'>
            <ToggleGroup
              type='single'
              defaultValue='today'
              size={'sm'}
              className='h-[35px] w-fit gap-0 divide-x rounded-[12px] border'
            >
              <ToggleGroupItem
                value='today'
                className='h-[33px] rounded-l-[12px] rounded-r-none'
              >
                D
              </ToggleGroupItem>
              <ToggleGroupItem value='7' className='h-[33px] rounded-none'>
                7D
              </ToggleGroupItem>
              <ToggleGroupItem value='15' className='h-[33px] rounded-none'>
                15D
              </ToggleGroupItem>
              <ToggleGroupItem
                value='30'
                className='h-[33px] rounded-l-none rounded-r-[12px]'
              >
                30D
              </ToggleGroupItem>
            </ToggleGroup>
            <AdvancedOptionsMetricDialog>
              <Button
                variant={'secondary'}
                className='items-center gap-2 rounded-[12px] max-sm:w-full'
              >
                <Sliders className='size-4' />
                Advanced
              </Button>
            </AdvancedOptionsMetricDialog>
            <DialogClose className='max-sm:absolute max-sm:right-2 max-sm:top-2'>
              <Button
                type='button'
                size={'icon'}
                variant='secondary'
                className='rounded-[12px]'
              >
                <X />
              </Button>
            </DialogClose>
          </div>
        </div>
        <div className='max-sm:hidden'>
          <div className='flex flex-row items-center font-mono text-xl'>
            {props.total}
            {props.group.type === 0 ? (
              <></>
            ) : (
              <>
                <div className='ml-2 h-fit rounded-[6px] bg-green-500/10 px-1 py-0.5 font-mono text-sm text-green-500'>
                  +{props.total}
                </div>
                <div className='ml-2 h-fit rounded-[6px] bg-red-500/10 px-1 py-0.5 font-mono text-sm text-red-500'>
                  -{props.total}
                </div>
              </>
            )}
          </div>
        </div>
        {props.group.type === 0 ? (
          <>
            <ChartContainer
              config={{
                value: {
                  label: props.group.name,
                  color: 'skyblue',
                },
              }}
              className='rounded-[12px] bg-accent p-3'
            >
              <AreaChart
                accessibilityLayer
                data={mapToArray(dataOne ?? new Map())}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='date'
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value: Date) =>
                    dateToXAxis(
                      date?.from ?? new Date(),
                      date?.to ?? new Date(),
                      value,
                    )
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                  labelClassName='!min-w-[200px]'
                />
                <Area
                  dataKey='value'
                  type='natural'
                  fill='skyblue'
                  fillOpacity={0.5}
                  stroke='skyblue'
                  radius={8}
                />
              </AreaChart>
            </ChartContainer>
          </>
        ) : (
          <div className='rounded-[12px] bg-accent p-3'>
            <ChartContainer
              config={{
                positive: {
                  label: props.group.metrics[0].name,
                  color: 'green',
                },
                negative: {
                  label: props.group.metrics[1].name,
                  color: 'red',
                },
              }}
            >
              <AreaChart
                accessibilityLayer
                data={multiMapsToArray(
                  dataOne ?? new Map(),
                  dataTwo ?? new Map(),
                )}
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
                  tickMargin={10}
                  tickFormatter={(value: Date) =>
                    dateToXAxis(
                      date?.from ?? new Date(),
                      date?.to ?? new Date(),
                      value,
                    )
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator='dot' />}
                  labelClassName='!min-w-[200px]'
                />
                <Area
                  dataKey='postive'
                  type='natural'
                  strokeOpacity={0.6}
                  fill='lime'
                  fillOpacity={0.2}
                  stroke='lime'
                  stackId='a'
                />
                <Area
                  dataKey='negative'
                  type='natural'
                  strokeOpacity={0.6}
                  fill='red'
                  fillOpacity={0.2}
                  stroke='red'
                  stackId='a'
                />
              </AreaChart>
            </ChartContainer>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
