import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Group, GroupType } from '@/types';
import { AppsContext } from '@/dashContext';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { dateToXAxis, mapToArray, multiMapsToArray } from '@/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
      <DialogContent className='max-md: max-h-[95%] !min-w-[60%] !rounded-[16px] !shadow-none !ring ring-input max-md:max-w-[95%]'>
        <DialogHeader className='static'>
          <DialogTitle className='flex flex-row items-center gap-5 !text-xl'>
            {props.group.name}
            <div>
              <div className='flex w-fit items-center justify-center rounded-[12px] bg-accent p-1 px-2 font-mono text-[16px]'>
                {props.total}
              </div>
            </div>
          </DialogTitle>
          <DialogClose className='absolute right-5 top-3'>
            <Button
              type='button'
              size={'icon'}
              variant='secondary'
              className='rounded-[12px]'
            >
              <X />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className='flex flex-row items-center justify-between gap-2'>
          <ToggleGroup
            type='single'
            defaultValue='today'
            size={'sm'}
            className='w-fit gap-0 divide-x rounded-[12px] border'
          >
            <ToggleGroupItem
              value='today'
              className='rounded-l-[12px] rounded-r-none'
            >
              D
            </ToggleGroupItem>
            <ToggleGroupItem value='7' className='rounded-none'>
              7D
            </ToggleGroupItem>
            <ToggleGroupItem value='15' className='rounded-none'>
              15D
            </ToggleGroupItem>
            <ToggleGroupItem
              value='30'
              className='rounded-l-none rounded-r-[12px]'
            >
              30D
            </ToggleGroupItem>
          </ToggleGroup>
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
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-2 xl:flex-row xl:justify-between'>
                <Label className='flex flex-col gap-2 capitalize'>
                  Positive variable total ({props.group.metrics[0].name})
                  <div className='font-mono text-lg text-green-500'>
                    -{props.total}
                  </div>
                </Label>
                <Label className='flex flex-col gap-2 capitalize xl:text-end'>
                  Negative variable total ({props.group.metrics[1].name})
                  <div className='font-mono text-lg text-red-500'>
                    +{props.total}
                  </div>
                </Label>
              </div>
            </div>
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
