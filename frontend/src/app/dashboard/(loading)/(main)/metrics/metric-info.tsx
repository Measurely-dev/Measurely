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
import { Bar, BarChart } from 'recharts';
import { CartesianGrid, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Group } from '@/types';
import { AppsContext } from '@/dash-context';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import AdvancedOptionsMetricDialog from '@/components/dashboard/advanced-options-metric-dialog';
import { loadChartData, parseXAxis } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function MetricInformations(props: {
  children: ReactNode;
  group: Group;
}) {
  const [date, setDate] = useState<Date>();
  const [range, setRange] = useState<number>(0);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { applications, activeApp } = useContext(AppsContext);
  const [canLoad, setCanLoad] = useState(false);

  useEffect(() => {
    if (canLoad) {
      if (!date) {
        setDate(new Date());
        return;
      }
      const load = async () => {
        setLoading(true);
        if (
          applications !== undefined &&
          applications?.[activeApp] !== undefined
        ) {
          const data = await loadChartData(
            date,
            range,
            props.group,
            applications?.[activeApp],
          );

          if (!data) {
            setData([]);
          } else {
            setData(data);
          }
        }
        setLoading(false);
      };

      load();
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
              {props.group.type === 0 ? (
                <>{props.group.metrics[0].total}</>
              ) : (
                <>
                  {props.group.metrics[0].total - props.group.metrics[1].total}
                  <div className='ml-2 h-fit rounded-[6px] bg-green-500/10 px-1 py-0.5 font-mono text-sm text-green-500'>
                    +{props.group.metrics[0].total}
                  </div>
                  <div className='ml-2 h-fit rounded-[6px] bg-red-500/10 px-1 py-0.5 font-mono text-sm text-red-500'>
                    -{props.group.metrics[1].total}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className='flex flex-row items-center gap-2 max-sm:w-full'>
            <ToggleGroup
              type='single'
              defaultValue='0'
              size={'sm'}
              className='h-[35px] w-fit gap-0 divide-x rounded-[12px] border'
              onValueChange={(e) => setRange(parseInt(e))}
              value={range.toString()}
            >
              <ToggleGroupItem
                value={'0'}
                className='h-[33px] data-[state=on]:select-none rounded-l-[12px] rounded-r-none'
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
            {props.group.type === 0 ? (
              <>{props.group.metrics[0].total}</>
            ) : (
              <>
                {props.group.metrics[0].total - props.group.metrics[1].total}
                <div className='ml-2 h-fit rounded-[6px] bg-green-500/10 px-1 py-0.5 font-mono text-sm text-green-500'>
                  +{props.group.metrics[0].total}
                </div>
                <div className='ml-2 h-fit rounded-[6px] bg-red-500/10 px-1 py-0.5 font-mono text-sm text-red-500'>
                  -{props.group.metrics[1].total}
                </div>
              </>
            )}
          </div>
        </div>
        {loading ? (
          <Skeleton className='h-[200px] w-full rounded-[12px]' />
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
                  <BarChart
                    accessibilityLayer
                    data={data}
                    margin={{
                      left: 12,
                      right: 12,
                      top: 5,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey='date'
                      tickLine={false}
                      tickMargin={8}
                      axisLine={false}
                      tickFormatter={(value: Date | string) =>
                        parseXAxis(value, range)
                      }
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar
                      dataKey='positive'
                      fill='skyblue'
                      fillOpacity={1}
                      radius={8}
                      className='rounded-b-none'
                    />
                  </BarChart>
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
                  <BarChart
                    accessibilityLayer
                    data={data}
                    margin={{
                      left: 12,
                      right: 12,
                      top: 5,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey='date'
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value: Date | string) =>
                        parseXAxis(value, range)
                      }
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator='dot' />}
                      labelClassName='!min-w-[200px]'
                    />
                    <Bar
                      dataKey='postive'
                      fill='lime'
                      fillOpacity={1}
                      stackId='a'
                      radius={8}
                      className='rounded-b-none'
                    />
                    <Bar
                      dataKey='negative'
                      fill='red'
                      fillOpacity={1}
                      stackId='a'
                      radius={8}
                      className='rounded-b-none'
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
