'use client';
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
import { toast } from 'sonner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import AdvancedOptionsMetricDialog from '@/components/dashboard/advanced-options-metric-dialog';

export default function MetricInformations(props: {
  children: ReactNode;
  group: Group;
  total: number;
}) {
  const [date, setDate] = useState<Date>();
  const [range, setRange] = useState<number>(0);
  const [data, setData] = useState<any[] | null>(null);
  const { applications, activeApp } = useContext(AppsContext);
  const [canLoad, setCanLoad] = useState(false);

  const loadData = async () => {
    let tmpData: any[] = [];
    if (!date) {
      setDate(new Date());
      return;
    }

    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);

    const from = date;
    const to = new Date();
    to.setDate(from.getDate() + range);

    const dateCounter = new Date(from);
    const dataLength = range === 0 ? 24 : range;
    const now = new Date();
    for (let i = 0; i < dataLength; i++) {
      const eventDate = new Date(dateCounter);
      if (eventDate > now) {
        tmpData.push({
          date: eventDate,
        });
      } else {
        tmpData.push({
          date: eventDate,
          positive: 0,
          negative: 0,
        });
      }
      if (range === 0) dateCounter.setHours(dateCounter.getHours() + 1);
      else dateCounter.setDate(dateCounter.getDate() + 1);
    }

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events?groupid=${props.group.id}&metricid=${props.group.metrics[0].id}&appid=${applications?.[activeApp].id}&start=${from.toUTCString()}&end=${to.toUTCString()}`,
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
        if (json !== null && json !== undefined) {
          for (let i = 0; i < json.length; i++) {
            const eventDate = new Date(json.date);
            for (let j = 0; j < tmpData.length; j++) {
              if (
                eventDate.getDate() === tmpData[j].date.getDate() &&
                eventDate.getMonth() === tmpData[j].date.getMonth() &&
                eventDate.getFullYear() === tmpData[j].date.getFullYear()
              ) {
                if (range === 0) {
                  if (eventDate.getHours() === tmpData[j].date.getHours()) {
                    tmpData[j].positive += json.value;
                  }
                } else {
                  tmpData[j].positive += json.value;
                }
              }
            }
          }
        }
      });
    if (props.group.type === GroupType.Dual) {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events?groupid=${props.group.id}&metricid=${props.group.metrics[1].id}&appid=${applications?.[activeApp].id}&start=${from.toUTCString()}&end=${to.toUTCString()}`,
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
          if (json !== null && json !== undefined) {
            for (let i = 0; i < json.length; i++) {
              const eventDate = new Date(json.date);
              for (let j = 0; j < tmpData.length; j++) {
                if (
                  eventDate.getDate() === tmpData[j].date.getDate() &&
                  eventDate.getMonth() === tmpData[j].date.getMonth() &&
                  eventDate.getFullYear() === tmpData[j].date.getFullYear()
                ) {
                  if (range === 0) {
                    if (eventDate.getHours() === tmpData[j].date.getHours()) {
                      tmpData[j].negative += json.value;
                    }
                  } else {
                    tmpData[j].negative += json.value;
                  }
                }
              }
            }
          }
        });
    }

    setData(tmpData);
  };

  useEffect(() => {
    if (canLoad) {
      loadData();
    }
  }, [date, range, canLoad]);

  return (
    <Dialog
      onOpenChange={(state) => {
        if (state === true) {
          setCanLoad(true);
        } else {
          setCanLoad(false);
        }
      }}
    >
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
              onValueChange={(e) => setRange(parseInt(e))}
              value={range.toString()}
            >
              <ToggleGroupItem
                value={'0'}
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
            <AdvancedOptionsMetricDialog setDate={setDate} date={date}>
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
        {data === null ? (
          'LOADING...'
        ) : (
          <>
            {props.group.type === 0 ? (
              <>
                <ChartContainer
                  config={{
                    positive: {
                      label: props.group.name,
                      color: 'skyblue',
                    },
                  }}
                  className='rounded-[12px] bg-accent p-3'
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
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value: Date) => {
                        if (range === 0) {
                          return value.getHours().toString();
                        } else {
                          return value.getDate().toString();
                        }
                      }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                      labelClassName='!min-w-[200px]'
                    />
                    <Area
                      dataKey='positive'
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
                      tickMargin={10}
                      tickFormatter={(value: Date) => {
                        if (range === 0) {
                          return value.getHours().toString();
                        } else {
                          return value.getDate().toString();
                        }
                      }}
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
